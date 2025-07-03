import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/DexieCardContext';
import { exportCardsAsJSON, exportCardsAsCSV } from '../../utils/exportUtils';
import { exportCardsToPDF } from '../../utils/pdfExport';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'inventory' | 'add-card' | 'admin' | 'profile' | 'reports' | 'ebay' | 'backup' | 'users' | 'collections' | 'about';
  onViewChange: (view: 'dashboard' | 'inventory' | 'add-card' | 'admin' | 'profile' | 'reports' | 'ebay' | 'backup' | 'users' | 'collections' | 'about') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { state: authState, logout } = useAuth();
  const { state, getPortfolioStats } = useCards();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const stats = getPortfolioStats();
  
  // Debug logging for stats
  console.log('Portfolio Stats:', {
    totalCards: stats.totalCards,
    totalCurrentValue: stats.totalCurrentValue,
    totalProfit: stats.totalProfit,
    cardsLength: state.cards.length
  });
  
  const isLoading = state.loading;
  const hasError = !!state.error;

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    try {
      if (format === 'pdf') {
        exportCardsToPDF(state.cards, {
          includeStats: true,
          groupBy: 'none',
          sortBy: 'player'
        });
        return;
      }

      const filename = `sports-cards-${new Date().toISOString().split('T')[0]}`;
      const data = format === 'json' 
        ? exportCardsAsJSON(state.cards)
        : exportCardsAsCSV(state.cards);
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h2 className="app-title">
              <img src="/logo-smp.png" alt="App Icon" className="app-icon" />
              <span className="title-text">Collectors Playbook Card Tracker</span>
            </h2>
            {hasError && (
              <div className="api-status error">
                ⚠️ {state.error}
              </div>
            )}
            {isLoading && (
              <div className="api-status loading">
                🔄 Loading...
              </div>
            )}
            <div className="stats-container">
              <button 
                className="stats-toggle"
                onClick={() => setShowStats(!showStats)}
                aria-label="Toggle statistics"
              >
                <span className="stats-label">Stats</span>
              </button>
              <div className={`quick-stats ${showStats ? 'show' : ''}`}>
                <span className="stat">
                  <span>{stats.totalCards} cards</span>
                </span>
                <span className="stat">
                  <span>{formatCurrency(stats.totalCurrentValue)}</span>
                </span>
                <span className={`stat profit-loss ${stats.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                  <span>{stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="user-info" onClick={() => onViewChange('profile')}>
              {authState.user?.profilePhoto ? (
                <img src={authState.user.profilePhoto} alt="Profile" className="profile-photo-small" />
              ) : (
                <div className="default-avatar-small">
                  <span>{authState.user?.username?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <span className="username">
                {authState.user?.username}
                {authState.user?.role === 'admin' && <span className="admin-badge">Admin</span>}
              </span>
            </div>
            
            <div className="export-menu">
              <button className="export-btn">
                Export
              </button>
              <div className="export-dropdown">
                <button onClick={() => handleExport('pdf')}>
                  📄 Export as PDF
                </button>
                <button onClick={() => handleExport('json')}>
                  📋 Export as JSON
                </button>
                <button onClick={() => handleExport('csv')}>
                  📊 Export as CSV
                </button>
              </div>
            </div>
            
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
            
            <button 
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <nav className={`navigation ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-content">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('dashboard');
              setIsMobileMenuOpen(false);
            }}
          >
            Dashboard
          </button>
          
          <button
            className={`nav-item ${currentView === 'collections' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('collections');
              setIsMobileMenuOpen(false);
            }}
          >
            Collections
          </button>
          
          <button
            className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('inventory');
              setIsMobileMenuOpen(false);
            }}
          >
            Inventory
          </button>
          
          <button
            className={`nav-item ${currentView === 'add-card' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('add-card');
              setIsMobileMenuOpen(false);
            }}
          >
            Add Card
          </button>
          
          <button
            className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('reports');
              setIsMobileMenuOpen(false);
            }}
          >
            Reports
          </button>
          
          <button
            className={`nav-item ${currentView === 'ebay' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('ebay');
              setIsMobileMenuOpen(false);
            }}
          >
            eBay Listings
          </button>
          
          <button
            className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('profile');
              setIsMobileMenuOpen(false);
            }}
          >
            Profile
          </button>
          
          <button
            className={`nav-item ${currentView === 'backup' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('backup');
              setIsMobileMenuOpen(false);
            }}
          >
            Backup
          </button>
          
          <button
            className={`nav-item ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('about');
              setIsMobileMenuOpen(false);
            }}
          >
            About
          </button>
          
          {authState.user?.role === 'admin' && (
            <>
              <button
                className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  onViewChange('admin');
                  setIsMobileMenuOpen(false);
                }}
              >
                Admin
              </button>
              <button
                className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
                onClick={() => {
                  onViewChange('users');
                  setIsMobileMenuOpen(false);
                }}
              >
                Users
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Collectors Playbook Card Tracker.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;