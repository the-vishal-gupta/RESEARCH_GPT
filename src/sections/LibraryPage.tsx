import { useState } from 'react';
import { savedPapers } from '@/data/mockPapers';
import { Calendar, Tag, Trash2, Download, FolderOpen, Plus, Search } from 'lucide-react';
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
import type { SavedPaper } from '@/types';

export function LibraryPage() {
  const [papers, setPapers] = useState<SavedPaper[]>(savedPapers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [newLabelDialogOpen, setNewLabelDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');

  // Get all unique labels
  const allLabels = Array.from(
    new Set(papers.flatMap(p => p.labels))
  );

  // Filter papers
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLabel = !selectedLabel || paper.labels.includes(selectedLabel);
    return matchesSearch && matchesLabel;
  });

  const handleRemovePaper = (paperId: string) => {
    setPapers(prev => prev.filter(p => p.id !== paperId));
    toast.success('Paper removed from library');
  };

  const handleAddLabel = (paperId: string, label: string) => {
    setPapers(prev => prev.map(p => 
      p.id === paperId && !p.labels.includes(label)
        ? { ...p, labels: [...p.labels, label] }
        : p
    ));
    toast.success(`Added label "${label}"`);
  };

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      setNewLabelDialogOpen(false);
      setNewLabelName('');
      toast.success(`Created label "${newLabelName}"`);
    }
  };

  const labelColors: Record<string, string> = {
    'Transformers': 'bg-blue-100 text-blue-800',
    'NLP': 'bg-green-100 text-green-800',
    'Must Read': 'bg-red-100 text-red-800',
    'BERT': 'bg-purple-100 text-purple-800',
    'Pre-training': 'bg-yellow-100 text-yellow-800',
    'Healthcare': 'bg-pink-100 text-pink-800',
    'ML Applications': 'bg-indigo-100 text-indigo-800',
  };

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
            <div className="flex items-center gap-2">
              <Dialog open={newLabelDialogOpen} onOpenChange={setNewLabelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Label
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Label</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Input
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Label name"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                    />
                    <Button 
                      className="w-full mt-4 bg-[#4285f4]"
                      onClick={handleCreateLabel}
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="bg-[#4285f4]">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Labels */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#dadce0] p-4">
              <h3 className="text-sm font-medium text-[#5f6368] uppercase tracking-wide mb-3">
                Labels
              </h3>
              
              <button
                onClick={() => setSelectedLabel(null)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  !selectedLabel ? 'bg-[#f0f7ff] text-[#4285f4]' : 'text-[#5f6368] hover:bg-[#f8f9fa]'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                All Papers
                <span className="ml-auto text-xs bg-[#e8eaed] px-2 py-0.5 rounded-full">
                  {papers.length}
                </span>
              </button>

              <div className="mt-2 space-y-1">
                {allLabels.map((label) => (
                  <button
                    key={label}
                    onClick={() => setSelectedLabel(label === selectedLabel ? null : label)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLabel === label ? 'bg-[#f0f7ff] text-[#4285f4]' : 'text-[#5f6368] hover:bg-[#f8f9fa]'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    {label}
                    <span className="ml-auto text-xs bg-[#e8eaed] px-2 py-0.5 rounded-full">
                      {papers.filter(p => p.labels.includes(label)).length}
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
                  No papers found
                </h3>
                <p className="text-sm text-[#5f6368]">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Start saving papers to build your library'}
                </p>
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

                        {/* Labels */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {paper.labels.map((label) => (
                            <Badge 
                              key={label}
                              variant="secondary"
                              className={labelColors[label] || 'bg-gray-100 text-gray-800'}
                            >
                              {label}
                            </Badge>
                          ))}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <Plus className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {allLabels.filter(l => !paper.labels.includes(l)).map((label) => (
                                <DropdownMenuItem 
                                  key={label}
                                  onClick={() => handleAddLabel(paper.id, label)}
                                >
                                  <Tag className="w-4 h-4 mr-2" />
                                  {label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-[#5f6368]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Saved {paper.savedAt.toLocaleDateString()}
                          </span>
                          <span className="gs-green">
                            Cited by {paper.citations.toLocaleString()}
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
                        <Button variant="ghost" size="icon">
                          <Download className="w-5 h-5" />
                        </Button>
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
