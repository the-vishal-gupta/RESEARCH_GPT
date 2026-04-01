import { useState, useEffect } from 'react';
import { Calendar, Tag, Trash2, Download, FolderOpen, Plus, Search, Star, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { libraryService, type SavedPaper } from '@/services/libraryService';
import { exportService, type ExportFormat } from '@/services/exportService';

export function LibraryPage() {
  const { currentUser } = useAuth();
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load papers from library
  useEffect(() => {
    if (currentUser) {
      const savedPapers = libraryService.getSavedPapers(currentUser.id);
      setPapers(savedPapers);
    }
    setIsLoading(false);
  }, [currentUser]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(papers.flatMap(p => p.tags))
  );

  // Filter papers
  const filteredPapers = papers.filter(paper => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = !selectedTag || paper.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleRemovePaper = (paperId: string) => {
    if (!currentUser) return;
    try {
      libraryService.removePaper(currentUser.id, paperId);
      setPapers(prev => prev.filter(p => p.id !== paperId));
      toast.success('Paper removed from library');
    } catch (err) {
      toast.error('Failed to remove paper');
    }
  };

  const handleAddTag = (paperId: string, tag: string) => {
    if (!currentUser) return;
    try {
      libraryService.addTags(currentUser.id, paperId, [tag]);
      setPapers(prev => prev.map(p =>
        p.id === paperId && !p.tags.includes(tag)
          ? { ...p, tags: [...p.tags, tag] }
          : p
      ));
      toast.success(`Added tag "${tag}"`);
    } catch (err) {
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveTag = (paperId: string, tag: string) => {
    if (!currentUser) return;
    try {
      libraryService.removeTags(currentUser.id, paperId, [tag]);
      setPapers(prev => prev.map(p =>
        p.id === paperId
          ? { ...p, tags: p.tags.filter(t => t !== tag) }
          : p
      ));
    } catch (err) {
      toast.error('Failed to remove tag');
    }
  };

  const handleSetRating = (paperId: string, rating: number) => {
    if (!currentUser) return;
    try {
      libraryService.setRating(currentUser.id, paperId, rating);
      setPapers(prev => prev.map(p =>
        p.id === paperId ? { ...p, rating } : p
      ));
      toast.success(`Rated ${rating} stars`);
    } catch (err) {
      toast.error('Failed to set rating');
    }
  };

  const tagColors: Record<string, string> = {
    'Important': 'bg-red-100 text-red-800',
    'ToRead': 'bg-blue-100 text-blue-800',
    'Reference': 'bg-green-100 text-green-800',
    'Methodology': 'bg-purple-100 text-purple-800',
    'Results': 'bg-yellow-100 text-yellow-800',
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-[#5f6368]">Loading library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-white border-b border-[#dadce0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-[#202124]">My Library</h1>
              <p className="text-sm text-[#5f6368]">
                {papers.length} saved papers
              </p>
            </div>
            {papers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#4285f4] hover:bg-[#1557b0] text-white">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export ({filteredPapers.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      const content = exportService.exportPapers(filteredPapers, 'bibtex');
                      exportService.downloadFile(content, 'papers.bib');
                      toast.success('Exported as BibTeX');
                    }}
                  >
                    BibTeX (.bib)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const content = exportService.exportPapers(filteredPapers, 'csv');
                      exportService.downloadFile(content, 'papers.csv');
                      toast.success('Exported as CSV');
                    }}
                  >
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const content = exportService.exportPapers(filteredPapers, 'ris');
                      exportService.downloadFile(content, 'papers.ris');
                      toast.success('Exported as RIS');
                    }}
                  >
                    RIS (.ris)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const content = exportService.exportPapers(filteredPapers, 'json');
                      exportService.downloadFile(content, 'papers.json');
                      toast.success('Exported as JSON');
                    }}
                  >
                    JSON (.json)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Tags */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#dadce0] p-4 sticky top-20">
              <h3 className="text-sm font-medium text-[#5f6368] uppercase tracking-wide mb-3">
                Tags
              </h3>

              <button
                onClick={() => setSelectedTag(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedTag ? 'bg-[#f0f7ff] text-[#4285f4]' : 'text-[#5f6368] hover:bg-[#f8f9fa]'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                All Papers
                <span className="ml-auto text-xs bg-[#e8eaed] px-2 py-0.5 rounded-full">
                  {papers.length}
                </span>
              </button>

              <div className="mt-2 space-y-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTag === tag ? 'bg-[#f0f7ff] text-[#4285f4]' : 'text-[#5f6368] hover:bg-[#f8f9fa]'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    {tag}
                    <span className="ml-auto text-xs bg-[#e8eaed] px-2 py-0.5 rounded-full">
                      {papers.filter(p => p.tags.includes(tag)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-[#dadce0] p-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa0a6]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your library..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Papers Grid */}
            {filteredPapers.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#dadce0] p-12 text-center">
                <FolderOpen className="w-16 h-16 text-[#dadce0] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#202124] mb-2">
                  {searchQuery
                    ? 'No papers found'
                    : papers.length === 0
                    ? 'Your library is empty'
                    : 'No papers found'}
                </h3>
                <p className="text-sm text-[#5f6368] mb-4">
                  {searchQuery
                    ? 'Try a different search term'
                    : papers.length === 0
                    ? 'Search for papers and click the star icon to save them to your library'
                    : 'Try a different search term'}
                </p>
                {papers.length === 0 && (
                  <Button
                    onClick={() => window.location.href = '/'}
                    className="bg-[#4285f4] hover:bg-[#1557b0] text-white"
                  >
                    Go to Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-white rounded-xl border border-[#dadce0] p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Title */}
                        <h3 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer mb-2">
                          {paper.title}
                        </h3>

                        {/* Authors */}
                        <p className="text-sm text-[#5f6368] mb-2">
                          {paper.authors.join(', ')}
                        </p>

                        {/* Publication */}
                        <p className="text-sm text-[#5f6368] mb-3">
                          <span className="italic">{paper.publication}</span>, {paper.year}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleSetRating(paper.id, star)}
                              className="transition-colors"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= paper.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-[#dadce0]'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {paper.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className={`${tagColors[tag] || 'bg-gray-100 text-gray-800'} cursor-pointer`}
                              onClick={() => handleRemoveTag(paper.id, tag)}
                            >
                              {tag} ✕
                            </Badge>
                          ))}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Plus className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {allTags.filter(t => !paper.tags.includes(t)).map((tag) => (
                                <DropdownMenuItem
                                  key={tag}
                                  onClick={() => handleAddTag(paper.id, tag)}
                                >
                                  <Tag className="w-4 h-4 mr-2" />
                                  {tag}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuTrigger asChild>
                                <DropdownMenuItem>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add new tag
                                </DropdownMenuItem>
                              </DropdownMenuTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-[#5f6368]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Saved {new Date(paper.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePaper(paper.id)}
                          className="text-[#5f6368] hover:text-[#d93025]"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        {paper.pdfUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(paper.pdfUrl, '_blank')}
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
