// Tree shaking utilities for eliminating unused code
import { useState, useEffect } from 'react';

interface TreeShakingConfig {
  enableSideEffects: boolean;
  optimizeImports: boolean;
  removeUnusedExports: boolean;
  analyzeBundle: boolean;
}

interface UnusedCodeReport {
  unusedImports: string[];
  unusedExports: string[];
  deadCode: string[];
  recommendations: string[];
  estimatedSavings: number;
}

class TreeShakingAnalyzer {
  private config: TreeShakingConfig;

  constructor(
    config: TreeShakingConfig = {
      enableSideEffects: true,
      optimizeImports: true,
      removeUnusedExports: true,
      analyzeBundle: true,
    }
  ) {
    this.config = config;
  }

  // Analyze code for tree shaking opportunities
  analyzeCode(code: string, filePath: string): UnusedCodeReport {
    const unusedImports: string[] = [];
    const unusedExports: string[] = [];
    const deadCode: string[] = [];
    const recommendations: string[] = [];

    // Parse imports
    const imports = this.extractImports(code);
    const exports = this.extractExports(code);
    const usedIdentifiers = this.extractUsedIdentifiers(code);

    // Find unused imports
    imports.forEach((importItem) => {
      if (!this.isImportUsed(importItem, usedIdentifiers)) {
        unusedImports.push(importItem.name);
      }
    });

    // Find unused exports
    exports.forEach((exportItem) => {
      if (!this.isExportUsed(exportItem, usedIdentifiers)) {
        unusedExports.push(exportItem.name);
      }
    });

    // Find dead code (unreachable code)
    const deadCodeBlocks = this.findDeadCode(code);
    deadCode.push(...deadCodeBlocks);

    // Generate recommendations
    if (unusedImports.length > 0) {
      recommendations.push(`Remove unused imports: ${unusedImports.join(', ')}`);
    }

    if (unusedExports.length > 0) {
      recommendations.push(`Remove unused exports: ${unusedExports.join(', ')}`);
    }

    if (deadCode.length > 0) {
      recommendations.push(`Remove dead code blocks: ${deadCode.length} found`);
    }

    // Calculate estimated savings
    const estimatedSavings = this.calculateSavings(unusedImports, unusedExports, deadCode);

    return {
      unusedImports,
      unusedExports,
      deadCode,
      recommendations,
      estimatedSavings,
    };
  }

