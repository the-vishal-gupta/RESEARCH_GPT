export interface Paper {
  id: string;
  title: string;
  authors: string[];
  publication: string;
  year: number;
  pages?: string;
  abstract: string;
  citations: number;
  pdfUrl?: string;
  doi?: string;
  publisher?: string;
}

export interface LabsResult extends Paper {
  aiSummary: string;
  relevancePoints: string[];
}

export interface SavedPaper extends Paper {
  savedAt: Date;
  labels: string[];
}

export type SearchType = 'articles' | 'books' | 'patents' | 'case-law';

export type SortBy = 'relevance' | 'date';

export interface SearchFilters {
  sortBy: SortBy;
  dateRange: string;
  type: SearchType;
  language: string;
  openAccessOnly: boolean;
}

export interface ResearchQuestion {
  id: string;
  question: string;
  timestamp: Date;
  results: LabsResult[];
  status: 'analyzing' | 'searching' | 'evaluating' | 'complete';
  progress: number;
}
