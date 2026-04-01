import axios from 'axios';
import type { SavedPaper } from './libraryService';
import { extractAndCachePdf, extractRelevantSections, pdfCacheService } from './pdfExtractor';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'phi3'; // Using Phi-3 for better accuracy
// Alternative models:
// 'llama3.2:1b' - Fastest, less accurate
// 'llama3.2:3b' - Balanced
// 'phi3' - Best for research Q&A (recommended)

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Check if Ollama is available
export const checkOllamaAvailability = async (): Promise<boolean> => {
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
};

// Simple text similarity (cosine similarity on word overlap)
const calculateSimilarity = (query: string, text: string): number => {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textWords = text.toLowerCase().split(/\s+/);
  const intersection = queryWords.filter(w => textWords.includes(w));
  return intersection.length / Math.sqrt(queryWords.length * textWords.length);
};

// Find relevant papers based on query
export const findRelevantPapers = (query: string, papers: SavedPaper[], topK = 3): SavedPaper[] => {
  // If query is very generic (like "tell me about papers", "what papers", etc.), return all papers
  const genericQueries = [
    'tell me about', 'what papers', 'about papers', 'my papers', 'the papers',
    'those papers', 'these papers', 'all papers', 'summarize', 'summary'
  ];
  
  const isGeneric = genericQueries.some(gq => query.toLowerCase().includes(gq));
  
  if (isGeneric || query.split(' ').length <= 3) {
    console.log('📋 Generic query detected, returning all papers');
    return papers.slice(0, topK);
  }

  const scored = papers.map(paper => {
    const titleScore = calculateSimilarity(query, paper.title) * 2;
    const abstractScore = calculateSimilarity(query, paper.abstract);
    const authorsScore = calculateSimilarity(query, paper.authors.join(' ')) * 0.5;
    return {
      paper,
      score: titleScore + abstractScore + authorsScore
    };
  });

  const sortedPapers = scored.sort((a, b) => b.score - a.score);
  
  // If no papers have a good score, return all papers anyway (user has limited papers)
  const hasGoodMatch = sortedPapers.some(s => s.score > 0.1);
  
  if (!hasGoodMatch && papers.length <= 5) {
    console.log('📋 No good matches but few papers, returning all');
    return papers.slice(0, topK);
  }

  return sortedPapers
    .slice(0, topK)
    .filter(s => s.score > 0.05) // Lowered threshold from 0.1 to 0.05
    .map(s => s.paper);
};

// Build context from relevant papers (with full PDF text if available)
const buildContext = async (papers: SavedPaper[]): Promise<string> => {
  const contexts: string[] = [];

  for (let idx = 0; idx < papers.length; idx++) {
    const paper = papers[idx];
    let paperContext = `[${idx + 1}] ${paper.title}\nAuthors: ${paper.authors.join(', ')}\nYear: ${paper.year}\n`;

    // Try to get full PDF text
    if (paper.pdfUrl) {
      try {
        console.log(`📄 Attempting to extract PDF for: ${paper.title.slice(0, 50)}...`);
        const pdfContent = await extractAndCachePdf(paper.id, paper.pdfUrl);
        
        // Use first 3000 characters of full text (more context than just abstract)
        const excerpt = pdfContent.fullText.slice(0, 3000);
        paperContext += `Content: ${excerpt}...\n(${pdfContent.wordCount} words total)`;
        
        console.log(`✅ Using full PDF text (${pdfContent.wordCount} words)`);
      } catch (error) {
        console.log(`⚠️ PDF extraction failed, using abstract`);
        paperContext += `Abstract: ${paper.abstract.slice(0, 300)}...`;
      }
    } else {
      // No PDF available, use abstract
      paperContext += `Abstract: ${paper.abstract.slice(0, 300)}...`;
    }

    contexts.push(paperContext);
  }

  return contexts.join('\n\n');
};

// Call Ollama LLM
export const askChatbot = async (
  question: string,
  papers: SavedPaper[],
  conversationHistory: ChatMessage[] = []
): Promise<{ answer: string; sources: string[] }> => {
  console.log('🤖 Chatbot called with:', { question, paperCount: papers.length });
  
  // Find relevant papers
  const relevantPapers = findRelevantPapers(question, papers);
  console.log('📚 Found relevant papers:', relevantPapers.length);

  if (relevantPapers.length === 0) {
    return {
      answer: "I couldn't find any relevant papers in your library to answer this question. Try saving more papers or rephrase your question.",
      sources: []
    };
  }

  const context = await buildContext(relevantPapers);
  const history = conversationHistory.slice(-4).map(m => 
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
  ).join('\n');

  const prompt = `You are a research assistant helping with academic papers. Answer the question based ONLY on the provided papers.

Research Papers:
${context}

${history ? `Previous conversation:\n${history}\n` : ''}
Question: ${question}

Instructions:
- Structure your response professionally with clear sections
- Use markdown formatting:
  * **Bold** for key terms and findings
  * Bullet points (•) for lists
  * Numbers (1., 2., 3.) for sequential steps
  * Line breaks for readability
- Start with a brief summary if the question is broad
- Cite papers using [1], [2], etc. after each claim
- Use formal academic language
- If discussing methodology, use subheadings like "Methodology:" or "Key Findings:"
- Keep response under 200 words but well-structured
- If the papers don't contain the answer, state this clearly

Format example:
**Summary:** Brief overview of the answer.

**Key Points:**
• First important point [1]
• Second important point [2]

**Methodology:** (if relevant)
Description of methods used...

**Conclusion:** Final thoughts or implications.

Answer:`;

  console.log('📝 Sending prompt to Ollama...');

  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 300 // Increased for structured responses
      }
    }, {
      timeout: 60000 // Increased timeout for PDF processing
    });

    console.log('✅ Got response from Ollama:', response.data);

    if (!response.data || !response.data.response) {
      throw new Error('Invalid response from Ollama');
    }

    return {
      answer: response.data.response.trim(),
      sources: relevantPapers.map(p => p.title)
    };
  } catch (error) {
    console.error('❌ Chatbot error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Please start Ollama and pull phi3 model.');
      }
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timed out. The model might be loading. Please try again.');
      }
      if (error.response) {
        console.error('Ollama error response:', error.response.data);
        throw new Error(`Ollama error: ${error.response.data.error || 'Unknown error'}`);
      }
    }
    
    throw new Error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Chat session management
export const chatSessionService = {
  getSessions: (userId: string): ChatSession[] => {
    const key = `chat_sessions_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  saveSession: (userId: string, session: ChatSession): void => {
    const key = `chat_sessions_${userId}`;
    const sessions = chatSessionService.getSessions(userId);
    const existing = sessions.findIndex(s => s.id === session.id);
    
    if (existing >= 0) {
      sessions[existing] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(key, JSON.stringify(sessions));
  },

  deleteSession: (userId: string, sessionId: string): void => {
    const key = `chat_sessions_${userId}`;
    const sessions = chatSessionService.getSessions(userId);
    const filtered = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem(key, JSON.stringify(filtered));
  },

  createSession: (title: string): ChatSession => {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};
