import { useState } from 'react';
import { User, BookOpen, Library, Bell, FlaskConical, Settings, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'citations', label: 'My Citations', icon: User },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'labs', label: 'Labs', icon: FlaskConical },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (page: string) => currentPage === page;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#dadce0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <BookOpen className="w-8 h-8 text-[#4285f4]" />
            <span className="text-xl font-normal text-[#202124]">
              ScholarGPT
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    isActive(item.id)
                      ? 'text-[#1a73e8] bg-[#f0f7ff]'
                      : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {isActive(item.id) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#1a73e8] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full w-9 h-9 bg-[#1a73e8] text-white hover:bg-[#1557b0]"
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-[#202124]">Researcher User</p>
                  <p className="text-xs text-[#5f6368]">user@university.edu</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('library')}>
                  <Library className="w-4 h-4 mr-2" />
                  My Library
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-[#d93025]">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isActive(item.id)
                            ? 'text-[#1a73e8] bg-[#f0f7ff]'
                            : 'text-[#5f6368] hover:bg-[#f8f9fa]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
