// Shared types for all API services
import type { Paper } from '@/types';

export interface APIResponse {
  papers: Paper[];
  total: number;
  source: 'arxiv' | 'semantic-scholar' | 'crossref' | 'core' | 'aggregated';
}

export interface SearchOptions {
  query: string;
  maxResults?: number;
  offset?: number;
}
