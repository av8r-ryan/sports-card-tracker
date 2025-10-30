import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AccessibilityTester from './AccessibilityTester';
import KeyboardNavigation from './KeyboardNavigation';
import ScreenReaderSupport from './ScreenReaderSupport';
import HighContrastMode from './HighContrastMode';
import ReducedMotionMode from './ReducedMotionMode';
import { accessibilityManager, accessibilityUtils } from '../../utils/accessibility';
import './AccessibilityPage.css';

const AccessibilityPage: React.FC = () => {
  const [showTester, setShowTester] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runAccessibilityTest = async () => {
    const results = accessibilityManager.validateAccessibility();
    setTestResults(results);
    setShowTester(true);
  };

  const accessibilityFeatures = [
    {
      title: 'Keyboard Navigation',
      description: 'Full keyboard support with shortcuts and focus management',
      icon: '⌨️',
      features: [
        'Tab navigation through all interactive elements',
        'Arrow key navigation for menus and grids',
        'Keyboard shortcuts for common actions',
        'Focus indicators and focus trapping',
        'Skip links for main content'
      ]
    },
    {
      title: 'Screen Reader Support',
      description: 'Comprehensive screen reader compatibility',
      icon: '🔊',
      features: [
        'Semantic HTML structure',
        'ARIA labels and descriptions',
        'Live regions for dynamic content',
        'Proper heading hierarchy',
        'Alternative text for images'
      ]
    },
    {
      title: 'High Contrast Mode',
      description: 'Enhanced visibility for users with visual impairments',
      icon: '🌙',
      features: [
        'Automatic detection of system preferences',
        'Manual toggle for high contrast',
        'Enhanced color contrast ratios',
        'Clear visual boundaries',
        'Readable text and backgrounds'
      ]
    },
    {
      title: 'Reduced Motion',
      description: 'Respects user preferences for reduced motion',
      icon: '⏸️',
      features: [
        'Disables animations when requested',
        'Maintains functionality without motion',
        'Respects prefers-reduced-motion',
        'Smooth transitions when enabled',
        'Accessible motion alternatives'
      ]
    },
    {
      title: 'Focus Management',
      description: 'Intelligent focus handling for better navigation',
      icon: '🎯',
      features: [
        'Focus trapping in modals',
        'Focus restoration after actions',
        'Visible focus indicators',
        'Logical tab order',
        'Focus history tracking'
      ]
    },
    {
      title: 'Color Accessibility',
      description: 'Color choices that work for all users',
      icon: '🎨',
      features: [
        'WCAG AA compliant color ratios',
        'Color-blind friendly palettes',
        'High contrast alternatives',
        'Pattern and texture alternatives',
        'Consistent color meaning'
      ]
    }
  ];

  const keyboardShortcuts = [
    { key: 'Ctrl + /', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl + 1-5', description: 'Navigate to main sections' },
    { key: 'Alt + 1-6', description: 'Focus specific areas' },
    { key: 'Tab', description: 'Move to next focusable element' },
    { key: 'Shift + Tab', description: 'Move to previous focusable element' },
    { key: 'Enter', description: 'Activate focused element' },
    { key: 'Escape', description: 'Close dialogs and menus' },
    { key: 'Space', description: 'Activate buttons and checkboxes' },
    { key: 'Arrow Keys', description: 'Navigate menus and grids' },
    { key: 'Home/End', description: 'Jump to first/last item' }
  ];

  const accessibilityGuidelines = [
    {
      category: 'Perceivable',
      items: [
        'Provide text alternatives for images',
        'Use sufficient color contrast',
        'Make content adaptable',
        'Distinguishable information'
      ]
    },
    {
      category: 'Operable',
      items: [
        'Keyboard accessible',
        'No seizure-inducing content',
        'Navigable content',
        'Input assistance'
      ]
    },
    {
      category: 'Understandable',
      items: [
        'Readable text',
        'Predictable functionality',
        'Input assistance',
        'Error identification'
      ]
    },
    {
      category: 'Robust',
      items: [
        'Compatible with assistive technologies',
        'Future-proof content',
        'Valid markup',
        'Semantic structure'
      ]
    }
  ];

  return (
    <ScreenReaderSupport>
      <KeyboardNavigation>
        <HighContrastMode>
          <ReducedMotionMode>
            <div className="accessibility-page">
              <div className="accessibility-header">
                <motion.h1
                  className="accessibility-title"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Accessibility Features
                </motion.h1>
                <motion.p
                  className="accessibility-subtitle"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Our application is designed to be accessible to all users, including those with disabilities.
                </motion.p>
                <motion.div
                  className="accessibility-actions"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <button
                    className="test-accessibility-btn"
                    onClick={runAccessibilityTest}
                    aria-label="Run accessibility test"
                  >
                    Test Accessibility
                  </button>
                  <button
                    className="show-shortcuts-btn"
                    onClick={() => accessibilityManager.announce('Keyboard shortcuts available. Press Ctrl + / to view them.', 'polite')}
                    aria-label="Show keyboard shortcuts"
                  >
                    Show Shortcuts
                  </button>
                </motion.div>
              </div>

              <div className="accessibility-content">
                <motion.section
                  className="features-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h2>Accessibility Features</h2>
                  <div className="features-grid">
                    {accessibilityFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="feature-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="feature-icon">{feature.icon}</div>
                        <h3 className="feature-title">{feature.title}</h3>
                        <p className="feature-description">{feature.description}</p>
                        <ul className="feature-list">
                          {feature.features.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  className="shortcuts-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <h2>Keyboard Shortcuts</h2>
                  <div className="shortcuts-grid">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <motion.div
                        key={index}
                        className="shortcut-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                      >
                        <kbd className="shortcut-key">{shortcut.key}</kbd>
                        <span className="shortcut-description">{shortcut.description}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  className="guidelines-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                >
                  <h2>WCAG 2.1 AA Guidelines</h2>
                  <div className="guidelines-grid">
                    {accessibilityGuidelines.map((guideline, index) => (
                      <motion.div
                        key={index}
                        className="guideline-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                      >
                        <h3 className="guideline-category">{guideline.category}</h3>
                        <ul className="guideline-items">
                          {guideline.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  className="testing-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.0 }}
                >
                  <h2>Accessibility Testing</h2>
                  <div className="testing-content">
                    <p>
                      We regularly test our application for accessibility compliance using automated tools
                      and manual testing with assistive technologies.
                    </p>
                    <div className="testing-tools">
                      <div className="tool-item">
                        <h4>Automated Testing</h4>
                        <ul>
                          <li>axe-core accessibility engine</li>
                          <li>WAVE web accessibility evaluator</li>
                          <li>Lighthouse accessibility audit</li>
                          <li>Custom accessibility scanner</li>
                        </ul>
                      </div>
                      <div className="tool-item">
                        <h4>Manual Testing</h4>
                        <ul>
                          <li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
                          <li>Keyboard-only navigation</li>
                          <li>High contrast mode testing</li>
                          <li>Zoom testing up to 200%</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.section>
              </div>

              <AccessibilityTester
                isOpen={showTester}
                onClose={() => setShowTester(false)}
              />
            </div>
          </ReducedMotionMode>
        </HighContrastMode>
      </KeyboardNavigation>
    </ScreenReaderSupport>
  );
};

export default AccessibilityPage;
