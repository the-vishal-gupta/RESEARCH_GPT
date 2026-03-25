import axios from 'axios';
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';
import { filterPapersByYear } from '@/utils/queryProcessor';

const ARXIV_API_URL = 'https://export.arxiv.org/api/query';
const DEBUG = import.meta.env.DEV;

// Parse arXiv XML response
const parseArxivXML = (xmlText: string): Paper[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const entries = xmlDoc.querySelectorAll('entry');
  
  const papers: Paper[] = [];
  
  entries.forEach((entry, index) => {
    const id = entry.querySelector('id')?.textContent?.trim() || '';
    const title = entry.querySelector('title')?.textContent?.trim().replace(/\s+/g, ' ') || '';
    const summary = entry.querySelector('summary')?.textContent?.trim().replace(/\s+/g, ' ') || '';
    const published = entry.querySelector('published')?.textContent || '';
    const year = published ? new Date(published).getFullYear() : new Date().getFullYear();
    
    // Get authors
    const authorNodes = entry.querySelectorAll('author name');
    const authors: string[] = [];
    authorNodes.forEach(node => {
      const name = node.textContent?.trim();
      if (name) authors.push(name);
    });
    
    // Get PDF link - arXiv always has PDFs
    // Extract arXiv ID from entry id (format: http://arxiv.org/abs/1234.5678v1)
    let pdfUrl = '';
    if (id) {
      const arxivId = id.split('/abs/')[1];
      if (arxivId) {
        // Remove version number if present
        const cleanId = arxivId.replace(/v\d+$/, '');
        pdfUrl = `https://arxiv.org/pdf/${cleanId}.pdf`;
      }
    }
    
    // Fallback: check link elements
    if (!pdfUrl) {
      const links = entry.querySelectorAll('link');
      links.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (link.getAttribute('title') === 'pdf' || href.includes('/pdf/')) {
          pdfUrl = href;
        }
      });
    }
    
    // Get DOI if available
    const doiElement = entry.querySelector('arxiv\\:doi, doi');
    const doi = doiElement?.textContent || '';
    
    // Get categories
    const categories = entry.querySelectorAll('category');
    const publication = categories.length > 0 
      ? `arXiv:${categories[0].getAttribute('term')}` 
      : 'arXiv';
    
    papers.push({
      id: `arxiv-${index}-${Date.now()}`,
      title,
      authors: authors.length > 0 ? authors : ['Unknown Author'],
      publication,
      year,
      abstract: summary,
      citations: 0,
      pdfUrl: pdfUrl || undefined,
      doi: doi || undefined,
      publisher: 'arXiv'
    });

    if (DEBUG) {
      console.log('arXiv paper:', { title: title.slice(0, 50), pdfUrl });
    }
  });
  
  return papers;
};

export const searchArxiv = async (options: SearchOptions): Promise<APIResponse> => {
  try {
    const { query, maxResults = 10 } = options;
    
    const params = new URLSearchParams({
      search_query: `all:${query}`,
      start: '0',
      max_results: maxResults.toString(),
      sortBy: 'relevance',
      sortOrder: 'descending'
    });
    
    const response = await axios.get(`${ARXIV_API_URL}?${params.toString()}`, {
      headers: {
        'Accept': 'application/xml'
      }
    });
    
    const papers = parseArxivXML(response.data);
    
    // Filter out papers after 2024
    const filteredPapers = filterPapersByYear(papers, 2024);
    
    // arXiv papers ALWAYS have PDFs, so all should have pdfUrl
    const papersWithPdf = filteredPapers.filter(p => p.pdfUrl);
    
    console.log('arXiv API:', { query, requested: maxResults, found: papersWithPdf.length, withPdf: papersWithPdf.length });
    
    return {
      papers: papersWithPdf,
      total: papersWithPdf.length,
      source: 'arxiv'
    };
  } catch (error) {
    if (DEBUG) {
      console.error('arXiv API error:', error);
    }
    return {
      papers: [],
      total: 0,
      source: 'arxiv'
    };
  }
};
