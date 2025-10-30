import { useCallback, useRef, useState, useEffect } from 'react';

// Touch interaction types
export interface TouchPosition {
  x: number;
  y: number;
}

// Helper function to get touch position
const getTouchPosition = (e: TouchEvent): TouchPosition => ({
  x: e.touches[0]?.clientX || 0,
  y: e.touches[0]?.clientY || 0,
});

export interface SwipeDirection {
  direction: 'up' | 'down' | 'left' | 'right' | null;
  distance: number;
  velocity: number;
}

export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'pan';
  position?: TouchPosition;
  direction?: SwipeDirection;
  scale?: number;
  duration?: number;
}

// Touch detection utilities
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTabletDevice = (): boolean => {
  return (
    /iPad|Android(?=.*\bMobile\b)/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

// Touch event handlers
export const useTouchGestures = (
  onGesture: (gesture: TouchGesture) => void,
  options: {
    swipeThreshold?: number;
    longPressDelay?: number;
    doubleTapDelay?: number;
    preventDefault?: boolean;
  } = {}
) => {
  const { swipeThreshold = 50, longPressDelay = 500, doubleTapDelay = 300, preventDefault = true } = options;

  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartTime = useRef<number>(0);

  const getSwipeDirection = (start: TouchPosition, end: TouchPosition): SwipeDirection => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / (Date.now() - touchStartTime.current);

    let direction: SwipeDirection['direction'] = null;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return { direction, distance, velocity };
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const position = getTouchPosition(e);
      setTouchStart(position);
      setTouchEnd(null);
      touchStartTime.current = Date.now();

      // Long press detection
      longPressTimer.current = setTimeout(() => {
        onGesture({
          type: 'long-press',
          position,
          duration: longPressDelay,
        });
      }, longPressDelay);
    },
    [onGesture, longPressDelay, preventDefault]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const position = getTouchPosition(e);
      setTouchEnd(position);

      // Cancel long press if user moves
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    },
    [preventDefault]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const position = getTouchPosition(e);
      setTouchEnd(position);

      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!touchStart) return;

      const duration = Date.now() - touchStartTime.current;
      const distance = Math.sqrt(Math.pow(position.x - touchStart.x, 2) + Math.pow(position.y - touchStart.y, 2));

      // Determine gesture type
      if (distance < 10 && duration < 200) {
        // Tap or double tap
        const now = Date.now();
        if (now - lastTap < doubleTapDelay) {
          onGesture({
            type: 'double-tap',
            position,
          });
          setLastTap(0);
        } else {
          onGesture({
            type: 'tap',
            position,
          });
          setLastTap(now);
        }
      } else if (distance > swipeThreshold) {
        // Swipe
        const direction = getSwipeDirection(touchStart, position);
        onGesture({
          type: 'swipe',
          position,
          direction,
        });
      }
    },
    [touchStart, onGesture, swipeThreshold, doubleTapDelay, lastTap, preventDefault]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

// Swipe detection hook
export const useSwipe = (
  onSwipe: (direction: SwipeDirection) => void,
  options: {
    threshold?: number;
    preventDefault?: boolean;
  } = {}
) => {
  const { threshold = 50, preventDefault = true } = options;

  const gestureHandlers = useTouchGestures(
    (gesture) => {
      if (gesture.type === 'swipe' && gesture.direction) {
        onSwipe(gesture.direction);
      }
    },
    { swipeThreshold: threshold, preventDefault }
  );

  return gestureHandlers;
};

// Pinch zoom detection
export const usePinchZoom = (
  onPinch: (scale: number, center: TouchPosition) => void,
  options: {
    preventDefault?: boolean;
  } = {}
) => {
  const { preventDefault = true } = options;
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState<number>(1);

  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;

    const touch1 = touches[0];
    const touch2 = touches[1];

    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
  };

  const getCenter = (touches: TouchList): TouchPosition => {
    if (touches.length < 2) return { x: 0, y: 0 };

    const touch1 = touches[0];
    const touch2 = touches[1];

    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      if (e.touches.length === 2) {
        const distance = getDistance(e.touches);
        setInitialDistance(distance);
        setInitialScale(1);
      }
    },
    [preventDefault]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      if (e.touches.length === 2 && initialDistance) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / initialDistance;
        const center = getCenter(e.touches);

        onPinch(scale, center);
      }
    },
    [initialDistance, onPinch, preventDefault]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      if (e.touches.length < 2) {
        setInitialDistance(null);
      }
    },
    [preventDefault]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

// Pan gesture detection
export const usePan = (
  onPan: (delta: TouchPosition, position: TouchPosition) => void,
  options: {
    preventDefault?: boolean;
  } = {}
) => {
  const { preventDefault = true } = options;
  const [lastPosition, setLastPosition] = useState<TouchPosition | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const position = getTouchPosition(e);
      setLastPosition(position);
    },
    [preventDefault]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const position = getTouchPosition(e);

      if (lastPosition) {
        const delta = {
          x: position.x - lastPosition.x,
          y: position.y - lastPosition.y,
        };

        onPan(delta, position);
      }

      setLastPosition(position);
    },
    [lastPosition, onPan, preventDefault]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      setLastPosition(null);
    },
    [preventDefault]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

// Mobile-specific utilities
export const getMobileViewport = () => {
  const vh = window.innerHeight * 0.01;
  const vw = window.innerWidth * 0.01;

  return {
    vh,
    vw,
    height: window.innerHeight,
    width: window.innerWidth,
    isLandscape: window.innerWidth > window.innerHeight,
    isPortrait: window.innerHeight > window.innerWidth,
  };
};

export const useMobileViewport = () => {
  const [viewport, setViewport] = useState(getMobileViewport);

  useEffect(() => {
    const handleResize = () => {
      setViewport(getMobileViewport());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
};

// Touch feedback utilities
export const addTouchFeedback = (element: HTMLElement) => {
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

// Haptic feedback (if supported)
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
    };

    navigator.vibrate(patterns[type]);
  }
};

// Safe area utilities for notched devices
export const getSafeAreaInsets = () => {
  const computedStyle = getComputedStyle(document.documentElement);

  return {
    top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
  };
};

// Mobile-optimized scroll utilities
export const useMobileScroll = (element: HTMLElement | null) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!element) return;

    const handleScroll = () => {
      setScrollPosition(element.scrollTop);
      setIsScrolling(true);

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [element]);

  return { scrollPosition, isScrolling };
};
