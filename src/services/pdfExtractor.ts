import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedPaperContent {
  paperId: string;
  fullText: string;
  pageCount: number;
  extractedAt: Date;
  wordCount: number;
}

// Extract text from PDF URL
export const extractPdfText = async (pdfUrl: string): Promise<string> => {
  try {
    console.log('📄 Extracting PDF from:', pdfUrl);

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;

    console.log(`📚 PDF loaded: ${pdf.numPages} pages`);

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }

    console.log(`✅ Extracted ${fullText.length} characters`);
    return fullText.trim();
  } catch (error) {
    console.error('❌ PDF extraction failed:', error);
    throw new Error('Failed to extract PDF text');
  }
};

// Cache management for extracted PDFs
export const pdfCacheService = {
  // Get cached PDF content
  getCached: (paperId: string): ExtractedPaperContent | null => {
    const key = `pdf_cache_${paperId}`;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    try {
      const data = JSON.parse(cached);
      return {
        ...data,
        extractedAt: new Date(data.extractedAt)
      };
    } catch {
      return null;
    }
  },

  // Save extracted PDF content
  setCached: (paperId: string, content: ExtractedPaperContent): void => {
    const key = `pdf_cache_${paperId}`;
    localStorage.setItem(key, JSON.stringify(content));
  },

  // Check if PDF is cached
  isCached: (paperId: string): boolean => {
    return !!pdfCacheService.getCached(paperId);
  },

  // Clear cache for a specific paper
  clearCache: (paperId: string): void => {
    const key = `pdf_cache_${paperId}`;
    localStorage.removeItem(key);
  },

  // Clear all PDF cache
  clearAllCache: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('pdf_cache_')) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get cache size
  getCacheSize: (): number => {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('pdf_cache_')) {
        size += localStorage.getItem(key)?.length || 0;
      }
    });
    return size;
  }
};

// Extract and cache PDF content
export const extractAndCachePdf = async (
  paperId: string,
  pdfUrl: string
): Promise<ExtractedPaperContent> => {
  // Check cache first
  const cached = pdfCacheService.getCached(paperId);
  if (cached) {
    console.log('💾 Using cached PDF content');
    return cached;
  }

  // Extract from PDF
  const fullText = await extractPdfText(pdfUrl);
  const wordCount = fullText.split(/\s+/).length;

  const content: ExtractedPaperContent = {
    paperId,
    fullText,
    pageCount: 0, // Will be set during extraction
    extractedAt: new Date(),
    wordCount
  };

  // Cache the result
  pdfCacheService.setCached(paperId, content);

  return content;
};

// Extract text from multiple papers
export const extractMultiplePdfs = async (
  papers: Array<{ id: string; pdfUrl?: string }>
): Promise<Map<string, ExtractedPaperContent>> => {
  const results = new Map<string, ExtractedPaperContent>();

  for (const paper of papers) {
    if (!paper.pdfUrl) continue;

    try {
      const content = await extractAndCachePdf(paper.id, paper.pdfUrl);
      results.set(paper.id, content);
    } catch (error) {
      console.error(`Failed to extract PDF for ${paper.id}:`, error);
    }
  }

  return results;
};

// Smart text chunking for large PDFs
export const chunkText = (text: string, maxChunkSize: number = 2000): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
};

// Extract relevant sections from PDF
export const extractRelevantSections = (
  fullText: string,
  query: string,
  maxSections: number = 3
): string[] => {
  const chunks = chunkText(fullText, 1000);
  
  // Score each chunk based on query relevance
  const scored = chunks.map(chunk => {
    const queryWords = query.toLowerCase().split(/\s+/);
    const chunkLower = chunk.toLowerCase();
    const score = queryWords.filter(word => chunkLower.includes(word)).length;
    return { chunk, score };
  });

  // Return top scoring chunks
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSections)
    .map(s => s.chunk);
};
