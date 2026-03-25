// Query processing utilities

// Remove common filler words and extract meaningful search terms
export const processSearchQuery = (query: string): string => {
  
  // Common conversational patterns to remove
  const fillerPatterns = [
    /^give me\s+/i,
    /^show me\s+/i,
    /^find me\s+/i,
    /^search for\s+/i,
    /^get me\s+/i,
    /^i want\s+/i,
    /^i need\s+/i,
    /^looking for\s+/i,
    /^can you (find|get|show|give)\s+/i,
    /\s+papers?$/i,
    /\s+articles?$/i,
    /\s+research$/i,
  ];
  
  let processedQuery = query;
  
  // Remove filler patterns
  fillerPatterns.forEach(pattern => {
    processedQuery = processedQuery.replace(pattern, '');
  });
  
  // Extract numbers (like "5 papers" -> just keep the topic)
  processedQuery = processedQuery.replace(/^\d+\s+/i, '');
  
  // Common abbreviations expansion
  const abbreviations: Record<string, string> = {
    'aiml': 'artificial intelligence machine learning',
    'ai': 'artificial intelligence',
    'ml': 'machine learning',
    'dl': 'deep learning',
    'nlp': 'natural language processing',
    'cv': 'computer vision',
    'nn': 'neural networks',
  };
  
  const words = processedQuery.toLowerCase().split(/\s+/);
  const expandedWords = words.map(word => {
    return abbreviations[word] || word;
  });
  
  processedQuery = expandedWords.join(' ');
  
  return processedQuery.trim() || query;
};

// Validate and filter papers by year
export const filterPapersByYear = (papers: any[], maxYear: number = 2024): any[] => {
  return papers.filter(paper => {
    const year = paper.year || 0;
    return year > 1900 && year <= maxYear;
  });
};
