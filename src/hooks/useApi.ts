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
    // Skip API calls - using local IndexedDB storage only
    // Reset loading state when user logs out
    if (!authState.user || !authState.token) {
      hasLoadedRef.current = false;
      return;
    }

    // Skip API loading - all data is in local IndexedDB
    logInfo('useApi', 'Skipping API load - using local IndexedDB storage', {
      userId: authState.user?.id,
    });

    hasLoadedRef.current = true;
    setLoading(false);
  }, [setLoading, authState.user, authState.token]);

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
