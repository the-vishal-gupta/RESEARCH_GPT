import axios from 'axios';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'llama3.2:1b'; // Small 1B parameter model, fast and efficient

const DEBUG = import.meta.env.DEV;

interface LLMResponse {
  response: string;
  done: boolean;
}

// Call local Ollama LLM
const callLLM = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(OLLAMA_API_URL, {
      model: MODEL_NAME,
      prompt,
      stream: false,
      options: {
        temperature: 0.1, // Low temperature for consistent results
        num_predict: 100
      }
    }, {
      timeout: 5000
    });

    return response.data.response.trim();
  } catch (error) {
    if (DEBUG) {
      console.warn('LLM not available, falling back to regex-based detection');
    }
    return '';
  }
};

// Detect query intent using LLM
export const detectQueryIntentWithLLM = async (query: string): Promise<{
  sortBy: 'citations' | 'year' | 'relevance';
  searchTerms: string;
}> => {
  const prompt = `Analyze this research paper search query and extract:
1. Sort preference (citations/year/relevance)
2. Clean search terms (remove filler words)

Query: "${query}"

Respond in this exact format:
SORT: [citations/year/relevance]
TERMS: [clean search terms]

Examples:
Query: "most cited papers on deep learning"
SORT: citations
TERMS: deep learning

Query: "recent AI research"
SORT: year
TERMS: AI

Query: "machine learning in healthcare"
SORT: relevance
TERMS: machine learning healthcare

Now analyze: "${query}"`;

  const llmResponse = await callLLM(prompt);

  if (llmResponse) {
    try {
      const sortMatch = llmResponse.match(/SORT:\s*(citations|year|relevance)/i);
      const termsMatch = llmResponse.match(/TERMS:\s*(.+?)(?:\n|$)/i);

      if (sortMatch && termsMatch) {
        const sortBy = sortMatch[1].toLowerCase() as 'citations' | 'year' | 'relevance';
        const searchTerms = termsMatch[1].trim();

        if (DEBUG) {
          console.log('LLM Intent Detection:', { sortBy, searchTerms });
        }

        return {
          sortBy,
          searchTerms: searchTerms || 'machine learning'
        };
      }
    } catch (error) {
      if (DEBUG) console.error('Failed to parse LLM response:', error);
    }
  }

  // Fallback to regex-based detection
  return fallbackIntentDetection(query);
};

// Fallback regex-based intent detection
const fallbackIntentDetection = (query: string): {
  sortBy: 'citations' | 'year' | 'relevance';
  searchTerms: string;
} => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.match(/most cited|highly cited|top cited|best cited|popular/)) {
    const searchTerms = query
      .replace(/most cited|highly cited|top cited|best cited|popular/gi, '')
      .replace(/papers?|articles?|research/gi, '')
      .trim();

    return {
      sortBy: 'citations',
      searchTerms: searchTerms || 'deep learning'
    };
  }

  if (lowerQuery.match(/recent|latest|newest|new|2024|2023/)) {
    const searchTerms = query
      .replace(/recent|latest|newest|new/gi, '')
      .replace(/papers?|articles?|research/gi, '')
      .replace(/\d{4}/g, '')
      .trim();

    return {
      sortBy: 'year',
      searchTerms: searchTerms || 'machine learning'
    };
  }

  return {
    sortBy: 'relevance',
    searchTerms: query
  };
};

// Check if Ollama is running
export const checkLLMAvailability = async (): Promise<boolean> => {
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Get installation instructions
export const getLLMSetupInstructions = (): string => {
  return `
To enable local LLM features:

1. Install Ollama:
   - Windows: Download from https://ollama.ai/download
   - Mac: brew install ollama
   - Linux: curl -fsSL https://ollama.ai/install.sh | sh

2. Pull the model:
   ollama pull llama3.2:1b

3. Ollama will run automatically on http://localhost:11434

The 1B model is ~1GB download, runs fast on CPU.
`;
};
