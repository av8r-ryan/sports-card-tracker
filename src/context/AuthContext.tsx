import React, { createContext, useContext, useReducer, useEffect } from 'react';

import { collectionsDatabase } from '../db/collectionsDatabase';
import { localAuthService } from '../services/localAuthService';
import { User } from '../types';
import { logDebug, logInfo, logWarn, logError } from '../utils/logger';
import { seedDataManager } from '../utils/seedDataManager';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is stored in localStorage on app start
    logDebug('AuthContext', 'Checking for existing session on app start');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        logDebug('AuthContext', 'Found existing session data', { hasUser: !!storedUser, hasToken: !!storedToken });
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: storedToken } });
        logInfo('AuthContext', 'Session restored successfully', { userId: user.id, username: user.username });
      } catch (error) {
        logError('AuthContext', 'Failed to parse stored user data', error as Error, { storedUser, storedToken });
        // Clear invalid stored data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        logWarn('AuthContext', 'Cleared invalid session data');
      }
    } else {
      logDebug('AuthContext', 'No existing session found');
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    logInfo('AuthContext', 'Starting login process', { email });
    dispatch({ type: 'LOGIN_START' });

    try {
      // Use local authentication
      logDebug('AuthContext', 'Authenticating user with local auth service');
      const { user, token } = await localAuthService.login(email, password);
      logDebug('AuthContext', 'Authentication result received', { userFound: !!user, userId: user?.id });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      logInfo('AuthContext', 'Login successful, initializing user collections', { userId: user.id });

      // Initialize user collections (handles errors internally)
      await collectionsDatabase.initializeUserCollections(user.id);
      logInfo('AuthContext', 'User collections initialization completed', { userId: user.id });

      // Import seed data if needed
      try {
        const importedCount = await seedDataManager.importSeedData(user.id);
        if (importedCount > 0) {
          logInfo('AuthContext', 'Seed data imported successfully', { importedCount, userId: user.id });
        }
      } catch (seedError) {
        logError('AuthContext', 'Failed to import seed data', seedError as Error, { userId: user.id });
        // Don't fail login if seed import fails
      }
    } catch (error) {
      logError('AuthContext', 'Login process failed', error as Error, { email });
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    logInfo('AuthContext', 'Starting registration process', { username, email });
    dispatch({ type: 'LOGIN_START' });

    try {
      // Use local registration
      logDebug('AuthContext', 'Registering user with local auth service');
      const { user, token } = await localAuthService.register(username, email, password);
      logDebug('AuthContext', 'Registration result received', { userFound: !!user, userId: user?.id });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      logInfo('AuthContext', 'Registration successful, initializing user collections', { userId: user.id });

      // Initialize user collections (handles errors internally)
      await collectionsDatabase.initializeUserCollections(user.id);
      logInfo('AuthContext', 'User collections initialization completed for new user', { userId: user.id });

      // Import seed data for new user
      try {
        const importedCount = await seedDataManager.importSeedData(user.id);
        if (importedCount > 0) {
          logInfo('AuthContext', 'Seed data imported for new user', { importedCount, userId: user.id });
        }
      } catch (seedError) {
        logError('AuthContext', 'Failed to import seed data for new user', seedError as Error);
        // Don't fail registration if seed import fails
      }
    } catch (error) {
      logError('AuthContext', 'Registration process failed', error as Error, { username, email });
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed',
      });
      throw error;
    }
  };

  const logout = () => {
    logInfo('AuthContext', 'User logout initiated', { userId: state.user?.id, username: state.user?.username });
    dispatch({ type: 'LOGOUT' });
    logInfo('AuthContext', 'User logout completed');
  };

  const clearError = () => {
    logDebug('AuthContext', 'Clearing authentication error');
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (user: User) => {
    logInfo('AuthContext', 'Updating user data', { userId: user.id, username: user.username });
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, clearError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
