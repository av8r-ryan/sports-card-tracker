// Bundle analysis utilities
interface BundleInfo {
  name: string;
  size: number;
  gzippedSize?: number;
  dependencies: string[];
  chunks: string[];
  modules: ModuleInfo[];
}

interface ModuleInfo {
  name: string;
  size: number;
  gzippedSize?: number;
  type: 'javascript' | 'css' | 'image' | 'font' | 'other';
  isNodeModule: boolean;
  isDuplicate: boolean;
  duplicateOf?: string;
}

interface BundleAnalysis {
  totalSize: number;
  totalGzippedSize: number;
  bundleCount: number;
  moduleCount: number;
  duplicateModules: ModuleInfo[];
  largeModules: ModuleInfo[];
  unusedModules: ModuleInfo[];
  recommendations: string[];
  treeShakingOpportunities: string[];
  codeSplittingOpportunities: string[];
}

class BundleAnalyzer {
  private bundleInfo: BundleInfo[] = [];
  private analysis: BundleAnalysis | null = null;

  constructor() {
    this.analyzeBundles();
  }

  private analyzeBundles(): void {
    // This would typically read from webpack-bundle-analyzer output
    // or webpack stats in a real implementation
    this.bundleInfo = this.extractBundleInfo();
    this.analysis = this.performAnalysis();
  }

  private extractBundleInfo(): BundleInfo[] {
    // In a real implementation, this would parse webpack stats
    // For now, we'll return mock data structure
    return [
      {
        name: 'main',
        size: 1024 * 1024, // 1MB
        gzippedSize: 256 * 1024, // 256KB
        dependencies: ['react', 'react-dom', 'framer-motion'],
        chunks: ['main', 'vendors'],
        modules: [
          {
            name: 'react',
            size: 128 * 1024,
            gzippedSize: 32 * 1024,
            type: 'javascript',
            isNodeModule: true,
            isDuplicate: false
          },
          {
            name: 'framer-motion',
            size: 256 * 1024,
            gzippedSize: 64 * 1024,
            type: 'javascript',
            isNodeModule: true,
            isDuplicate: false
          }
        ]
      }
    ];
  }

  private performAnalysis(): BundleAnalysis {
    const totalSize = this.bundleInfo.reduce((sum, bundle) => sum + bundle.size, 0);
    const totalGzippedSize = this.bundleInfo.reduce((sum, bundle) => sum + (bundle.gzippedSize || 0), 0);
    const allModules = this.bundleInfo.flatMap(bundle => bundle.modules);
    
    const duplicateModules = allModules.filter(module => module.isDuplicate);
    const largeModules = allModules.filter(module => module.size > 100 * 1024); // > 100KB
    const unusedModules = this.detectUnusedModules(allModules);
    
    const recommendations = this.generateRecommendations(duplicateModules, largeModules, unusedModules);
    const treeShakingOpportunities = this.findTreeShakingOpportunities(allModules);
    const codeSplittingOpportunities = this.findCodeSplittingOpportunities(this.bundleInfo);

    return {
      totalSize,
      totalGzippedSize,
      bundleCount: this.bundleInfo.length,
      moduleCount: allModules.length,
      duplicateModules,
      largeModules,
      unusedModules,
      recommendations,
      treeShakingOpportunities,
      codeSplittingOpportunities
    };
  }

  private detectUnusedModules(modules: ModuleInfo[]): ModuleInfo[] {
    // This would typically use webpack's unused exports analysis
    // For now, return empty array
    return [];
  }

  private generateRecommendations(
    duplicates: ModuleInfo[],
    large: ModuleInfo[],
    unused: ModuleInfo[]
  ): string[] {
    const recommendations: string[] = [];

    if (duplicates.length > 0) {
      recommendations.push(`Remove ${duplicates.length} duplicate modules to save ${this.formatBytes(duplicates.reduce((sum, m) => sum + m.size, 0))}`);
    }

    if (large.length > 0) {
      recommendations.push(`Consider code splitting for ${large.length} large modules (>100KB)`);
    }

    if (unused.length > 0) {
      recommendations.push(`Remove ${unused.length} unused modules to reduce bundle size`);
    }

    if (this.analysis && this.analysis.totalSize > 2 * 1024 * 1024) {
      recommendations.push('Bundle size exceeds 2MB - consider aggressive code splitting');
    }

    if (this.analysis && this.analysis.totalGzippedSize > 500 * 1024) {
      recommendations.push('Gzipped bundle size exceeds 500KB - optimize for mobile');
    }

    return recommendations;
  }

