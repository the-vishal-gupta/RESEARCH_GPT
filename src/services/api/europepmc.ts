import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const EUROPEPMC_API_URL = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';

interface EuropePMCResult {
  id: string;
  title: string;
  authorString?: string;
  pubYear?: string;
  journalTitle?: string;
  abstractText?: string;
  citedByCount?: number;
  doi?: string;
  fullTextUrlList?: {
    fullTextUrl?: Array<{
      url: string;
      documentStyle: string;
    }>;
  };
  isOpenAccess?: string;
}

export const searchEuropePMC = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 10 } = options;
    
    const params = new URLSearchParams({
      query: `${query} AND OPEN_ACCESS:y`,
      format: 'json',
      pageSize: Math.min(maxResults * 2, 50).toString(),
      resultType: 'core'
    });
    
    const response = await axios.get(`${EUROPEPMC_API_URL}?${params.toString()}`, {
      timeout: 10000
    });
    
    const data = response.data;
    const papers: Paper[] = [];
    
    if (data.resultList?.result && Array.isArray(data.resultList.result)) {
      data.resultList.result.forEach((item: EuropePMCResult) => {
        const year = item.pubYear ? parseInt(item.pubYear) : new Date().getFullYear();
        
        // Get authors from authorString (format: "Smith J, Doe A, Johnson B")
        const authors = item.authorString 
          ? item.authorString.split(',').map(a => a.trim()).slice(0, 10)
          : ['Unknown Author'];
        
        // Get PDF URL
        let pdfUrl: string | undefined;
        if (item.fullTextUrlList?.fullTextUrl) {
          const pdfLink = item.fullTextUrlList.fullTextUrl.find(
            url => url.documentStyle === 'pdf' || url.url.includes('.pdf')
          );
          pdfUrl = pdfLink?.url;
        }
        
        if (year <= 2024 && item.isOpenAccess === 'Y') {
          papers.push({
            id: `europepmc-${item.id}`,
            title: item.title || 'Untitled',
            authors,
            publication: item.journalTitle || 'Europe PMC',
            year,
            abstract: item.abstractText || 'No abstract available',
            citations: item.citedByCount || 0,
            pdfUrl,
            doi: item.doi,
            publisher: 'Europe PMC'
          });
        }
      });
    }
    
    console.log('Europe PMC API:', { query, requested: maxResults, found: papers.length });
    
    return {
      papers,
      total: data.hitCount || papers.length,
      source: 'europepmc' as any
    };
  } catch (error) {
    console.error('❌ Europe PMC API error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      papers: [],
      total: 0,
      source: 'europepmc' as any
    };
  }
};
