import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import './CollapsibleMenu.css';

interface CollapsibleMenuProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  className = '',
  variant = 'default',
  size = 'md',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const toggleMenu = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  const menuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut' as const,
      },
    },
    open: {
      height: 'auto',
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut' as const,
      },
    },
  };

  const iconVariants = {
    closed: {
      rotate: 0,
      transition: {
        duration: 0.2,
        ease: 'easeInOut' as const,
      },
    },
    open: {
      rotate: 90,
      transition: {
        duration: 0.2,
        ease: 'easeInOut' as const,
      },
    },
  };

  const sizeClasses = {
    sm: 'collapsible-menu-sm',
    md: 'collapsible-menu-md',
    lg: 'collapsible-menu-lg',
  };

  const variantClasses = {
    default: 'collapsible-menu-default',
    glass: 'collapsible-menu-glass',
    gradient: 'collapsible-menu-gradient',
    minimal: 'collapsible-menu-minimal',
  };

  return (
    <div className={`collapsible-menu ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      <motion.button
        className="collapsible-menu-header"
        onClick={toggleMenu}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div className="collapsible-menu-title">
          {icon && <span className="collapsible-menu-icon">{icon}</span>}
          <span className="collapsible-menu-text">{title}</span>
        </div>
        <motion.div className="collapsible-menu-chevron" variants={iconVariants} animate={isOpen ? 'open' : 'closed'}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="collapsible-menu-content"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="collapsible-menu-inner">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleMenu;
