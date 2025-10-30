# 🧪 Testing Documentation

This document provides comprehensive information about the testing strategy, setup, and execution for the Sports Card Tracker application.

## 📋 Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Setup & Installation](#setup--installation)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Sports Card Tracker uses a comprehensive testing approach with multiple testing frameworks to ensure code quality, reliability, and user experience. Our testing strategy covers:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Complete user journey testing
- **Visual Tests**: UI regression testing
- **Performance Tests**: Speed and optimization testing

## 🏗️ Testing Strategy

### Testing Pyramid

```
    /\
   /  \     E2E Tests (5%)
  /____\    - User journeys
 /      \   - Critical paths
/________\  - Cross-browser testing

   /\
  /  \      Integration Tests (25%)
 /____\     - Component interactions
/      \    - API integration
/________\  - State management

  /\
 /  \       Unit Tests (70%)
/____\      - Individual functions
/      \    - Component behavior
/________\  - Utility functions
```

### Quality Gates

- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All critical user flows
- **E2E Tests**: All major features
- **Performance**: Lighthouse score 90+
- **Accessibility**: WCAG 2.1 AA compliance

## 🔧 Test Types

### 1. Unit Tests (Jest + React Testing Library)

**Purpose**: Test individual components and functions in isolation

**Location**: `tests/unit/`

**Coverage**:
- Component rendering
- User interactions
- State changes
- Props handling
- Error boundaries
- Utility functions

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../../../src/components/Auth/AuthForm';

