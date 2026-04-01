import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const SCHOLAR_API_URL = 'http://localhost:5001/api/scholar';

export const searchGoogleScholar = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 10 } = options;
    
    const params = new URLSearchParams({
      query,
      maxResults: maxResults.toString()
    });
    
    const response = await axios.get(`${SCHOLAR_API_URL}/search?${params.toString()}`, {
      timeout: 120000 // 2 minutes (Scholar is slow)
    });
    
    const papers = response.data.papers || [];
    
    console.log('Google Scholar API:', { query, requested: maxResults, found: papers.length });
    
    return {
      papers,
      total: response.data.total || papers.length,
      source: 'google-scholar' as any
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Google Scholar server not running. Start it with: python scholar_server.py');
      } else if (error.response?.status === 429) {
        console.error('❌ Google Scholar rate limit exceeded. Wait a few minutes.');
      }
    }
    console.error('❌ Google Scholar API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      papers: [],
      total: 0,
      source: 'google-scholar' as any
    };
  }
};

export const searchGoogleScholarByAuthor = async (authorName: string, maxResults: number = 10): Promise<APIResponse> => {
  try {
    const params = new URLSearchParams({
      name: authorName,
      maxResults: maxResults.toString()
    });
    
    const response = await axios.get(`${SCHOLAR_API_URL}/author?${params.toString()}`, {
      timeout: 120000 // 2 minutes
    });
    
    const papers = response.data.papers || [];
    
    console.log('Google Scholar Author API:', { 
      author: authorName, 
      requested: maxResults, 
      found: papers.length,
      authorInfo: response.data.author 
    });
    
    return {
      papers,
      total: response.data.total || papers.length,
      source: 'google-scholar' as any
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Google Scholar server not running. Start it with: python scholar_server.py');
      } else if (error.response?.status === 404) {
        console.error(`❌ Author "${authorName}" not found on Google Scholar`);
      }
    }
    console.error('❌ Google Scholar Author API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      papers: [],
      total: 0,
      source: 'google-scholar' as any
    };
  }
};

// Check if Scholar server is running
export const checkScholarAvailability = async (): Promise<boolean> => {
  try {
    await axios.get(`${SCHOLAR_API_URL.replace('/api/scholar', '')}/health`, {
      timeout: 3000
    });
    return true;
  } catch {
    return false;
  }
};
