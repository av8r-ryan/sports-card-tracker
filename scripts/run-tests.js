#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Sports Card Tracker
 * 
 * This script runs all types of tests with proper configuration and reporting.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
  unit: {
    command: 'jest',
    args: ['--coverage', '--verbose', '--passWithNoTests'],
    config: 'jest.config.js'
  },
  integration: {
    command: 'jest',
    args: ['--testPathPattern=tests/integration', '--coverage', '--verbose'],
    config: 'jest.config.js'
  },
  e2e: {
    command: 'cypress',
    args: ['run', '--browser', 'chrome', '--headless'],
    config: 'cypress.config.js'
  },
  visual: {
    command: 'playwright',
    args: ['test', '--reporter=html'],
    config: 'playwright.config.js'
  },
  performance: {
    command: 'lighthouse',
    args: ['http://localhost:3000', '--output=html', '--output-path=./tests/performance/lighthouse-report.html']
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test results tracking
const testResults = {
  unit: { passed: false, coverage: 0, duration: 0 },
  integration: { passed: false, coverage: 0, duration: 0 },
  e2e: { passed: false, duration: 0 },
  visual: { passed: false, duration: 0 },
  performance: { passed: false, score: 0, duration: 0 }
};

// Parse command line arguments
const args = process.argv.slice(2);
const testTypes = args.length > 0 ? args : ['unit', 'integration', 'e2e'];
const verbose = args.includes('--verbose') || args.includes('-v');
const watch = args.includes('--watch') || args.includes('-w');
const ci = args.includes('--ci');

logSection('Sports Card Tracker - Test Suite Runner');
log(`Running tests: ${testTypes.join(', ')}`, 'bright');
log(`Mode: ${ci ? 'CI' : watch ? 'Watch' : 'Single Run'}`, 'bright');

// Check if required dependencies are installed
function checkDependencies() {
  logSection('Checking Dependencies');
  
  const requiredPackages = [
    'jest',
    '@testing-library/react',
    '@testing-library/jest-dom',
    'cypress',
    'playwright',
    'lighthouse'
  ];

  let allInstalled = true;

  requiredPackages.forEach(pkg => {
    try {
      require.resolve(pkg);
      logSuccess(`${pkg} is installed`);
    } catch (error) {
      logError(`${pkg} is not installed`);
      allInstalled = false;
    }
  });

  if (!allInstalled) {
    logError('Some required dependencies are missing. Please run: npm install');
    process.exit(1);
  }

  logSuccess('All dependencies are installed');
}

// Run unit tests
async function runUnitTests() {
  logSection('Running Unit Tests');
  
  const startTime = Date.now();
  
  try {
    const args = [...testConfig.unit.args];
    if (watch) args.push('--watch');
    if (verbose) args.push('--verbose');
    if (ci) args.push('--ci', '--coverage', '--watchAll=false');

    const command = `${testConfig.unit.command} ${args.join(' ')}`;
    logInfo(`Running: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    testResults.unit.passed = true;
    testResults.unit.duration = Date.now() - startTime;
    logSuccess('Unit tests passed');
    
  } catch (error) {
    testResults.unit.passed = false;
    testResults.unit.duration = Date.now() - startTime;
    logError('Unit tests failed');
    throw error;
  }
}

// Run integration tests
async function runIntegrationTests() {
  logSection('Running Integration Tests');
  
  const startTime = Date.now();
  
  try {
    const args = [...testConfig.integration.args];
    if (verbose) args.push('--verbose');
    if (ci) args.push('--ci', '--watchAll=false');

    const command = `${testConfig.integration.command} ${args.join(' ')}`;
    logInfo(`Running: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    testResults.integration.passed = true;
    testResults.integration.duration = Date.now() - startTime;
    logSuccess('Integration tests passed');
    
  } catch (error) {
    testResults.integration.passed = false;
    testResults.integration.duration = Date.now() - startTime;
    logError('Integration tests failed');
    throw error;
  }
}

// Run end-to-end tests
async function runE2ETests() {
  logSection('Running End-to-End Tests');
  
  const startTime = Date.now();
  
  try {
    // Start the development server if not already running
    logInfo('Starting development server...');
    const serverProcess = spawn('npm', ['start'], {
      stdio: 'pipe',
      detached: true
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    const args = [...testConfig.e2e.args];
    if (verbose) args.push('--verbose');

    const command = `${testConfig.e2e.command} ${args.join(' ')}`;
    logInfo(`Running: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Kill the server process
    process.kill(-serverProcess.pid);

    testResults.e2e.passed = true;
    testResults.e2e.duration = Date.now() - startTime;
    logSuccess('End-to-end tests passed');
    
  } catch (error) {
    testResults.e2e.passed = false;
    testResults.e2e.duration = Date.now() - startTime;
    logError('End-to-end tests failed');
    throw error;
  }
}

// Run visual tests
async function runVisualTests() {
  logSection('Running Visual Tests');
  
  const startTime = Date.now();
  
  try {
    const args = [...testConfig.visual.args];
    if (verbose) args.push('--verbose');

    const command = `${testConfig.visual.command} ${args.join(' ')}`;
    logInfo(`Running: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    testResults.visual.passed = true;
    testResults.visual.duration = Date.now() - startTime;
    logSuccess('Visual tests passed');
    
  } catch (error) {
    testResults.visual.passed = false;
    testResults.visual.duration = Date.now() - startTime;
    logError('Visual tests failed');
    throw error;
  }
}

// Run performance tests
async function runPerformanceTests() {
  logSection('Running Performance Tests');
  
  const startTime = Date.now();
  
  try {
    // Start the development server if not already running
    logInfo('Starting development server...');
    const serverProcess = spawn('npm', ['start'], {
      stdio: 'pipe',
      detached: true
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    const args = [...testConfig.performance.args];
    const command = `${testConfig.performance.command} ${args.join(' ')}`;
    logInfo(`Running: ${command}`);
    
    const output = execSync(command, { 
      encoding: 'utf8',
      cwd: process.cwd()
    });

    // Parse lighthouse score from output
    const scoreMatch = output.match(/Performance: (\d+)/);
    if (scoreMatch) {
      testResults.performance.score = parseInt(scoreMatch[1]);
    }

    // Kill the server process
    process.kill(-serverProcess.pid);

    testResults.performance.passed = true;
    testResults.performance.duration = Date.now() - startTime;
    logSuccess(`Performance tests passed (Score: ${testResults.performance.score})`);
    
  } catch (error) {
    testResults.performance.passed = false;
    testResults.performance.duration = Date.now() - startTime;
    logError('Performance tests failed');
    throw error;
  }
}

// Generate test report
function generateReport() {
  logSection('Test Report');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(result => result.passed).length;
  const totalDuration = Object.values(testResults).reduce((sum, result) => sum + result.duration, 0);
  
  log(`Total Tests: ${totalTests}`, 'bright');
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'red');
  log(`Failed: ${totalTests - passedTests}`, passedTests === totalTests ? 'green' : 'red');
  log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'bright');
  
  log('\nDetailed Results:', 'bright');
  
  Object.entries(testResults).forEach(([type, result]) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = `${(result.duration / 1000).toFixed(2)}s`;
    const coverage = result.coverage ? ` (${result.coverage}% coverage)` : '';
    const score = result.score ? ` (Score: ${result.score})` : '';
    
    log(`  ${type.toUpperCase()}: ${status} - ${duration}${coverage}${score}`, 
        result.passed ? 'green' : 'red');
  });

  // Generate HTML report
  const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Sports Card Tracker - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        .summary { margin: 20px 0; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .pass { background: #d4edda; border: 1px solid #c3e6cb; }
        .fail { background: #f8d7da; border: 1px solid #f5c6cb; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 4px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sports Card Tracker - Test Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metrics">
            <div class="metric">
                <h3>${totalTests}</h3>
                <p>Total Tests</p>
            </div>
            <div class="metric">
                <h3 style="color: ${passedTests === totalTests ? 'green' : 'red'}">${passedTests}</h3>
                <p>Passed</p>
            </div>
            <div class="metric">
                <h3 style="color: ${passedTests === totalTests ? 'green' : 'red'}">${totalTests - passedTests}</h3>
                <p>Failed</p>
            </div>
            <div class="metric">
                <h3>${(totalDuration / 1000).toFixed(2)}s</h3>
                <p>Total Duration</p>
            </div>
        </div>
    </div>
    
    <div class="summary">
        <h2>Test Results</h2>
        ${Object.entries(testResults).map(([type, result]) => `
            <div class="test-result ${result.passed ? 'pass' : 'fail'}">
                <h3>${type.toUpperCase()}</h3>
                <p>Status: ${result.passed ? 'PASS' : 'FAIL'}</p>
                <p>Duration: ${(result.duration / 1000).toFixed(2)}s</p>
                ${result.coverage ? `<p>Coverage: ${result.coverage}%</p>` : ''}
                ${result.score ? `<p>Score: ${result.score}</p>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;

  fs.writeFileSync('./tests/test-report.html', reportHtml);
  logInfo('HTML report generated: ./tests/test-report.html');
}

// Main execution
async function main() {
  try {
    checkDependencies();
    
    for (const testType of testTypes) {
      switch (testType) {
        case 'unit':
          await runUnitTests();
          break;
        case 'integration':
          await runIntegrationTests();
          break;
        case 'e2e':
          await runE2ETests();
          break;
        case 'visual':
          await runVisualTests();
          break;
        case 'performance':
          await runPerformanceTests();
          break;
        default:
          logWarning(`Unknown test type: ${testType}`);
      }
    }
    
    generateReport();
    
    const allPassed = Object.values(testResults).every(result => result.passed);
    if (allPassed) {
      logSuccess('All tests passed! 🎉');
      process.exit(0);
    } else {
      logError('Some tests failed! ❌');
      process.exit(1);
    }
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logWarning('Test execution interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  logWarning('Test execution terminated');
  process.exit(1);
});

// Run the tests
main();
