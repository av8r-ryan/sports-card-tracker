import React from 'react';
import { motion, MotionProps, Variants } from 'framer-motion';

interface AnimatedWrapperProps extends Omit<MotionProps, 'transition'> {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'slideIn' | 'slideInRight' | 'slideInUp' | 'slideInDown' | 'zoomIn' | 'zoomOut' | 'flip' | 'bounce' | 'pulse' | 'float' | 'shake' | 'wiggle' | 'heartbeat' | 'glow' | 'shimmer' | 'ripple' | 'typewriter' | 'stagger' | 'morph' | 'custom';
  delay?: number;
  duration?: number;
  repeat?: boolean;
  className?: string;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  intensity?: 'subtle' | 'normal' | 'strong';
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string;
  };
}

const animationVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 }
  },
  slideIn: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  slideInRight: {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  slideInUp: {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  slideInDown: {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  zoomIn: {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  },
  zoomOut: {
    hidden: { scale: 1, opacity: 1 },
    visible: { scale: 0, opacity: 0 }
  },
  flip: {
    hidden: { rotateY: -90, opacity: 0 },
    visible: { rotateY: 0, opacity: 1 }
  },
  bounce: {
    hidden: { y: 0 },
    visible: { 
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },
  pulse: {
    hidden: { scale: 1 },
    visible: { 
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },
  float: {
    hidden: { y: 0, rotate: 0 },
    visible: { 
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  },
  shake: {
    hidden: { x: 0 },
    visible: { 
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },
  wiggle: {
    hidden: { rotate: 0 },
    visible: { 
      rotate: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },
  heartbeat: {
    hidden: { scale: 1 },
    visible: { 
      scale: [1, 1.1, 1, 1.1, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },
  glow: {
    hidden: { boxShadow: '0 0 0px rgba(59, 130, 246, 0)' },
    visible: { 
      boxShadow: [
        '0 0 0px rgba(59, 130, 246, 0)',
        '0 0 20px rgba(59, 130, 246, 0.5)',
        '0 0 0px rgba(59, 130, 246, 0)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },
  shimmer: {
    hidden: { backgroundPosition: '-200% 0' },
    visible: { 
      backgroundPosition: '200% 0',
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'linear'
      }
    }
  },
  ripple: {
    hidden: { scale: 0, opacity: 1 },
    visible: { 
      scale: [0, 1.2, 0],
      opacity: [1, 0.5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  },
  typewriter: {
    hidden: { width: 0 },
    visible: { 
      width: '100%',
      transition: {
        duration: 2,
        ease: 'linear'
      }
    }
  },
  stagger: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  morph: {
    hidden: { borderRadius: '50%', scale: 0.8 },
    visible: { 
      borderRadius: '0%',
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeInOut'
      }
    }
  }
};

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  repeat = false,
  className = '',
  stagger = 0,
  direction = 'up',
  intensity = 'normal',
  ...motionProps
}) => {
  const variants = animationVariants[animation] || animationVariants.fadeIn;
  
  // Adjust animation intensity
  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'subtle': return 0.5;
      case 'strong': return 1.5;
      default: return 1;
    }
  };

  const intensityMultiplier = getIntensityMultiplier();
  
  // Adjust animation based on direction
  const getDirectionalVariants = (baseVariants: Variants) => {
    if (animation.includes('fadeIn') || animation.includes('slideIn')) {
      const directionMap = {
        up: { y: -30 * intensityMultiplier },
        down: { y: 30 * intensityMultiplier },
        left: { x: -30 * intensityMultiplier },
        right: { x: 30 * intensityMultiplier }
      };
      
      const directionOffset = directionMap[direction];
      if (directionOffset) {
        return {
          ...baseVariants,
          hidden: { ...baseVariants.hidden, ...directionOffset }
        };
      }
    }
    return baseVariants;
  };

  const adjustedVariants = getDirectionalVariants(variants);
  
  const defaultTransition = {
    duration,
    delay: delay + stagger,
    ease: 'easeOut' as const
  };

  const motionPropsWithDefaults = {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    transition: defaultTransition,
    ...motionProps
  };

  // Handle repeat animations
  const repeatAnimations = ['bounce', 'pulse', 'float', 'shake', 'wiggle', 'heartbeat', 'glow', 'shimmer', 'ripple'];
  if (repeat && repeatAnimations.includes(animation)) {
    motionPropsWithDefaults.animate = 'visible';
  }

  // Handle stagger animation
  if (animation === 'stagger') {
    motionPropsWithDefaults.transition = {
      ...defaultTransition,
      staggerChildren: stagger || 0.1
    } as any;
  }

  // Handle shimmer animation - requires special CSS
  if (animation === 'shimmer') {
    const shimmerClass = 'shimmer-effect';
    className = `${className} ${shimmerClass}`.trim();
  }

  return (
    <motion.div
      variants={adjustedVariants}
      {...motionPropsWithDefaults as any}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper;
