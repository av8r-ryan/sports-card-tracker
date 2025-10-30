import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import './KeyboardNavigation.css';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
}

const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({ children, className = '' }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentShortcut, setCurrentShortcut] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show shortcuts on Ctrl+/
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Hide shortcuts on Escape
      if (event.key === 'Escape') {
        setShowShortcuts(false);
        setCurrentShortcut(null);
        return;
      }

      // Handle other shortcuts
      if (event.ctrlKey || event.altKey) {
        handleShortcut(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShortcut = (event: KeyboardEvent) => {
    const { key, ctrlKey, altKey } = event;

    // Prevent default browser shortcuts
    if (ctrlKey && ['s', 'p', 'a', 'f', 'h'].includes(key)) {
      event.preventDefault();
    }

    let shortcut = '';
    if (ctrlKey) shortcut += 'Ctrl+';
    if (altKey) shortcut += 'Alt+';
    shortcut += key.toUpperCase();

    setCurrentShortcut(shortcut);

    // Clear shortcut display after 2 seconds
    setTimeout(() => setCurrentShortcut(null), 2000);

    // Handle specific shortcuts
    switch (shortcut) {
      case 'Ctrl+/':
        setShowShortcuts(true);
        break;
      case 'Ctrl+1':
        navigateToSection('dashboard');
        break;
      case 'Ctrl+2':
        navigateToSection('inventory');
        break;
      case 'Ctrl+3':
        navigateToSection('collections');
        break;
      case 'Ctrl+4':
        navigateToSection('reports');
        break;
      case 'Ctrl+5':
        navigateToSection('profile');
        break;
      case 'Alt+1':
        focusFirstElement();
        break;
      case 'Alt+2':
        focusMainContent();
        break;
      case 'Alt+3':
        focusNavigation();
        break;
      case 'Alt+4':
        focusSearch();
        break;
      case 'Alt+5':
        focusActions();
        break;
      case 'Alt+6':
        focusFooter();
        break;
      case 'Ctrl+Enter':
        activateFocusedElement();
        break;
      case 'Ctrl+Tab':
        focusNextElement();
        break;
      case 'Ctrl+Shift+Tab':
        focusPreviousElement();
        break;
      case 'Ctrl+Home':
        focusFirstElement();
        break;
      case 'Ctrl+End':
        focusLastElement();
        break;
      case 'Ctrl+Space':
        toggleMenu();
        break;
      case 'Ctrl+Escape':
        closeModals();
        break;
    }
  };

  const navigateToSection = (section: string) => {
    const element = document.querySelector(`[data-section="${section}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      (element as HTMLElement).focus();
    }
  };

  const focusFirstElement = () => {
    const firstElement = containerRef.current?.querySelector(
      '[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a[href]'
    ) as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  };

  const focusMainContent = () => {
    const main = document.querySelector('main, [role="main"]') as HTMLElement;
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const focusNavigation = () => {
    const nav = document.querySelector('nav, [role="navigation"]') as HTMLElement;
    if (nav) {
      const firstLink = nav.querySelector('a, button') as HTMLElement;
      if (firstLink) {
        firstLink.focus();
      }
    }
  };

  const focusSearch = () => {
    const search = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLElement;
    if (search) {
      search.focus();
    }
  };

  const focusActions = () => {
    const actions = document.querySelector('[role="toolbar"], .actions, .action-buttons') as HTMLElement;
    if (actions) {
      const firstButton = actions.querySelector('button') as HTMLElement;
      if (firstButton) {
        firstButton.focus();
      }
    }
  };

  const focusFooter = () => {
    const footer = document.querySelector('footer, [role="contentinfo"]') as HTMLElement;
    if (footer) {
      footer.focus();
      footer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const activateFocusedElement = () => {
    const focused = document.activeElement as HTMLElement;
    if (focused && (focused.tagName === 'BUTTON' || focused.getAttribute('role') === 'button')) {
      focused.click();
    }
  };

  const focusNextElement = () => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  };

  const focusPreviousElement = () => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const prevIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[prevIndex]?.focus();
  };

  const focusLastElement = () => {
    const focusableElements = getFocusableElements();
    const lastElement = focusableElements[focusableElements.length - 1];
    if (lastElement) {
      lastElement.focus();
    }
  };

  const toggleMenu = () => {
    const menu = document.querySelector('[role="menu"], .menu, .navigation-menu') as HTMLElement;
    if (menu) {
      const isOpen = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', (!isOpen).toString());

      if (!isOpen) {
        const firstItem = menu.querySelector('[role="menuitem"], a, button') as HTMLElement;
        if (firstItem) {
          firstItem.focus();
        }
      }
    }
  };

  const closeModals = () => {
    const modals = document.querySelectorAll('[role="dialog"], .modal, .popup');
    modals.forEach((modal) => {
      const closeButton = modal.querySelector('[aria-label*="close" i], [aria-label*="Close" i]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    });
  };

  const getFocusableElements = (): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="gridcell"]',
    ];

    return Array.from(document.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  };

  const shortcuts = [
    { key: 'Ctrl + /', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl + 1-5', description: 'Navigate to sections' },
    { key: 'Alt + 1-6', description: 'Focus specific areas' },
    { key: 'Ctrl + Enter', description: 'Activate focused element' },
    { key: 'Ctrl + Tab', description: 'Focus next element' },
    { key: 'Ctrl + Shift + Tab', description: 'Focus previous element' },
    { key: 'Ctrl + Home', description: 'Focus first element' },
    { key: 'Ctrl + End', description: 'Focus last element' },
    { key: 'Ctrl + Space', description: 'Toggle menu' },
    { key: 'Ctrl + Escape', description: 'Close modals' },
    { key: 'Escape', description: 'Close dialogs/shortcuts' },
  ];

  return (
    <>
      <div ref={containerRef} className={`keyboard-navigation ${className}`}>
        {children}
      </div>

      {/* Shortcut Display */}
      <AnimatePresence>
        {currentShortcut && (
          <motion.div
            className="shortcut-display"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {currentShortcut}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts Help */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            className="shortcuts-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              className="shortcuts-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shortcuts-header">
                <h2>Keyboard Shortcuts</h2>
                <button className="close-btn" onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts">
                  ×
                </button>
              </div>

              <div className="shortcuts-content">
                <div className="shortcuts-section">
                  <h3>Navigation</h3>
                  <div className="shortcuts-list">
                    {shortcuts.slice(0, 4).map((shortcut, index) => (
                      <div key={index} className="shortcut-item">
                        <kbd className="shortcut-key">{shortcut.key}</kbd>
                        <span className="shortcut-description">{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shortcuts-section">
                  <h3>Focus Management</h3>
                  <div className="shortcuts-list">
                    {shortcuts.slice(4, 8).map((shortcut, index) => (
                      <div key={index} className="shortcut-item">
                        <kbd className="shortcut-key">{shortcut.key}</kbd>
                        <span className="shortcut-description">{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shortcuts-section">
                  <h3>Actions</h3>
                  <div className="shortcuts-list">
                    {shortcuts.slice(8).map((shortcut, index) => (
                      <div key={index} className="shortcut-item">
                        <kbd className="shortcut-key">{shortcut.key}</kbd>
                        <span className="shortcut-description">{shortcut.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shortcuts-footer">
                <p>
                  Press <kbd>Escape</kbd> to close this dialog
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardNavigation;
