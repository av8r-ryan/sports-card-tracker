// Image optimization utilities for WebP support and compression
import { useState, useCallback } from 'react';
interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  enableWebP?: boolean;
}

interface OptimizedImageResult {
  blob: Blob;
  url: string;
  size: number;
  originalSize: number;
  compressionRatio: number;
  format: string;
}

class ImageOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Check if WebP is supported
  isWebPSupported(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Check if the browser supports the requested format
  async supportsFormat(format: string): Promise<boolean> {
    if (format === 'webp') {
      return this.isWebPSupported();
    }
    return true; // JPEG and PNG are universally supported
  }

  // Optimize image with compression and format conversion
  async optimizeImage(
    file: File | Blob,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp',
      enableWebP = true
    } = options;

    const originalSize = file.size;
    const image = await this.loadImage(file);
    
    // Calculate new dimensions while maintaining aspect ratio
    const { width, height } = this.calculateDimensions(
      image.width,
      image.height,
      maxWidth,
      maxHeight
    );

    // Set canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw image on canvas
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(image, 0, 0, width, height);

    // Determine the best format to use
    const finalFormat = await this.getBestFormat(format, enableWebP);
    
    // Convert to blob
    const blob = await this.canvasToBlob(finalFormat, quality);
    const url = URL.createObjectURL(blob);
    const compressionRatio = (1 - blob.size / originalSize) * 100;

    return {
      blob,
      url,
      size: blob.size,
      originalSize,
      compressionRatio,
      format: finalFormat
    };
  }

  // Create multiple optimized versions of an image
  async createImageVariants(
    file: File | Blob,
    variants: Array<{
      name: string;
      maxWidth: number;
      maxHeight: number;
      quality: number;
      format?: 'webp' | 'jpeg' | 'png';
    }>
  ): Promise<Record<string, OptimizedImageResult>> {
    const results: Record<string, OptimizedImageResult> = {};

    for (const variant of variants) {
      try {
        const result = await this.optimizeImage(file, {
          maxWidth: variant.maxWidth,
          maxHeight: variant.maxHeight,
          quality: variant.quality,
          format: variant.format || 'webp',
          enableWebP: true
        });
        results[variant.name] = result;
      } catch (error) {
        console.error(`Failed to create variant ${variant.name}:`, error);
      }
    }

    return results;
  }

  // Generate responsive image srcset
  async generateSrcSet(
    file: File | Blob,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
  ): Promise<{ srcset: string; sizes: string }> {
    const variants = breakpoints.map((width, index) => ({
      name: `w${width}`,
      maxWidth: width,
      maxHeight: Math.round(width * 0.75), // 4:3 aspect ratio
      quality: Math.max(0.6, 0.9 - index * 0.05), // Decreasing quality for larger images
      format: 'webp' as const
    }));

    const results = await this.createImageVariants(file, variants);
    
    const srcset = Object.entries(results)
      .map(([name, result]) => {
        const width = name.replace('w', '');
        return `${result.url} ${width}w`;
      })
      .join(', ');

    const sizes = breakpoints
      .map((width, index) => {
        if (index === breakpoints.length - 1) {
          return `${width}px`;
        }
        return `(max-width: ${width}px) ${width}px`;
      })
      .join(', ');

    return { srcset, sizes };
  }

  // Compress image without format conversion
  async compressImage(
    file: File | Blob,
    quality: number = 0.8
  ): Promise<OptimizedImageResult> {
    const image = await this.loadImage(file);
    
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    
    this.ctx.clearRect(0, 0, image.width, image.height);
    this.ctx.drawImage(image, 0, 0);

    const blob = await this.canvasToBlob('image/jpeg', quality);
    const url = URL.createObjectURL(blob);
    const compressionRatio = (1 - blob.size / file.size) * 100;

    return {
      blob,
      url,
      size: blob.size,
      originalSize: file.size,
      compressionRatio,
      format: 'jpeg'
    };
  }

  // Private helper methods
  private loadImage(file: File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private async getBestFormat(
    requestedFormat: string,
    enableWebP: boolean
  ): Promise<string> {
    if (requestedFormat === 'webp' && enableWebP) {
      const webpSupported = await this.isWebPSupported();
      return webpSupported ? 'image/webp' : 'image/jpeg';
    }

    switch (requestedFormat) {
      case 'webp':
        return 'image/webp';
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'image/jpeg';
    }
  }

  private canvasToBlob(format: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        format,
        quality
      );
    });
  }

  // Clean up resources
  cleanup(): void {
    this.canvas.remove();
  }
}

// Global instance
const imageOptimizer = new ImageOptimizer();

// Utility functions
export const optimizeImage = (
  file: File | Blob,
  options?: ImageOptimizationOptions
): Promise<OptimizedImageResult> => {
  return imageOptimizer.optimizeImage(file, options);
};

export const compressImage = (
  file: File | Blob,
  quality?: number
): Promise<OptimizedImageResult> => {
  return imageOptimizer.compressImage(file, quality);
};

export const createImageVariants = (
  file: File | Blob,
  variants: Array<{
    name: string;
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format?: 'webp' | 'jpeg' | 'png';
  }>
): Promise<Record<string, OptimizedImageResult>> => {
  return imageOptimizer.createImageVariants(file, variants);
};

export const generateSrcSet = (
  file: File | Blob,
  breakpoints?: number[]
): Promise<{ srcset: string; sizes: string }> => {
  return imageOptimizer.generateSrcSet(file, breakpoints);
};

export const isWebPSupported = (): Promise<boolean> => {
  return imageOptimizer.isWebPSupported();
};

export const supportsFormat = (format: string): Promise<boolean> => {
  return imageOptimizer.supportsFormat(format);
};

// React hook for image optimization
export const useImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(async (
    file: File | Blob,
    options?: ImageOptimizationOptions
  ) => {
    setIsOptimizing(true);
    setError(null);

    try {
      const result = await optimizeImage(file, options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Optimization failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  return {
    optimize,
    isOptimizing,
    error
  };
};

// Preload images with optimization
export const preloadOptimizedImage = async (
  src: string,
  options?: ImageOptimizationOptions
): Promise<string> => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const optimized = await optimizeImage(blob, options);
    return optimized.url;
  } catch (error) {
    console.error('Failed to preload and optimize image:', error);
    return src; // Fallback to original
  }
};

// Batch optimize multiple images
export const batchOptimizeImages = async (
  files: File[],
  options?: ImageOptimizationOptions
): Promise<OptimizedImageResult[]> => {
  const results: OptimizedImageResult[] = [];
  
  for (const file of files) {
    try {
      const result = await optimizeImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to optimize ${file.name}:`, error);
    }
  }
  
  return results;
};

export default imageOptimizer;
