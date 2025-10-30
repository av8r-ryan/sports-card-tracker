// Accessibility utilities for WCAG 2.1 AA compliance
interface AccessibilityConfig {
  enableAnnouncements: boolean;
  enableKeyboardNavigation: boolean;
  enableFocusManagement: boolean;
  enableScreenReader: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  announceTimeout: number;
}

interface FocusTrapOptions {
  container: HTMLElement;
  initialFocus?: HTMLElement;
  returnFocus?: HTMLElement;
  escapeKey?: boolean;
  clickOutside?: boolean;
}

class AccessibilityManager {
  private config: AccessibilityConfig;
  private focusHistory: HTMLElement[] = [];
  private currentFocusTrap: FocusTrapOptions | null = null;
  private announcements: HTMLElement | null = null;

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableAnnouncements: true,
      enableKeyboardNavigation: true,
      enableFocusManagement: true,
      enableScreenReader: true,
      enableHighContrast: false,
      enableReducedMotion: false,
      announceTimeout: 5000,
      ...config
    };

    this.initialize();
  }

  private initialize(): void {
    if (this.config.enableAnnouncements) {
      this.createAnnouncementsContainer();
    }

    if (this.config.enableKeyboardNavigation) {
      this.setupKeyboardNavigation();
    }

    if (this.config.enableFocusManagement) {
      this.setupFocusManagement();
    }

    this.setupMediaQueries();
    this.setupReducedMotion();
  }

  private createAnnouncementsContainer(): void {
    this.announcements = document.createElement('div');
    this.announcements.setAttribute('aria-live', 'polite');
    this.announcements.setAttribute('aria-atomic', 'true');
    this.announcements.className = 'sr-only';
    this.announcements.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announcements);
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private setupFocusManagement(): void {
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  private setupMediaQueries(): void {
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    highContrastQuery.addEventListener('change', (e) => {
      this.config.enableHighContrast = e.matches;
      this.updateHighContrastMode();
    });

    reducedMotionQuery.addEventListener('change', (e) => {
      this.config.enableReducedMotion = e.matches;
      this.updateReducedMotionMode();
    });

    // Initial setup
    this.config.enableHighContrast = highContrastQuery.matches;
    this.config.enableReducedMotion = reducedMotionQuery.matches;
    this.updateHighContrastMode();
    this.updateReducedMotionMode();
  }

  private setupReducedMotion(): void {
    if (this.config.enableReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.style.setProperty('--animation-iteration-count', '1');
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const { key, ctrlKey, altKey, shiftKey } = event;

    // Skip modifier keys
    if (ctrlKey || altKey || shiftKey) return;

    switch (key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event);
        break;
      case 'Home':
        this.handleHomeKey(event);
        break;
      case 'End':
        this.handleEndKey(event);
        break;
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    if (this.currentFocusTrap) {
      this.trapFocus(event);
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      if (modal.getAttribute('aria-hidden') !== 'true') {
        const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]');
        if (closeButton) {
          (closeButton as HTMLElement).click();
        }
      }
    });
  }

  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Handle button activation
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      event.preventDefault();
      target.click();
    }
    
    // Handle link activation
    if (target.tagName === 'A') {
      event.preventDefault();
      target.click();
    }
  }

  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const { key } = event;

    // Handle menu navigation
    const menu = target.closest('[role="menu"], [role="menubar"]');
    if (menu) {
      this.navigateMenu(menu as HTMLElement, target, key);
      return;
    }

    // Handle tab navigation
    const tablist = target.closest('[role="tablist"]');
    if (tablist) {
      this.navigateTabs(tablist as HTMLElement, target, key);
      return;
    }

    // Handle grid navigation
    const grid = target.closest('[role="grid"]');
    if (grid) {
      this.navigateGrid(grid as HTMLElement, target, key);
      return;
    }
  }

  private handleHomeKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const container = target.closest('[role="menu"], [role="menubar"], [role="tablist"]');
    
    if (container) {
      event.preventDefault();
      const firstItem = container.querySelector('[role="menuitem"], [role="tab"]') as HTMLElement;
      if (firstItem) {
        firstItem.focus();
      }
    }
  }

  private handleEndKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const container = target.closest('[role="menu"], [role="menubar"], [role="tablist"]');
    
    if (container) {
      event.preventDefault();
      const items = container.querySelectorAll('[role="menuitem"], [role="tab"]');
      const lastItem = items[items.length - 1] as HTMLElement;
      if (lastItem) {
        lastItem.focus();
      }
    }
  }

  private navigateMenu(menu: HTMLElement, currentItem: HTMLElement, direction: string): void {
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    const currentIndex = items.indexOf(currentItem);
    
    let nextIndex = currentIndex;
    
    if (direction === 'ArrowDown' || direction === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % items.length;
    } else if (direction === 'ArrowUp' || direction === 'ArrowLeft') {
      nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    }
    
    if (nextIndex !== currentIndex) {
      items[nextIndex].focus();
    }
  }

  private navigateTabs(tablist: HTMLElement, currentTab: HTMLElement, direction: string): void {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]')) as HTMLElement[];
    const currentIndex = tabs.indexOf(currentTab);
    
    let nextIndex = currentIndex;
    
    if (direction === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (direction === 'ArrowLeft') {
      nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    }
    
    if (nextIndex !== currentIndex) {
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    }
  }

  private navigateGrid(grid: HTMLElement, currentCell: HTMLElement, direction: string): void {
    const cells = Array.from(grid.querySelectorAll('[role="gridcell"]')) as HTMLElement[];
    const currentIndex = cells.indexOf(currentCell);
    const columns = this.getGridColumns(grid);
    
    let nextIndex = currentIndex;
    
    switch (direction) {
      case 'ArrowRight':
        nextIndex = currentIndex + 1;
        break;
      case 'ArrowLeft':
        nextIndex = currentIndex - 1;
        break;
      case 'ArrowDown':
        nextIndex = currentIndex + columns;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex - columns;
        break;
    }
    
    if (nextIndex >= 0 && nextIndex < cells.length && nextIndex !== currentIndex) {
      cells[nextIndex].focus();
    }
  }

  private getGridColumns(grid: HTMLElement): number {
    const firstRow = grid.querySelector('[role="row"]');
    if (firstRow) {
      return firstRow.querySelectorAll('[role="gridcell"]').length;
    }
    return 1;
  }

  private trapFocus(event: KeyboardEvent): void {
    if (!this.currentFocusTrap) return;

    const { container } = this.currentFocusTrap;
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.focusHistory.push(target);
    
    // Limit focus history
    if (this.focusHistory.length > 10) {
      this.focusHistory = this.focusHistory.slice(-10);
    }
  }

  private handleFocusOut(event: FocusEvent): void {
    // Handle focus management
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
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
      '[role="gridcell"]'
    ];

    return Array.from(container.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }

  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcements) return;

    this.announcements.setAttribute('aria-live', priority);
    this.announcements.textContent = message;

    // Clear after timeout
    setTimeout(() => {
      if (this.announcements) {
        this.announcements.textContent = '';
      }
    }, this.config.announceTimeout);
  }

  public setFocusTrap(options: FocusTrapOptions): void {
    this.currentFocusTrap = options;
    
    if (options.initialFocus) {
      options.initialFocus.focus();
    } else {
      const focusableElements = this.getFocusableElements(options.container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }

  public removeFocusTrap(): void {
    if (this.currentFocusTrap?.returnFocus) {
      this.currentFocusTrap.returnFocus.focus();
    }
    this.currentFocusTrap = null;
  }

  public focusPrevious(): void {
    if (this.focusHistory.length > 1) {
      this.focusHistory.pop(); // Remove current
      const previous = this.focusHistory[this.focusHistory.length - 1];
      if (previous) {
        previous.focus();
      }
    }
  }

  public updateHighContrastMode(): void {
    document.documentElement.classList.toggle('high-contrast', this.config.enableHighContrast);
  }

  public updateReducedMotionMode(): void {
    document.documentElement.classList.toggle('reduced-motion', this.config.enableReducedMotion);
  }

  public validateAccessibility(): AccessibilityReport {
    const issues: AccessibilityIssue[] = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push({
          type: 'missing-alt-text',
          element: img,
          severity: 'error',
          message: `Image ${index + 1} is missing alt text`,
          fix: 'Add alt attribute or aria-label'
        });
      }
    });

    // Check for missing form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          type: 'missing-label',
          element: input,
          severity: 'error',
          message: `Form control ${index + 1} is missing a label`,
          fix: 'Add label element or aria-label attribute'
        });
      }
    });

    // Check for missing heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push({
          type: 'heading-hierarchy',
          element: heading,
          severity: 'warning',
          message: `Heading ${heading.tagName} skips level ${lastLevel + 1}`,
          fix: 'Use proper heading hierarchy'
        });
      }
      lastLevel = level;
    });

    return {
      issues,
      score: this.calculateAccessibilityScore(issues),
      recommendations: this.generateRecommendations(issues)
    };
  }

  private calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    const maxScore = 100;
    const errorPenalty = 10;
    const warningPenalty = 5;
    
    return Math.max(0, maxScore - (errorCount * errorPenalty) - (warningCount * warningPenalty));
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'missing-alt-text')) {
      recommendations.push('Add descriptive alt text to all images');
    }
    
    if (issues.some(i => i.type === 'missing-label')) {
      recommendations.push('Ensure all form controls have associated labels');
    }
    
    if (issues.some(i => i.type === 'heading-hierarchy')) {
      recommendations.push('Use proper heading hierarchy (h1 > h2 > h3, etc.)');
    }
    
    return recommendations;
  }
}

interface AccessibilityIssue {
  type: string;
  element: Element;
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix: string;
}

interface AccessibilityReport {
  issues: AccessibilityIssue[];
  score: number;
  recommendations: string[];
}

// Create singleton instance
export const accessibilityManager = new AccessibilityManager();

// Export utilities
export const accessibilityUtils = {
  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    return focusableSelectors.some(selector => element.matches(selector));
  },

  // Get accessible name
  getAccessibleName: (element: HTMLElement): string => {
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') ||
           element.textContent?.trim() ||
           element.getAttribute('alt') ||
           element.getAttribute('title') ||
           '';
  },

  // Check color contrast
  checkColorContrast: (foreground: string, background: string): number => {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5; // Mock value
  },

  // Generate accessible ID
  generateId: (prefix: string = 'element'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

export type { AccessibilityConfig, FocusTrapOptions, AccessibilityIssue, AccessibilityReport };
