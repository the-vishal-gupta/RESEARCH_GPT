import { SearchBar } from '@/components/SearchBar';
import { BookOpen, Sparkles, Library, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  onSearch: (query: string) => void;
  onNavigate: (page: string) => void;
}

export function HomePage({ onSearch, onNavigate }: HomePageProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-16 h-16 text-[#4285f4]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-normal text-[#202124] mb-2">
            ScholarGPT
          </h1>
          <p className="text-lg text-[#5f6368]">
            Stand on the shoulders of giants
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-8 animate-slide-up stagger-1">
          <SearchBar 
            onSearch={onSearch} 
            size="large"
            showLabsButton={true}
            onLabsClick={() => onNavigate('labs')}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-slide-up stagger-2">
          <Button
            variant="outline"
            onClick={() => onNavigate('labs')}
            className="rounded-full border-[#4285f4] text-[#4285f4] hover:bg-[#f0f7ff]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Try Scholar Labs
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('library')}
            className="rounded-full"
          >
            <Library className="w-4 h-4 mr-2" />
            My Library
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('citations')}
            className="rounded-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            My Citations
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#f8f9fa] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-[#202124] text-center mb-8">
            Research made easier
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Scholar Search */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#4285f4] rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#202124] mb-2">
                Scholar Search
              </h3>
              <p className="text-sm text-[#5f6368] mb-4">
                Search across millions of academic papers, theses, books, and conference papers.
              </p>
              <button 
                onClick={() => document.querySelector('input')?.focus()}
                className="text-sm text-[#4285f4] hover:underline"
              >
                Start searching →
              </button>
            </div>

            {/* Scholar Labs */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-2 border-[#4285f4]/20">
              <div className="w-12 h-12 bg-gradient-to-r from-[#4285f4] to-[#34a853] rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-medium text-[#202124]">
                  Scholar Labs
                </h3>
                <span className="labs-badge">NEW</span>
              </div>
              <p className="text-sm text-[#5f6368] mb-4">
                AI-powered research assistant that answers complex questions from multiple angles.
              </p>
              <button 
                onClick={() => onNavigate('labs')}
                className="text-sm text-[#4285f4] hover:underline"
              >
                Try Labs →
              </button>
            </div>

            {/* My Library */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#188038] rounded-lg flex items-center justify-center mb-4">
                <Library className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#202124] mb-2">
                My Library
              </h3>
              <p className="text-sm text-[#5f6368] mb-4">
                Save papers, organize with labels, and access your research anywhere.
              </p>
              <button 
                onClick={() => onNavigate('library')}
                className="text-sm text-[#4285f4] hover:underline"
              >
                View library →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl font-medium text-[#4285f4]">200M+</p>
              <p className="text-sm text-[#5f6368]">Academic papers</p>
            </div>
            <div>
              <p className="text-3xl font-medium text-[#4285f4]">50M+</p>
              <p className="text-sm text-[#5f6368]">Authors</p>
            </div>
            <div>
              <p className="text-3xl font-medium text-[#4285f4]">100K+</p>
              <p className="text-sm text-[#5f6368]">Journals</p>
            </div>
            <div>
              <p className="text-3xl font-medium text-[#4285f4]">20+</p>
              <p className="text-sm text-[#5f6368]">Years of data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
