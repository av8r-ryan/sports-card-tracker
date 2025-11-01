import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Card, PortfolioStats } from '../types';
import { useAuth } from './AuthContext';

interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
}

interface CardContextType {
  state: CardState;
  addCard: (card: Card) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  setCards: (cards: Card[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getPortfolioStats: () => PortfolioStats;
  clearAllCards: () => Promise<void>;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export const CardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CardState>({ cards: [], loading: false, error: null });
  const { state: authState } = useAuth();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (isMounted) setState({ cards: data || [], loading: false, error: null });
      } catch (err) {
        if (isMounted)
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load cards',
          }));
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const addCard = useCallback(
    async (card: Card): Promise<void> => {
      const userId = authState.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const id =
        (card as any).id ||
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? (crypto as any).randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

      const payload = {
        id,
        user_id: userId,
        collection_id: (card as any).collection_id || `default-${userId}`,
        player: card.player,
        year: card.year,
        brand: card.brand,
        card_number: card.cardNumber || null,
        category: card.category,
        team: card.team || null,
        condition: card.condition || null,
        grading_company: card.gradingCompany || null,
        purchase_price: card.purchasePrice || null,
        current_value: card.currentValue || null,
        purchase_date: card.purchaseDate ? new Date(card.purchaseDate).toISOString().split('T')[0] : null,
        sell_price: card.sellPrice || null,
        sell_date: card.sellDate ? new Date(card.sellDate).toISOString().split('T')[0] : null,
        notes: card.notes || null,
      } as const;

      const { error } = await supabase.from('cards').insert([payload]);
      if (error) throw error;

      setState((prev) => ({ ...prev, cards: [{ ...card, id } as Card, ...prev.cards] }));
    },
    [authState.user?.id]
  );

  const updateCard = useCallback(async (card: Card): Promise<void> => {
    const payload = {
      player: card.player,
      year: card.year,
      brand: card.brand,
      card_number: card.cardNumber || null,
      category: card.category,
      team: card.team || null,
      condition: card.condition || null,
      grading_company: card.gradingCompany || null,
      purchase_price: card.purchasePrice || null,
      current_value: card.currentValue || null,
      purchase_date: card.purchaseDate ? new Date(card.purchaseDate).toISOString().split('T')[0] : null,
      sell_price: card.sellPrice || null,
      sell_date: card.sellDate ? new Date(card.sellDate).toISOString().split('T')[0] : null,
      notes: card.notes || null,
    };

    const { error } = await supabase.from('cards').update(payload).eq('id', card.id);
    if (error) throw error;

    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === card.id ? card : c)),
    }));
  }, []);

  const deleteCard = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) throw error;
    setState((prev) => ({ ...prev, cards: prev.cards.filter((c) => c.id !== id) }));
  }, []);

  const clearAllCards = useCallback(async (): Promise<void> => {
    const { error } = await supabase.from('cards').delete().neq('id', '');
    if (error) throw error;
    setState((prev) => ({ ...prev, cards: [] }));
  }, []);

  const setCards = useCallback((cards: Card[]) => {
    setState((prev) => ({ ...prev, cards }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const getPortfolioStats = useCallback((): PortfolioStats => {
    const { cards } = state;
    const totalCards = cards.length;
    const totalCurrentValue = cards.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const totalCostBasis = cards.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    const totalProfit = totalCurrentValue - totalCostBasis;
    const soldCards = cards.filter((c) => !!c.sellDate);
    const totalSold = soldCards.length;
    const totalSoldValue = soldCards.reduce((sum, c) => sum + (c.sellPrice || 0), 0);
    return {
      totalCards,
      totalCostBasis,
      totalCurrentValue,
      totalProfit,
      totalSold,
      totalSoldValue,
    };
  }, [state]);

  const contextValue = useMemo(
    () => ({
      state,
      addCard,
      updateCard,
      deleteCard,
      setCards,
      setLoading,
      setError,
      getPortfolioStats,
      clearAllCards,
    }),
    [state, addCard, updateCard, deleteCard, setCards, setLoading, setError, getPortfolioStats, clearAllCards]
  );

  return <CardContext.Provider value={contextValue}>{children}</CardContext.Provider>;
};

export const useCards = (): CardContextType => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
};
