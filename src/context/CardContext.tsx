import React, { createContext, useContext, useReducer, ReactNode, useCallback, useMemo } from 'react';
import { Card, PortfolioStats } from '../types';
import { logDebug, logInfo, logError } from '../utils/logger';

interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

type CardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string };

interface CardContextType {
  state: CardState;
  addCard: (card: Card) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setCards: (cards: Card[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getPortfolioStats: () => PortfolioStats;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

const cardReducer = (state: CardState, action: CardAction): CardState => {
  logDebug('CardContext', `Reducer action: ${action.type}`, action);
  
  switch (action.type) {
    case 'SET_LOADING':
      logDebug('CardContext', `Loading state changed to: ${action.payload}`);
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      if (action.payload) {
        logError('CardContext', `Error set: ${action.payload}`);
      }
      return { ...state, error: action.payload };
    case 'SET_CARDS':
      logInfo('CardContext', `Setting ${action.payload.length} cards`);
      return { ...state, cards: action.payload };
    case 'ADD_CARD':
      logInfo('CardContext', `Adding card: ${action.payload.player} - ${action.payload.year}`, action.payload);
      return { ...state, cards: [...state.cards, action.payload] };
    case 'UPDATE_CARD':
      logInfo('CardContext', `Updating card: ${action.payload.id}`, action.payload);
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.payload.id ? action.payload : card
        )
      };
    case 'DELETE_CARD':
      logInfo('CardContext', `Deleting card: ${action.payload}`);
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };
    default:
      return state;
  }
};

const initialState: CardState = {
  cards: [],
  loading: false,
  error: null
};

export const CardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cardReducer, initialState);
  
  logDebug('CardProvider', 'Provider initialized', { initialCardsCount: initialState.cards.length });

  const addCard = useCallback(async (card: Card) => {
    try {
      logDebug('CardProvider', 'addCard called', card);
      
      // Import API service dynamically to avoid circular dependencies
      const { apiService } = await import('../services/api');
      const createdCard = await apiService.createCard(card);
      
      dispatch({ type: 'ADD_CARD', payload: createdCard });
    } catch (error) {
      logError('CardProvider', 'Failed to add card', error as Error, card);
      throw error;
    }
  }, []);

  const updateCard = useCallback(async (card: Card) => {
    try {
      logDebug('CardProvider', 'updateCard called', card);
      
      // Import API service dynamically to avoid circular dependencies
      const { apiService } = await import('../services/api');
      const updatedCard = await apiService.updateCard(card);
      
      dispatch({ type: 'UPDATE_CARD', payload: updatedCard });
    } catch (error) {
      logError('CardProvider', 'Failed to update card', error as Error, card);
      throw error;
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    try {
      logDebug('CardProvider', 'deleteCard called', { id });
      
      // Import API service dynamically to avoid circular dependencies
      const { apiService } = await import('../services/api');
      await apiService.deleteCard(id);
      
      dispatch({ type: 'DELETE_CARD', payload: id });
    } catch (error) {
      logError('CardProvider', 'Failed to delete card', error as Error, { id });
      throw error;
    }
  }, []);

  const setCards = useCallback((cards: Card[]) => {
    try {
      logDebug('CardProvider', 'setCards called', { count: cards.length });
      dispatch({ type: 'SET_CARDS', payload: cards });
    } catch (error) {
      logError('CardProvider', 'Failed to set cards', error as Error, { count: cards.length });
      throw error;
    }
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const getPortfolioStats = useCallback((): PortfolioStats => {
    try {
      const { cards } = state;
      const soldCards = cards.filter(card => card.sellPrice && card.sellDate);
      
      const stats = {
        totalCards: cards.length,
        totalCostBasis: cards.reduce((sum, card) => sum + card.purchasePrice, 0),
        totalCurrentValue: cards.reduce((sum, card) => sum + card.currentValue, 0),
        totalProfit: cards.reduce((sum, card) => sum + (card.currentValue - card.purchasePrice), 0),
        totalSold: soldCards.length,
        totalSoldValue: soldCards.reduce((sum, card) => sum + (card.sellPrice || 0), 0)
      };
      
      logDebug('CardProvider', 'Portfolio stats calculated', stats);
      return stats;
    } catch (error) {
      logError('CardProvider', 'Failed to calculate portfolio stats', error as Error);
      return {
        totalCards: 0,
        totalCostBasis: 0,
        totalCurrentValue: 0,
        totalProfit: 0,
        totalSold: 0,
        totalSoldValue: 0
      };
    }
  }, [state]);

  const contextValue = useMemo(() => ({
    state,
    addCard,
    updateCard,
    deleteCard,
    setCards,
    setLoading,
    setError,
    getPortfolioStats
  }), [state, addCard, updateCard, deleteCard, setCards, setLoading, setError, getPortfolioStats]);

  return (
    <CardContext.Provider value={contextValue}>
      {children}
    </CardContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};