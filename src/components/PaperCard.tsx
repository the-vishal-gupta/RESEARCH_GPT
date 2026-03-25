import { useState, memo } from 'react';
import { Star, Quote, MoreVertical, Bookmark, Download, Share2, FileText, ExternalLink } from 'lucide-react';
import type { Paper, LabsResult } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PaperCardProps {
  paper: Paper | LabsResult;
  isLabsResult?: boolean;
  isSaved?: boolean;
  onSave?: (paper: Paper) => void;
  onCite?: (paper: Paper) => void;
}

export const PaperCard = memo(function PaperCard({ paper, isLabsResult = false, isSaved = false, onSave, onCite }: PaperCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [showAbstract, setShowAbstract] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const labsResult = isLabsResult ? paper as LabsResult : null;

  // Determine paper access type
  const getAccessType = (paper: Paper | LabsResult): 'free' | 'paywalled' => {
    if (paper.pdfUrl) return 'free';
    return 'paywalled';
  };

  const accessType = getAccessType(paper);

  const handleSave = () => {
    setSaved(!saved);
    onSave?.(paper);
  };

  const formatCitations = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleDownloadPdf = () => {
    if (paper.pdfUrl) {
      window.open(paper.pdfUrl, '_blank');
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    if (paper.pdfUrl) {
      // If PDF exists, open it
      window.open(paper.pdfUrl, '_blank');
    } else if (paper.doi) {
      // If DOI exists, open DOI link
      window.open(`https://doi.org/${paper.doi}`, '_blank');
    }
    e.preventDefault();
  };

  const handleViewPdf = () => {
    if (paper.pdfUrl) {
      setShowPdfViewer(true);
    }
  };

  return (
    <TooltipProvider>
      <article className="paper-card p-4 rounded-lg">
        <div className="flex items-start gap-3">
          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSave}
                className={`mt-1 p-1 rounded-full transition-all ${
                  saved ? 'text-[#f9ab00]' : 'text-[#9aa0a6] hover:text-[#f9ab00]'
                }`}
              >
                <Star className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{saved ? 'Remove from library' : 'Save to library'}</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-lg font-medium leading-snug mb-1">
              {paper.pdfUrl || paper.doi ? (
                <a
                  href="#"
                  onClick={handleTitleClick}
                  className="gs-link hover:underline cursor-pointer"
                >
                  {paper.title}
                </a>
              ) : (
                <span className="text-[#202124]">{paper.title}</span>
              )}
            </h3>

            {/* Access Type Badge */}
            <div className="flex gap-2 items-center flex-wrap mb-2">
              {accessType === 'free' ? (
                <span className="inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                  ✓ FREE PDF
                </span>
              ) : (
                <span className="inline-block px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                  PAYWALLED
                </span>
              )}
              {paper.year && (
                <span className="text-sm text-[#5f6368]">{paper.year}</span>
              )}
            </div>

            {/* AI Summary for Labs Results */}
            {labsResult && (
              <div className="mb-3 p-3 bg-[#f0f7ff] rounded-lg border-l-4 border-[#4285f4]">
                <p className="text-sm text-[#5f6368] italic mb-2">
                  {labsResult.aiSummary}
                </p>
                <ul className="space-y-1">
                  {labsResult.relevancePoints.map((point, index) => (
                    <li key={index} className="text-sm text-[#202124] flex items-start gap-2">
                      <span className="text-[#4285f4] mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Authors */}
            <p className="text-sm text-[#5f6368] mb-1">
              {paper.authors.join(', ')}
            </p>

            {/* Publication Info */}
            <p className="text-sm text-[#5f6368] mb-2">
              <span className="italic">{paper.publication}</span>
              {paper.year && `, ${paper.year}`}
              {paper.pages && `, pp. ${paper.pages}`}
              {paper.doi && (
                <span className="ml-2">
                  <a 
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4285f4] hover:underline"
                  >
                    [DOI]
                  </a>
                </span>
              )}
            </p>

            {/* Abstract (collapsible) */}
            {!isLabsResult && (
              <div className="mb-2">
                <button
                  onClick={() => setShowAbstract(!showAbstract)}
                  className="text-sm text-[#4285f4] hover:underline"
                >
                  {showAbstract ? 'Hide abstract' : 'Show abstract'}
                </button>
                {showAbstract && (
                  <p className="mt-2 text-sm text-[#202124] leading-relaxed animate-fade-in">
                    {paper.abstract}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {/* PDF Actions */}
              {paper.pdfUrl && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadPdf}
                    className="text-white bg-[#4285f4] hover:bg-[#1557b0]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewPdf}
                    className="text-[#4285f4] border-[#4285f4] hover:bg-[#f0f7ff]"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                </>
              )}

              {/* Cited By */}
              {paper.citations > 0 && (
                <a
                  href="#"
                  className="text-sm gs-green hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    onCite?.(paper);
                  }}
                >
                  Cited by {formatCitations(paper.citations)}
                </a>
              )}

              {/* Related Articles */}
              <a href="#" className="text-sm text-[#1a0dab] hover:underline">
                Related articles
              </a>

              {/* All Versions */}
              <a href="#" className="text-sm text-[#1a0dab] hover:underline">
                All versions
              </a>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Add to collection
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Quote className="w-4 h-4 mr-2" />
                    Cite
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* PDF Viewer Modal */}
        {showPdfViewer && paper.pdfUrl && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowPdfViewer(false)}
          >
            <div 
              className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#dadce0] bg-white">
                <h3 className="text-lg font-medium text-[#202124] truncate flex-1 mr-4">
                  {paper.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPdf}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(paper.pdfUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPdfViewer(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              {/* PDF Iframe */}
              <iframe
                src={paper.pdfUrl}
                className="w-full h-[calc(100%-64px)]"
                title={paper.title}
              />
            </div>
          </div>
        )}
      </article>
    </TooltipProvider>
  );
});
