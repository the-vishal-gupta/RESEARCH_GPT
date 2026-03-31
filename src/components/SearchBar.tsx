import { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sampleResearchQuestions } from '@/data/mockPapers';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
  size?: 'default' | 'large';
  showLabsButton?: boolean;
  onLabsClick?: () => void;
}

export function SearchBar({ 
  onSearch, 
  initialQuery = '', 
  placeholder = 'Search articles, authors, or topics',
  size = 'default',
  showLabsButton = false,
  onLabsClick
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const heightClass = size === 'large' ? 'h-14' : 'h-12';
  const inputTextClass = size === 'large' ? 'text-lg' : 'text-base';

  return (
    <div ref={containerRef} className="relative w-full z-50">
      <form onSubmit={handleSubmit}>
        <div
          className={`search-bar flex items-center ${heightClass} px-2 sm:px-4 bg-white border rounded-lg ${
            isFocused ? 'border-[#4285f4] shadow-md' : 'border-[#dadce0]'
          }`}
        >
          <Search className={`w-5 h-5 text-[#5f6368] flex-shrink-0 ${size === 'large' ? 'w-6 h-6' : ''}`} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`flex-1 mx-2 sm:mx-4 ${inputTextClass} bg-transparent border-none outline-none text-[#202124] placeholder:text-[#9aa0a6] text-sm sm:text-base`}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-[#f1f3f4] transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#5f6368]" />
            </button>
          )}

          {/* Mic button - hidden on mobile */}
          <button
            type="button"
            className="p-1 sm:p-2 ml-1 sm:ml-2 rounded-full hover:bg-[#f1f3f4] transition-colors hidden sm:block flex-shrink-0"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-[#4285f4]" />
          </button>

          {/* Search button - icon only on mobile, full text on desktop */}
          <Button
            type="submit"
            className={`ml-1 sm:ml-3 bg-[#4285f4] hover:bg-[#3367d6] text-white rounded-full ${
              size === 'large' ? 'h-10 px-4 sm:px-6' : 'h-8 px-2 sm:px-4'
            } flex-shrink-0`}
          >
            <Search className={`w-4 h-4 ${size === 'large' ? 'sm:mr-2' : 'sm:mr-2'}`} />
            <span className="hidden sm:inline ml-0">Search</span>
          </Button>

          {/* Labs button - hidden on mobile */}
          {showLabsButton && (
            <Button
              type="button"
              onClick={onLabsClick}
              variant="outline"
              className="hidden md:flex ml-3 border-[#4285f4] text-[#4285f4] hover:bg-[#f0f7ff] rounded-full px-4 flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Labs
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#dadce0] overflow-hidden z-50 animate-fade-in max-h-80 overflow-y-auto">
          <div className="p-2 sm:p-3">
            <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wide mb-2">
              Try asking Scholar Labs
            </p>
            {sampleResearchQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#4285f4] flex-shrink-0" />
                <span className="truncate">{question}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
