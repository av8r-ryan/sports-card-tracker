import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../src/context/AuthContext';

// Mock the user service
const mockUserService = {
  authenticateUser: jest.fn(),
  createUser: jest.fn(),
  getAllUsers: jest.fn()
};

jest.mock('../../../src/services/userService', () => ({
  userService: mockUserService
}));

// Mock the collections database
const mockCollectionsDatabase = {
  initializeUserCollections: jest.fn()
};

jest.mock('../../../src/db/collectionsDatabase', () => ({
  collectionsDatabase: mockCollectionsDatabase
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { state, login, register, logout, clearError, updateUser } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{state.user ? state.user.username : 'No user'}</div>
      <div data-testid="loading">{state.loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{state.error || 'No error'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('testuser', 'test@example.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
      <button onClick={() => updateUser({ id: '1', username: 'updated', email: 'test@example.com', role: 'user' })}>Update User</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('initializes with no user and no token', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });

    it('restores user from localStorage on mount', () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
      const mockToken = 'mock-token';
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    it('handles invalid localStorage data gracefully', () => {
      localStorage.setItem('user', 'invalid-json');
      localStorage.setItem('token', 'mock-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Login Functionality', () => {
    it('handles successful login', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
      mockUserService.authenticateUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockCollectionsDatabase.initializeUserCollections).toHaveBeenCalledWith('1');
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(localStorage.getItem('token')).toMatch(/^local-token-1-/);
    });

    it('handles login failure', async () => {
      mockUserService.authenticateUser.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');
    });

    it('handles login error', async () => {
      mockUserService.authenticateUser.mockImplementation(() => {
        throw new Error('Network error');
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });

    it('sets loading state during login', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockUserService.authenticateUser.mockReturnValue(promise);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      act(() => {
        loginButton.click();
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

      await act(async () => {
        resolvePromise!({ id: '1', username: 'testuser', email: 'test@example.com', role: 'user' });
        await promise;
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
  });

  describe('Registration Functionality', () => {
    it('handles successful registration', async () => {
      const mockUser = { id: '2', username: 'newuser', email: 'new@example.com', role: 'user' };
      mockUserService.getAllUsers.mockReturnValue([]);
      mockUserService.createUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByText('Register');
      
      await act(async () => {
        registerButton.click();
      });

      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: 'user',
        isActive: true
      });
      expect(mockCollectionsDatabase.initializeUserCollections).toHaveBeenCalledWith('2');
      expect(screen.getByTestId('user')).toHaveTextContent('newuser');
    });

    it('handles registration with existing email', async () => {
      mockUserService.getAllUsers.mockReturnValue([
        { email: 'test@example.com' }
      ]);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByText('Register');
      
      await act(async () => {
        registerButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('error')).toHaveTextContent('Email already registered');
    });

    it('handles registration error', async () => {
      mockUserService.getAllUsers.mockReturnValue([]);
      mockUserService.createUser.mockImplementation(() => {
        throw new Error('Database error');
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByText('Register');
      
      await act(async () => {
        registerButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('error')).toHaveTextContent('Database error');
    });
  });

  describe('Logout Functionality', () => {
    it('clears user and token on logout', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
      mockUserService.authenticateUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText('Login');
      await act(async () => {
        loginButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('testuser');

      // Then logout
      const logoutButton = screen.getByText('Logout');
      act(() => {
        logoutButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('clears error when clearError is called', async () => {
      mockUserService.authenticateUser.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Trigger error
      const loginButton = screen.getByText('Login');
      await act(async () => {
        loginButton.click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Invalid email or password');

      // Clear error
      const clearErrorButton = screen.getByText('Clear Error');
      act(() => {
        clearErrorButton.click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });
  });

  describe('User Update', () => {
    it('updates user information', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
      mockUserService.authenticateUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login first
      const loginButton = screen.getByText('Login');
      await act(async () => {
        loginButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('testuser');

      // Update user
      const updateButton = screen.getByText('Update User');
      act(() => {
        updateButton.click();
      });

      expect(screen.getByTestId('user')).toHaveTextContent('updated');
      expect(localStorage.getItem('user')).toContain('updated');
    });
  });

  describe('Token Management', () => {
    it('generates unique tokens for each login', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
      mockUserService.authenticateUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      const token1 = localStorage.getItem('token');

      // Login again
      await act(async () => {
        loginButton.click();
      });

      const token2 = localStorage.getItem('token');

      expect(token1).not.toBe(token2);
      expect(token1).toMatch(/^local-token-1-/);
      expect(token2).toMatch(/^local-token-1-/);
    });
  });

  describe('Collections Initialization', () => {
    it('initializes collections on successful login', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
      mockUserService.authenticateUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      expect(mockCollectionsDatabase.initializeUserCollections).toHaveBeenCalledWith('1');
    });

    it('initializes collections on successful registration', async () => {
      const mockUser = { id: '2', username: 'newuser', email: 'new@example.com', role: 'user' };
      mockUserService.getAllUsers.mockReturnValue([]);
      mockUserService.createUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const registerButton = screen.getByText('Register');
      
      await act(async () => {
        registerButton.click();
      });

      expect(mockCollectionsDatabase.initializeUserCollections).toHaveBeenCalledWith('2');
    });

    it('handles collections initialization error gracefully', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' };
      mockUserService.authenticateUser.mockReturnValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockRejectedValue(new Error('Collections error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const loginButton = screen.getByText('Login');
      
      await act(async () => {
        loginButton.click();
      });

      // Should still login successfully even if collections fail
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });
});
