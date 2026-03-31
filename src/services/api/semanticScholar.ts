import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const SEMANTIC_SCHOLAR_API_URL = '/api/semantic';

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  authors?: Array<{ name: string }>;
  citationCount?: number;
  venue?: string;
  externalIds?: {
    DOI?: string;
    ArXiv?: string;
  };
  openAccessPdf?: {
    url: string;
  };
}

export const searchSemanticScholar = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 10 } = options;
    
    // Increase results to get better coverage
    const fetchCount = Math.min(maxResults * 2, 50);
    
    const params = new URLSearchParams({
      query,
      limit: fetchCount.toString(),
      fields: 'paperId,title,abstract,year,authors,citationCount,venue,externalIds,openAccessPdf'
    });
    
    const response = await axios.get(`${SEMANTIC_SCHOLAR_API_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ResearchGPT (https://github.com/vishal/research-gpt)'
      },
      timeout: 10000
    });
    
    const data = response.data;
    const papers: Paper[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: SemanticScholarPaper) => {
        // Only include papers from 2024 or earlier
        if (!item.year || item.year <= 2024) {
          papers.push({
            id: `semantic-${item.paperId}`,
            title: item.title || 'Untitled',
            authors: item.authors?.map(a => a.name) || ['Unknown Author'],
            publication: item.venue || 'Unknown Venue',
            year: item.year || new Date().getFullYear(),
            abstract: item.abstract || 'No abstract available',
            citations: item.citationCount || 0,
            pdfUrl: item.openAccessPdf?.url,
            doi: item.externalIds?.DOI,
            publisher: 'Semantic Scholar'
          });
        }
      });
    }
    
    console.log('Semantic Scholar API:', { query, requested: fetchCount, found: papers.length, withCitations: papers.filter(p => p.citations > 0).length });

    return {
      papers,
      total: data.total || papers.length,
      source: 'semantic-scholar'
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Semantic Scholar API error:', {
      message: errorMsg,
      query,
      timestamp: new Date().toISOString()
    });
    return {
      papers: [],
      total: 0,
      source: 'semantic-scholar'
    };
  }
};
