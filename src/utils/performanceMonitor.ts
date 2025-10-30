// Performance monitoring utilities
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'navigation' | 'paint' | 'measure' | 'custom';
  metadata?: Record<string, any>;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  maxMetrics: number;
  reportInterval: number;
  thresholds: {
    [key: string]: number;
  };
}

class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private reportTimer: number | null = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxMetrics: 1000,
      reportInterval: 30000, // 30 seconds
      thresholds: {
        'first-contentful-paint': 1500,
        'largest-contentful-paint': 2500,
        'first-input-delay': 100,
        'cumulative-layout-shift': 0.1,
        'total-blocking-time': 300,
      },
      ...config,
    };

    if (this.config.enabled) {
      this.initialize();
    }
  }

  private initialize(): void {
    // Only initialize if performance API is available
    if (typeof performance === 'undefined') {
      console.warn('[PerformanceMonitor] Performance API not available');
      return;
    }

    this.setupNavigationObserver();
    this.setupPaintObserver();
    this.setupLargestContentfulPaintObserver();
    this.setupFirstInputDelayObserver();
    this.setupLayoutShiftObserver();
    this.setupLongTaskObserver();
    this.setupResourceObserver();
    this.setupMemoryObserver();
    this.startReporting();
  }

  private setupNavigationObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric({
              name: 'navigation-total',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              timestamp: Date.now(),
              type: 'navigation',
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                domInteractive: navEntry.domInteractive - navEntry.startTime,
                redirect: navEntry.redirectEnd - navEntry.redirectStart,
                dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                tcp: navEntry.connectEnd - navEntry.connectStart,
                request: navEntry.responseEnd - navEntry.requestStart,
                response: navEntry.responseEnd - navEntry.responseStart,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup navigation observer:', error);
    }
  }

  private setupPaintObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
              type: 'paint',
            });
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup paint observer:', error);
    }
  }

  private setupLargestContentfulPaintObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric({
            name: 'largest-contentful-paint',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            type: 'paint',
            metadata: {
              element: (lastEntry as any).element?.tagName,
              url: (lastEntry as any).url,
              size: (lastEntry as any).size,
            },
          });
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup LCP observer:', error);
    }
  }

  private setupFirstInputDelayObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            this.recordMetric({
              name: 'first-input-delay',
              value: fidEntry.processingStart - fidEntry.startTime,
              timestamp: Date.now(),
              type: 'measure',
              metadata: {
                eventType: fidEntry.name,
                target: (fidEntry.target as any)?.tagName,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup FID observer:', error);
    }
  }

  private setupLayoutShiftObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });

        this.recordMetric({
          name: 'cumulative-layout-shift',
          value: clsValue,
          timestamp: Date.now(),
          type: 'measure',
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup CLS observer:', error);
    }
  }

  private setupLongTaskObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordMetric({
              name: 'long-task',
              value: entry.duration,
              timestamp: Date.now(),
              type: 'measure',
              metadata: {
                startTime: entry.startTime,
                name: entry.name,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup long task observer:', error);
    }
  }

  private setupResourceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric({
              name: 'resource-load',
              value: resourceEntry.responseEnd - resourceEntry.startTime,
              timestamp: Date.now(),
              type: 'measure',
              metadata: {
                url: resourceEntry.name,
                type: resourceEntry.initiatorType,
                size: resourceEntry.transferSize,
                cached: resourceEntry.transferSize === 0,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup resource observer:', error);
    }
  }

  private setupMemoryObserver(): void {
    // Memory API is only available in Chrome
    if (!('memory' in performance)) return;

    try {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        if (memory) {
          this.recordMetric({
            name: 'memory-used',
            value: memory.usedJSHeapSize,
            timestamp: Date.now(),
            type: 'custom',
            metadata: {
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit,
            },
          });
        }
      };

      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
      checkMemory(); // Initial check
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to setup memory observer:', error);
    }
  }

  private recordMetric(metric: PerformanceMetric): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // Check thresholds
    this.checkThresholds(metric);
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.config.thresholds[metric.name];
    if (threshold && metric.value > threshold) {
      console.warn(`[PerformanceMonitor] Threshold exceeded for ${metric.name}:`, {
        value: metric.value,
        threshold,
        metadata: metric.metadata,
      });
    }
  }

  private startReporting(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }

    this.reportTimer = window.setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }

  public measure(name: string, fn: () => void): void {
    if (!this.config.enabled) {
      fn();
      return;
    }

    const start = performance.now();
    fn();
    const end = performance.now();

    this.recordMetric({
      name,
      value: end - start,
      timestamp: Date.now(),
      type: 'measure',
    });
  }

  public async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.config.enabled) {
      return await fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();

      this.recordMetric({
        name,
        value: end - start,
        timestamp: Date.now(),
        type: 'measure',
      });

      return result;
    } catch (error) {
      const end = performance.now();

      this.recordMetric({
        name: `${name}-error`,
        value: end - start,
        timestamp: Date.now(),
        type: 'measure',
        metadata: { error: (error as Error).message },
      });

      throw error;
    }
  }

  public mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  public measureBetween(mark1: string, mark2: string, name: string): void {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, mark1, mark2);

        const entries = performance.getEntriesByName(name, 'measure');
        if (entries.length > 0) {
          const entry = entries[0];
          this.recordMetric({
            name,
            value: entry.duration,
            timestamp: Date.now(),
            type: 'measure',
          });
        }
      } catch (error) {
        console.warn('[PerformanceMonitor] Failed to measure between marks:', error);
      }
    }
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((metric) => metric.name === name);
    }
    return [...this.metrics];
  }

  public getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  public getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.getMetrics(name);
    return metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  public reportMetrics(): void {
    if (this.metrics.length === 0) return;

    const report = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection
        ? {
            effectiveType: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink,
            rtt: (navigator as any).connection.rtt,
          }
        : null,
      metrics: this.getMetricsSummary(),
    };

    // Send to analytics service
    this.sendToAnalytics(report);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[PerformanceMonitor] Metrics Report:', report);
    }
  }

  private getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    const metricNames = [...new Set(this.metrics.map((m) => m.name))];

    metricNames.forEach((name) => {
      const values = this.getMetrics(name).map((m) => m.value);
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p50: this.percentile(values, 0.5),
        p95: this.percentile(values, 0.95),
        p99: this.percentile(values, 0.99),
      };
    });

    return summary;
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  private sendToAnalytics(report: any): void {
    // Send to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metrics', {
        custom_parameter_1: report.metrics,
        custom_parameter_2: report.connection,
      });
    }
  }

  public destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();

    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    this.metrics = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor({
  enabled: process.env.NODE_ENV === 'production' || process.env.REACT_APP_PERFORMANCE_MONITORING === 'true',
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});

