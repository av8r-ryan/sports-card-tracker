import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../src/context/AuthContext';
import AuthForm from '../../src/components/Auth/AuthForm';

// Mock the user service
const mockUserService = {
  authenticateUser: jest.fn(),
  createUser: jest.fn(),
  getAllUsers: jest.fn()
};

jest.mock('../../src/services/userService', () => ({
  userService: mockUserService
}));

// Mock the collections database
const mockCollectionsDatabase = {
  initializeUserCollections: jest.fn()
};

jest.mock('../../src/db/collectionsDatabase', () => ({
  collectionsDatabase: mockCollectionsDatabase
}));

// Test component that shows auth state
const AuthTestComponent = () => {
  const { state } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-state">
        {state.user ? `Logged in as ${state.user.username}` : 'Not logged in'}
      </div>
      <div data-testid="loading-state">
        {state.loading ? 'Loading...' : 'Not loading'}
      </div>
      <div data-testid="error-state">
        {state.error || 'No errors'}
      </div>
    </div>
  );
};

// Import useAuth after mocking
import { useAuth } from '../../src/context/AuthContext';

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Complete Login Flow', () => {
    it('successfully logs in a user and initializes collections', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      mockUserService.authenticateUser.mockResolvedValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="login" onToggleMode={jest.fn()} />
        </AuthProvider>
      );

      // Verify initial state
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not logged in');
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading');

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(loginButton);

      // Verify loading state
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading...');
      expect(loginButton).toBeDisabled();

      // Wait for login to complete
      await waitFor(() => {
        expect(screen.getByTestId('auth-state')).toHaveTextContent('Logged in as testuser');
      });

      // Verify final state
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('error-state')).toHaveTextContent('No errors');

      // Verify service calls
      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockCollectionsDatabase.initializeUserCollections).toHaveBeenCalledWith('1');

      // Verify localStorage
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      expect(localStorage.getItem('token')).toMatch(/^local-token-1-/);
    });

    it('handles login failure gracefully', async () => {
      mockUserService.authenticateUser.mockResolvedValue(null);

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="login" onToggleMode={jest.fn()} />
        </AuthProvider>
      );

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(loginButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Invalid email or password');
      });

      // Verify user is still not logged in
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not logged in');
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Complete Registration Flow', () => {
    it('successfully registers a new user', async () => {
      const mockNewUser = {
        id: '2',
        username: 'newuser',
        email: 'new@example.com',
        role: 'user'
      };

      mockUserService.getAllUsers.mockResolvedValue([]);
      mockUserService.createUser.mockResolvedValue(mockNewUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      const mockToggleMode = jest.fn();

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="register" onToggleMode={mockToggleMode} />
        </AuthProvider>
      );

      // Fill in registration form
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const registerButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(usernameInput, 'newuser');
      await userEvent.type(emailInput, 'new@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      await userEvent.click(registerButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(screen.getByTestId('auth-state')).toHaveTextContent('Logged in as newuser');
      });

      // Verify service calls
      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        role: 'user',
        isActive: true
      });
      expect(mockCollectionsDatabase.initializeUserCollections).toHaveBeenCalledWith('2');

      // Verify localStorage
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockNewUser));
    });

    it('handles registration with existing email', async () => {
      mockUserService.getAllUsers.mockResolvedValue([
        { email: 'existing@example.com' }
      ]);

      const mockToggleMode = jest.fn();

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="register" onToggleMode={mockToggleMode} />
        </AuthProvider>
      );

      // Fill in registration form with existing email
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const registerButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(usernameInput, 'newuser');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      await userEvent.click(registerButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Email already registered');
      });

      // Verify user is not logged in
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not logged in');
    });
  });

  describe('Password Validation Flow', () => {
    it('validates password confirmation in real-time', async () => {
      const mockToggleMode = jest.fn();

      render(
        <AuthProvider>
          <AuthForm mode="register" onToggleMode={mockToggleMode} />
        </AuthProvider>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const registerButton = screen.getByRole('button', { name: /create account/i });

      // Type different passwords
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'differentpassword');

      // Should show error and disable button
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(registerButton).toBeDisabled();

      // Fix password confirmation
      await userEvent.clear(confirmPasswordInput);
      await userEvent.type(confirmPasswordInput, 'password123');

      // Error should disappear and button should be enabled
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
      expect(registerButton).toBeEnabled();
    });
  });

  describe('Mode Toggle Flow', () => {
    it('switches between login and register modes', async () => {
      const mockToggleMode = jest.fn();

      render(
        <AuthProvider>
          <AuthForm mode="login" onToggleMode={mockToggleMode} />
        </AuthProvider>
      );

      // Should show login form
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();

      // Click toggle link
      const toggleLink = screen.getByText('Sign up');
      await userEvent.click(toggleLink);

      expect(mockToggleMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Recovery Flow', () => {
    it('clears errors when user starts typing', async () => {
      mockUserService.authenticateUser.mockResolvedValue(null);

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="login" onToggleMode={jest.fn()} />
        </AuthProvider>
      );

      // Trigger error
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(loginButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Invalid email or password');
      });

      // Start typing to clear error
      await userEvent.type(emailInput, 'x');

      // Error should be cleared
      expect(screen.getByTestId('error-state')).toHaveTextContent('No errors');
    });
  });

  describe('Session Persistence Flow', () => {
    it('restores user session from localStorage on page reload', () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      // Simulate existing session
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token');

      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      );

      // Should restore user session
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Logged in as testuser');
    });

    it('handles corrupted localStorage data gracefully', () => {
      // Simulate corrupted data
      localStorage.setItem('user', 'invalid-json');
      localStorage.setItem('token', 'mock-token');

      render(
        <AuthProvider>
          <AuthTestComponent />
        </AuthProvider>
      );

      // Should not crash and should clear corrupted data
      expect(screen.getByTestId('auth-state')).toHaveTextContent('Not logged in');
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Loading State Management', () => {
    it('shows loading state during authentication', async () => {
      let resolveAuth: (value: any) => void;
      const authPromise = new Promise(resolve => {
        resolveAuth = resolve;
      });
      mockUserService.authenticateUser.mockReturnValue(authPromise);

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="login" onToggleMode={jest.fn()} />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(loginButton);

      // Should show loading state
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading...');
      expect(loginButton).toBeDisabled();

      // Resolve authentication
      await act(async () => {
        resolveAuth!({
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        });
        await authPromise;
      });

      // Loading should complete
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading');
    });
  });

  describe('Collections Integration', () => {
    it('initializes collections after successful authentication', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      mockUserService.authenticateUser.mockResolvedValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="login" onToggleMode={jest.fn()} />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(mockCollectionsDatabase.initializeUserCollections).toHaveBeenCalledWith('1');
      });
    });

    it('handles collections initialization failure gracefully', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      mockUserService.authenticateUser.mockResolvedValue(mockUser);
      mockCollectionsDatabase.initializeUserCollections.mockRejectedValue(
        new Error('Collections error')
      );

      render(
        <AuthProvider>
          <AuthTestComponent />
          <AuthForm mode="login" onToggleMode={jest.fn()} />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(loginButton);

      // Should still login successfully even if collections fail
      await waitFor(() => {
        expect(screen.getByTestId('auth-state')).toHaveTextContent('Logged in as testuser');
      });
    });
  });
});
