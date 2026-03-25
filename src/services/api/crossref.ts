import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const CROSSREF_API_URL = 'https://api.crossref.org/works';

interface CrossRefWork {
  DOI: string;
  title?: string[];
  abstract?: string;
  author?: Array<{ given?: string; family?: string }>;
  'published-print'?: { 'date-parts'?: number[][] };
  'published-online'?: { 'date-parts'?: number[][] };
  'container-title'?: string[];
  publisher?: string;
  'is-referenced-by-count'?: number;
  page?: string;
}

export const searchCrossRef = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 10 } = options;
    
    const params = new URLSearchParams({
      query: query,
      rows: maxResults.toString(),
      sort: 'relevance',
      order: 'desc'
    });
    
    const response = await axios.get(`${CROSSREF_API_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = response.data;
    const papers: Paper[] = [];
    
    if (data.message && data.message.items && Array.isArray(data.message.items)) {
      data.message.items.forEach((item: CrossRefWork) => {
        // Get year
        const dateInfo = item['published-print'] || item['published-online'];
        const year = dateInfo?.['date-parts']?.[0]?.[0] || new Date().getFullYear();
        
        // Only include papers from 2024 or earlier
        if (year <= 2024) {
          // Get authors
          const authors = item.author?.map(a => {
            const given = a.given || '';
            const family = a.family || '';
            return `${given} ${family}`.trim();
          }).filter(name => name.length > 0) || ['Unknown Author'];
          
          papers.push({
            id: `crossref-${item.DOI}`,
            title: item.title?.[0] || 'Untitled',
            authors,
            publication: item['container-title']?.[0] || 'Unknown Journal',
            year,
            abstract: item.abstract || 'No abstract available',
            citations: item['is-referenced-by-count'] || 0,
            doi: item.DOI,
            publisher: item.publisher || 'Unknown Publisher',
            pages: item.page
          });
        }
      });
    }
    
    return {
      papers,
      total: data.message?.['total-results'] || papers.length,
      source: 'crossref'
    };
  } catch (error) {
    console.error('CrossRef API error:', error);
    return {
      papers: [],
      total: 0,
      source: 'crossref'
    };
  }
};
