import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CardProvider, useCards } from './context/CardContext';
import { useApi } from './hooks/useApi';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CardList from './components/CardList/CardList';
import CardForm from './components/CardForm/CardForm';
import EnhancedCardForm from './components/EnhancedCardForm/EnhancedCardForm';
import CardDetail from './components/CardDetail/CardDetail';
import AuthForm from './components/Auth/AuthForm';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserProfile from './components/UserProfile/UserProfile';
import Reports from './components/Reports/Reports';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import DebugPanel from './components/DebugPanel/DebugPanel';
import DevTools from './components/DevTools/DevTools';
import { Card } from './types';
import { migrateCardToEnhanced } from './utils/cardMigration';
import { saveEnhancedCard } from './utils/enhancedCardIntegration';
import { logInfo } from './utils/logger';
import './App.css';

type View = 'dashboard' | 'inventory' | 'add-card' | 'admin' | 'profile' | 'reports';

const AppContent: React.FC = () => {
  const { state: authState } = useAuth();
  const { addCard, updateCard } = useCards();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [useEnhancedForm, setUseEnhancedForm] = useState(true); // Toggle for enhanced form
  
  useApi();
  
  logInfo('App', 'Application initialized');

  // Show auth form if user is not authenticated
  if (!authState.user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
      />
    );
  }

  const handleViewChange = (view: View) => {
    logInfo('App', `View changed to: ${view}`);
    setCurrentView(view);
    setSelectedCard(null);
    setEditingCard(null);
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
          />
        );
      case 'add-card':
        if (useEnhancedForm) {
          const enhancedCard = editingCard ? migrateCardToEnhanced(editingCard) : undefined;
          return (
            <>
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => setUseEnhancedForm(!useEnhancedForm)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Switch to Classic Form
                </button>
              </div>
              <EnhancedCardForm
                key={editingCard?.id || 'new-card'}
                card={enhancedCard}
                onSave={async (data) => {
                  try {
                    await saveEnhancedCard(data, addCard, updateCard);
                    handleFormSuccess();
                  } catch (error) {
                    console.error('Error saving enhanced card:', error);
                    alert('Failed to save card. Please try again.');
                  }
                }}
                onCancel={handleFormCancel}
              />
            </>
          );
        } else {
          return (
            <>
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => setUseEnhancedForm(!useEnhancedForm)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Switch to Enhanced Form
                </button>
              </div>
              <CardForm 
                key={editingCard?.id || 'new-card'}
                card={editingCard || undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </>
          );
        }
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <UserProfile />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={handleViewChange}>
      {renderCurrentView()}
      
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onEdit={handleEditCard}
          onClose={handleCloseDetail}
        />
      )}
      
      <DebugPanel />
      <DevTools />
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CardProvider>
          <AppContent />
        </CardProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;