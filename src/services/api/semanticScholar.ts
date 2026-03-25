import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const SEMANTIC_SCHOLAR_API_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';

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
    
    const params = new URLSearchParams({
      query,
      limit: maxResults.toString(),
      fields: 'paperId,title,abstract,year,authors,citationCount,venue,externalIds,openAccessPdf'
    });
    
    const response = await axios.get(`${SEMANTIC_SCHOLAR_API_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json'
      }
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
    
    return {
      papers,
      total: data.total || papers.length,
      source: 'semantic-scholar'
    };
  } catch (error) {
    console.error('Semantic Scholar API error:', error);
    return {
      papers: [],
      total: 0,
      source: 'semantic-scholar'
    };
  }
};
