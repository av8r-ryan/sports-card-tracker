import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { User } from '../types';
import { logDebug, logInfo, logWarn, logError } from '../utils/logger';

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
    // Initialize from Supabase session and subscribe to auth state changes
    (async () => {
      logDebug('AuthContext', 'Initializing Supabase auth session');
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (session?.user) {
        logInfo('AuthContext', 'Supabase session found', { userId: session.user.id });
        const profile = await ensureUserProfile(session.user.id, session.user.email || '');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: { id: profile.id, username: profile.username, email: profile.email || '', role: profile.role as any },
            token: session.access_token,
          },
        });
      }

      supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
        if (newSession?.user) {
          const profile = await ensureUserProfile(newSession.user.id, newSession.user.email || '');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: {
                id: profile.id,
                username: profile.username,
                email: profile.email || '',
                role: profile.role as any,
              },
              token: newSession.access_token,
            },
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      });
    })();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    logInfo('AuthContext', 'Starting login process', { email });
    dispatch({ type: 'LOGIN_START' });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session || !data.user) throw error || new Error('Login failed');

      const profile = await ensureUserProfile(data.user.id, data.user.email || email);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: profile.id,
            username: profile.username,
            email: profile.email || email,
            role: profile.role as any,
          },
          token: data.session.access_token,
        },
      });
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) throw error || new Error('Registration failed');

      // Create profile row
      await upsertUserProfile({ id: data.user.id, username, email, role: 'user' });

      // Optional immediate sign-in (if email confirmations disabled)
      const { data: signin } = await supabase.auth.signInWithPassword({ email, password });
      if (signin?.session) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: { id: data.user.id, username, email, role: 'user' },
            token: signin.session.access_token,
          },
        });
      } else {
        // If email confirmation is required, surface a friendly message
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Please check your email to confirm your account.' });
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
    supabase.auth.signOut().finally(() => {
      dispatch({ type: 'LOGOUT' });
    });
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

// Helpers
async function ensureUserProfile(userId: string, email: string) {
  // Fetch or create user profile row
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (!error && data) return data;

  // Create with derived username
  const username = email?.split('@')[0] || `user_${userId.substring(0, 6)}`;
  const { data: inserted, error: upsertErr } = await supabase
    .from('users')
    .upsert([{ id: userId, username, email, role: 'user' }])
    .select()
    .maybeSingle();

  if (upsertErr) throw upsertErr;

  // Ensure default collection
  await supabase
    .from('collections')
    .upsert([
      {
        id: `default-${userId}`,
        user_id: userId,
        name: 'My Collection',
        description: 'Default collection',
        is_default: true,
      },
    ]);

  return inserted!;
}

async function upsertUserProfile(profile: { id: string; username: string; email: string; role: 'user' | 'admin' }) {
  const { error } = await supabase.from('users').upsert([profile]);
  if (error) throw error;
}
