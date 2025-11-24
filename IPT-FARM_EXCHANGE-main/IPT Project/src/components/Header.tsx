import { Sprout, Menu, X } from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../lib/auth';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header = ({ onNavigate, currentPage }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  const handleNavClick = (page: string) => {
    if (!user && ['about', 'how-it-works', 'contact'].includes(page)) {
      onNavigate('home');
      setTimeout(() => {
        const element = document.getElementById(page === 'how-it-works' ? 'how-it-works' : page);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      onNavigate(page);
    }
  };

  const navLinks = user
    ? [
        { label: 'Dashboard', page: 'dashboard' },
        { label: 'Browse', page: 'browse' },
        { label: 'Messages', page: 'messages' },
      ]
    : [
        { label: 'Home', page: 'home' },
        { label: 'About', page: 'about' },
        { label: 'How It Works', page: 'how-it-works' },
        { label: 'Contact', page: 'contact' },
      ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate(user ? 'dashboard' : 'home')}>
            <Sprout className="h-8 w-8 text-green-600" />
            <div className="ml-2">
              <h1 className="text-xl font-bold text-gray-900">FarmExchange</h1>
              <p className="text-xs text-gray-500">Connect. Share. Grow.</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNavClick(link.page)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'text-green-600'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  {profile?.full_name}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => onNavigate('login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => onNavigate('signup')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  handleNavClick(link.page);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === link.page
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 space-y-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-700">
                    {profile?.full_name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onNavigate('signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
