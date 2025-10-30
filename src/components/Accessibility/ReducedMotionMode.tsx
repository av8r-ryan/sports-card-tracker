import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import { accessibilityManager } from '../../utils/accessibility';
import './ReducedMotionMode.css';

interface ReducedMotionModeProps {
  children: React.ReactNode;
  className?: string;
}

const ReducedMotionMode: React.FC<ReducedMotionModeProps> = ({ children, className = '' }) => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      accessibilityManager.updateReducedMotionMode();
    };

    mediaQuery.addEventListener('change', handleChange);

    // Show toggle button after 5 seconds
    const timer = setTimeout(() => {
      setShowToggle(true);
    }, 5000);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearTimeout(timer);
    };
  }, []);

  const toggleReducedMotion = () => {
    const newState = !isReducedMotion;
    setIsReducedMotion(newState);
    accessibilityManager.updateReducedMotionMode();

    // Announce change
    accessibilityManager.announce(`Reduced motion mode ${newState ? 'enabled' : 'disabled'}`, 'polite');
  };

  return (
    <div className={`reduced-motion-mode ${isReducedMotion ? 'reduced-motion' : ''} ${className}`}>
      {children}

      {/* Toggle Button */}
      <AnimatePresence>
        {showToggle && (
          <motion.button
            className="motion-toggle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleReducedMotion}
            aria-label={`${isReducedMotion ? 'Disable' : 'Enable'} reduced motion mode`}
            title={`${isReducedMotion ? 'Disable' : 'Enable'} reduced motion mode`}
          >
            <div className="motion-icon">{isReducedMotion ? '⏸️' : '▶️'}</div>
            <span className="motion-text">{isReducedMotion ? 'Reduced Motion' : 'Full Motion'}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reduced motion utilities
export const reducedMotionUtils = {
  // Check if reduced motion is enabled
  isReducedMotionEnabled: (): boolean => {
    return document.documentElement.classList.contains('reduced-motion');
  },

  // Get motion-safe animation
  getMotionSafeAnimation: (animation: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return animation;
  },

  // Create motion-safe transition
  createMotionSafeTransition: (transition: any, fallback: any = { duration: 0.01 }) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return transition;
  },

  // Create motion-safe variants
  createMotionSafeVariants: (variants: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return variants;
  },

  // Create motion-safe motion component
  createMotionSafeComponent: (Component: any, props: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      // Return static component without motion
      return React.createElement(Component, props);
    }
    return motion(Component);
  },

  // Create motion-safe hover effect
  createMotionSafeHover: (hover: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return hover;
  },

  // Create motion-safe tap effect
  createMotionSafeTap: (tap: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return tap;
  },

  // Create motion-safe drag
  createMotionSafeDrag: (drag: any, fallback: any = false) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return drag;
  },

  // Create motion-safe stagger
  createMotionSafeStagger: (stagger: any, fallback: any = 0) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return stagger;
  },

  // Create motion-safe delay
  createMotionSafeDelay: (delay: any, fallback: any = 0) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return delay;
  },

  // Create motion-safe duration
  createMotionSafeDuration: (duration: any, fallback: any = 0.01) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return duration;
  },

  // Create motion-safe ease
  createMotionSafeEase: (ease: any, fallback: any = 'linear') => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return ease;
  },

  // Create motion-safe spring
  createMotionSafeSpring: (spring: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return spring;
  },

  // Create motion-safe keyframes
  createMotionSafeKeyframes: (keyframes: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return keyframes;
  },

  // Create motion-safe path
  createMotionSafePath: (path: any, fallback: any = '') => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return path;
  },

  // Create motion-safe transform
  createMotionSafeTransform: (transform: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return transform;
  },

  // Create motion-safe filter
  createMotionSafeFilter: (filter: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return filter;
  },

  // Create motion-safe backdrop filter
  createMotionSafeBackdropFilter: (backdropFilter: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return backdropFilter;
  },

  // Create motion-safe box shadow
  createMotionSafeBoxShadow: (boxShadow: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return boxShadow;
  },

  // Create motion-safe text shadow
  createMotionSafeTextShadow: (textShadow: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return textShadow;
  },

  // Create motion-safe clip path
  createMotionSafeClipPath: (clipPath: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return clipPath;
  },

  // Create motion-safe mask
  createMotionSafeMask: (mask: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return mask;
  },

  // Create motion-safe perspective
  createMotionSafePerspective: (perspective: any, fallback: any = {}) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return perspective;
  },

  // Create motion-safe rotate
  createMotionSafeRotate: (rotate: any, fallback: any = 0) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return rotate;
  },

  // Create motion-safe scale
  createMotionSafeScale: (scale: any, fallback: any = 1) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return scale;
  },

  // Create motion-safe skew
  createMotionSafeSkew: (skew: any, fallback: any = 0) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return skew;
  },

  // Create motion-safe translate
  createMotionSafeTranslate: (translate: any, fallback: any = 0) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return translate;
  },

  // Create motion-safe opacity
  createMotionSafeOpacity: (opacity: any, fallback: any = 1) => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return opacity;
  },

  // Create motion-safe visibility
  createMotionSafeVisibility: (visibility: any, fallback: any = 'visible') => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return visibility;
  },

  // Create motion-safe display
  createMotionSafeDisplay: (display: any, fallback: any = 'block') => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return display;
  },

  // Create motion-safe position
  createMotionSafePosition: (position: any, fallback: any = 'static') => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return position;
  },

  // Create motion-safe z-index
  createMotionSafeZIndex: (zIndex: any, fallback: any = 'auto') => {
    if (reducedMotionUtils.isReducedMotionEnabled()) {
      return fallback;
    }
    return zIndex;
  },
};

export default ReducedMotionMode;
