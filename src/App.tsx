import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CardProvider } from './context/CardContext';
import { useApi } from './hooks/useApi';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CardList from './components/CardList/CardList';
import CardForm from './components/CardForm/CardForm';
import CardDetail from './components/CardDetail/CardDetail';
import AuthForm from './components/Auth/AuthForm';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserProfile from './components/UserProfile/UserProfile';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import DebugPanel from './components/DebugPanel/DebugPanel';
import { Card } from './types';
import { logInfo } from './utils/logger';
import './App.css';

type View = 'dashboard' | 'inventory' | 'add-card' | 'admin' | 'profile';

const AppContent: React.FC = () => {
  const { state: authState } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  
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
        return (
          <CardForm 
            key={editingCard?.id || 'new-card'}
            card={editingCard || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        );
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <UserProfile />;
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