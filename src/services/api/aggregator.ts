import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';
import { searchArxiv } from './arxiv';
import { searchSemanticScholar } from './semanticScholar';
import { searchCrossRef } from './crossref';
import { processSearchQuery } from '@/utils/queryProcessor';

// Environment-based debugging
const DEBUG = import.meta.env.DEV;

// Create a normalized fingerprint from title (first 3 words)
const getTitleFingerprint = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .split(/\s+/)
    .slice(0, 3)
    .join(' ')
    .trim();
};

// Remove duplicate papers based on title fingerprints
const deduplicatePapers = (papers: Paper[]): Paper[] => {
  const uniquePapersMap = new Map<string, Paper>();

  for (const paper of papers) {
    const fingerprint = getTitleFingerprint(paper.title);

    if (fingerprint && uniquePapersMap.has(fingerprint)) {
      // Merge data: keep the one with more information
      const existingPaper = uniquePapersMap.get(fingerprint)!;

      if (paper.citations > existingPaper.citations) {
        existingPaper.citations = paper.citations;
      }
      if (!existingPaper.abstract || existingPaper.abstract === 'No abstract available') {
        existingPaper.abstract = paper.abstract;
      }
      if (!existingPaper.pdfUrl && paper.pdfUrl) {
        existingPaper.pdfUrl = paper.pdfUrl;
      }
      if (!existingPaper.doi && paper.doi) {
        existingPaper.doi = paper.doi;
      }
    } else if (fingerprint) {
      // Add new unique paper
      uniquePapersMap.set(fingerprint, paper);
    }
  }

  return Array.from(uniquePapersMap.values());
};

// Search all APIs in parallel and aggregate results
export const searchAllAPIs = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 20 } = options;
    
    // Process query to extract meaningful search terms
    const processedQuery = processSearchQuery(query);

    if (DEBUG) {
      console.log('Original query:', query);
      console.log('Processed query:', processedQuery);
    }
    
    // Call all APIs in parallel with processed query
    // Note: CORE API requires proper open access filtering
    const [arxivResults, semanticResults, crossrefResults] = await Promise.allSettled([
      searchArxiv({ query: processedQuery, maxResults: Math.ceil(maxResults / 3) }),
      searchSemanticScholar({ query: processedQuery, maxResults: Math.ceil(maxResults / 3) }),
      searchCrossRef({ query: processedQuery, maxResults: Math.ceil(maxResults / 3) })
    ]);
    
    // Collect all papers
    const allPapers: Paper[] = [];
    
    if (arxivResults.status === 'fulfilled') {
      allPapers.push(...arxivResults.value.papers);
    }
    
    if (semanticResults.status === 'fulfilled') {
      allPapers.push(...semanticResults.value.papers);
    }
    
    if (crossrefResults.status === 'fulfilled') {
      allPapers.push(...crossrefResults.value.papers);
    }
    
    // Deduplicate papers
    const uniquePapers = deduplicatePapers(allPapers);
    
    // Separate papers by PDF availability
    const papersWithPdf = uniquePapers.filter(paper => paper.pdfUrl);
    const papersWithoutPdf = uniquePapers.filter(paper => !paper.pdfUrl);

    // Sort papers with PDFs by citations (most cited first)
    papersWithPdf.sort((a, b) => b.citations - a.citations);
    // Sort papers without PDFs by citations
    papersWithoutPdf.sort((a, b) => b.citations - a.citations);

    // Combine: ALL papers with PDFs first, then papers without
    const sortedPapers = [...papersWithPdf, ...papersWithoutPdf];
    
    // Limit to maxResults
    const finalPapers = sortedPapers.slice(0, maxResults);

    if (DEBUG) {
      console.log(`Found ${papersWithPdf.length} papers with PDFs, ${papersWithoutPdf.length} without PDFs`);
    }
    
    return {
      papers: finalPapers,
      total: finalPapers.length,
      source: 'aggregated'
    };
  } catch (error) {
    if (DEBUG) {
      console.error('Aggregator error:', error);
    }
    return {
      papers: [],
      total: 0,
      source: 'aggregated'
    };
  }
};
