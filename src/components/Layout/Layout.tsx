import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/CardContext';
import { exportCardsAsJSON, exportCardsAsCSV } from '../../utils/localStorage';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'inventory' | 'add-card' | 'admin' | 'profile';
  onViewChange: (view: 'dashboard' | 'inventory' | 'add-card' | 'admin' | 'profile') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { state: authState, logout } = useAuth();
  const { state, getPortfolioStats } = useCards();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const stats = getPortfolioStats();
  
  const isLoading = state.loading;
  const hasError = !!state.error;

  const handleExport = (format: 'json' | 'csv') => {
    try {
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
            <h1 className="app-title">Collectors Playbook Card Tracker</h1>
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
            <div className="quick-stats">
              <span className="stat">
                {stats.totalCards} cards
              </span>
              <span className="stat">
                {formatCurrency(stats.totalCurrentValue)} value
              </span>
              <span className={`stat profit-loss ${stats.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
              </span>
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
                <button onClick={() => handleExport('json')}>
                  Export as JSON
                </button>
                <button onClick={() => handleExport('csv')}>
                  Export as CSV
                </button>
              </div>
            </div>
            
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
            
            <button 
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
            >
              ☰
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
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          
          <button
            className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('inventory');
              setIsMobileMenuOpen(false);
            }}
          >
            <span className="nav-icon">📋</span>
            Inventory
          </button>
          
          <button
            className={`nav-item ${currentView === 'add-card' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('add-card');
              setIsMobileMenuOpen(false);
            }}
          >
            <span className="nav-icon">➕</span>
            Add Card
          </button>
          
          <button
            className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('profile');
              setIsMobileMenuOpen(false);
            }}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
          
          {authState.user?.role === 'admin' && (
            <button
              className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => {
                onViewChange('admin');
                setIsMobileMenuOpen(false);
              }}
            >
              <span className="nav-icon">🔧</span>
              Admin
            </button>
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