// Export types and utilities
export type { PerformanceMetric, PerformanceConfig };
export { PerformanceMonitor };

// Performance utilities
export const performanceUtils = {
  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    performanceMonitor.measure(`render-${componentName}`, renderFn);
  },

  // Measure async operations
  measureAsync: (operationName: string, asyncFn: () => Promise<any>) => {
    return performanceMonitor.measureAsync(operationName, asyncFn);
  },

  // Measure user interactions
  measureInteraction: (interactionName: string, interactionFn: () => void) => {
    performanceMonitor.measure(`interaction-${interactionName}`, interactionFn);
  },

  // Get performance score
  getPerformanceScore: (): number => {
    const lcp = performanceMonitor.getLatestMetric('largest-contentful-paint');
    const fid = performanceMonitor.getLatestMetric('first-input-delay');
    const cls = performanceMonitor.getLatestMetric('cumulative-layout-shift');

    let score = 100;

    if (lcp && lcp.value > 2500) score -= 30;
    else if (lcp && lcp.value > 1500) score -= 15;

    if (fid && fid.value > 300) score -= 30;
    else if (fid && fid.value > 100) score -= 15;

    if (cls && cls.value > 0.25) score -= 30;
    else if (cls && cls.value > 0.1) score -= 15;

    return Math.max(0, score);
  },
};
