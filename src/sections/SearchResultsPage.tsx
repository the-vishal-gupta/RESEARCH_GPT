import { useState, useEffect, useMemo } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { PaperCard } from '@/components/PaperCard';
import { Filters } from '@/components/Filters';
import { getPapersByQuery } from '@/data/mockPapers';
import type { Paper, SearchFilters } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SearchResultsPageProps {
  query: string;
  onBack: () => void;
  onSearch: (query: string) => void;
}

export function SearchResultsPage({ query, onBack, onSearch }: SearchResultsPageProps) {
  const [results, setResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    dateRange: 'any',
    type: 'articles',
    language: 'any',
    openAccessOnly: false,
  });

  const RESULTS_PER_PAGE = 10;

  useEffect(() => {
    // Fetch real papers from APIs
    const fetchPapers = async () => {
      setLoading(true);
      setCurrentPage(1); // Reset to first page on new search
      try {
        const papers = await getPapersByQuery(query);
        setResults(papers);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching papers:', error);
        }
        toast.error('Failed to fetch papers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [query]);

  const handleSavePaper = (paper: Paper) => {
    toast.success(`"${paper.title}" saved to library`);
  };

  const handleCitePaper = (paper: Paper) => {
    toast.info(`Citing "${paper.title}"`);
  };

  // Apply filters
  const filteredResults = useMemo(() => {
    return results.filter(paper => {
      // Open access filter
      if (filters.openAccessOnly && !paper.pdfUrl) return false;

      // Date range filter
      if (filters.dateRange !== 'any') {
        const currentYear = new Date().getFullYear();
        if (filters.dateRange === '5years' && paper.year < currentYear - 5) return false;
        if (filters.dateRange === '10years' && paper.year < currentYear - 10) return false;
        if (!isNaN(parseInt(filters.dateRange)) && paper.year < parseInt(filters.dateRange)) return false;
      }
      return true;
    });
  }, [results, filters.openAccessOnly, filters.dateRange]);

  // Sort results
  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      if (filters.sortBy === 'date') {
        return b.year - a.year;
      }
      // Default: relevance (by citations)
      return b.citations - a.citations;
    });
  }, [filteredResults, filters.sortBy]);

  // Paginate results
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    return sortedResults.slice(startIndex, startIndex + RESULTS_PER_PAGE);
  }, [sortedResults, currentPage]);

  const totalPages = Math.ceil(sortedResults.length / RESULTS_PER_PAGE);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Search Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-[#dadce0] py-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 max-w-2xl">
              <SearchBar 
                onSearch={onSearch} 
                initialQuery={query}
                showLabsButton={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#4285f4] animate-spin mb-4" />
            <p className="text-[#5f6368]">Searching for "{query}"...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <Filters 
              filters={filters} 
              onChange={setFilters}
              resultCount={sortedResults.length}
            />

            {/* Results List */}
            <div className="flex-1">
              {/* Query Info */}
              <div className="mb-4">
                <h1 className="text-xl text-[#202124]">
                  Results for <span className="font-medium">"{query}"</span>
                </h1>
              </div>

              {sortedResults.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-[#202124] mb-2">No results found</p>
                  <p className="text-sm text-[#5f6368]">
                    Try different keywords or check your spelling
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {paginatedResults.map((paper, index) => (
                    <div
                      key={paper.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <PaperCard
                        paper={paper}
                        onSave={handleSavePaper}
                        onCite={handleCitePaper}
                      />
                      {index < paginatedResults.length - 1 && (
                        <hr className="border-[#ebebeb]" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {sortedResults.length > 0 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'bg-[#4285f4] text-white' : ''}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {totalPages > 5 && <span className="px-2 py-2 text-[#5f6368]">...</span>}

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
