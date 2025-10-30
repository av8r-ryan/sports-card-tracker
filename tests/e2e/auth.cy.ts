describe('Authentication End-to-End Tests', () => {
  beforeEach(() => {
    // Clear localStorage and visit the app
    cy.clearLocalStorage();
    cy.visit('/');
  });

  describe('Login Flow', () => {
    it('should display login form by default', () => {
      cy.get('[data-testid="auth-form"]').should('be.visible');
      cy.get('h2').should('contain', 'Sign In');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Sign In');
    });

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').should('be.disabled');
      
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('button[type="submit"]').should('be.disabled');
      
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').should('be.enabled');
    });

    it('should handle successful login', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          },
          token: 'mock-token'
        }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      
      // Should redirect to dashboard or show authenticated state
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should handle login failure', () => {
      // Mock failed login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          error: 'Invalid credentials'
        }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
    });

    it('should show loading state during login', () => {
      // Mock slow login response
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          },
          token: 'mock-token'
        },
        delay: 1000
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should show loading state
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('button[type="submit"]').should('contain', 'Signing in...');
      
      cy.wait('@loginRequest');
    });
  });

  describe('Registration Flow', () => {
    it('should switch to registration mode', () => {
      cy.get('button').contains('Sign up').click();
      
      cy.get('h2').should('contain', 'Create Account');
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Create Account');
    });

    it('should validate password confirmation', () => {
      cy.get('button').contains('Sign up').click();
      
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('differentpassword');
      
      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('[data-testid="password-error"]').should('contain', 'Passwords do not match');
    });

    it('should handle successful registration', () => {
      // Mock successful registration
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: {
            id: '2',
            username: 'newuser',
            email: 'new@example.com',
            role: 'user'
          },
          token: 'mock-token'
        }
      }).as('registerRequest');

      cy.get('button').contains('Sign up').click();
      
      cy.get('input[name="username"]').type('newuser');
      cy.get('input[type="email"]').type('new@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
      
      // Should redirect to dashboard
      cy.url().should('not.include', '/login');
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should handle registration with existing email', () => {
      // Mock registration with existing email
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          error: 'Email already registered'
        }
      }).as('registerRequest');

      cy.get('button').contains('Sign up').click();
      
      cy.get('input[name="username"]').type('newuser');
      cy.get('input[type="email"]').type('existing@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Email already registered');
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('password123');
      
      // HTML5 validation should prevent submission
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should validate password length', () => {
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('123');
      
      // Should show validation message
      cy.get('input[type="password"]').should('have.attr', 'minlength', '6');
    });

    it('should clear errors when user starts typing', () => {
      // Mock failed login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      
      // Should show error
      cy.get('[data-testid="error-message"]').should('be.visible');
      
      // Start typing to clear error
      cy.get('input[type="email"]').type('x');
      cy.get('[data-testid="error-message"]').should('not.exist');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      cy.get('label[for="email"]').should('be.visible');
      cy.get('label[for="password"]').should('be.visible');
      cy.get('input[type="email"]').should('have.attr', 'id', 'email');
      cy.get('input[type="password"]').should('have.attr', 'id', 'password');
    });

    it('should support keyboard navigation', () => {
      cy.get('input[type="email"]').focus();
      cy.get('input[type="email"]').should('have.focus');
      
      cy.get('input[type="email"]').tab();
      cy.get('input[type="password"]').should('have.focus');
    });

    it('should have proper ARIA attributes', () => {
      cy.get('form').should('have.attr', 'role', 'form');
      cy.get('button[type="submit"]').should('have.attr', 'type', 'submit');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-6');
      
      cy.get('[data-testid="auth-form"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="auth-form"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });

  describe('Session Management', () => {
    it('should persist login session across page reloads', () => {
      // Mock successful login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          },
          token: 'mock-token'
        }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      
      // Reload page
      cy.reload();
      
      // Should still be logged in
      cy.get('[data-testid="user-menu"]').should('be.visible');
    });

    it('should handle logout correctly', () => {
      // First login
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          },
          token: 'mock-token'
        }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      
      // Logout
      cy.get('[data-testid="logout-button"]').click();
      
      // Should return to login form
      cy.get('[data-testid="auth-form"]').should('be.visible');
      cy.get('h2').should('contain', 'Sign In');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Internal server error');
    });

    it('should handle timeout errors', () => {
      // Mock timeout
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 408,
        body: { error: 'Request timeout' }
      }).as('loginRequest');

      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Request timeout');
    });
  });
});
