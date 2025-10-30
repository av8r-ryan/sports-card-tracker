import { motion, Variants } from 'framer-motion';
import React from 'react';

// Predefined animation presets for common use cases
export const animationPresets = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  pageSlide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },

  // Card animations
  cardHover: {
    whileHover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 },
    },
    whileTap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  },

  cardFlip: {
    initial: { rotateY: 0 },
    animate: { rotateY: 180 },
    transition: { duration: 0.6, ease: 'easeInOut' },
  },

  // Button animations
  buttonPress: {
    whileHover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    whileTap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  },

  buttonGlow: {
    whileHover: {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.3 },
    },
  },

  // List animations
  listStagger: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },

  listItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Modal animations
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  modalContent: {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Loading animations
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },

  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },

  // Notification animations
  notificationSlide: {
    initial: { opacity: 0, x: 300, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 300, scale: 0.8 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Form animations
  formField: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 },
  },

  formError: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.2 },
  },

  // Progress animations
  progressBar: {
    initial: { width: 0 },
    animate: { width: '100%' },
    transition: { duration: 1, ease: 'easeOut' },
  },

  // Success animations
  successCheck: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: {
      duration: 0.5,
      ease: 'backOut',
    },
  },

  // Error animations
  errorShake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  },
};

// Animation variants for complex sequences
export const complexVariants: Record<string, Variants> = {
  // Staggered list with different directions
  staggeredList: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },

  staggeredItem: {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  },

  // Accordion animation
  accordion: {
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    open: {
      height: 'auto',
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  },

  // Tab content animation
  tabContent: {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  },

  // Carousel animation
  carousel: {
    enter: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: -100,
      scale: 0.8,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  },

  // Floating action button
  fab: {
    hidden: {
      scale: 0,
      rotate: -180,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.3, ease: 'backOut' },
    },
  },

  // Tooltip animation
  tooltip: {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 10,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  },
};

// Utility functions for common animation patterns
export const createStaggerAnimation = (staggerDelay = 0.1) => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

export const createSlideAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const directionMap = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return {
    initial: { opacity: 0, ...directionMap[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directionMap[direction] },
  };
};

export const createScaleAnimation = (scale = 0.8) => ({
  initial: { opacity: 0, scale },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale },
});

// HOC for adding animations to components
export const withAnimation = <P extends object>(Component: React.ComponentType<P>, animationProps: any) => {
  return React.forwardRef<any, P>((props, ref) => (
    <motion.div {...animationProps} ref={ref}>
      <Component {...(props as any)} />
    </motion.div>
  ));
};

// Animation context for global animation settings
export const AnimationContext = React.createContext({
  reducedMotion: false,
  animationSpeed: 1,
  enableAnimations: true,
});

// Hook for animation context
export const useAnimationSettings = () => {
  const context = React.useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationSettings must be used within AnimationProvider');
  }
  return context;
};

// Animation provider component
export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reducedMotion] = React.useState(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const [animationSpeed] = React.useState(1);
  const [enableAnimations] = React.useState(true);

  return (
    <AnimationContext.Provider value={{ reducedMotion, animationSpeed, enableAnimations }}>
      {children}
    </AnimationContext.Provider>
  );
};