  private findTreeShakingOpportunities(modules: ModuleInfo[]): string[] {
    const opportunities: string[] = [];
    
    // Look for modules that might benefit from tree shaking
    const nodeModules = modules.filter(m => m.isNodeModule);
    const largeNodeModules = nodeModules.filter(m => m.size > 50 * 1024);
    
    largeNodeModules.forEach(module => {
      opportunities.push(`Consider tree shaking ${module.name} - only import needed functions`);
    });

    return opportunities;
  }

  private findCodeSplittingOpportunities(bundles: BundleInfo[]): string[] {
    const opportunities: string[] = [];
    
    bundles.forEach(bundle => {
      if (bundle.size > 500 * 1024) {
        opportunities.push(`Split ${bundle.name} bundle (${this.formatBytes(bundle.size)}) into smaller chunks`);
      }
      
      const largeModules = bundle.modules.filter(m => m.size > 100 * 1024);
      if (largeModules.length > 0) {
        opportunities.push(`Extract large modules from ${bundle.name}: ${largeModules.map(m => m.name).join(', ')}`);
      }
    });

    return opportunities;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public getAnalysis(): BundleAnalysis | null {
    return this.analysis;
  }

  public getBundleInfo(): BundleInfo[] {
    return this.bundleInfo;
  }

  public getModuleSize(moduleName: string): number {
    const allModules = this.bundleInfo.flatMap(bundle => bundle.modules);
    const module = allModules.find(m => m.name === moduleName);
    return module ? module.size : 0;
  }

  public getLargestModules(count: number = 10): ModuleInfo[] {
    const allModules = this.bundleInfo.flatMap(bundle => bundle.modules);
    return allModules
      .sort((a, b) => b.size - a.size)
      .slice(0, count);
  }

  public getDuplicateModules(): ModuleInfo[] {
    return this.analysis?.duplicateModules || [];
  }

  public getUnusedModules(): ModuleInfo[] {
    return this.analysis?.unusedModules || [];
  }

  public getRecommendations(): string[] {
    return this.analysis?.recommendations || [];
  }

  public generateReport(): string {
    if (!this.analysis) return 'No analysis available';

    const { totalSize, totalGzippedSize, bundleCount, moduleCount, recommendations } = this.analysis;
    
    let report = `# Bundle Analysis Report\n\n`;
    report += `## Summary\n`;
    report += `- Total Size: ${this.formatBytes(totalSize)}\n`;
    report += `- Gzipped Size: ${this.formatBytes(totalGzippedSize)}\n`;
    report += `- Bundles: ${bundleCount}\n`;
    report += `- Modules: ${moduleCount}\n\n`;
    
    report += `## Recommendations\n`;
    recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    
    report += `\n## Largest Modules\n`;
    this.getLargestModules(10).forEach((module, index) => {
      report += `${index + 1}. ${module.name}: ${this.formatBytes(module.size)}\n`;
    });
    
    return report;
  }

  public exportAnalysis(): string {
    return JSON.stringify({
      analysis: this.analysis,
      bundleInfo: this.bundleInfo,
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}

// Bundle optimization utilities
export const bundleOptimizer = {
  // Check if a module should be code split
  shouldCodeSplit: (moduleName: string, size: number): boolean => {
    const largeModuleThreshold = 100 * 1024; // 100KB
    const codeSplitModules = ['framer-motion', 'chart.js', 'lodash'];
    
    return size > largeModuleThreshold || codeSplitModules.includes(moduleName);
  },

  // Get optimal chunk size
  getOptimalChunkSize: (): number => {
    return 200 * 1024; // 200KB
  },

  // Check if module should be lazy loaded
  shouldLazyLoad: (moduleName: string): boolean => {
    const lazyLoadModules = [
      'reports',
      'admin',
      'ebay-listings',
      'collections'
    ];
    
    return lazyLoadModules.some(name => moduleName.includes(name));
  },

  // Get compression ratio
  getCompressionRatio: (originalSize: number, compressedSize: number): number => {
    return ((originalSize - compressedSize) / originalSize) * 100;
  },

  // Estimate loading time
  estimateLoadingTime: (size: number, connectionSpeed: number = 1.5): number => {
    // connectionSpeed in Mbps
    const sizeInMB = size / (1024 * 1024);
    return (sizeInMB * 8) / connectionSpeed; // seconds
  }
};

// Create singleton instance
export const bundleAnalyzer = new BundleAnalyzer();

// Export types
export type { BundleInfo, ModuleInfo, BundleAnalysis };
