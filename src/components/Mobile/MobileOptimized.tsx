import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useTouchGestures, useSwipe, useMobileViewport, triggerHapticFeedback } from '../../utils/touchUtils';
import { useResponsive, useMobileOptimization } from '../../utils/responsiveUtils';
import './MobileOptimized.css';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  enableSwipe?: boolean;
  enablePullToRefresh?: boolean;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onPullToRefresh?: () => void;
  enableHapticFeedback?: boolean;
  enableTouchFeedback?: boolean;
  swipeThreshold?: number;
  pullToRefreshThreshold?: number;
}

const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className = '',
  enableSwipe = false,
  enablePullToRefresh = false,
  onSwipe,
  onPullToRefresh,
  enableHapticFeedback = true,
  enableTouchFeedback = true,
  swipeThreshold = 50,
  pullToRefreshThreshold = 80
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useResponsive();
  const { shouldReduceAnimations } = useMobileOptimization();
  const viewport = useMobileViewport();
  
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, pullToRefreshThreshold], [0.5, 1]);
  const scale = useTransform(y, [0, pullToRefreshThreshold], [0.8, 1]);

  // Touch gesture handlers
  const handleGesture = (gesture: any) => {
    if (enableHapticFeedback && gesture.type === 'tap') {
      triggerHapticFeedback('light');
    }
  };

  const handleSwipe = (direction: any) => {
    if (enableHapticFeedback) {
      triggerHapticFeedback('medium');
    }
    onSwipe?.(direction.direction);
  };

  const gestureHandlers = useTouchGestures(handleGesture, {
    preventDefault: false
  });

  const swipeHandlers = useSwipe(handleSwipe, {
    threshold: swipeThreshold,
    preventDefault: false
  });

  // Pull to refresh handlers
  const handleDrag = (event: any, info: PanInfo) => {
    if (!enablePullToRefresh) return;
    
    const currentY = info.offset.y;
    setPullDistance(Math.max(0, currentY));
    
    if (currentY > 0) {
      setIsPulling(true);
      y.set(currentY);
    } else {
      setIsPulling(false);
      y.set(0);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!enablePullToRefresh) return;
    
    if (info.offset.y > pullToRefreshThreshold) {
      setIsRefreshing(true);
      onPullToRefresh?.();
      
      if (enableHapticFeedback) {
        triggerHapticFeedback('heavy');
      }
      
      // Reset after refresh
      setTimeout(() => {
        setIsRefreshing(false);
        setIsPulling(false);
        y.set(0);
        setPullDistance(0);
      }, 1000);
    } else {
      setIsPulling(false);
      y.set(0);
      setPullDistance(0);
    }
  };

  // Touch feedback effect
  useEffect(() => {
    if (!enableTouchFeedback || !containerRef.current) return;
    
    const cleanup = addTouchFeedback(containerRef.current);
    return cleanup;
  }, [enableTouchFeedback]);

  // Responsive adjustments
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      
      // Adjust for mobile viewport
      if (isMobile) {
        container.style.minHeight = `${viewport.height}px`;
        container.style.touchAction = 'pan-y';
      }
      
      // Adjust for tablet
      if (isTablet) {
        container.style.touchAction = 'pan-x pan-y';
      }
    }
  }, [isMobile, isTablet, viewport.height]);

  const combinedHandlers = {
    ...gestureHandlers,
    ...(enableSwipe ? swipeHandlers : {})
  } as any;

  return (
    <motion.div
      ref={containerRef}
      className={`mobile-optimized ${className}`}
      style={{
        y: enablePullToRefresh ? y : undefined,
        opacity: enablePullToRefresh ? opacity : undefined,
        scale: enablePullToRefresh ? scale : undefined
      }}
      drag={enablePullToRefresh ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      {...combinedHandlers}
      animate={shouldReduceAnimations ? {} : undefined}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (
        <motion.div
          className="pull-to-refresh-indicator"
          style={{
            opacity: isPulling ? 1 : 0,
            scale: isPulling ? 1 : 0.8
          }}
        >
          <div className="refresh-icon">
            {isRefreshing ? '🔄' : '⬇️'}
          </div>
          <div className="refresh-text">
            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
          </div>
        </motion.div>
      )}
      
      {/* Content */}
      <div className="mobile-content">
        {children}
      </div>
      
      {/* Touch feedback overlay */}
      {enableTouchFeedback && (
        <div className="touch-feedback-overlay" />
      )}
    </motion.div>
  );
};

// Mobile-optimized button component
interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  enableHapticFeedback?: boolean;
  className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  enableHapticFeedback = true,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const { shouldReduceAnimations } = useMobileOptimization();

  const handleClick = () => {
    if (disabled) return;
    
    if (enableHapticFeedback && isMobile) {
      triggerHapticFeedback('light');
    }
    
    onClick?.();
  };

  const buttonClass = `mobile-button mobile-button--${variant} mobile-button--${size} ${className}`;

  return (
    <motion.button
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled}
      whileHover={shouldReduceAnimations ? {} : { scale: 1.02 }}
      whileTap={shouldReduceAnimations ? {} : { scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  enableSwipe?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  onClick,
  enableSwipe = false,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const { shouldReduceAnimations } = useMobileOptimization();
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const handleDrag = (event: any, info: PanInfo) => {
    if (!enableSwipe) return;
    
    setIsDragging(true);
    setDragX(info.offset.x);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!enableSwipe) return;
    
    setIsDragging(false);
    
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    
    setDragX(0);
  };

  const cardClass = `mobile-card ${isDragging ? 'mobile-card--dragging' : ''} ${className}`;

  return (
    <motion.div
      className={cardClass}
      onClick={onClick}
      drag={enableSwipe ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        x: enableSwipe ? dragX : 0,
        scale: isDragging ? 0.98 : 1
      }}
      whileHover={shouldReduceAnimations ? {} : { y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Mobile-optimized list component
interface MobileListProps {
  children: React.ReactNode;
  enableInfiniteScroll?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
}

export const MobileList: React.FC<MobileListProps> = ({
  children,
  enableInfiniteScroll = false,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enableInfiniteScroll || !isMobile) return;

    const handleScroll = () => {
      if (!listRef.current || !hasMore || loading) return;

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        onLoadMore?.();
      }
    };

    const list = listRef.current;
    list?.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      list?.removeEventListener('scroll', handleScroll);
    };
  }, [enableInfiniteScroll, hasMore, loading, onLoadMore, isMobile]);

  return (
    <div
      ref={listRef}
      className={`mobile-list ${className}`}
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
      
      {enableInfiniteScroll && hasMore && (
        <div className="mobile-list-loading">
          {loading ? 'Loading...' : 'Pull up for more'}
        </div>
      )}
    </div>
  );
};

// Helper function for touch feedback (from touchUtils)
const addTouchFeedback = (element: HTMLElement) => {
  const addRipple = (e: TouchEvent) => {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.touches[0].clientX - rect.left - size / 2;
    const y = e.touches[0].clientY - rect.top - size / 2;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  element.addEventListener('touchstart', addRipple);
  
  return () => {
    element.removeEventListener('touchstart', addRipple);
  };
};

export default MobileOptimized;
