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
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div
          className={`search-bar flex items-center ${heightClass} px-4 bg-white ${
            isFocused ? 'border-[#4285f4]' : 'border-[#dadce0]'
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
            className={`flex-1 mx-4 ${inputTextClass} bg-transparent border-none outline-none text-[#202124] placeholder:text-[#9aa0a6]`}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-[#f1f3f4] transition-colors"
            >
              <X className="w-5 h-5 text-[#5f6368]" />
            </button>
          )}

          <button
            type="button"
            className="p-2 ml-2 rounded-full hover:bg-[#f1f3f4] transition-colors"
          >
            <Mic className="w-5 h-5 text-[#4285f4]" />
          </button>

          <Button
            type="submit"
            className={`ml-3 bg-[#4285f4] hover:bg-[#3367d6] text-white rounded-full px-6 ${
              size === 'large' ? 'h-10 text-base' : 'h-9'
            }`}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>

          {showLabsButton && (
            <Button
              type="button"
              onClick={onLabsClick}
              variant="outline"
              className="ml-3 border-[#4285f4] text-[#4285f4] hover:bg-[#f0f7ff] rounded-full px-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Labs
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-[#dadce0] overflow-hidden z-50 animate-fade-in">
          <div className="p-3">
            <p className="text-xs font-medium text-[#5f6368] uppercase tracking-wide mb-2">
              Try asking Scholar Labs
            </p>
            {sampleResearchQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="w-full text-left px-3 py-2 text-sm text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#4285f4]" />
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
