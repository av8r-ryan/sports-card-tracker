import { useEffect, useRef } from 'react';

import { useAuth } from '../context/AuthContext';
import { useCards } from '../context/DexieCardContext';
import { apiService } from '../services/api';
import { logInfo, logError } from '../utils/logger';

export const useApi = () => {
  const { setCards, setLoading, setError } = useCards();
  const { state: authState } = useAuth();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Reset loading state when user logs out
    if (!authState.user || !authState.token) {
      hasLoadedRef.current = false;
      return;
    }

    // Only load once on mount and only if user is authenticated
    if (hasLoadedRef.current) return;

    const loadCards = async () => {
      try {
        logInfo('useApi', 'Loading cards from API', {
          userId: authState.user?.id,
          hasToken: !!authState.token,
        });
        setLoading(true);
        setError(null);

        // First, check if the API is available
        await apiService.healthCheck();

        // Load cards from API
        const cards = await apiService.getAllCards();
        console.log('API Cards loaded:', cards);
        console.log('First card images:', cards[0]?.images);
        setCards(cards);

        logInfo('useApi', `Loaded ${cards.length} cards from API`);
        hasLoadedRef.current = true;
      } catch (error) {
        logError('useApi', 'Failed to load cards from API', error as Error);
        setError('Failed to connect to server. Please make sure the server is running.');

        // Try again in 5 seconds if failed
        setTimeout(() => {
          hasLoadedRef.current = false;
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
  }, [setCards, setError, setLoading, authState.user, authState.token]); // Include auth dependencies

  return {
    // Health check function for manual use
    healthCheck: async () => {
      try {
        await apiService.healthCheck();
        return true;
      } catch {
        return false;
      }
    },
  };
};
