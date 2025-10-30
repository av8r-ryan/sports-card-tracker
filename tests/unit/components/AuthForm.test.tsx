import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../../src/context/AuthContext';
import AuthForm from '../../../src/components/Auth/AuthForm';

// Mock the collections database
jest.mock('../../../src/db/collectionsDatabase', () => ({
  collectionsDatabase: {
    initializeUserCollections: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock the user service
jest.mock('../../../src/services/userService', () => ({
  userService: {
    authenticateUser: jest.fn(),
    createUser: jest.fn(),
    getAllUsers: jest.fn()
  }
}));

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Mode', () => {
    it('renders login form correctly', () => {
      const mockToggleMode = jest.fn();
      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      
      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeDisabled();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      expect(submitButton).toBeDisabled();

      await user.type(passwordInput, 'password123');
      expect(submitButton).toBeEnabled();
    });

    it('handles successful login', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      userService.authenticateUser.mockReturnValue({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      });

      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(userService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('handles login failure', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      userService.authenticateUser.mockReturnValue(null);

      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('clears error when user starts typing', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      userService.authenticateUser.mockReturnValue(null);

      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Trigger error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, 'x');
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });

  describe('Register Mode', () => {
    it('renders register form correctly', () => {
      const mockToggleMode = jest.fn();
      renderWithAuth(
        <AuthForm mode="register" onToggleMode={mockToggleMode} />
      );

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    });

    it('validates password confirmation', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      
      renderWithAuth(
        <AuthForm mode="register" onToggleMode={mockToggleMode} />
      );

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'testuser');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('handles successful registration', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      userService.getAllUsers.mockReturnValue([]);
      userService.createUser.mockReturnValue({
        id: '2',
        username: 'newuser',
        email: 'new@example.com',
        role: 'user'
      });

      renderWithAuth(
        <AuthForm mode="register" onToggleMode={mockToggleMode} />
      );

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(userService.createUser).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
          role: 'user',
          isActive: true
        });
      });
    });

    it('handles registration with existing email', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      userService.getAllUsers.mockReturnValue([
        { email: 'existing@example.com' }
      ]);

      renderWithAuth(
        <AuthForm mode="register" onToggleMode={mockToggleMode} />
      );

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mode Toggle', () => {
    it('calls onToggleMode when toggle link is clicked', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      
      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const toggleLink = screen.getByText('Sign up');
      await user.click(toggleLink);

      expect(mockToggleMode).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('shows loading state during login', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      // Mock a slow response
      userService.authenticateUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }), 100))
      );

      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('shows loading state during registration', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      userService.getAllUsers.mockReturnValue([]);
      userService.createUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          id: '2',
          username: 'newuser',
          email: 'new@example.com',
          role: 'user'
        }), 100))
      );

      renderWithAuth(
        <AuthForm mode="register" onToggleMode={mockToggleMode} />
      );

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'new@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      const mockToggleMode = jest.fn();
      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      const mockToggleMode = jest.fn();
      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('supports keyboard navigation', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      
      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const mockToggleMode = jest.fn();
      const user = userEvent.setup();
      const { userService } = require('../../../src/services/userService');
      
      userService.authenticateUser.mockImplementation(() => {
        throw new Error('Network error');
      });

      renderWithAuth(
        <AuthForm mode="login" onToggleMode={mockToggleMode} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });
    });
  });
});
