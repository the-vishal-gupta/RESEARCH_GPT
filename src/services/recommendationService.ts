import type { Paper } from '@/types';
import { libraryService } from './libraryService';

export const recommendationService = {
  getRecommendations: (userId: string, allPapers: Paper[], limit: number = 5): Paper[] => {
    // Get user's saved papers
    const savedPapers = libraryService.getSavedPapers(userId);

    if (savedPapers.length === 0) {
      // If no saved papers, return highest cited papers
      return allPapers
        .sort((a, b) => b.citations - a.citations)
        .slice(0, limit);
    }

    // Extract keywords from saved papers
    const keywords = new Map<string, number>();

    savedPapers.forEach(paper => {
      // Extract title keywords
      const titleWords = paper.title.toLowerCase().split(/\s+/);
      titleWords.forEach(word => {
        if (word.length > 4) {
          keywords.set(word, (keywords.get(word) || 0) + 2);
        }
      });

      // Extract abstract keywords
      if (paper.abstract) {
        const abstractWords = paper.abstract.toLowerCase().split(/\s+/);
        abstractWords.forEach(word => {
          if (word.length > 5) {
            keywords.set(word, (keywords.get(word) || 0) + 1);
          }
        });
      }
    });

    // Score papers based on keyword overlap
    const scoredPapers = allPapers
      .filter(p => !savedPapers.some(sp => sp.id === p.id))
      .map(paper => {
        let score = 0;

        // Title match (higher weight)
        const titleWords = paper.title.toLowerCase().split(/\s+/);
        titleWords.forEach(word => {
          score += (keywords.get(word) || 0) * 3;
        });

        // Abstract match
        if (paper.abstract) {
          const abstractWords = paper.abstract.toLowerCase().split(/\s+/);
          abstractWords.forEach(word => {
            score += (keywords.get(word) || 0);
          });
        }

        // Author overlap
        const authors = paper.authors.map(a => a.toLowerCase());
        savedPapers.forEach(sp => {
          sp.authors.forEach(spAuthor => {
            if (authors.some(a => a.includes(spAuthor.toLowerCase()))) {
              score += 5;
            }
          });
        });

        // Citation score (newer, highly cited papers)
        score += paper.citations * 0.1;

        return { paper, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(sp => sp.paper);

    return scoredPapers;
  },

  getSimilarPapers: (targetPaper: Paper, allPapers: Paper[], limit: number = 5): Paper[] => {
    const keywords = new Set<string>();

    // Extract keywords from target paper
    const titleWords = targetPaper.title.toLowerCase().split(/\s+/);
    titleWords.forEach(word => {
      if (word.length > 4) keywords.add(word);
    });

    if (targetPaper.abstract) {
      const abstractWords = targetPaper.abstract.toLowerCase().split(/\s+/);
      abstractWords.forEach(word => {
        if (word.length > 5) keywords.add(word);
      });
    }

    // Score papers
    const scoredPapers = allPapers
      .filter(p => p.id !== targetPaper.id)
      .map(paper => {
        let score = 0;

        // Keyword overlap
        const paperText = (paper.title + ' ' + (paper.abstract || '')).toLowerCase();
        keywords.forEach(keyword => {
          score += (paperText.match(new RegExp(keyword, 'g')) || []).length;
        });

        // Same authors
        paper.authors.forEach(author => {
          if (targetPaper.authors.some(ta =>
            ta.toLowerCase().includes(author.toLowerCase())
          )) {
            score += 10;
          }
        });

        // Same venue/publication
        if (paper.publication.toLowerCase() === targetPaper.publication.toLowerCase()) {
          score += 5;
        }

        // Same year range
        if (Math.abs(paper.year - targetPaper.year) <= 2) {
          score += 3;
        }

        return { paper, score };
      })
      .filter(sp => sp.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(sp => sp.paper);

    return scoredPapers;
  }
};
