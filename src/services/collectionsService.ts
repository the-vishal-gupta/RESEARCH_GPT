// Collections Service - Manage user paper collections (localStorage based)

export interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  paperIds: string[];
  createdAt: string;
}

const COLLECTIONS_KEY = 'paper_collections';

export const collectionsService = {
  // Get all collections
  getCollections: (): Collection[] => {
    try {
      const data = localStorage.getItem(COLLECTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Create a new collection
  createCollection: (name: string, description = '', color = '#4285f4'): Collection => {
    const collections = collectionsService.getCollections();

    // Check if collection already exists
    if (collections.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Collection already exists');
    }

    const newCollection: Collection = {
      id: `col_${Date.now()}`,
      name,
      description,
      color,
      paperIds: [],
      createdAt: new Date().toISOString()
    };

    collections.push(newCollection);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
    return newCollection;
  },

  // Delete a collection
  deleteCollection: (collectionId: string): void => {
    const collections = collectionsService.getCollections();
    const filtered = collections.filter(c => c.id !== collectionId);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(filtered));
  },

  // Add paper to collection
  addPaperToCollection: (collectionId: string, paperId: string): void => {
    const collections = collectionsService.getCollections();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) throw new Error('Collection not found');
    if (collection.paperIds.includes(paperId)) return; // Already added

    collection.paperIds.push(paperId);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  },

  // Remove paper from collection
  removePaperFromCollection: (collectionId: string, paperId: string): void => {
    const collections = collectionsService.getCollections();
    const collection = collections.find(c => c.id === collectionId);

    if (!collection) return;

    collection.paperIds = collection.paperIds.filter(id => id !== paperId);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  },

  // Get papers in a collection
  getPapersInCollection: (collectionId: string): string[] => {
    const collections = collectionsService.getCollections();
    const collection = collections.find(c => c.id === collectionId);
    return collection?.paperIds || [];
  },

  // Check if paper is in collection
  isPaperInCollection: (collectionId: string, paperId: string): boolean => {
    const collections = collectionsService.getCollections();
    const collection = collections.find(c => c.id === collectionId);
    return collection?.paperIds.includes(paperId) || false;
  },

  // Get all collections containing a paper
  getCollectionsForPaper: (paperId: string): Collection[] => {
    const collections = collectionsService.getCollections();
    return collections.filter(c => c.paperIds.includes(paperId));
  },

  // Get default collection (create if doesn't exist)
  getOrCreateDefaultCollection: (): Collection => {
    const collections = collectionsService.getCollections();
    let defaultCollection = collections.find(c => c.name === 'Saved Papers');

    if (!defaultCollection) {
      defaultCollection = collectionsService.createCollection(
        'Saved Papers',
        'My saved research papers',
        '#4285f4'
      );
    }

    return defaultCollection;
  }
};
