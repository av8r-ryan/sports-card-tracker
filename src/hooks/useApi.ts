import { useEffect, useRef } from 'react';
import { useCards } from '../context/DexieCardContext';
import { apiService } from '../services/api';
import { logInfo, logError } from '../utils/logger';

export const useApi = () => {
  const { setCards, setLoading, setError } = useCards();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load once on mount
    if (hasLoadedRef.current) return;
    
    const loadCards = async () => {
      try {
        logInfo('useApi', 'Loading cards from API');
        setLoading(true);
        setError(null);
        
        // First, check if the API is available
        await apiService.healthCheck();
        
        // Load cards from API
        const cards = await apiService.getAllCards();
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
  }, [setCards, setError, setLoading]); // Include dependencies

  return {
    // Health check function for manual use
    healthCheck: async () => {
      try {
        await apiService.healthCheck();
        return true;
      } catch {
        return false;
      }
    }
  };
};