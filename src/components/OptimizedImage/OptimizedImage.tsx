import React, { useState, useEffect, useRef, useCallback } from 'react';
import { optimizeImage, isWebPSupported, generateSrcSet } from '../../utils/imageOptimization';
import './OptimizedImage.css';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableWebP?: boolean;
  enableLazyLoading?: boolean;
  enableResponsive?: boolean;
  breakpoints?: number[];
  onOptimizationComplete?: (result: { size: number; originalSize: number; compressionRatio: number }) => void;
  onError?: (error: Error) => void;
  // Remove the inherited onError from ImgHTMLAttributes
  onErrorEvent?: React.ReactEventHandler<HTMLImageElement>;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc,
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080,
  enableWebP = true,
  enableLazyLoading = true,
  enableResponsive = true,
  breakpoints = [320, 640, 768, 1024, 1280, 1920],
  onOptimizationComplete,
  onError,
  className = '',
  ...props
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [srcSet, setSrcSet] = useState<string>('');
  const [sizes, setSizes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [webpSupported, setWebpSupported] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check WebP support on mount
  useEffect(() => {
    isWebPSupported().then(setWebpSupported);
  }, []);

  // Set up lazy loading
  useEffect(() => {
    if (!enableLazyLoading || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            optimizeImageSrc();
            observerRef.current?.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, enableLazyLoading]);

  // Optimize image when src changes
  useEffect(() => {
    if (!enableLazyLoading) {
      optimizeImageSrc();
    }
  }, [src, enableLazyLoading]);

  const optimizeImageSrc = useCallback(async () => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    try {
      // Fetch the original image
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();

      // Optimize the image
      const optimized = await optimizeImage(blob, {
        quality,
        maxWidth,
        maxHeight,
        format: enableWebP && webpSupported ? 'webp' : 'jpeg',
        enableWebP
      });

      setOptimizedSrc(optimized.url);

      // Generate responsive srcset if enabled
      if (enableResponsive) {
        const { srcset: generatedSrcSet, sizes: generatedSizes } = await generateSrcSet(
          blob,
          breakpoints
        );
        setSrcSet(generatedSrcSet);
        setSizes(generatedSizes);
      }

      // Notify parent of optimization results
      onOptimizationComplete?.({
        size: optimized.size,
        originalSize: optimized.originalSize,
        compressionRatio: optimized.compressionRatio
      });

    } catch (error) {
      console.error('Image optimization failed:', error);
      setHasError(true);
      onError?.(error as Error);
      
      // Fallback to original or provided fallback
      setOptimizedSrc(fallbackSrc || src);
    } finally {
      setIsLoading(false);
    }
  }, [src, quality, maxWidth, maxHeight, enableWebP, webpSupported, enableResponsive, breakpoints, fallbackSrc, onOptimizationComplete, onError]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    
    if (fallbackSrc && optimizedSrc !== fallbackSrc) {
      setOptimizedSrc(fallbackSrc);
    }
  }, [fallbackSrc, optimizedSrc]);

  const imageProps = {
    ref: imgRef,
    src: optimizedSrc,
    alt,
    className: `optimized-image ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''} ${className}`,
    onLoad: handleImageLoad,
    onError: handleImageError,
    ...(srcSet && { srcSet }),
    ...(sizes && { sizes }),
    ...props
  };

  return (
    <div className="optimized-image-container">
      {isLoading && (
        <div className="image-loading-placeholder">
          <div className="loading-spinner"></div>
          <span>Optimizing image...</span>
        </div>
      )}
      
      <img {...imageProps} />
      
      {hasError && (
        <div className="image-error-fallback">
          <span>⚠️ Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
