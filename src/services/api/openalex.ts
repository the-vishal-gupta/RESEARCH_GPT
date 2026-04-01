import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const OPENALEX_API_URL = 'https://api.openalex.org/works';

interface OpenAlexWork {
  id: string;
  title: string;
  publication_year?: number;
  authorships?: Array<{
    author: {
      display_name: string;
    };
  }>;
  abstract_inverted_index?: Record<string, number[]>;
  cited_by_count?: number;
  primary_location?: {
    source?: {
      display_name?: string;
    };
  };
  doi?: string;
  open_access?: {
    oa_url?: string;
    is_oa?: boolean;
  };
}

// Reconstruct abstract from inverted index
const reconstructAbstract = (invertedIndex?: Record<string, number[]>): string => {
  if (!invertedIndex) return 'No abstract available';
  
  try {
    const words: [string, number][] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      positions.forEach(pos => words.push([word, pos]));
    }
    words.sort((a, b) => a[1] - b[1]);
    return words.map(w => w[0]).join(' ').slice(0, 500);
  } catch {
    return 'No abstract available';
  }
};

export const searchOpenAlex = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 10 } = options;
    
    const params = new URLSearchParams({
      search: query,
      per_page: Math.min(maxResults * 2, 50).toString(),
      filter: 'is_oa:true', // Only open access papers
      mailto: 'research@example.com' // Polite pool (faster)
    });
    
    const response = await axios.get(`${OPENALEX_API_URL}?${params.toString()}`, {
      timeout: 10000
    });
    
    const data = response.data;
    const papers: Paper[] = [];
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((item: OpenAlexWork) => {
        const year = item.publication_year || new Date().getFullYear();
        
        if (year <= 2024 && item.open_access?.oa_url) {
          papers.push({
            id: `openalex-${item.id}`,
            title: item.title || 'Untitled',
            authors: item.authorships?.map(a => a.author.display_name) || ['Unknown Author'],
            publication: item.primary_location?.source?.display_name || 'OpenAlex',
            year,
            abstract: reconstructAbstract(item.abstract_inverted_index),
            citations: item.cited_by_count || 0,
            pdfUrl: item.open_access?.oa_url,
            doi: item.doi,
            publisher: 'OpenAlex'
          });
        }
      });
    }
    
    console.log('OpenAlex API:', { query, requested: maxResults, found: papers.length });
    
    return {
      papers,
      total: data.meta?.count || papers.length,
      source: 'openalex' as any
    };
  } catch (error) {
    console.error('❌ OpenAlex API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      papers: [],
      total: 0,
      source: 'openalex' as any
    };
  }
};