  // Extract import statements from code
  private extractImports(
    code: string
  ): Array<{ name: string; source: string; type: 'default' | 'named' | 'namespace' }> {
    const imports: Array<{ name: string; source: string; type: 'default' | 'named' | 'namespace' }> = [];

    // Match various import patterns
    const importRegex =
      /import\s+(?:(\w+)\s+from\s+)?['"]([^'"]+)['"]|import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]|import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;

    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(code)) !== null) {
      if (match[1] && match[2]) {
        // Default import: import name from 'source'
        imports.push({ name: match[1], source: match[2], type: 'default' });
      } else if (match[3] && match[4]) {
        // Named imports: import { name1, name2 } from 'source'
        const names = match[3].split(',').map((n) => n.trim());
        const source = match[4];
        names.forEach((name) => {
          imports.push({ name, source, type: 'named' });
        });
      } else if (match[5] && match[6]) {
        // Namespace import: import * as name from 'source'
        imports.push({ name: match[5], source: match[6], type: 'namespace' });
      }
    }

    return imports;
  }

  // Extract export statements from code
  private extractExports(code: string): Array<{ name: string; type: 'default' | 'named' | 'class' | 'function' }> {
    const exports: Array<{ name: string; type: 'default' | 'named' | 'class' | 'function' }> = [];

    // Match various export patterns
    const exportRegex =
      /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)|export\s*\{\s*([^}]+)\s*\}|export\s+default\s+(\w+)/g;

    let match;
    while ((match = exportRegex.exec(code)) !== null) {
      if (match[1]) {
        // Named export: export const/let/var/function/class name
        exports.push({ name: match[1], type: 'named' });
      } else if (match[2]) {
        // Named exports: export { name1, name2 }
        const names = match[2].split(',').map((n) => n.trim());
        names.forEach((name) => {
          exports.push({ name, type: 'named' });
        });
      } else if (match[3]) {
        // Default export: export default name
        exports.push({ name: match[3], type: 'default' });
      }
    }

    return exports;
  }

  // Extract used identifiers from code
  private extractUsedIdentifiers(code: string): Set<string> {
    const identifiers = new Set<string>();

    // Match identifier usage patterns
    const identifierRegex = /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g;
    let match;
    while ((match = identifierRegex.exec(code)) !== null) {
      identifiers.add(match[0]);
    }

    return identifiers;
  }

  // Check if an import is used in the code
  private isImportUsed(
    importItem: { name: string; source: string; type: string },
    usedIdentifiers: Set<string>
  ): boolean {
    return usedIdentifiers.has(importItem.name);
  }

  // Check if an export is used in the code
  private isExportUsed(exportItem: { name: string; type: string }, usedIdentifiers: Set<string>): boolean {
    return usedIdentifiers.has(exportItem.name);
  }

  // Find dead code blocks
  private findDeadCode(code: string): string[] {
    const deadCode: string[] = [];

    // Look for unreachable code after return statements
    const returnRegex = /return[^;]*;[\s\S]*?(?=function|class|const|let|var|$)/g;
    let match;
    while ((match = returnRegex.exec(code)) !== null) {
      const afterReturn = match[0].substring(match[0].indexOf(';') + 1).trim();
      if (afterReturn && !afterReturn.match(/^\s*$/)) {
        deadCode.push(afterReturn);
      }
    }

    return deadCode;
  }

  // Calculate estimated savings in bytes
  private calculateSavings(unusedImports: string[], unusedExports: string[], deadCode: string[]): number {
    let savings = 0;

    // Estimate savings from unused imports (rough approximation)
    savings += unusedImports.length * 50; // ~50 bytes per unused import

    // Estimate savings from unused exports
    savings += unusedExports.length * 30; // ~30 bytes per unused export

    // Estimate savings from dead code
    deadCode.forEach((block) => {
      savings += block.length;
    });

    return savings;
  }

  // Optimize imports for better tree shaking
  optimizeImports(code: string): string {
    if (!this.config.optimizeImports) {
      return code;
    }

    let optimizedCode = code;

    // Convert namespace imports to named imports where possible
    optimizedCode = this.convertNamespaceToNamedImports(optimizedCode);

    // Remove unused imports
    const report = this.analyzeCode(optimizedCode, '');
    optimizedCode = this.removeUnusedImports(optimizedCode, report.unusedImports);

    return optimizedCode;
  }

  // Convert namespace imports to named imports
  private convertNamespaceToNamedImports(code: string): string {
    // This is a simplified example - in practice, you'd need more sophisticated analysis
    return code.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, (match, namespaceName, source) => {
      // Check if only specific properties are used
      const usageRegex = new RegExp(`\\b${namespaceName}\\.(\\w+)`, 'g');
      const usedProperties = new Set<string>();
      let usageMatch;
      while ((usageMatch = usageRegex.exec(code)) !== null) {
        usedProperties.add(usageMatch[1]);
      }

      if (usedProperties.size > 0 && usedProperties.size < 5) {
        // Convert to named imports
        const properties = Array.from(usedProperties).join(', ');
        return `import { ${properties} } from '${source}'`;
      }

      return match; // Keep namespace import if many properties are used
    });
  }

  // Remove unused imports from code
  private removeUnusedImports(code: string, unusedImports: string[]): string {
    let optimizedCode = code;

    unusedImports.forEach((importName) => {
      // Remove import lines that only contain unused imports
      const importLineRegex = new RegExp(
        `import\\s+\\{[^}]*\\b${importName}\\b[^}]*\\}\\s+from\\s+['"][^'"]+['"];?\\s*`,
        'g'
      );
      optimizedCode = optimizedCode.replace(importLineRegex, '');
    });

    return optimizedCode;
  }

  // Generate tree shaking configuration for webpack
  generateWebpackConfig(): object {
    return {
      optimization: {
        usedExports: true,
        sideEffects: this.config.enableSideEffects ? false : '*.css',
        providedExports: true,
        concatenateModules: true,
      },
      resolve: {
        mainFields: ['browser', 'module', 'main'],
      },
    };
  }

  // Generate package.json sideEffects configuration
  generatePackageJsonSideEffects(): string[] {
    if (this.config.enableSideEffects) {
      return ['*.css', '*.scss', '*.sass', '*.less'];
    }
    return [];
  }
}

// Global instance
const treeShakingAnalyzer = new TreeShakingAnalyzer();

// Utility functions
export const analyzeTreeShaking = (code: string, filePath: string): UnusedCodeReport => {
  return treeShakingAnalyzer.analyzeCode(code, filePath);
};

export const optimizeImports = (code: string): string => {
  return treeShakingAnalyzer.optimizeImports(code);
};

export const generateWebpackConfig = (): object => {
  return treeShakingAnalyzer.generateWebpackConfig();
};

export const generatePackageJsonSideEffects = (): string[] => {
  return treeShakingAnalyzer.generatePackageJsonSideEffects();
};

// React hook for tree shaking analysis
export const useTreeShakingAnalysis = (code: string) => {
  const [report, setReport] = useState<UnusedCodeReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!code) return;

    setIsAnalyzing(true);

    // Simulate analysis (in real implementation, this would be more sophisticated)
    setTimeout(() => {
      const analysisReport = analyzeTreeShaking(code, '');
      setReport(analysisReport);
      setIsAnalyzing(false);
    }, 100);
  }, [code]);

  return {
    report,
    isAnalyzing,
  };
};

export default treeShakingAnalyzer;
