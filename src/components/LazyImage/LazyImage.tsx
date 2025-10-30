import React, { useState, useRef, useEffect } from 'react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableWebP?: boolean;
  enableResponsive?: boolean;
  onOptimizationComplete?: (result: { size: number; originalSize: number; compressionRatio: number }) => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  quality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080,
  enableWebP = true,
  enableResponsive = true,
  onOptimizationComplete
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(container);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (error: Error) => {
    setHasError(true);
    onError?.();
  };

  const handleOptimizationComplete = (result: { size: number; originalSize: number; compressionRatio: number }) => {
    onOptimizationComplete?.(result);
  };

  return (
    <div ref={containerRef} className={`lazy-image-container ${className}`}>
      {isInView ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fallbackSrc={placeholder}
          quality={quality}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          enableWebP={enableWebP}
          enableLazyLoading={false} // We handle lazy loading ourselves
          enableResponsive={enableResponsive}
          onLoad={handleLoad}
          onError={handleError}
          onOptimizationComplete={handleOptimizationComplete}
          className="lazy-image"
        />
      ) : (
        <img
          src={placeholder}
          alt={alt}
          className="lazy-image placeholder"
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
