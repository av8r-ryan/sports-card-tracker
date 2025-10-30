import { useState, useEffect } from 'react';

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Device type detection
export const getDeviceType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < breakpoints.md) return 'mobile';
  if (width < breakpoints.lg) return 'tablet';
  return 'desktop';
};

// Responsive hook
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });
      setDeviceType(getDeviceType(width));
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';

  const isBreakpoint = (breakpoint: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[breakpoint];
  };

  const isBreakpointDown = (breakpoint: Breakpoint): boolean => {
    return windowSize.width < breakpoints[breakpoint];
  };

  const isBreakpointBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max];
  };

  return {
    ...windowSize,
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    isBreakpointDown,
    isBreakpointBetween,
  };
};

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

// Responsive values hook
export const useResponsiveValue = <T>(values: { mobile?: T; tablet?: T; desktop?: T }): T | undefined => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && values.mobile !== undefined) return values.mobile;
  if (isTablet && values.tablet !== undefined) return values.tablet;
  if (isDesktop && values.desktop !== undefined) return values.desktop;

  // Fallback to first available value
  return values.mobile || values.tablet || values.desktop;
};

// Container queries hook (when supported)
export const useContainerQuery = (element: HTMLElement | null, query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!element || !('ResizeObserver' in window)) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Simple container query implementation
        if (query.includes('min-width:')) {
          const minWidth = parseInt(query.match(/min-width:\s*(\d+)px/)?.[1] || '0');
          setMatches(width >= minWidth);
        } else if (query.includes('max-width:')) {
          const maxWidth = parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || '0');
          setMatches(width <= maxWidth);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [element, query]);

  return matches;
};

// Touch-friendly sizing utilities
export const getTouchTargetSize = (baseSize = 44): number => {
  const { isMobile } = useResponsive();
  return isMobile ? Math.max(baseSize, 44) : baseSize;
};

// Spacing utilities for different screen sizes
export const getResponsiveSpacing = (mobile: number, tablet?: number, desktop?: number): number => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet && tablet !== undefined) return tablet;
  if (isDesktop && desktop !== undefined) return desktop;

  return mobile;
};

// Grid utilities
export const getResponsiveGridColumns = (mobile: number, tablet?: number, desktop?: number): number => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet && tablet !== undefined) return tablet;
  if (isDesktop && desktop !== undefined) return desktop;

  return mobile;
};

// Font size utilities
export const getResponsiveFontSize = (mobile: number, tablet?: number, desktop?: number): number => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) return mobile;
  if (isTablet && tablet !== undefined) return tablet;
  if (isDesktop && desktop !== undefined) return desktop;

  return mobile;
};

// Image sizing utilities
export const getResponsiveImageSize = (containerWidth: number, aspectRatio = 1): { width: number; height: number } => {
  const { isMobile, isTablet } = useResponsive();

  let maxWidth = containerWidth;

  if (isMobile) {
    maxWidth = Math.min(containerWidth, 400);
  } else if (isTablet) {
    maxWidth = Math.min(containerWidth, 600);
  }

  return {
    width: maxWidth,
    height: maxWidth / aspectRatio,
  };
};

// Scroll behavior utilities
export const getScrollBehavior = (): 'smooth' | 'auto' => {
  const { isMobile } = useResponsive();
  return isMobile ? 'auto' : 'smooth';
};

// Animation duration utilities
export const getResponsiveAnimationDuration = (baseDuration: number): number => {
  const { isMobile } = useResponsive();

  // Reduce animation duration on mobile for better performance
  return isMobile ? baseDuration * 0.7 : baseDuration;
};

// Z-index utilities for mobile layering
export const getMobileZIndex = (level: 'base' | 'overlay' | 'modal' | 'tooltip'): number => {
  const zIndexes = {
    base: 1,
    overlay: 1000,
    modal: 2000,
    tooltip: 3000,
  };

  return zIndexes[level];
};

// Safe area utilities
export const getSafeAreaPadding = (): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computedStyle = getComputedStyle(document.documentElement);

  return {
    top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
  };
};

// Viewport height utilities for mobile browsers
export const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;

  // Use visual viewport API if available (better for mobile)
  if ('visualViewport' in window && window.visualViewport) {
    return window.visualViewport.height;
  }

  return window.innerHeight;
};

// Orientation utilities
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' && window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};

// Performance utilities for mobile
export const useMobileOptimization = () => {
  const { isMobile } = useResponsive();
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    if (!isMobile) return;

    // Detect low-end devices
    const isLowEnd =
      navigator.hardwareConcurrency < 4 ||
      /Android.*Chrome\/[0-5]\.|iPhone.*Version\/[0-9]\.|iPad.*Version\/[0-9]\./.test(navigator.userAgent);

    setIsLowEndDevice(isLowEnd);
  }, [isMobile]);

  return {
    isMobile,
    isLowEndDevice,
    shouldReduceAnimations: isMobile && isLowEndDevice,
    shouldUseSimpleTransitions: isMobile && isLowEndDevice,
    maxConcurrentAnimations: isMobile && isLowEndDevice ? 2 : 10,
  };
};

// Responsive CSS-in-JS utilities
export const createResponsiveStyles = (styles: {
  mobile?: React.CSSProperties;
  tablet?: React.CSSProperties;
  desktop?: React.CSSProperties;
}): React.CSSProperties => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && styles.mobile) return styles.mobile;
  if (isTablet && styles.tablet) return styles.tablet;
  if (isDesktop && styles.desktop) return styles.desktop;

  return styles.mobile || styles.tablet || styles.desktop || {};
};

// Responsive class name utilities
export const getResponsiveClassName = (
  baseClass: string,
  modifiers: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  }
): string => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  let className = baseClass;

  if (isMobile && modifiers.mobile) {
    className += ` ${modifiers.mobile}`;
  } else if (isTablet && modifiers.tablet) {
    className += ` ${modifiers.tablet}`;
  } else if (isDesktop && modifiers.desktop) {
    className += ` ${modifiers.desktop}`;
  }

  return className;
};
