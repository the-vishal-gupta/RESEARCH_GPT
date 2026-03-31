import type { Paper } from '@/types';

export interface SavedPaper extends Paper {
  savedAt: string;
  notes: string;
  tags: string[];
  rating: number;
}

export const libraryService = {
  savePaper: (userId: string, paper: Paper): void => {
    const key = `library_${userId}`;
    const library: SavedPaper[] = JSON.parse(localStorage.getItem(key) || '[]');

    // Check if already saved
    if (library.some(p => p.id === paper.id)) {
      throw new Error('Paper already saved');
    }

    const savedPaper: SavedPaper = {
      ...paper,
      savedAt: new Date().toISOString(),
      notes: '',
      tags: [],
      rating: 0
    };

    library.push(savedPaper);
    localStorage.setItem(key, JSON.stringify(library));
  },

  getSavedPapers: (userId: string): SavedPaper[] => {
    const key = `library_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]') as SavedPaper[];
  },

  isSaved: (userId: string, paperId: string): boolean => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]') as SavedPaper[];
    return library.some(p => p.id === paperId);
  },

  removePaper: (userId: string, paperId: string): void => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]') as SavedPaper[];
    const updated = library.filter(p => p.id !== paperId);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  updateNotes: (userId: string, paperId: string, notes: string): void => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]') as SavedPaper[];
    const paper = library.find(p => p.id === paperId);
    if (paper) {
      paper.notes = notes;
      localStorage.setItem(key, JSON.stringify(library));
    }
  },

  addTags: (userId: string, paperId: string, tags: string[]): void => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]') as SavedPaper[];
    const paper = library.find(p => p.id === paperId);
    if (paper) {
      paper.tags = [...new Set([...paper.tags, ...tags])]; // Remove duplicates
      localStorage.setItem(key, JSON.stringify(library));
    }
  },

  removeTags: (userId: string, paperId: string, tags: string[]): void => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]') as SavedPaper[];
    const paper = library.find(p => p.id === paperId);
    if (paper) {
      paper.tags = paper.tags.filter(t => !tags.includes(t));
      localStorage.setItem(key, JSON.stringify(library));
    }
  },

  setRating: (userId: string, paperId: string, rating: number): void => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]') as SavedPaper[];
    const paper = library.find(p => p.id === paperId);
    if (paper) {
      paper.rating = Math.max(0, Math.min(5, rating)); // Clamp 0-5
      localStorage.setItem(key, JSON.stringify(library));
    }
  }
};
