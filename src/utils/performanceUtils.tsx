import React, { useRef, useEffect, useState, Suspense } from 'react';

// Simple performance monitoring (non-generic)
export const performanceMonitor = {
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  measureBetween: (startMark: string, endMark: string, name: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name);
        if (measures.length > 0) {
          console.log(`[Performance] ${name}: ${measures[0].duration.toFixed(2)}ms`);
        }
      } catch (error) {
        console.warn(`[Performance] Could not measure ${name}:`, error);
      }
    }
  },
};

// Code splitting utilities
export const withSuspense = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props: P) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );
  return WrappedComponent;
};

// Caching utilities
export class MemoryCache {
  private cache = new Map<string, { value: any; timestamp: number; ttl: number }>();

  set(key: string, value: any, ttl = 300000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// React performance hooks
export const usePerformanceOptimization = () => {
  const [isOptimized, setIsOptimized] = useState(true);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsOptimized(!mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsOptimized(!e.matches);
    mediaQuery.addEventListener('change', handler);

    // Detect low-end devices
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    setIsLowEndDevice(memory < 4 || cores < 4);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return { isOptimized, isLowEndDevice };
};

// Image lazy loading utility
export const useLazyImage = (src: string, options: IntersectionObserverInit = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(img);

    return () => observer.disconnect();
  }, [options]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.src = src;
  }, [isInView, src]);

  return { imgRef, isLoaded, isInView };
};

// Web Vitals monitoring
export const useWebVitals = () => {
  const [vitals, setVitals] = useState<{
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  }>({});

  useEffect(() => {
    const observer = new PerformanceObserver((list: PerformanceObserverEntryList) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          setVitals((prev: any) => ({ ...prev, lcp: entry.startTime }));
        }
        if (entry.entryType === 'first-input') {
          setVitals((prev: any) => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
        }
        if (entry.entryType === 'layout-shift') {
          setVitals((prev: any) => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }));
        }
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setVitals((prev: any) => ({ ...prev, fcp: entry.startTime }));
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'] } as any);

    return () => observer.disconnect();
  }, []);

  return vitals;
};
