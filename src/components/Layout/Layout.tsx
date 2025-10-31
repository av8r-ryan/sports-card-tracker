import React, { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/SupabaseCardContext';
import { useTheme } from '../../context/ThemeContext';
import { exportCardsAsJSON, exportCardsAsCSV } from '../../utils/exportUtils';
import { exportCardsToPDF } from '../../utils/pdfExport';
import './Layout.css';
import PerformanceMonitoring from '../PerformanceMonitoring/PerformanceMonitoring';

interface LayoutProps {
  children: React.ReactNode;
  currentView:
    | 'dashboard'
    | 'inventory'
    | 'add-card'
    | 'admin'
    | 'profile'
    | 'reports'
    | 'ebay'
    | 'backup'
    | 'users'
    | 'collections'
    | 'about'
    | 'contact'
    | 'docs'
    | 'privacy'
    | 'terms'
    | '404';
  onViewChange: (
    view:
      | 'dashboard'
      | 'inventory'
      | 'add-card'
      | 'admin'
      | 'profile'
      | 'reports'
      | 'ebay'
      | 'backup'
      | 'users'
      | 'collections'
      | 'about'
      | 'contact'
      | 'docs'
      | 'privacy'
      | 'terms'
      | '404'
  ) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { state: authState, logout } = useAuth();
  const { state, getPortfolioStats } = useCards();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showExportSubmenu, setShowExportSubmenu] = useState(false);
  const [showCardsMenu, setShowCardsMenu] = useState(false);

  // Debug logging for submenu state
  console.log('Export submenu state:', showExportSubmenu);
  const stats = getPortfolioStats();

  // Debug logging for stats
  console.log('Portfolio Stats:', {
    totalCards: stats.totalCards,
    totalCurrentValue: stats.totalCurrentValue,
    totalProfit: stats.totalProfit,
    cardsLength: state.cards.length,
  });

  const isLoading = state.loading;
  const hasError = !!state.error;

  const handleExport = (format: 'json' | 'csv' | 'pdf') => {
    console.log('Export function called with format:', format);
    console.log('Cards available:', state.cards.length);

    try {
      if (format === 'pdf') {
        console.log('Exporting as PDF...');
        exportCardsToPDF(state.cards, {
          includeStats: true,
          groupBy: 'none',
          sortBy: 'player',
        });
        return;
      }

      console.log('Exporting as', format.toUpperCase());
      const filename = `sports-cards-${new Date().toISOString().split('T')[0]}`;
      const data = format === 'json' ? exportCardsAsJSON(state.cards) : exportCardsAsCSV(state.cards);

      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Export completed successfully');
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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportSubmenu) {
        const target = event.target as Element;
        if (!target.closest('.submenu-item')) {
          setShowExportSubmenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportSubmenu]);

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h2 className="app-title" onClick={() => onViewChange('dashboard')} style={{ cursor: 'pointer' }}>
              <span className="title-text">CardFlex™</span>
            </h2>
            {hasError && <div className="api-status error">⚠️ {state.error}</div>}
            {isLoading && <div className="api-status loading">🔄 Loading...</div>}
          </div>

          <div className="header-right">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <div className="user-menu-container">
              <div className="user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
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
                <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L2 4h8L6 8z" />
                </svg>
              </div>

              {showUserMenu && (
                <div className="user-dropdown">
                  <button
                    onClick={() => {
                      onViewChange('profile');
                      setShowUserMenu(false);
                    }}
                  >
                    👤 Profile
                  </button>
                  <button
                    onClick={() => {
                      onViewChange('backup');
                      setShowUserMenu(false);
                    }}
                  >
                    💾 Backup & Restore
                  </button>

                  <div className="submenu-item">
                    <button
                      className="submenu-label"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Export submenu clicked, current state:', showExportSubmenu);
                        setShowExportSubmenu(!showExportSubmenu);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        📤 Export
                        <svg
                          className={`submenu-arrow ${showExportSubmenu ? 'rotated' : ''}`}
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="currentColor"
                          style={{ marginLeft: 'auto' }}
                        >
                          <path d="M4 2l4 4-4 4V2z" />
                        </svg>
                      </span>
                    </button>
                    <div
                      className="submenu-third-level"
                      style={{
                        display: showExportSubmenu ? 'block' : 'none',
                        opacity: showExportSubmenu ? 1 : 0,
                        position: 'absolute',
                        left: 'calc(100% + 4px)',
                        top: '0',
                        minWidth: '180px',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        zIndex: 10000,
                        padding: '8px 0',
                      }}
                    >
                      <button
                        onClick={() => {
                          console.log('PDF export clicked');
                          handleExport('pdf');
                          setShowUserMenu(false);
                          setShowExportSubmenu(false);
                        }}
                      >
                        📄 Export as PDF
                      </button>
                      <button
                        onClick={() => {
                          console.log('JSON export clicked');
                          handleExport('json');
                          setShowUserMenu(false);
                          setShowExportSubmenu(false);
                        }}
                      >
                        📋 Export as JSON
                      </button>
                      <button
                        onClick={() => {
                          console.log('CSV export clicked');
                          handleExport('csv');
                          setShowUserMenu(false);
                          setShowExportSubmenu(false);
                        }}
                      >
                        📊 Export as CSV
                      </button>
                    </div>
                  </div>

                  {authState.user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          onViewChange('admin');
                          setShowUserMenu(false);
                        }}
                      >
                        ⚙️ Admin Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onViewChange('users');
                          setShowUserMenu(false);
                        }}
                      >
                        👥 User Management
                      </button>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="logout-menu-item"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>

            <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
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

          <div className="nav-item-dropdown">
            <button
              className={`nav-item ${currentView === 'inventory' || currentView === 'add-card' ? 'active' : ''}`}
              onClick={() => setShowCardsMenu(!showCardsMenu)}
              onBlur={() => setTimeout(() => setShowCardsMenu(false), 200)}
            >
              Cards
              <svg
                className={`dropdown-arrow ${showCardsMenu ? 'rotated' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M6 8L2 4h8L6 8z" />
              </svg>
            </button>
            {showCardsMenu && (
              <div className="nav-dropdown">
                <button
                  onClick={() => {
                    onViewChange('inventory');
                    setIsMobileMenuOpen(false);
                    setShowCardsMenu(false);
                  }}
                >
                  Inventory
                </button>
                <button
                  onClick={() => {
                    onViewChange('add-card');
                    setIsMobileMenuOpen(false);
                    setShowCardsMenu(false);
                  }}
                >
                  Add Card
                </button>
              </div>
            )}
          </div>

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
            className={`nav-item ${currentView === 'about' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('about');
              setIsMobileMenuOpen(false);
            }}
          >
            About
          </button>

          <button
            className={`nav-item ${currentView === 'contact' ? 'active' : ''}`}
            onClick={() => {
              onViewChange('contact');
              setIsMobileMenuOpen(false);
            }}
          >
            Contact
          </button>
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Sookie Wentzel.</p>
          <div className="footer-links">
            <button className="footer-link" onClick={() => onViewChange('privacy')}>
              Privacy Policy
            </button>
            <span className="footer-separator">|</span>
            <button className="footer-link" onClick={() => onViewChange('terms')}>
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
      {/* Performance monitor overlay */}
      <PerformanceMonitoring showDetails={false} position="bottom-right" autoHide={true} />
    </div>
  );
};

export default Layout;
