import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Header } from '@/components/Header';
import { HomePage } from '@/sections/HomePage';
import { SearchResultsPage } from '@/sections/SearchResultsPage';
import { LabsPage } from '@/sections/LabsPage';
import { LibraryPage } from '@/sections/LibraryPage';
import { CitationsPage } from '@/sections/CitationsPage';
import { AlertsPage } from '@/sections/AlertsPage';
import { SettingsPage } from '@/sections/SettingsPage';
import './App.css';

type PageType = 'home' | 'search' | 'labs' | 'library' | 'citations' | 'alerts' | 'settings' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('search');
    toast.info(`Searching for "${query}"...`);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSearchQuery('');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onSearch={handleSearch} onNavigate={handleNavigate} />;
      case 'search':
        return (
          <SearchResultsPage 
            query={searchQuery} 
            onBack={handleBackToHome}
            onSearch={handleSearch}
          />
        );
      case 'labs':
        return <LabsPage onSearch={handleSearch} />;
      case 'library':
        return <LibraryPage />;
      case 'citations':
      case 'profile':
        return <CitationsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onSearch={handleSearch} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Roboto, Arial, sans-serif',
          },
        }}
      />
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
