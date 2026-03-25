import { useState, useRef, useEffect } from 'react';
import { PaperCard } from '@/components/PaperCard';
import { getLabsResultsByQuery, sampleResearchQuestions } from '@/data/mockPapers';
import type { ResearchQuestion } from '@/types';
import { Sparkles, Loader2, MessageSquare, History, Lightbulb, ChevronRight, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LabsPageProps {
  onSearch: (query: string) => void;
}

// Progress animation timing constants
const PROGRESS_UPDATE_INTERVAL = 400; // ms between progress updates
const VISUAL_DELAY = 1200; // ms to show progress before data loads

export function LabsPage({ onSearch }: LabsPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState<ResearchQuestion | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [history, setHistory] = useState<ResearchQuestion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  const progressStages = [
    { stage: 'analyzing', message: 'Analyzing your question...', progress: 15 },
    { stage: 'searching', message: 'Searching multiple angles...', progress: 40 },
    { stage: 'evaluating', message: 'Evaluating results...', progress: 70 },
    { stage: 'complete', message: 'Found relevant papers', progress: 100 },
  ];

  useEffect(() => {
    if (isProcessing) {
      let stageIndex = 0;
      const interval = setInterval(() => {
        if (stageIndex < progressStages.length) {
          setProgressStage(progressStages[stageIndex].message);
          setProgress(progressStages[stageIndex].progress);
          stageIndex++;
        } else {
          clearInterval(interval);
        }
      }, PROGRESS_UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentQuestion?.results]);

  const handleAskQuestion = async (question: string) => {
    if (!question.trim()) return;

    setIsProcessing(true);
    setInputValue(question);
    setProgress(0);
    setProgressStage('Analyzing your question...');

    try {
      // Simulate processing stages while fetching real data
      const resultsPromise = getLabsResultsByQuery(question);

      // Show progress while waiting
      await new Promise(resolve => setTimeout(resolve, VISUAL_DELAY));

      const results = await resultsPromise;

      const newQuestion: ResearchQuestion = {
        id: Date.now().toString(),
        question: question.trim(),
        timestamp: new Date(),
        results,
        status: 'complete',
        progress: 100,
      };

      setCurrentQuestion(newQuestion);
      setHistory(prev => [newQuestion, ...prev]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error processing question:', error);
      }
      toast.error('Failed to process your question. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgressStage('');
    }
  };

  const handleSavePaper = () => {
    toast.success('Paper saved to library');
  };

  const handleLoadHistory = (question: ResearchQuestion) => {
    setCurrentQuestion(question);
    setInputValue(question.question);
  };

  const handleNewSearch = () => {
    setCurrentQuestion(null);
    setInputValue('');
    setProgress(0);
    setProgressStage('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#f0f7ff] to-white">
      {/* Header */}
      <div className="bg-white border-b border-[#dadce0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#4285f4] to-[#34a853] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-medium text-[#202124]">
                  Scholar Labs
                </h1>
                <p className="text-sm text-[#5f6368]">
                  AI-powered research assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={showHistory ? 'bg-[#f0f7ff]' : ''}
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewSearch}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Area */}
          <div className={`flex-1 transition-all ${showHistory ? 'mr-80' : ''}`}>
            {/* Input Area */}
            {!currentQuestion && !isProcessing && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="mb-8">
                  <Lightbulb className="w-16 h-16 text-[#4285f4] mx-auto mb-4" />
                  <h2 className="text-2xl font-medium text-[#202124] mb-2">
                    Ask a research question
                  </h2>
                  <p className="text-[#5f6368]">
                    Scholar Labs will search from multiple angles and find the most relevant papers
                  </p>
                </div>

                {/* Example Questions */}
                <div className="space-y-3 mb-8">
                  <p className="text-sm text-[#5f6368] mb-3">Try asking:</p>
                  {sampleResearchQuestions.slice(0, 4).map((q, index) => (
                    <button
                      key={index}
                      onClick={() => handleAskQuestion(q)}
                      className="w-full p-4 text-left bg-white border border-[#dadce0] rounded-lg hover:border-[#4285f4] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#202124]">{q}</span>
                        <ChevronRight className="w-5 h-5 text-[#9aa0a6] group-hover:text-[#4285f4]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Input */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a detailed research question..."
                  className="w-full p-4 pr-24 border border-[#dadce0] rounded-xl resize-none focus:border-[#4285f4] focus:outline-none focus:ring-2 focus:ring-[#4285f4]/20 min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion(inputValue);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAskQuestion(inputValue)}
                  disabled={isProcessing || !inputValue.trim()}
                  className="absolute bottom-4 right-4 bg-[#4285f4] hover:bg-[#3367d6] text-white"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="max-w-2xl mx-auto py-12 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-[#f0f7ff] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-[#4285f4] animate-spin" />
                  </div>
                  <p className="text-lg text-[#202124] mb-2">{progressStage}</p>
                  <p className="text-sm text-[#5f6368]">
                    This may take a minute as we search from multiple angles
                  </p>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-[#e8eaed] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#4285f4] to-[#34a853] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Processing Steps */}
                <div className="mt-8 flex justify-center gap-8">
                  {progressStages.map((stage, index) => (
                    <div 
                      key={stage.stage}
                      className={`flex flex-col items-center ${
                        progress >= stage.progress ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        progress >= stage.progress 
                          ? 'bg-[#4285f4] text-white' 
                          : 'bg-[#e8eaed] text-[#5f6368]'
                      }`}>
                        {progress >= stage.progress ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </div>
                      <span className="text-xs text-[#5f6368]">{stage.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {currentQuestion && !isProcessing && (
              <div className="animate-fade-in">
                {/* Question Header */}
                <div className="bg-white p-6 rounded-xl border border-[#dadce0] mb-6">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-[#4285f4] mt-1" />
                    <div>
                      <p className="text-sm text-[#5f6368] mb-1">Your question</p>
                      <p className="text-lg text-[#202124]">{currentQuestion.question}</p>
                    </div>
                  </div>
                  
                  {/* Feedback */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#ebebeb]">
                    <span className="text-sm text-[#5f6368]">Was this helpful?</span>
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#5f6368]">
                    Found <span className="font-medium text-[#202124]">{currentQuestion.results.length}</span> relevant papers
                  </p>
                  <Button variant="outline" size="sm" onClick={() => onSearch(currentQuestion.question)}>
                    View in Scholar Search
                  </Button>
                </div>

                {/* Results List */}
                <div className="space-y-4">
                  {currentQuestion.results.map((paper, index) => (
                    <div 
                      key={paper.id}
                      className="bg-white p-6 rounded-xl border border-[#dadce0] hover:shadow-md transition-shadow animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <PaperCard 
                        paper={paper}
                        isLabsResult={true}
                        onSave={handleSavePaper}
                      />
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {currentQuestion.results.length >= 5 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" className="px-8">
                      Load more results
                    </Button>
                  </div>
                )}

                <div ref={resultsEndRef} />
              </div>
            )}
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className="fixed right-0 top-[64px] w-80 h-[calc(100vh-64px)] bg-white border-l border-[#dadce0] overflow-y-auto p-4 animate-slide-up">
              <h3 className="text-sm font-medium text-[#5f6368] uppercase tracking-wide mb-4">
                Recent Questions
              </h3>
              
              {history.length === 0 ? (
                <p className="text-sm text-[#9aa0a6] text-center py-8">
                  No questions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleLoadHistory(item)}
                      className={`w-full p-3 text-left rounded-lg transition-colors ${
                        currentQuestion?.id === item.id 
                          ? 'bg-[#f0f7ff] border border-[#4285f4]' 
                          : 'bg-[#f8f9fa] hover:bg-[#e8eaed]'
                      }`}
                    >
                      <p className="text-sm text-[#202124] line-clamp-2 mb-2">
                        {item.question}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#5f6368]">
                        <span>{item.results.length} papers</span>
                        <span>{item.timestamp.toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
