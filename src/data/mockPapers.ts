import type { Paper, LabsResult, SavedPaper } from '@/types';
import { searchAllAPIs } from '@/services/api';

export const mockPapers: Paper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    publication: 'Advances in Neural Information Processing Systems',
    year: 2017,
    pages: '5998-6008',
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    citations: 154320,
    publisher: 'NeurIPS',
    doi: '10.48550/arXiv.1706.03762',
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf'
  }
];

export const sampleResearchQuestions = [
  'How does caffeine consumption affect short-term memory?',
  'What are the latest developments in quantum computing?',
  'Find papers on machine learning in healthcare',
  'Explain the relationship between sleep and cognitive performance',
  'What is the impact of social media on mental health?',
  'How do transformers work in natural language processing?'
];

export const getPapersByQuery = async (query: string): Promise<Paper[]> => {
  try {
    const response = await searchAllAPIs({ query, maxResults: 20 });

    // Papers are already filtered for PDFs in aggregator.ts
    // Return all papers from API
    console.log(`✅ API results: ${response.papers.length} papers returned`);

    // Return API results directly - no additional filtering
    return response.papers;
  } catch (error) {
    console.error('❌ Error fetching papers:', error);
    return [];
  }
};

export const getLabsResultsByQuery = async (query: string): Promise<LabsResult[]> => {
  try {
    const response = await searchAllAPIs({ query, maxResults: 20 });

    // Papers are already filtered for PDFs in aggregator.ts
    console.log(`✅ Labs API results: ${response.papers.length} papers returned`);

    if (response.papers.length === 0) {
      console.warn('⚠️ No papers found for query:', query);
      return [];
    }

    return response.papers.slice(0, 10).map(paper => ({
      ...paper,
      aiSummary: `This paper addresses your question about "${query}" by examining ${paper.title.toLowerCase().slice(0, 100)}...`,
      relevancePoints: [
        `Directly relevant to your query: "${query}"`,
        `Published in ${paper.publication} (${paper.year}) with ${paper.citations.toLocaleString()} citations`,
        paper.abstract ? `Key insight: ${paper.abstract.slice(0, 150)}...` : 'Provides relevant research findings'
      ]
    }));
  } catch (error) {
    console.error('❌ Error fetching labs results:', error);
    return [];
  }
};

export const savedPapers: SavedPaper[] = [];
export const labsResults: LabsResult[] = [];
