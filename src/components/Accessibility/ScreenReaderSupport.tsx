import React, { useEffect, useRef } from 'react';
import { accessibilityManager } from '../../utils/accessibility';

interface ScreenReaderSupportProps {
  children: React.ReactNode;
  className?: string;
}

const ScreenReaderSupport: React.FC<ScreenReaderSupportProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add screen reader specific attributes
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Add landmark roles
    if (!container.getAttribute('role')) {
      container.setAttribute('role', 'main');
    }
    
    // Add aria-label if missing
    if (!container.getAttribute('aria-label') && !container.getAttribute('aria-labelledby')) {
      container.setAttribute('aria-label', 'Main content area');
    }
    
    // Add live region for dynamic content
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    container.appendChild(liveRegion);
    
    // Cleanup
    return () => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    };
  }, []);

  // Announce page changes
  useEffect(() => {
    const announcePageChange = () => {
      const pageTitle = document.title;
      const mainHeading = document.querySelector('h1, [role="heading"][aria-level="1"]');
      const headingText = mainHeading?.textContent || 'Page';
      
      accessibilityManager.announce(
        `Navigated to ${headingText}. ${pageTitle}`,
        'polite'
      );
    };

    // Announce on mount
    announcePageChange();

    // Listen for route changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if main content changed
          const addedNodes = Array.from(mutation.addedNodes);
          const hasMainContent = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node as Element).querySelector('h1, [role="heading"]')
          );
          
          if (hasMainContent) {
            setTimeout(announcePageChange, 100);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`screen-reader-support ${className}`}>
      {children}
    </div>
  );
};

// Screen reader utilities
export const screenReaderUtils = {
  // Announce text to screen readers
  announce: (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityManager.announce(text, priority);
  },

  // Announce form validation errors
  announceValidationError: (fieldName: string, errorMessage: string) => {
    accessibilityManager.announce(
      `Validation error for ${fieldName}: ${errorMessage}`,
      'assertive'
    );
  },

  // Announce successful actions
  announceSuccess: (message: string) => {
    accessibilityManager.announce(`Success: ${message}`, 'polite');
  },

  // Announce loading states
  announceLoading: (message: string) => {
    accessibilityManager.announce(`Loading: ${message}`, 'polite');
  },

  // Announce data changes
  announceDataChange: (change: string) => {
    accessibilityManager.announce(`Data updated: ${change}`, 'polite');
  },

  // Create accessible button
  createAccessibleButton: (text: string, onClick: () => void, options: {
    disabled?: boolean;
    ariaLabel?: string;
    ariaDescribedBy?: string;
  } = {}) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    button.disabled = options.disabled || false;
    
    if (options.ariaLabel) {
      button.setAttribute('aria-label', options.ariaLabel);
    }
    
    if (options.ariaDescribedBy) {
      button.setAttribute('aria-describedby', options.ariaDescribedBy);
    }
    
    return button;
  },

  // Create accessible link
  createAccessibleLink: (text: string, href: string, options: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    external?: boolean;
  } = {}) => {
    const link = document.createElement('a');
    link.textContent = text;
    link.href = href;
    
    if (options.ariaLabel) {
      link.setAttribute('aria-label', options.ariaLabel);
    }
    
    if (options.ariaDescribedBy) {
      link.setAttribute('aria-describedby', options.ariaDescribedBy);
    }
    
    if (options.external) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('aria-label', `${text} (opens in new tab)`);
    }
    
    return link;
  },

  // Create accessible form field
  createAccessibleFormField: (type: string, label: string, options: {
    required?: boolean;
    ariaDescribedBy?: string;
    ariaInvalid?: boolean;
    errorMessage?: string;
  } = {}) => {
    const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `error-${fieldId}`;
    
    const labelElement = document.createElement('label');
    labelElement.setAttribute('for', fieldId);
    labelElement.textContent = label;
    
    const field = document.createElement(type === 'textarea' ? 'textarea' : 'input') as HTMLInputElement | HTMLTextAreaElement;
    field.id = fieldId;
    if (field instanceof HTMLInputElement && type !== 'textarea') {
      field.type = type;
    }
    field.required = options.required || false;
    
    if (options.ariaDescribedBy) {
      field.setAttribute('aria-describedby', options.ariaDescribedBy);
    }
    
    if (options.ariaInvalid) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
    }
    
    const container = document.createElement('div');
    container.className = 'form-field-container';
    container.appendChild(labelElement);
    container.appendChild(field);
    
    if (options.errorMessage) {
      const errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.textContent = options.errorMessage;
      errorElement.setAttribute('role', 'alert');
      container.appendChild(errorElement);
    }
    
    return container;
  },

  // Create accessible table
  createAccessibleTable: (headers: string[], data: string[][], options: {
    caption?: string;
    ariaLabel?: string;
  } = {}) => {
    const table = document.createElement('table');
    
    if (options.caption) {
      const caption = document.createElement('caption');
      caption.textContent = options.caption;
      table.appendChild(caption);
    }
    
    if (options.ariaLabel) {
      table.setAttribute('aria-label', options.ariaLabel);
    }
    
    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      th.setAttribute('scope', 'col');
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      
      row.forEach((cell, cellIndex) => {
        const td = document.createElement('td');
        td.textContent = cell;
        
        // Add headers attribute for screen readers
        const headerId = `header-${cellIndex}`;
        td.setAttribute('headers', headerId);
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // Add header IDs
    const headerCells = table.querySelectorAll('th');
    headerCells.forEach((th, index) => {
      th.id = `header-${index}`;
    });
    
    return table;
  },

  // Create accessible modal
  createAccessibleModal: (title: string, content: HTMLElement, options: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
  } = {}) => {
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    if (options.ariaLabel) {
      modal.setAttribute('aria-label', options.ariaLabel);
    }
    
    if (options.ariaDescribedBy) {
      modal.setAttribute('aria-describedby', options.ariaDescribedBy);
    }
    
    const titleElement = document.createElement('h2');
    titleElement.id = 'modal-title';
    titleElement.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.setAttribute('aria-label', 'Close modal');
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => {
      document.body.removeChild(modal);
      accessibilityManager.announce('Modal closed', 'polite');
    };
    
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    const body = document.createElement('div');
    body.className = 'modal-body';
    body.appendChild(content);
    
    modal.appendChild(header);
    modal.appendChild(body);
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Focus management
    const focusableElements = modal.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
    
    // Announce modal opening
    accessibilityManager.announce(`Modal opened: ${title}`, 'assertive');
    
    return modal;
  }
};

export default ScreenReaderSupport;
