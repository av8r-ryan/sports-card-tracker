import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import EnhancedCardForm from './components/EnhancedCardForm/EnhancedCardForm';
import PhotoCardForm from './components/PhotoCardForm/PhotoCardForm';
import CardDetail from './components/CardDetail/CardDetail';
import AuthForm from './components/Auth/AuthForm';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserProfile from './components/UserProfile/UserProfile';
import UserManagement from './components/UserManagement/UserManagement';
import Collections from './components/Collections/Collections';
import Reports from './components/Reports/Reports';
import EbayListings from './components/EbayListings/EbayListings';
import { BackupRestore } from './components/BackupRestore/BackupRestore';
import About from './components/About/About';
import CardForm from './components/CardForm/CardForm';
import CardList from './components/CardList/CardList';
import Contact from './components/Contact/Contact';
import Dashboard from './components/Dashboard/Dashboard';
import DebugPanel from './components/DebugPanel/DebugPanel';
import DevTools from './components/DevTools/DevTools';
import Docs from './components/Docs/Docs';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';
import NotFound from './components/NotFound/NotFound';
import Privacy from './components/Privacy/Privacy';
import Terms from './components/Terms/Terms';
import { AutoMigration } from './components/AutoMigration/AutoMigration';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CardProvider, useCards } from './context/DexieCardContext'; // Use Dexie context
import { ThemeProvider } from './context/ThemeContext';
import { useApi } from './hooks/useApi';
import { Card } from './types';
import { saveEnhancedCard, mergeCardWithEnhanced } from './utils/enhancedCardIntegration';
import { logInfo } from './utils/logger';
import { registerServiceWorker } from './utils/serviceWorker';
import './utils/debugDatabase'; // Import debug utility
import './utils/debugEnhancedCards'; // Import enhanced cards debug utility
import './utils/testCollectionMove'; // Import collection move test utility
import './utils/testCardSave'; // Import test card save utility
import './utils/debugBackup'; // Import backup debug utility
import './utils/resetAdmin'; // Import admin reset utility
import './App.css';

type View =
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
type FormType = 'classic' | 'enhanced' | 'photo';

