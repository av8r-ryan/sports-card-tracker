import React, { useState, useEffect, useRef, useCallback } from 'react';
import { logDebug, logInfo } from '../../utils/logger';
import './Carousel.css';

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  value?: string | number;
  category?: string;
  onClick?: () => void;
  metadata?: Record<string, any>;
}

interface CarouselProps {
  items: CarouselItem[];
  autoScroll?: boolean;
  scrollInterval?: number;
  pauseOnHover?: boolean;
  showNavigation?: boolean;
  showDots?: boolean;
  itemsPerView?: number;
  className?: string;
  onItemClick?: (item: CarouselItem) => void;
  onItemHover?: (item: CarouselItem) => void;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoScroll = true,
  scrollInterval = 3000,
  pauseOnHover = true,
  showNavigation = true,
  showDots = true,
  itemsPerView = 3,
  className = '',
  onItemClick,
  onItemHover
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    logDebug('Carousel', 'Carousel component mounted', { 
      itemCount: items.length, 
      autoScroll, 
      scrollInterval,
      itemsPerView 
    });
  }, [items.length, autoScroll, scrollInterval, itemsPerView]);

  const startAutoScroll = useCallback(() => {
    if (autoScroll && !isPaused && !isHovered && items.length > itemsPerView) {
      logDebug('Carousel', 'Starting auto-scroll', { currentIndex, scrollInterval });
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = (prev + 1) % items.length;
          logDebug('Carousel', 'Auto-scrolling to next item', { from: prev, to: nextIndex });
          return nextIndex;
        });
      }, scrollInterval);
    }
  }, [autoScroll, isPaused, isHovered, items.length, itemsPerView, scrollInterval]);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      logDebug('Carousel', 'Stopping auto-scroll');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % items.length;
    logInfo('Carousel', 'Manual navigation to next', { from: currentIndex, to: nextIndex });
    setCurrentIndex(nextIndex);
  }, [currentIndex, items.length]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    logInfo('Carousel', 'Manual navigation to previous', { from: currentIndex, to: prevIndex });
    setCurrentIndex(prevIndex);
  }, [currentIndex, items.length]);

  const goToSlide = useCallback((index: number) => {
    logInfo('Carousel', 'Manual navigation to slide', { from: currentIndex, to: index });
    setCurrentIndex(index);
  }, [currentIndex]);

  const handleItemClick = useCallback((item: CarouselItem) => {
    logInfo('Carousel', 'Item clicked', { itemId: item.id, itemTitle: item.title });
    if (onItemClick) {
      onItemClick(item);
    }
    if (item.onClick) {
      item.onClick();
    }
  }, [onItemClick]);

  const handleItemHover = useCallback((item: CarouselItem) => {
    logDebug('Carousel', 'Item hovered', { itemId: item.id, itemTitle: item.title });
    if (onItemHover) {
      onItemHover(item);
    }
  }, [onItemHover]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      logDebug('Carousel', 'Mouse entered - pausing auto-scroll');
      setIsHovered(true);
      stopAutoScroll();
    }
  }, [pauseOnHover, stopAutoScroll]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      logDebug('Carousel', 'Mouse left - resuming auto-scroll');
      setIsHovered(false);
    }
  }, [pauseOnHover]);

  const togglePause = useCallback(() => {
    logInfo('Carousel', 'Toggle pause', { currentPaused: isPaused });
    setIsPaused(prev => !prev);
  }, [isPaused]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && !isPaused && !isHovered && items.length > itemsPerView) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    return () => stopAutoScroll();
  }, [autoScroll, isPaused, isHovered, items.length, itemsPerView, startAutoScroll, stopAutoScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAutoScroll();
  }, [stopAutoScroll]);

  if (items.length === 0) {
    logDebug('Carousel', 'No items to display');
    return (
      <div className={`carousel empty ${className}`}>
        <div className="carousel-empty">
          <p>No items to display</p>
        </div>
      </div>
    );
  }

  const maxIndex = Math.max(0, items.length - itemsPerView);
  const clampedIndex = Math.min(currentIndex, maxIndex);

  return (
    <div 
      className={`carousel ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-header">
        <div className="carousel-controls">
          {showNavigation && items.length > itemsPerView && (
            <>
              <button 
                className="carousel-btn prev"
                onClick={goToPrevious}
                aria-label="Previous items"
              >
                <span className="carousel-arrow">‹</span>
              </button>
              <button 
                className="carousel-btn next"
                onClick={goToNext}
                aria-label="Next items"
              >
                <span className="carousel-arrow">›</span>
              </button>
            </>
          )}
          <button 
            className={`carousel-btn pause ${isPaused ? 'paused' : ''}`}
            onClick={togglePause}
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            <span className="pause-icon">
              {isPaused ? '▶' : '⏸'}
            </span>
          </button>
        </div>
      </div>

      <div className="carousel-container" ref={carouselRef}>
        <div 
          className="carousel-track"
          style={{
            transform: `translateX(-${clampedIndex * (100 / itemsPerView)}%)`,
            width: `${(items.length * 100) / itemsPerView}%`
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
              style={{ width: `${100 / items.length}%` }}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => handleItemHover(item)}
            >
              <div className="carousel-item-content">
                {item.image && (
                  <div className="carousel-item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                )}
                {item.icon && !item.image && (
                  <div className="carousel-item-icon">
                    {item.icon}
                  </div>
                )}
                <div className="carousel-item-text">
                  <h3 className="carousel-item-title">{item.title}</h3>
                  <p className="carousel-item-description">{item.description}</p>
                  {item.value && (
                    <div className="carousel-item-value">{item.value}</div>
                  )}
                  {item.category && (
                    <div className="carousel-item-category">{item.category}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDots && items.length > itemsPerView && (
        <div className="carousel-dots">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === clampedIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
