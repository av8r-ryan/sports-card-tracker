// Bundle analysis utilities for identifying large dependencies and optimization opportunities
import { useState, useCallback, useEffect } from 'react';

interface BundleAnalysisResult {
  totalSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  recommendations: string[];
  warnings: string[];
}

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize?: number;
  modules: ModuleInfo[];
}

interface ModuleInfo {
  name: string;
  size: number;
  percentage: number;
  isNodeModule: boolean;
}

interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  percentage: number;
  isDevDependency: boolean;
  alternatives?: string[];
}

class BundleAnalyzer {
  private performanceObserver: PerformanceObserver | null = null;
  private resourceTimings: PerformanceResourceTiming[] = [];

  constructor() {
    this.initializePerformanceObserver();
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        this.resourceTimings.push(...entries);
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  // Analyze current bundle size and dependencies
  async analyzeBundle(): Promise<BundleAnalysisResult> {
    const chunks = await this.analyzeChunks();
    const dependencies = await this.analyzeDependencies();
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

    const recommendations = this.generateRecommendations(chunks, dependencies);
    const warnings = this.generateWarnings(chunks, dependencies);

    return {
      totalSize,
      chunks,
      dependencies,
      recommendations,
      warnings,
    };
  }

  // Analyze JavaScript chunks
  private async analyzeChunks(): Promise<ChunkInfo[]> {
    const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
    const chunks: ChunkInfo[] = [];

    for (const script of scripts) {
      if (script.src.includes('static/js/')) {
        try {
          const response = await fetch(script.src);
          const blob = await response.blob();
          const size = blob.size;

          // Estimate gzipped size (rough approximation)
          const gzippedSize = Math.round(size * 0.3);

          chunks.push({
            name: this.extractChunkName(script.src),
            size,
            gzippedSize,
            modules: [], // Would need source map analysis for detailed module info
          });
        } catch (error) {
          console.warn(`Failed to analyze chunk ${script.src}:`, error);
        }
      }
    }

    return chunks;
  }

  // Analyze dependencies from package.json and runtime
  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    // This would typically require build-time analysis
    // For runtime analysis, we can only estimate based on loaded resources
    const dependencies: DependencyInfo[] = [];

    // Analyze loaded resources
    for (const resource of this.resourceTimings) {
      if (resource.name.includes('node_modules') || resource.name.includes('chunk')) {
        const name = this.extractDependencyName(resource.name);
        const size = resource.transferSize || 0;

        dependencies.push({
          name,
          version: 'unknown',
          size,
          percentage: 0, // Will be calculated later
          isDevDependency: false,
        });
      }
    }

    return dependencies;
  }

  // Generate optimization recommendations
  private generateRecommendations(chunks: ChunkInfo[], dependencies: DependencyInfo[]): string[] {
    const recommendations: string[] = [];
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

    // Large chunk recommendations
    const largeChunks = chunks.filter((chunk) => chunk.size > 500000); // 500KB
    if (largeChunks.length > 0) {
      recommendations.push(`Consider code splitting for large chunks: ${largeChunks.map((c) => c.name).join(', ')}`);
    }

    // Duplicate dependencies
    const duplicateDeps = this.findDuplicateDependencies(dependencies);
    if (duplicateDeps.length > 0) {
      recommendations.push(`Remove duplicate dependencies: ${duplicateDeps.join(', ')}`);
    }

    // Unused dependencies (would need static analysis)
    if (totalSize > 2000000) {
      // 2MB
      recommendations.push('Bundle size is large. Consider tree shaking and removing unused code.');
    }

    // Image optimization
    const imageResources = this.resourceTimings.filter((r) => r.name.match(/\.(jpg|jpeg|png|gif|svg)$/i));
    if (imageResources.length > 0) {
      recommendations.push('Consider optimizing images and using WebP format.');
    }

    return recommendations;
  }

  // Generate warnings for potential issues
  private generateWarnings(chunks: ChunkInfo[], dependencies: DependencyInfo[]): string[] {
    const warnings: string[] = [];

    // Large individual chunks
    chunks.forEach((chunk) => {
      if (chunk.size > 1000000) {
        // 1MB
        warnings.push(`Chunk ${chunk.name} is very large (${this.formatBytes(chunk.size)})`);
      }
    });

    // Many chunks (potential over-splitting)
    if (chunks.length > 20) {
      warnings.push('Many small chunks detected. Consider consolidating some chunks.');
    }

    // Slow loading resources
    const slowResources = this.resourceTimings.filter((r) => r.duration > 1000);
    if (slowResources.length > 0) {
      warnings.push(`${slowResources.length} resources took longer than 1s to load`);
    }

    return warnings;
  }

  // Helper methods
  private extractChunkName(src: string): string {
    const match = src.match(/static\/js\/([^/]+)\.js/);
    return match ? match[1] : 'unknown';
  }

  private extractDependencyName(url: string): string {
    const match = url.match(/node_modules\/([^/]+)/);
    return match ? match[1] : 'unknown';
  }

  private findDuplicateDependencies(dependencies: DependencyInfo[]): string[] {
    const nameCount = new Map<string, number>();
    dependencies.forEach((dep) => {
      nameCount.set(dep.name, (nameCount.get(dep.name) || 0) + 1);
    });

    return Array.from(nameCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([name, _]) => name);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // Get performance metrics
  getPerformanceMetrics(): {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0, // Would need LCP observer
    };
  }

  // Clean up
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Global instance
const bundleAnalyzer = new BundleAnalyzer();

// Utility functions
export const analyzeBundle = (): Promise<BundleAnalysisResult> => {
  return bundleAnalyzer.analyzeBundle();
};

export const getPerformanceMetrics = () => {
  return bundleAnalyzer.getPerformanceMetrics();
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// React hook for bundle analysis
export const useBundleAnalysis = () => {
  const [analysis, setAnalysis] = useState<BundleAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeBundle();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    // Run analysis on mount
    runAnalysis();
  }, [runAnalysis]);

  return {
    analysis,
    isAnalyzing,
    error,
    runAnalysis,
  };
};

export default bundleAnalyzer;