describe('AuthForm Component', () => {
  it('renders login form correctly', () => {
    render(<AuthForm mode="login" onToggleMode={jest.fn()} />);
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
```

### 2. Integration Tests (Jest + React Testing Library)

**Purpose**: Test component interactions and data flow

**Location**: `tests/integration/`

**Coverage**:
- Component communication
- Context providers
- API integration
- State management
- User workflows

**Example**:
```typescript
describe('Authentication Flow Integration', () => {
  it('successfully logs in a user and initializes collections', async () => {
    // Mock services
    mockUserService.authenticateUser.mockResolvedValue(mockUser);
    
    render(
      <AuthProvider>
        <AuthForm mode="login" onToggleMode={jest.fn()} />
      </AuthProvider>
    );
    
    // Test complete flow
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify results
    expect(mockUserService.authenticateUser).toHaveBeenCalled();
  });
});
```

### 3. End-to-End Tests (Cypress)

**Purpose**: Test complete user journeys in real browser environment

**Location**: `tests/e2e/`

**Coverage**:
- User registration and login
- Card management workflows
- Collection organization
- Report generation
- Cross-browser compatibility

**Example**:
```typescript
describe('Authentication End-to-End Tests', () => {
  it('should handle successful login', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { user: mockUser, token: 'mock-token' }
    }).as('loginRequest');

    cy.visit('/');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginRequest');
    cy.url().should('not.include', '/login');
  });
});
```

### 4. Visual Tests (Playwright)

**Purpose**: Detect visual regressions and ensure UI consistency

**Location**: `tests/visual/`

**Coverage**:
- Component visual appearance
- Responsive design
- Cross-browser rendering
- Theme consistency
- Animation behavior

### 5. Performance Tests (Lighthouse)

**Purpose**: Ensure optimal performance and user experience

**Location**: `tests/performance/`

**Coverage**:
- Page load times
- Core Web Vitals
- Bundle size analysis
- Memory usage
- Network efficiency

## 🚀 Setup & Installation

### Prerequisites

- Node.js 16+ 
- npm 8+
- Chrome browser (for E2E tests)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sports-card-tracker.git
   cd sports-card-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up test environment**
   ```bash
   node scripts/setup-tests.js
   ```

4. **Verify installation**
   ```bash
   npm run test -- --version
   npx cypress --version
   npx playwright --version
   ```

### Configuration Files

- `jest.config.js` - Jest configuration
- `cypress.config.js` - Cypress configuration
- `playwright.config.js` - Playwright configuration
- `tests/setup.ts` - Test setup and mocks

## 🏃‍♂️ Running Tests

### Quick Commands

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:visual      # Visual tests
npm run test:performance # Performance tests

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run in CI mode
npm run test:ci
```

### Advanced Commands

```bash
# Run specific test file
npm test -- AuthForm.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="login"

# Run with verbose output
npm test -- --verbose

# Run with custom reporter
npm test -- --reporter=json

# Run E2E tests in specific browser
npx cypress run --browser chrome

# Run visual tests in headed mode
npx playwright test --headed
```

### Test Scripts

The project includes several test scripts in the `scripts/` directory:

- `setup-tests.js` - Initial test environment setup
- `run-tests.js` - Comprehensive test runner
- `test-coverage.js` - Coverage analysis
- `test-performance.js` - Performance testing

## ✍️ Writing Tests

### Unit Test Guidelines

1. **Test Structure**
   ```typescript
   describe('ComponentName', () => {
     beforeEach(() => {
       // Setup
     });
     
     it('should do something', () => {
       // Arrange
       // Act
       // Assert
     });
   });
   ```

2. **Best Practices**
   - Test behavior, not implementation
   - Use descriptive test names
   - Keep tests simple and focused
   - Mock external dependencies
   - Test error cases
   - Use data-testid for selectors

3. **Common Patterns**
   ```typescript
   // Testing user interactions
   await userEvent.click(button);
   await userEvent.type(input, 'text');
   
   // Testing async operations
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   });
   
   // Testing error states
   expect(screen.getByText(/error message/i)).toBeInTheDocument();
   ```

### Integration Test Guidelines

1. **Test Real User Flows**
   - Login/logout process
   - Card creation workflow
   - Collection management
   - Report generation

2. **Mock External Services**
   ```typescript
   jest.mock('../../../src/services/userService', () => ({
     userService: {
       authenticateUser: jest.fn(),
       createUser: jest.fn()
     }
   }));
   ```

3. **Test Context Providers**
   ```typescript
   render(
     <AuthProvider>
       <ComponentUnderTest />
     </AuthProvider>
   );
   ```

### E2E Test Guidelines

1. **Use Page Object Pattern**
   ```typescript
   class LoginPage {
     visit() {
       cy.visit('/login');
     }
     
     fillEmail(email) {
       cy.get('input[type="email"]').type(email);
     }
     
     fillPassword(password) {
       cy.get('input[type="password"]').type(password);
     }
     
     submit() {
       cy.get('button[type="submit"]').click();
     }
   }
   ```

2. **Use Data Attributes**
   ```typescript
   cy.get('[data-testid="login-form"]').should('be.visible');
   cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
   ```

3. **Test Real User Scenarios**
   - Complete user journeys
   - Error handling
   - Edge cases
   - Cross-browser compatibility

## 📊 Test Coverage

### Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html

# Generate coverage badge
npm run test:coverage -- --coverageReporters=text-summary
```

### Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Tests failing randomly**
   - Check for async operations not being awaited
   - Ensure proper cleanup in beforeEach/afterEach
   - Use `waitFor` for async state changes

2. **Cypress tests timing out**
   - Increase timeout in cypress.config.js
   - Use `cy.wait()` for API calls
   - Check for proper element selectors

3. **Coverage not updating**
   - Clear coverage directory
   - Check jest configuration
   - Ensure all files are included

4. **Mock not working**
   - Check mock placement (before imports)
   - Verify mock function names
   - Use `jest.clearAllMocks()` in beforeEach

### Debug Commands

```bash
# Debug Jest tests
npm test -- --verbose --no-cache

# Debug Cypress tests
npx cypress open

# Debug Playwright tests
npx playwright test --debug

# Check test coverage
npm run test:coverage -- --verbose
```

### Performance Issues

1. **Slow test execution**
   - Run tests in parallel
   - Use `--maxWorkers` option
   - Optimize test setup

2. **Memory leaks**
   - Clean up event listeners
   - Clear timers and intervals
   - Reset mocks properly

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Cypress Documentation](https://docs.cypress.io/)
- [Playwright Documentation](https://playwright.dev/)

### Best Practices
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [E2E Testing Guide](https://docs.cypress.io/guides/references/best-practices)

### Tools
- [Testing Playground](https://testing-playground.com/)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)
- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)

---

*Last Updated: ${new Date().toLocaleDateString()}*
*Version: 1.0.0*
