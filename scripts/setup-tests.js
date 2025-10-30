#!/usr/bin/env node

/**
 * Test Setup Script for Sports Card Tracker
 * 
 * This script sets up the comprehensive testing environment for the entire repository.
 * It installs necessary dependencies, creates test configurations, and generates test files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up comprehensive test suite for Sports Card Tracker...\n');

// Test configuration
const testConfig = {
  frameworks: ['jest', 'react-testing-library', 'cypress'],
  coverage: {
    threshold: 90,
    directories: ['src/components', 'src/services', 'src/utils', 'src/context']
  },
  testTypes: ['unit', 'integration', 'e2e', 'visual', 'performance']
};

// Create test directory structure
const testDirs = [
  'tests/unit',
  'tests/integration', 
  'tests/e2e',
  'tests/visual',
  'tests/performance',
  'tests/utils',
  'tests/fixtures',
  'tests/mocks'
];

console.log('📁 Creating test directory structure...');
testDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`   ✅ Created ${dir}`);
  }
});

// Install testing dependencies
console.log('\n📦 Installing testing dependencies...');
const dependencies = [
  '@testing-library/react',
  '@testing-library/jest-dom',
  '@testing-library/user-event',
  'jest',
  'jest-environment-jsdom',
  'cypress',
  'cypress-real-events',
  'cypress-axe',
  'msw',
  'jest-canvas-mock',
  'jest-fetch-mock',
  'supertest',
  'puppeteer',
  'lighthouse',
  'playwright'
];

try {
  execSync(`npm install --save-dev ${dependencies.join(' ')}`, { stdio: 'inherit' });
  console.log('   ✅ Testing dependencies installed');
} catch (error) {
  console.error('   ❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create Jest configuration
console.log('\n⚙️ Creating Jest configuration...');
const jestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'
  ],
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
  },
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testTimeout: 10000
};

fs.writeFileSync(
  path.join(__dirname, '..', 'jest.config.js'),
  `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
);
console.log('   ✅ Jest configuration created');

// Create test setup file
console.log('\n🔧 Creating test setup file...');
const testSetup = `
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { server } from './mocks/server';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Suppress console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
`;

fs.writeFileSync(path.join(__dirname, '..', 'tests', 'setup.ts'), testSetup);
console.log('   ✅ Test setup file created');

// Create MSW server for API mocking
console.log('\n🌐 Creating MSW server for API mocking...');
const mswServer = `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API handlers
const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'user' },
        token: 'mock-token'
      })
    );
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '2', username: 'newuser', email: 'new@example.com', role: 'user' },
        token: 'mock-token'
      })
    );
  }),

  // Cards endpoints
  rest.get('/api/cards', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          player: 'Test Player',
          year: 2023,
          brand: 'Topps',
          category: 'Baseball',
          condition: 'Mint',
          currentValue: 100,
          purchasePrice: 50
        }
      ])
    );
  }),

  rest.post('/api/cards', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '2',
        ...req.body,
        createdAt: new Date().toISOString()
      })
    );
  }),

  // Collections endpoints
  rest.get('/api/collections', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Test Collection',
          description: 'A test collection',
          isDefault: true,
          userId: '1'
        }
      ])
    );
  }),
];

export const server = setupServer(...handlers);
`;

fs.writeFileSync(path.join(__dirname, '..', 'tests', 'mocks', 'server.ts'), mswServer);
console.log('   ✅ MSW server created');

// Create file mock for assets
console.log('\n🖼️ Creating file mock for assets...');
const fileMock = `
module.exports = 'test-file-stub';
`;

fs.writeFileSync(path.join(__dirname, '..', 'tests', 'mocks', 'fileMock.js'), fileMock);
console.log('   ✅ File mock created');

// Create package.json test scripts
console.log('\n📝 Adding test scripts to package.json...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'test': 'jest',
  'test:watch': 'jest --watch',
  'test:coverage': 'jest --coverage',
  'test:ci': 'jest --ci --coverage --watchAll=false',
  'test:e2e': 'cypress run',
  'test:e2e:open': 'cypress open',
  'test:visual': 'playwright test',
  'test:performance': 'lighthouse http://localhost:3000 --output=html --output-path=./tests/performance/lighthouse-report.html',
  'test:all': 'npm run test:ci && npm run test:e2e && npm run test:visual',
  'test:debug': 'node --inspect-brk node_modules/.bin/jest --runInBand'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('   ✅ Test scripts added to package.json');

console.log('\n🎉 Test setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('   1. Run "npm run test" to run unit tests');
console.log('   2. Run "npm run test:e2e:open" to open Cypress');
console.log('   3. Run "npm run test:coverage" to see coverage report');
console.log('   4. Run "npm run test:all" to run all tests');
console.log('\n✨ Happy testing!');
