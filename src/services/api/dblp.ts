import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const DBLP_API_URL = 'https://dblp.org/search/publ/api';

interface DBLPHit {
  info: {
    title: string;
    authors?: {
      author: string | string[];
    };
    year?: string;
    venue?: string;
    doi?: string;
    ee?: string; // Electronic edition (PDF link)
    url?: string;
  };
}

export const searchDBLP = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 10 } = options;
    
    const params = new URLSearchParams({
      q: query,
      h: Math.min(maxResults * 2, 50).toString(),
      format: 'json'
    });
    
    const response = await axios.get(`${DBLP_API_URL}?${params.toString()}`, {
      timeout: 10000
    });
    
    const data = response.data;
    const papers: Paper[] = [];
    
    if (data.result?.hits?.hit && Array.isArray(data.result.hits.hit)) {
      data.result.hits.hit.forEach((hit: DBLPHit) => {
        const item = hit.info;
        const year = item.year ? parseInt(item.year) : new Date().getFullYear();
        
        // Get authors
        let authors: string[] = ['Unknown Author'];
        if (item.authors?.author) {
          if (Array.isArray(item.authors.author)) {
            authors = item.authors.author;
          } else {
            authors = [item.authors.author];
          }
        }
        
        // DBLP provides links to papers, check if it's a PDF
        const pdfUrl = item.ee && (item.ee.includes('.pdf') || item.ee.includes('arxiv')) 
          ? item.ee 
          : undefined;
        
        if (year <= 2024) {
          papers.push({
            id: `dblp-${item.url || Date.now()}`,
            title: item.title || 'Untitled',
            authors,
            publication: item.venue || 'DBLP',
            year,
            abstract: 'No abstract available',
            citations: 0,
            pdfUrl,
            doi: item.doi,
            publisher: 'DBLP'
          });
        }
      });
    }
    
    console.log('DBLP API:', { query, requested: maxResults, found: papers.length });
    
    return {
      papers,
      total: data.result?.hits?.['@total'] || papers.length,
      source: 'dblp' as any
    };
  } catch (error) {
    console.error('❌ DBLP API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      papers: [],
      total: 0,
      source: 'dblp' as any
    };
  }
};
