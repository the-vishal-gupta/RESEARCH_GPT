import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, FileText, Globe, SortAsc, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SearchFilters, SortBy, SearchType } from '@/types';

interface FiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  resultCount: number;
}

export function Filters({ filters, onChange, resultCount }: FiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sort: true,
    date: true,
    type: true,
    language: false,
    citations: false,
    author: false,
    venue: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSortChange = (sortBy: SortBy) => {
    onChange({ ...filters, sortBy });
  };

  const handleDateChange = (dateRange: string) => {
    onChange({ ...filters, dateRange });
  };

  const handleTypeChange = (type: SearchType) => {
    onChange({ ...filters, type });
  };

  const handleCitationMinChange = (value: string) => {
    onChange({ ...filters, citationMin: value ? parseInt(value) : undefined });
  };

  const handleCitationMaxChange = (value: string) => {
    onChange({ ...filters, citationMax: value ? parseInt(value) : undefined });
  };

  const handleAuthorChange = (value: string) => {
    onChange({ ...filters, author: value || undefined });
  };

  const handleVenueChange = (value: string) => {
    onChange({ ...filters, venue: value || undefined });
  };

  const dateOptions = [
    { value: 'any', label: 'Any time' },
    { value: '2026', label: 'Since 2026' },
    { value: '2025', label: 'Since 2025' },
    { value: '2024', label: 'Since 2024' },
    { value: '2023', label: 'Since 2023' },
    { value: '2022', label: 'Since 2022' },
    { value: '5years', label: 'Last 5 years' },
    { value: '10years', label: 'Last 10 years' },
  ];

  const typeOptions = [
    { value: 'articles', label: 'Articles', icon: FileText },
    { value: 'books', label: 'Books', icon: FileText },
    { value: 'patents', label: 'Patents', icon: FileText },
    { value: 'case-law', label: 'Case law', icon: FileText },
  ];

  const handleOpenAccessToggle = (checked: boolean) => {
    onChange({ ...filters, openAccessOnly: checked });
  };

  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="sticky top-20">
        {/* Results Count */}
        <div className="mb-4 px-2">
          <p className="text-sm text-[#5f6368]">
            About {resultCount.toLocaleString()} results
          </p>
        </div>

        {/* Sort By */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('sort')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <SortAsc className="w-4 h-4" />
              Sort by
            </span>
            {expandedSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.sort && (
            <div className="mt-2 space-y-2 px-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="sort-relevance"
                  name="sort"
                  checked={filters.sortBy === 'relevance'}
                  onChange={() => handleSortChange('relevance')}
                  className="w-4 h-4 text-[#4285f4]"
                />
                <Label htmlFor="sort-relevance" className="text-sm text-[#5f6368] cursor-pointer">
                  Relevance
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="sort-date"
                  name="sort"
                  checked={filters.sortBy === 'date'}
                  onChange={() => handleSortChange('date')}
                  className="w-4 h-4 text-[#4285f4]"
                />
                <Label htmlFor="sort-date" className="text-sm text-[#5f6368] cursor-pointer">
                  Date (newest first)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="sort-citations"
                  name="sort"
                  checked={filters.sortBy === 'citations'}
                  onChange={() => handleSortChange('citations')}
                  className="w-4 h-4 text-[#4285f4]"
                />
                <Label htmlFor="sort-citations" className="text-sm text-[#5f6368] cursor-pointer">
                  Most cited
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('date')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date range
            </span>
            {expandedSections.date ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.date && (
            <div className="mt-2 space-y-1 px-2">
              {dateOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`date-${option.value}`}
                    checked={filters.dateRange === option.value}
                    onCheckedChange={() => handleDateChange(option.value)}
                  />
                  <Label 
                    htmlFor={`date-${option.value}`} 
                    className="text-sm text-[#5f6368] cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Type
            </span>
            {expandedSections.type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.type && (
            <div className="mt-2 space-y-1 px-2">
              {typeOptions.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={filters.type === option.value as SearchType}
                    onCheckedChange={() => handleTypeChange(option.value as SearchType)}
                  />
                  <Label 
                    htmlFor={`type-${option.value}`} 
                    className="text-sm text-[#5f6368] cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Language */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('language')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Language
            </span>
            {expandedSections.language ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expandedSections.language && (
            <div className="mt-2 px-2">
              <select
                value={filters.language}
                onChange={(e) => onChange({ ...filters, language: e.target.value })}
                className="w-full p-2 text-sm border border-[#dadce0] rounded-md focus:border-[#4285f4] focus:outline-none"
              >
                <option value="any">Any language</option>
                <option value="en">English</option>
                <option value="zh">Chinese</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          )}
        </div>

        {/* Citation Range */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('citations')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Citation count
            </span>
            {expandedSections.citations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.citations && (
            <div className="mt-2 space-y-2 px-2">
              <div>
                <Label htmlFor="citation-min" className="text-xs text-[#5f6368]">Min citations</Label>
                <Input
                  id="citation-min"
                  type="number"
                  placeholder="0"
                  value={filters.citationMin || ''}
                  onChange={(e) => handleCitationMinChange(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="citation-max" className="text-xs text-[#5f6368]">Max citations</Label>
                <Input
                  id="citation-max"
                  type="number"
                  placeholder="1000"
                  value={filters.citationMax || ''}
                  onChange={(e) => handleCitationMaxChange(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Author Filter */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('author')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Author
            </span>
            {expandedSections.author ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.author && (
            <div className="mt-2 px-2">
              <Input
                type="text"
                placeholder="Search authors..."
                value={filters.author || ''}
                onChange={(e) => handleAuthorChange(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Venue/Journal Filter */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('venue')}
            className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-[#202124] hover:bg-[#f8f9fa] rounded-md transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Venue
            </span>
            {expandedSections.venue ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.venue && (
            <div className="mt-2 px-2">
              <Input
                type="text"
                placeholder="Journal or conference..."
                value={filters.venue || ''}
                onChange={(e) => handleVenueChange(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Open Access Filter */}
        <div className="mb-4 px-2 py-3 bg-[#f0f7ff] rounded-lg border border-[#4285f4]/20">
          <div className="flex items-center gap-2">
            <Checkbox
              id="open-access"
              checked={filters.openAccessOnly}
              onCheckedChange={handleOpenAccessToggle}
            />
            <Label 
              htmlFor="open-access" 
              className="text-sm font-medium text-[#202124] cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-[#4285f4]" />
              Open Access Only (with PDF)
            </Label>
          </div>
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => onChange({
            sortBy: 'relevance',
            dateRange: 'any',
            type: 'articles',
            language: 'any',
            openAccessOnly: false,
            citationMin: undefined,
            citationMax: undefined,
            author: undefined,
            venue: undefined,
          })}
        >
          Clear filters
        </Button>
      </div>
    </aside>
  );
}
