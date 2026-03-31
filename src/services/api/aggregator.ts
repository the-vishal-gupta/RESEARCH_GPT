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

// Fast regex-based query intent detection (no LLM needed)
const detectQueryIntentFast = (query: string): 'citations' | 'year' | 'relevance' => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.match(/most cited|highly cited|top cited|best cited|popular|famous/i)) {
    return 'citations';
  }

  if (lowerQuery.match(/recent|latest|newest|new|2024|2023|2022|this year|last year/i)) {
    return 'year';
  }

  return 'relevance';
};

// Fast regex-based search term extraction
const extractSearchTermsFast = (query: string): string => {
  return query
    .replace(/most cited|highly cited|top cited|best cited|popular|famous/gi, '')
    .replace(/recent|latest|newest|new|this year|last year/gi, '')
    .replace(/papers?|articles?|research|on|about|for/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

// Search all APIs in parallel and aggregate results
export const searchAllAPIs = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 20 } = options;

    // Use fast regex detection for query intent - don't block on LLM
    // LLM can run in background if needed
    const queryIntent = {
      sortBy: detectQueryIntentFast(query),
      searchTerms: extractSearchTermsFast(query)
    };

    const processedQuery = processSearchQuery(queryIntent.searchTerms);

    if (DEBUG) {
      console.log('⚡ Query processed instantly');
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
    // Show papers with citations first, but don't exclude papers with 0 citations
    let filteredPapers = papersWithPdf;
    if (queryIntent.sortBy === 'citations') {
      // Separate papers into two groups
      const papersWithCitations = papersWithPdf.filter(paper => paper.citations > 0);
      const papersWithoutCitations = papersWithPdf.filter(paper => paper.citations === 0);

      // If we have papers with citations, use those; otherwise use all papers
      if (papersWithCitations.length > 0) {
        // Combine: papers with citations first, then papers without citations
        filteredPapers = [...papersWithCitations, ...papersWithoutCitations];
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
      console.log('=== 📚 PAPER FETCHING DEBUG REPORT ===');
      console.log('Original query:', query);
      console.log('Detected intent:', queryIntent.sortBy);
      console.log('Search terms:', queryIntent.searchTerms);
      console.log('Processed query:', processedQuery);
      console.log('');
      console.log('=== 🔍 API RESULTS (FREE PDFs ONLY) ===');
      console.log(`✅ arXiv: ${arxivResults.status === 'fulfilled' ? arxivResults.value.papers.length : '❌ FAILED'} papers (100% have PDFs)`);
      if (arxivResults.status === 'rejected') console.log('   Error:', arxivResults.reason?.message);
      console.log(`✅ Semantic Scholar: ${semanticResults.status === 'fulfilled' ? semanticResults.value.papers.length : '❌ FAILED'} papers`);
      if (semanticResults.status === 'rejected') console.log('   Error:', semanticResults.reason?.message);
      console.log(`✅ CORE: ${coreResults.status === 'fulfilled' ? coreResults.value.papers.length : '❌ FAILED'} papers (open access)`);
      if (coreResults.status === 'rejected') console.log('   Error:', coreResults.reason?.message);
      console.log('');
      console.log('=== 📊 AGGREGATION RESULTS ===');
      console.log(`Total collected: ${allPapers.length} papers`);
      console.log(`After deduplication: ${uniquePapers.length} papers`);
      console.log(`After citation enrichment: ${enrichedPapers.filter(p => p.citations > 0).length} papers have citations`);
      console.log(`Papers with FREE PDFs: ${papersWithPdf.length}`);
      console.log(`Paywalled papers: ${paywalledPapers.length}`);
      console.log(`After filtering (for ${queryIntent.sortBy}): ${filteredPapers.length}`);
      console.log(`Final result: ${freePapers.length} free + ${latestPaywalled.length} paywalled = ${finalPapers.length} total`);
      console.log('');
      if (finalPapers.length === 0) {
        console.error('❌ NO RESULTS FOUND!');
        console.error('Try these suggestions:');
        console.error('  1. Use broader search terms like "machine learning" (not "ML in healthcare")');
        console.error('  2. Try simple keywords: "deep learning", "neural networks", "AI"');
        console.error('  3. Check that the backend server is running: node server.js');
        console.error('  4. Check browser console for specific API errors');
      } else {
        console.log('✨ Papers returned successfully!');
      }
      console.log('====================================');
    }
    
    return {
      papers: finalPapers,
      total: finalPapers.length,
      source: 'aggregated'
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Aggregator error:', {
      message: errorMsg,
      timestamp: new Date().toISOString(),
      // Include stack trace in dev mode for debugging
      ...(DEBUG && { stack: error instanceof Error ? error.stack : undefined })
    });
    return {
      papers: [],
      total: 0,
      source: 'aggregated'
    };
  }
};
