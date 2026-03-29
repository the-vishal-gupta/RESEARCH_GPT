import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';
import { searchArxiv } from './arxiv';
import { searchSemanticScholar } from './semanticScholar';
import { searchCore } from './core';

import { processSearchQuery } from '@/utils/queryProcessor';
import { detectQueryIntentWithLLM } from '@/services/llm/localLLM';
import { enrichWithCitations } from '@/services/llm/citationEnrichment';

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

// Remove duplicate papers based on title fingerprints and merge citation data
const deduplicatePapers = (papers: Paper[]): Paper[] => {
  const uniquePapersMap = new Map<string, Paper>();

  for (const paper of papers) {
    const fingerprint = getTitleFingerprint(paper.title);

    if (fingerprint && uniquePapersMap.has(fingerprint)) {
      // Merge data: keep the one with more information
      const existingPaper = uniquePapersMap.get(fingerprint)!;

      // CRITICAL: Always use the highest citation count from any source
      if (paper.citations > existingPaper.citations) {
        existingPaper.citations = paper.citations;
      }
      if (!existingPaper.abstract || existingPaper.abstract === 'No abstract available') {
        existingPaper.abstract = paper.abstract;
      }
      // Prefer arXiv PDFs as they're most reliable
      if (!existingPaper.pdfUrl && paper.pdfUrl) {
        existingPaper.pdfUrl = paper.pdfUrl;
      } else if (paper.pdfUrl && paper.pdfUrl.includes('arxiv.org')) {
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
    
    // Detect query intent (sorting preference) and extract clean search terms using LLM
    const queryIntent = await detectQueryIntentWithLLM(query);
    const processedQuery = processSearchQuery(queryIntent.searchTerms);

    if (DEBUG) {
      console.log('Original query:', query);
      console.log('Detected intent:', queryIntent.sortBy);
      console.log('Search terms:', queryIntent.searchTerms);
      console.log('Processed query:', processedQuery);
    }
    
    // Call APIs that provide FREE PDFs: arXiv (100% free), Semantic Scholar (open access), and CORE (open access)
    const [arxivResults, semanticResults, coreResults] = await Promise.allSettled([
      searchArxiv({ query: processedQuery, maxResults: maxResults }),
      searchSemanticScholar({ query: processedQuery, maxResults: maxResults }),
      searchCore({ query: processedQuery, maxResults: maxResults })
    ]);
    
    // Collect all papers from all sources
    const allPapers: Paper[] = [];
    
    if (arxivResults.status === 'fulfilled') {
      allPapers.push(...arxivResults.value.papers);
    }
    
    if (semanticResults.status === 'fulfilled') {
      allPapers.push(...semanticResults.value.papers);
    }
    
    if (coreResults.status === 'fulfilled') {
      allPapers.push(...coreResults.value.papers);
    }
    
    // Deduplicate papers
    const uniquePapers = deduplicatePapers(allPapers);
    
    // Enrich papers with citation counts from Semantic Scholar API
    const enrichedPapers = await enrichWithCitations(uniquePapers);
    
    // Separate free and paywalled papers
    const papersWithPdf = enrichedPapers.filter(paper => paper.pdfUrl && paper.pdfUrl.trim() !== '');
    const paywalledPapers = enrichedPapers.filter(paper => !paper.pdfUrl || paper.pdfUrl.trim() === '');

    // Smart filtering for citation-based queries:
    // Only filter out 0-citation papers if we have papers WITH citations
    let filteredPapers = papersWithPdf;
    if (queryIntent.sortBy === 'citations') {
      const papersWithCitations = papersWithPdf.filter(paper => paper.citations > 0);
      // Only apply filter if we have at least some papers with citations
      if (papersWithCitations.length > 0) {
        filteredPapers = papersWithCitations;
      }
      // Otherwise keep all papers (arXiv papers may have 0 citations but are still relevant)
    }

    // Sort papers based on detected intent
    if (queryIntent.sortBy === 'citations') {
      filteredPapers.sort((a, b) => b.citations - a.citations);
    } else if (queryIntent.sortBy === 'year') {
      filteredPapers.sort((a, b) => b.year - a.year);
    } else {
      // Default: sort by citations for relevance
      filteredPapers.sort((a, b) => b.citations - a.citations);
    }
    
    // Get top 3 latest paywalled papers to show users what's available but not free
    const latestPaywalled = paywalledPapers
      .sort((a, b) => b.year - a.year)
      .slice(0, 3)
      .map(paper => ({ ...paper, isPaywalled: true }));
    
    // Limit free papers to maxResults, then append paywalled papers
    const freePapers = filteredPapers.slice(0, maxResults);
    const finalPapers = [...freePapers, ...latestPaywalled];

    if (DEBUG) {
      console.log('=== SEARCH DEBUG ===');
      console.log('Original query:', query);
      console.log('Detected intent:', queryIntent.sortBy);
      console.log('Search terms:', queryIntent.searchTerms);
      console.log('Processed query:', processedQuery);
      console.log('=== API RESULTS (FREE PDFs ONLY) ===');
      console.log(`arXiv: ${arxivResults.status === 'fulfilled' ? arxivResults.value.papers.length : 0} papers (100% have PDFs)`);
      if (arxivResults.status === 'rejected') console.log('arXiv error:', arxivResults.reason);
      console.log(`Semantic Scholar: ${semanticResults.status === 'fulfilled' ? semanticResults.value.papers.length : 0} papers`);
      if (semanticResults.status === 'rejected') console.log('Semantic Scholar error:', semanticResults.reason);
      console.log(`CORE: ${coreResults.status === 'fulfilled' ? coreResults.value.papers.length : 0} papers (open access)`);
      if (coreResults.status === 'rejected') console.log('CORE error:', coreResults.reason);
      console.log(`Total collected: ${allPapers.length} papers`);
      console.log(`After deduplication: ${uniquePapers.length} papers`);
      console.log(`After citation enrichment: ${enrichedPapers.filter(p => p.citations > 0).length} papers have citations`);
      console.log(`Papers with FREE PDFs: ${papersWithPdf.length}`);
      console.log(`Paywalled papers: ${paywalledPapers.length}`);
      console.log(`After filtering (citations > 0 for 'most cited'): ${queryIntent.sortBy === 'citations' ? filteredPapers.length : 'N/A'}`);
      console.log(`Returning: ${freePapers.length} free + ${latestPaywalled.length} paywalled = ${finalPapers.length} total papers`);
      if (finalPapers.length === 0) {
        console.warn('⚠️ NO RESULTS FOUND!');
        console.warn('Try broader search terms like:');
        console.warn('  - "machine learning" (instead of "machine learning in healthcare")');
        console.warn('  - "deep learning"');
        console.warn('  - "neural networks"');
      }
      console.log('====================================');
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
