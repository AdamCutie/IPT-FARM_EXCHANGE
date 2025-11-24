import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManageHarvestsPage } from './pages/ManageHarvestsPage';
import { BrowsePage } from './pages/BrowsePage';
import { MessagesPage } from './pages/MessagesPage';
import { TransactionsPage } from './pages/TransactionsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    if (!loading) {
      if (user && (currentPage === 'home' || currentPage === 'login' || currentPage === 'signup')) {
        setCurrentPage('dashboard');
      } else if (!user && ['dashboard', 'manage-harvests', 'messages', 'transactions'].includes(currentPage)) {
        setCurrentPage('home');
      }
    }
  }, [user, loading]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === 'home' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
      {currentPage === 'signup' && <SignUpPage onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentPage === 'manage-harvests' && <ManageHarvestsPage onNavigate={handleNavigate} />}
      {currentPage === 'browse' && <BrowsePage onNavigate={handleNavigate} />}
      {currentPage === 'messages' && <MessagesPage onNavigate={handleNavigate} />}
      {currentPage === 'transactions' && <TransactionsPage onNavigate={handleNavigate} />}
      {['about', 'how-it-works', 'contact'].includes(currentPage) && (
        <LandingPage onNavigate={handleNavigate} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