const AppRoutes: React.FC = () => {
  const { state: authState } = useAuth();
  const { addCard, updateCard } = useCards();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formType, setFormType] = useState<FormType>('enhanced'); // Form type selection
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const location = useLocation();

  useApi();

  logInfo('App', 'Application initialized', { pathname: location.pathname });

  // Handle hash changes for collection navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#inventory?collection=')) {
        const collectionId = hash.split('=')[1];
        setSelectedCollectionId(collectionId);
        setCurrentView('inventory');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle URL-based navigation
  React.useEffect(() => {
    const path = location.pathname;
    logInfo('App', 'URL changed', { path });

    if (path === '/login' || path === '/register') {
      setAuthMode(path === '/login' ? 'login' : 'register');
    } else if (path === '/') {
      setCurrentView('dashboard');
    } else {
      const viewMap: { [key: string]: View } = {
        '/dashboard': 'dashboard',
        '/inventory': 'inventory',
        '/add-card': 'add-card',
        '/admin': 'admin',
        '/profile': 'profile',
        '/reports': 'reports',
        '/ebay': 'ebay',
        '/backup': 'backup',
        '/users': 'users',
        '/collections': 'collections',
        '/about': 'about',
        '/contact': 'contact',
        '/docs': 'docs',
      };

      if (viewMap[path]) {
        setCurrentView(viewMap[path]);
      }
    }
  }, [location.pathname]);

  // Show auth form if user is not authenticated
  if (!authState.user) {
    return <AuthForm mode={authMode} onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} />;
  }

  const handleViewChange = (view: View) => {
    logInfo('App', `View changed to: ${view}`);
    setCurrentView(view);
    setSelectedCard(null);
    setEditingCard(null);

    // Navigate to the appropriate URL
    const viewToPath: { [key in View]: string } = {
      dashboard: '/dashboard',
      inventory: '/inventory',
      'add-card': '/add-card',
      admin: '/admin',
      profile: '/profile',
      reports: '/reports',
      ebay: '/ebay',
      backup: '/backup',
      users: '/users',
      collections: '/collections',
      about: '/about',
      contact: '/contact',
      docs: '/docs',
      privacy: '/privacy',
      terms: '/terms',
      '404': '/404',
    };

    const path = viewToPath[view] || '/';
    window.history.pushState({}, '', path);

    // Clear collection filter when navigating away from inventory
    if (view !== 'inventory') {
      setSelectedCollectionId(null);
      window.location.hash = '';
    }
  };

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
  };

  const handleEditCard = (card: Card) => {
    setSelectedCard(null); // Close any open detail view
    setEditingCard(card);
    setCurrentView('add-card');
  };

  const handleFormSuccess = () => {
    setEditingCard(null);
    setCurrentView('inventory');
  };

  const handleFormCancel = () => {
    setEditingCard(null);
    setCurrentView('inventory');
  };

  const handleCloseDetail = () => {
    setSelectedCard(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return (
          <CardList
            onCardSelect={handleCardSelect}
            onEditCard={handleEditCard}
            selectedCollectionId={selectedCollectionId}
          />
        );
      case 'add-card':
        return (
          <>
            {/* Form Type Selector */}
            <div
              style={{
                marginBottom: '24px',
                textAlign: 'center',
                background: '#f7fafc',
                padding: '16px',
                borderRadius: '12px',
              }}
            >
              <div style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
                Choose Entry Method:
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFormType('classic')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: formType === 'classic' ? '2px solid #667eea' : '1px solid #e2e8f0',
                    background: formType === 'classic' ? '#e0e7ff' : '#ffffff',
                    color: formType === 'classic' ? '#667eea' : '#4a5568',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: formType === 'classic' ? '600' : '400',
                    transition: 'all 0.2s',
                  }}
                >
                  📝 Classic Form
                </button>
                <button
                  onClick={() => setFormType('enhanced')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: formType === 'enhanced' ? '2px solid #667eea' : '1px solid #e2e8f0',
                    background: formType === 'enhanced' ? '#e0e7ff' : '#ffffff',
                    color: formType === 'enhanced' ? '#667eea' : '#4a5568',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: formType === 'enhanced' ? '600' : '400',
                    transition: 'all 0.2s',
                  }}
                >
                  ⚡ Enhanced Form
                </button>
                <button
                  onClick={() => setFormType('photo')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: formType === 'photo' ? '2px solid #667eea' : '1px solid #e2e8f0',
                    background: formType === 'photo' ? '#e0e7ff' : '#ffffff',
                    color: formType === 'photo' ? '#667eea' : '#4a5568',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: formType === 'photo' ? '600' : '400',
                    transition: 'all 0.2s',
                  }}
                >
                  📸 Photo Scan
                </button>
              </div>
            </div>

            {/* Render appropriate form based on selection */}
            {formType === 'classic' && (
              <CardForm
                key={editingCard?.id || 'new-card'}
                card={editingCard || undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            )}
            {formType === 'enhanced' && (
              <EnhancedCardForm
                key={editingCard?.id || 'new-card-enhanced'}
                card={editingCard ? mergeCardWithEnhanced(editingCard) : undefined}
                onSave={async (enhancedCardData) => {
                  try {
                    await saveEnhancedCard(enhancedCardData, addCard, updateCard);
                    handleFormSuccess();
                  } catch (error) {
                    console.error('Error saving enhanced card:', error);
                    alert('Failed to save card. Please try again.');
                  }
                }}
                onCancel={handleFormCancel}
              />
            )}
            {formType === 'photo' && <PhotoCardForm onSuccess={handleFormSuccess} />}
          </>
        );
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <UserProfile />;
      case 'reports':
        return <Reports />;
      case 'ebay':
        return <EbayListings />;
      case 'backup':
        return <BackupRestore />;
      case 'users':
        return <UserManagement />;
      case 'collections':
        return <Collections />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'docs':
        return <Docs />;
      case 'privacy':
        return <Privacy />;
      case 'terms':
        return <Terms />;
      case '404':
        return <NotFound onNavigateHome={() => setCurrentView('dashboard')} />;
      default:
        return <NotFound onNavigateHome={() => setCurrentView('dashboard')} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      {renderCurrentView()}

      {selectedCard && <CardDetail card={selectedCard} onEdit={handleEditCard} onClose={handleCloseDetail} />}

      <DebugPanel />
      <DevTools />
    </Layout>
  );
};

function App() {
  // Register service worker on app start
  useEffect(() => {
    registerServiceWorker({
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully');
      },
      onUpdate: (registration) => {
        console.log('New Service Worker available');
        if (window.confirm('New version available! Reload to update?')) {
          window.location.reload();
        }
      },
      onOfflineReady: () => {
        console.log('App is ready for offline use');
      },
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <CardProvider>
              <Routes>
                <Route path="/migrate" element={<AutoMigration />} />
                <Route path="/login" element={<AppRoutes />} />
                <Route path="/register" element={<AppRoutes />} />
                <Route path="/" element={<AppRoutes />} />
                <Route path="/dashboard" element={<AppRoutes />} />
                <Route path="/inventory" element={<AppRoutes />} />
                <Route path="/add-card" element={<AppRoutes />} />
                <Route path="/admin" element={<AppRoutes />} />
                <Route path="/profile" element={<AppRoutes />} />
                <Route path="/reports" element={<AppRoutes />} />
                <Route path="/ebay" element={<AppRoutes />} />
                <Route path="/backup" element={<AppRoutes />} />
                <Route path="/users" element={<AppRoutes />} />
                <Route path="/collections" element={<AppRoutes />} />
                <Route path="/about" element={<AppRoutes />} />
                <Route path="/contact" element={<AppRoutes />} />
                <Route path="/docs" element={<AppRoutes />} />
                <Route path="*" element={<NotFound onNavigateHome={() => (window.location.href = '/')} />} />
              </Routes>
            </CardProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
