import { Variants, Transition } from 'framer-motion';

// Animation timing functions
export const easing = {
  linear: 'linear',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  easeInOut: 'easeInOut',
  // Custom cubic-bezier curves
  bounce: [0.68, -0.55, 0.265, 1.55] as number[],
  elastic: [0.175, 0.885, 0.32, 1.275] as number[],
  smooth: [0.25, 0.46, 0.45, 0.94] as number[],
  sharp: [0.4, 0, 0.6, 1] as number[],
  // Spring-like curves
  spring: [0.68, -0.6, 0.32, 1.6] as number[],
  gentle: [0.25, 0.1, 0.25, 1] as number[],
  dramatic: [0.68, -0.55, 0.265, 1.55] as number[],
};

// Animation durations
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
} as const;

// Common animation variants
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const rotateVariants: Variants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 180 },
};

// Stagger animation variants
export const createStaggerVariants = (staggerDelay = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easing.smooth as any,
    },
  },
};

// Directional slide variants
export const createDirectionalSlide = (direction: 'up' | 'down' | 'left' | 'right'): Variants => {
  const directionMap = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  const offset = directionMap[direction];

  return {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...offset },
  };
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const hoverLift = {
  whileHover: { y: -5, scale: 1.02 },
  whileTap: { y: 0, scale: 0.98 },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
    transition: { duration: 0.3 },
  },
};

export const hoverRotate = {
  whileHover: { rotate: 5 },
  whileTap: { rotate: 0 },
};

// Loading animations
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const bounceVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Modal animations
export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easing.bounce as any,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2,
      ease: easing.sharp as any,
    },
  },
};

// Accordion animations
export const accordionVariants: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easing.smooth as any,
    },
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easing.smooth as any,
    },
  },
};

// Tab animations
export const tabVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: easing.smooth as any },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

// Progress bar animations
export const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.8,
      ease: easing.smooth as any,
    },
  }),
};

// Notification animations
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 300,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easing.bounce as any,
    },
  },
  exit: {
    opacity: 0,
    x: 300,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: easing.sharp as any,
    },
  },
};

// Success/Error animations
export const successVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      ease: easing.bounce as any,
    },
  },
};

export const errorVariants: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Utility functions
export const createTransition = (
  duration: number = durations.normal,
  ease: string | number[] = easing.smooth,
  delay = 0
): Transition => ({
  duration,
  ease: ease as any,
  delay,
});

export const createSpringTransition = (stiffness = 100, damping = 20, mass = 1): Transition => ({
  type: 'spring',
  stiffness,
  damping,
  mass,
});

export const createTweenTransition = (
  duration: number = durations.normal,
  ease: string | number[] = easing.smooth
): Transition => ({
  type: 'tween',
  duration,
  ease: ease as any,
});

// Animation presets for common use cases
export const presets = {
  // Page transitions
  pageEnter: {
    variants: slideVariants,
    transition: createTransition(durations.normal, easing.smooth as any),
  },

  pageExit: {
    variants: slideVariants,
    transition: createTransition(durations.fast, easing.sharp as any),
  },

  // Card animations
  cardEnter: {
    variants: scaleVariants,
    transition: createTransition(durations.normal, easing.bounce as any),
  },

  cardHover: {
    whileHover: { scale: 1.05, y: -5 },
    whileTap: { scale: 0.95 },
  },

  // Button animations
  buttonPress: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },

  // List animations
  listStagger: {
    variants: createStaggerVariants(0.1),
    transition: createTransition(durations.normal, easing.smooth as any),
  },

  // Modal animations
  modal: {
    overlay: modalOverlayVariants,
    content: modalContentVariants,
  },

  // Loading animations
  loading: {
    spinner: spinnerVariants,
    pulse: pulseVariants,
    bounce: bounceVariants,
  },
};

// Accessibility helpers
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Return simplified variants for users who prefer reduced motion
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
};

export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation performance helpers
export const optimizeForPerformance = (variants: Variants): Variants => {
  // Remove complex animations on low-end devices
  const isLowEndDevice =
    typeof window !== 'undefined' &&
    (navigator.hardwareConcurrency < 4 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  if (isLowEndDevice) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return variants;
};

// Animation timing utilities
export const createSequence = (animations: Array<{ delay: number; duration: number }>) => {
  let totalDelay = 0;
  return animations.map((anim) => {
    const sequence = {
      ...anim,
      delay: totalDelay,
    };
    totalDelay += anim.duration;
    return sequence;
  });
};

export const createLoop = (variants: Variants, loopCount = Infinity) => ({
  ...variants,
  transition: {
    ...variants.transition,
    repeat: loopCount,
  },
});
