export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
  isFavorite: boolean;
}

export const searchHistoryService = {
  addSearch: (userId: string, query: string, resultCount: number = 0): void => {
    const key = `search_history_${userId}`;
    const history: SearchHistoryEntry[] = JSON.parse(localStorage.getItem(key) || '[]');

    // Check if query already exists in recent history
    const existingIndex = history.findIndex(h => h.query === query && !h.isFavorite);
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }

    // Add new entry at the beginning
    const newEntry: SearchHistoryEntry = {
      id: crypto.randomUUID(),
      query,
      timestamp: new Date().toISOString(),
      resultCount,
      isFavorite: false
    };

    history.unshift(newEntry);

    // Keep only last 50 searches
    const trimmed = history.slice(0, 50);
    localStorage.setItem(key, JSON.stringify(trimmed));
  },

  getHistory: (userId: string, limit: number = 20): SearchHistoryEntry[] => {
    const key = `search_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]') as SearchHistoryEntry[];
    return history.slice(0, limit);
  },

  toggleFavorite: (userId: string, searchId: string): void => {
    const key = `search_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]') as SearchHistoryEntry[];
    const search = history.find(h => h.id === searchId);
    if (search) {
      search.isFavorite = !search.isFavorite;
      localStorage.setItem(key, JSON.stringify(history));
    }
  },

  getFavoriteSearches: (userId: string): SearchHistoryEntry[] => {
    const key = `search_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]') as SearchHistoryEntry[];
    return history.filter(h => h.isFavorite);
  },

  deleteSearch: (userId: string, searchId: string): void => {
    const key = `search_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]') as SearchHistoryEntry[];
    const updated = history.filter(h => h.id !== searchId);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  clearHistory: (userId: string): void => {
    const key = `search_history_${userId}`;
    localStorage.removeItem(key);
  }
};
