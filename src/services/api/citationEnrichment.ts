import axios from 'axios';
import type { Paper } from '@/types';

const DEBUG = import.meta.env.DEV;

// Enrich papers with citation counts from Semantic Scholar
export const enrichWithCitations = async (papers: Paper[]): Promise<Paper[]> => {
  const enrichedPapers = [...papers];
  
  // Only enrich papers with 0 citations
  const papersNeedingCitations = enrichedPapers.filter(p => p.citations === 0);
  
  if (papersNeedingCitations.length === 0) {
    return enrichedPapers;
  }

  if (DEBUG) {
    console.log(`Enriching ${papersNeedingCitations.length} papers with citation data...`);
  }

  // Process in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < papersNeedingCitations.length; i += batchSize) {
    const batch = papersNeedingCitations.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (paper) => {
        try {
          // Try to find paper by DOI first (most accurate)
          if (paper.doi) {
            const citations = await getCitationsByDOI(paper.doi);
            if (citations > 0) {
              paper.citations = citations;
              if (DEBUG) console.log(`Enriched "${paper.title.slice(0, 50)}..." with ${citations} citations (via DOI)`);
              return;
            }
          }

          // Try by arXiv ID if it's an arXiv paper
          if (paper.pdfUrl?.includes('arxiv.org')) {
            const arxivId = extractArxivId(paper.pdfUrl);
            if (arxivId) {
              const citations = await getCitationsByArxivId(arxivId);
              if (citations > 0) {
                paper.citations = citations;
                if (DEBUG) console.log(`Enriched "${paper.title.slice(0, 50)}..." with ${citations} citations (via arXiv ID)`);
                return;
              }
            }
          }

          // Fallback: search by title
          const citations = await getCitationsByTitle(paper.title);
          if (citations > 0) {
            paper.citations = citations;
            if (DEBUG) console.log(`Enriched "${paper.title.slice(0, 50)}..." with ${citations} citations (via title)`);
          }
        } catch (error) {
          if (DEBUG) console.error(`Failed to enrich paper: ${paper.title.slice(0, 50)}`, error);
        }
      })
    );

    // Small delay between batches to respect rate limits
    if (i + batchSize < papersNeedingCitations.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return enrichedPapers;
};

// Get citations by DOI from Semantic Scholar
const getCitationsByDOI = async (doi: string): Promise<number> => {
  try {
    const url = import.meta.env.DEV 
      ? `/api/semantic/paper/DOI:${encodeURIComponent(doi)}`
      : `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}`;
    
    const response = await axios.get(url, {
      params: { fields: 'citationCount' },
      timeout: 3000
    });
    
    return response.data?.citationCount || 0;
  } catch (error) {
    return 0;
  }
};

// Get citations by arXiv ID from Semantic Scholar
const getCitationsByArxivId = async (arxivId: string): Promise<number> => {
  try {
    const url = import.meta.env.DEV
      ? `/api/semantic/paper/ARXIV:${arxivId}`
      : `https://api.semanticscholar.org/graph/v1/paper/ARXIV:${arxivId}`;
    
    const response = await axios.get(url, {
      params: { fields: 'citationCount' },
      timeout: 3000
    });
    
    return response.data?.citationCount || 0;
  } catch (error) {
    return 0;
  }
};

// Get citations by title from Semantic Scholar
const getCitationsByTitle = async (title: string): Promise<number> => {
  try {
    const url = import.meta.env.DEV
      ? '/api/semantic/paper/search'
      : 'https://api.semanticscholar.org/graph/v1/paper/search';
    
    const response = await axios.get(url, {
      params: {
        query: title,
        limit: 1,
        fields: 'citationCount,title'
      },
      timeout: 3000
    });
    
    const papers = response.data?.data || [];
    if (papers.length > 0) {
      // Check if title matches closely
      const foundTitle = papers[0].title.toLowerCase();
      const searchTitle = title.toLowerCase();
      if (foundTitle.includes(searchTitle.slice(0, 30)) || searchTitle.includes(foundTitle.slice(0, 30))) {
        return papers[0].citationCount || 0;
      }
    }
    
    return 0;
  } catch (error) {
    return 0;
  }
};

// Extract arXiv ID from PDF URL
const extractArxivId = (pdfUrl: string): string | null => {
  const match = pdfUrl.match(/arxiv\.org\/pdf\/([0-9.]+)/);
  return match ? match[1] : null;
};
