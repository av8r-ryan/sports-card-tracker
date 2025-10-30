// Performance monitoring utilities using Web Vitals and custom metrics

import { useEffect, useState } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetrics {
  // Core Web Vitals
  cls: number | null;
  fid: number | null;
  lcp: number | null;

  // Additional metrics
  fcp: number | null;
  ttfb: number | null;

  // Custom metrics
  customMetrics: Record<string, number>;

  // Timestamps
  timestamp: number;
  userAgent: string;
  connectionType?: string;
}

interface PerformanceConfig {
  enableWebVitals: boolean;
  enableCustomMetrics: boolean;
  enableResourceTiming: boolean;
  enableNavigationTiming: boolean;
  enableUserTiming: boolean;
  enableMemoryInfo: boolean;
  enableConnectionInfo: boolean;
  reportInterval: number;
  batchSize: number;
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private customMetrics: Map<string, number>;
  private observers: PerformanceObserver[];
  private reportQueue: PerformanceMetrics[];
  private isReporting: boolean;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableWebVitals: true,
      enableCustomMetrics: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
      enableUserTiming: true,
      enableMemoryInfo: true,
      enableConnectionInfo: true,
      reportInterval: 30000, // 30 seconds
      batchSize: 10,
      ...config,
    };

    this.metrics = {
      cls: null,
      fid: null,
      lcp: null,
      fcp: null,
      ttfb: null,
      customMetrics: {},
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
    };

    this.customMetrics = new Map();
    this.observers = [];
    this.reportQueue = [];
    this.isReporting = false;

    this.initialize();
  }

  private initialize(): void {
    if (this.config.enableWebVitals) {
      this.setupWebVitals();
    }

    if (this.config.enableCustomMetrics) {
      this.setupCustomMetrics();
    }

    if (this.config.enableResourceTiming) {
      this.setupResourceTiming();
    }

    if (this.config.enableNavigationTiming) {
      this.setupNavigationTiming();
    }

    if (this.config.enableUserTiming) {
      this.setupUserTiming();
    }

    if (this.config.enableMemoryInfo) {
      this.setupMemoryInfo();
    }

    // Start periodic reporting
    setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }

  private setupWebVitals(): void {
    // Core Web Vitals
    getCLS((metric) => {
      this.metrics.cls = metric.value;
      this.reportMetric('cls', metric.value, (metric as any).rating || 'good');
    });

    getFID((metric) => {
      this.metrics.fid = metric.value;
      this.reportMetric('fid', metric.value, (metric as any).rating || 'good');
    });

    getLCP((metric) => {
      this.metrics.lcp = metric.value;
      this.reportMetric('lcp', metric.value, (metric as any).rating || 'good');
    });

    // Additional metrics
    getFCP((metric) => {
      this.metrics.fcp = metric.value;
      this.reportMetric('fcp', metric.value, (metric as any).rating || 'good');
    });

    getTTFB((metric) => {
      this.metrics.ttfb = metric.value;
      this.reportMetric('ttfb', metric.value, (metric as any).rating || 'good');
    });
  }

  private setupCustomMetrics(): void {
    // Monitor component render times
    this.observePerformanceEntries('measure', (entries) => {
      entries.forEach((entry) => {
        if (entry.name.startsWith('component-')) {
          this.customMetrics.set(entry.name, entry.duration);
        }
      });
    });

    // Monitor long tasks
    this.observePerformanceEntries('longtask', (entries) => {
      entries.forEach((entry) => {
        this.customMetrics.set('long-task', entry.duration);
        console.warn(`Long task detected: ${entry.duration}ms`);
      });
    });

    // Monitor layout shifts
    this.observePerformanceEntries('layout-shift', (entries) => {
      entries.forEach((entry) => {
        const ls: any = entry as any;
        if (ls.hadRecentInput) return;
        if (typeof ls.value === 'number') {
          this.customMetrics.set('layout-shift', ls.value);
        }
      });
    });
  }

  private setupResourceTiming(): void {
    this.observePerformanceEntries('resource', (entries) => {
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        const loadTime = resource.responseEnd - resource.requestStart;

        // Track slow resources
        if (loadTime > 1000) {
          this.customMetrics.set(`slow-resource-${resource.name}`, loadTime);
        }

        // Track resource types
        const resourceType = this.getResourceType(resource.name);
        this.customMetrics.set(`resource-${resourceType}`, loadTime);
      });
    });
  }

  private setupNavigationTiming(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      this.customMetrics.set(
        'dom-content-loaded',
        navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      );
      this.customMetrics.set('load-complete', navigation.loadEventEnd - navigation.loadEventStart);
      this.customMetrics.set('dom-interactive', navigation.domInteractive - navigation.startTime);
    }
  }

  private setupUserTiming(): void {
    this.observePerformanceEntries('mark', (entries) => {
      entries.forEach((entry) => {
        this.customMetrics.set(`mark-${entry.name}`, entry.startTime);
      });
    });

    this.observePerformanceEntries('measure', (entries) => {
      entries.forEach((entry) => {
        this.customMetrics.set(`measure-${entry.name}`, entry.duration);
      });
    });
  }

  private setupMemoryInfo(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.customMetrics.set('memory-used', memory.usedJSHeapSize);
      this.customMetrics.set('memory-total', memory.totalJSHeapSize);
      this.customMetrics.set('memory-limit', memory.jsHeapSizeLimit);
    }
  }

  private observePerformanceEntries(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });

        observer.observe({ entryTypes: [type] });
        this.observers.push(observer);
      } catch (error) {
        console.warn(`PerformanceObserver for ${type} not supported:`, error);
      }
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'style';
    if (
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      url.includes('.gif') ||
      url.includes('.svg')
    )
      return 'image';
    if (url.includes('.woff') || url.includes('.woff2') || url.includes('.ttf') || url.includes('.otf')) return 'font';
    return 'other';
  }

  private getConnectionType(): string | undefined {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || connection.type;
    }
    return undefined;
  }

  // Public methods
  mark(name: string): void {
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string): void {
    if (endMark) {
      performance.measure(name, startMark, endMark);
    } else {
      performance.measure(name, startMark);
    }
  }

  measureComponent(componentName: string, renderFunction: () => void): void {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;

    this.mark(startMark);
    renderFunction();
    this.mark(endMark);
    this.measure(`${componentName}-render`, startMark, endMark);
  }

  measureAsync<T>(name: string, asyncFunction: () => Promise<T>): Promise<T> {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    this.mark(startMark);
    return asyncFunction().finally(() => {
      this.mark(endMark);
      this.measure(name, startMark, endMark);
    });
  }

  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      customMetrics: Object.fromEntries(this.customMetrics),
      timestamp: Date.now(),
    };
  }

  private reportMetric(name: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor'): void {
    console.log(`Performance metric: ${name} = ${value} (${rating || 'unknown'})`);

    // Store in custom metrics
    this.customMetrics.set(name, value);

    // Add rating if available
    if (rating) {
      this.customMetrics.set(`${name}-rating`, this.ratingToNumber(rating));
    }
  }

  private ratingToNumber(rating: 'good' | 'needs-improvement' | 'poor'): number {
    switch (rating) {
      case 'good':
        return 1;
      case 'needs-improvement':
        return 2;
      case 'poor':
        return 3;
      default:
        return 0;
    }
  }

  private async reportMetrics(): Promise<void> {
    if (this.isReporting) return;

    this.isReporting = true;

    try {
      const metrics = this.getMetrics();
      this.reportQueue.push(metrics);

      if (this.reportQueue.length >= this.config.batchSize) {
        await this.flushReportQueue();
      }
    } catch (error) {
      console.error('Failed to report metrics:', error);
    } finally {
      this.isReporting = false;
    }
  }

  private async flushReportQueue(): Promise<void> {
    if (this.reportQueue.length === 0) return;

    const metrics = [...this.reportQueue];
    this.reportQueue = [];

    // In a real application, you would send this to your analytics service
    console.log('Reporting performance metrics:', metrics);

    // Example: Send to analytics service
    // await this.sendToAnalytics(metrics);
  }

  // Clean up observers
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Global instance
const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const mark = (name: string): void => {
  performanceMonitor.mark(name);
};

export const measure = (name: string, startMark: string, endMark?: string): void => {
  performanceMonitor.measure(name, startMark, endMark);
};

export const measureComponent = (componentName: string, renderFunction: () => void): void => {
  performanceMonitor.measureComponent(componentName, renderFunction);
};

export const measureAsync = <T>(name: string, asyncFunction: () => Promise<T>): Promise<T> => {
  return performanceMonitor.measureAsync(name, asyncFunction);
};

export const getPerformanceMetrics = (): PerformanceMetrics => {
  return performanceMonitor.getMetrics();
};

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    mark,
    measure,
    measureComponent,
    measureAsync,
  };
};

export default performanceMonitor;
