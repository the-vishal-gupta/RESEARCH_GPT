import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const CORE_API_URL = '/api/core';

// Get API key from environment variable
const CORE_API_KEY = import.meta.env.VITE_CORE_API_KEY || '';

interface CorePaper {
  id: string;
  title: string;
  abstract?: string;
  yearPublished?: number;
  authors?: Array<{ name: string }>;
  citationCount?: number;
  downloadUrl?: string;
  doi?: string;
  publisher?: string;
  journalTitle?: string;
  isOpenAccess?: boolean;
}

export const searchCore = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    // If no API key, return empty results
    if (!CORE_API_KEY) {
      console.warn('CORE API key not configured. Set VITE_CORE_API_KEY environment variable.');
      return {
        papers: [],
        total: 0,
        source: 'core'
      };
    }

    const { query, maxResults = 10 } = options;
    
    // Search for papers with open access filter
    const searchQuery = `(${query}) AND isOpenAccess:true`;
    
    const params = new URLSearchParams({
      q: searchQuery,
      limit: (maxResults * 3).toString(), // Get more to filter
      offset: '0',
      sort: '-citationCount'
    });
    
    const response = await axios.get(`${CORE_API_URL}?${params.toString()}`, {
      headers: {
        'User-Agent': 'ResearchGPT (https://github.com/vishal/research-gpt)',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    const data = response.data;
    const papers: Paper[] = [];
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((item: CorePaper) => {
        const year = item.yearPublished || new Date().getFullYear();
        
        // STRICT filtering: Only papers with downloadUrl AND open access
        if (year <= 2024 && item.downloadUrl && item.isOpenAccess) {
          papers.push({
            id: `core-${item.id}`,
            title: item.title || 'Untitled',
            authors: item.authors?.map(a => a.name) || ['Unknown Author'],
            publication: item.journalTitle || 'Open Access Repository',
            year,
            abstract: item.abstract || 'No abstract available',
            citations: item.citationCount || 0,
            pdfUrl: item.downloadUrl,
            doi: item.doi,
            publisher: 'CORE (Open Access)'
          });
        }
      });
    }
    
    // Return only papers with PDFs, limit to maxResults
    const finalPapers = papers.slice(0, maxResults);
    
    console.log('CORE API:', { 
      query: searchQuery,
      requested: maxResults,
      found: finalPapers.length,
      withPdf: finalPapers.filter(p => p.pdfUrl).length
    });
    
    return {
      papers: finalPapers,
      total: finalPapers.length,
      source: 'core'
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ CORE API error:', {
      message: errorMsg,
      hasApiKey: !!CORE_API_KEY,
      timestamp: new Date().toISOString()
    });
    return {
      papers: [],
      total: 0,
      source: 'core'
    };
  }
};
