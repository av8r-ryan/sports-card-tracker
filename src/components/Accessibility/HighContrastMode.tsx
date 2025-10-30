import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import { accessibilityManager } from '../../utils/accessibility';
import './HighContrastMode.css';

interface HighContrastModeProps {
  children: React.ReactNode;
  className?: string;
}

const HighContrastMode: React.FC<HighContrastModeProps> = ({ children, className = '' }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
      accessibilityManager.updateHighContrastMode();
    };

    mediaQuery.addEventListener('change', handleChange);

    // Show toggle button after 3 seconds
    const timer = setTimeout(() => {
      setShowToggle(true);
    }, 3000);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearTimeout(timer);
    };
  }, []);

  const toggleHighContrast = () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    accessibilityManager.updateHighContrastMode();

    // Announce change
    accessibilityManager.announce(`High contrast mode ${newState ? 'enabled' : 'disabled'}`, 'polite');
  };

  return (
    <div className={`high-contrast-mode ${isHighContrast ? 'high-contrast' : ''} ${className}`}>
      {children}

      {/* Toggle Button */}
      <AnimatePresence>
        {showToggle && (
          <motion.button
            className="contrast-toggle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleHighContrast}
            aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
            title={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
          >
            <div className="contrast-icon">{isHighContrast ? '🔆' : '🌙'}</div>
            <span className="contrast-text">{isHighContrast ? 'High Contrast' : 'Normal'}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// High contrast utilities
export const highContrastUtils = {
  // Apply high contrast styles to element
  applyHighContrast: (element: HTMLElement) => {
    element.classList.add('high-contrast-element');
  },

  // Remove high contrast styles from element
  removeHighContrast: (element: HTMLElement) => {
    element.classList.remove('high-contrast-element');
  },

  // Check if high contrast is enabled
  isHighContrastEnabled: (): boolean => {
    return document.documentElement.classList.contains('high-contrast');
  },

  // Get high contrast color
  getHighContrastColor: (baseColor: string): string => {
    // Simple color conversion for high contrast
    const colorMap: { [key: string]: string } = {
      '#ffffff': '#000000',
      '#000000': '#ffffff',
      '#666666': '#000000',
      '#999999': '#000000',
      '#cccccc': '#000000',
      '#f0f0f0': '#000000',
      '#e0e0e0': '#000000',
      '#333333': '#ffffff',
    };

    return colorMap[baseColor.toLowerCase()] || baseColor;
  },

  // Create high contrast button
  createHighContrastButton: (text: string, onClick: () => void) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    button.className = 'high-contrast-button';
    return button;
  },

  // Create high contrast link
  createHighContrastLink: (text: string, href: string) => {
    const link = document.createElement('a');
    link.textContent = text;
    link.href = href;
    link.className = 'high-contrast-link';
    return link;
  },

  // Create high contrast input
  createHighContrastInput: (type: string, placeholder: string) => {
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.className = 'high-contrast-input';
    return input;
  },

  // Create high contrast table
  createHighContrastTable: (headers: string[], data: string[][]) => {
    const table = document.createElement('table');
    table.className = 'high-contrast-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');

    data.forEach((row) => {
      const tr = document.createElement('tr');

      row.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    return table;
  },

  // Create high contrast card
  createHighContrastCard: (title: string, content: string) => {
    const card = document.createElement('div');
    card.className = 'high-contrast-card';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.className = 'high-contrast-card-title';

    const contentElement = document.createElement('div');
    contentElement.textContent = content;
    contentElement.className = 'high-contrast-card-content';

    card.appendChild(titleElement);
    card.appendChild(contentElement);

    return card;
  },

  // Create high contrast alert
  createHighContrastAlert: (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    const alert = document.createElement('div');
    alert.className = `high-contrast-alert high-contrast-alert-${type}`;
    alert.textContent = message;
    alert.setAttribute('role', 'alert');

    return alert;
  },

  // Create high contrast progress bar
  createHighContrastProgressBar: (value: number, max = 100) => {
    const container = document.createElement('div');
    container.className = 'high-contrast-progress-container';

    const progress = document.createElement('div');
    progress.className = 'high-contrast-progress-bar';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuenow', value.toString());
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', max.toString());

    const percentage = (value / max) * 100;
    progress.style.width = `${percentage}%`;

    container.appendChild(progress);

    return container;
  },

  // Create high contrast navigation
  createHighContrastNavigation: (items: { text: string; href: string }[]) => {
    const nav = document.createElement('nav');
    nav.className = 'high-contrast-navigation';
    nav.setAttribute('role', 'navigation');

    const list = document.createElement('ul');
    list.className = 'high-contrast-nav-list';

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'high-contrast-nav-item';

      const link = document.createElement('a');
      link.textContent = item.text;
      link.href = item.href;
      link.className = 'high-contrast-nav-link';

      li.appendChild(link);
      list.appendChild(li);
    });

    nav.appendChild(list);

    return nav;
  },
};

export default HighContrastMode;
