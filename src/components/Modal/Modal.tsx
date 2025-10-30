import React, { useEffect, useRef, useCallback } from 'react';
import { logDebug, logInfo } from '../../utils/logger';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showNavigation?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalItems?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  size = 'medium',
  showNavigation = false,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  currentIndex = 0,
  totalItems = 0
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      logInfo('Modal', 'Modal opened', { title, size, showNavigation });
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      logInfo('Modal', 'Modal closed');
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      // Cleanup: restore body scroll if modal is still open
      if (isOpen) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, title, size, showNavigation]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      logDebug('Modal', 'Overlay clicked - closing modal');
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    logDebug('Modal', 'Key pressed in modal', { key: e.key });

    if (closeOnEscape && e.key === 'Escape') {
      logInfo('Modal', 'Escape key pressed - closing modal');
      onClose();
    }

    if (showNavigation) {
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        logInfo('Modal', 'Left arrow pressed - going to previous');
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        logInfo('Modal', 'Right arrow pressed - going to next');
        e.preventDefault();
        onNext();
      }
    }
  }, [isOpen, closeOnEscape, onClose, showNavigation, hasPrevious, hasNext, onPrevious, onNext]);

  const handlePrevious = useCallback(() => {
    if (hasPrevious && onPrevious) {
      logInfo('Modal', 'Previous button clicked');
      onPrevious();
    }
  }, [hasPrevious, onPrevious]);

  const handleNext = useCallback(() => {
    if (hasNext && onNext) {
      logInfo('Modal', 'Next button clicked');
      onNext();
    }
  }, [hasNext, onNext]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`modal-overlay ${className}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={`modal ${size}`}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Modal Header */}
        <div className="modal-header">
          {showNavigation && (
            <div className="modal-navigation">
              <button
                className={`modal-nav-btn prev ${!hasPrevious ? 'disabled' : ''}`}
                onClick={handlePrevious}
                disabled={!hasPrevious}
                aria-label="Previous item"
              >
                <span className="nav-arrow">‹</span>
              </button>
              <div className="modal-counter">
                {currentIndex + 1} / {totalItems}
              </div>
              <button
                className={`modal-nav-btn next ${!hasNext ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={!hasNext}
                aria-label="Next item"
              >
                <span className="nav-arrow">›</span>
              </button>
            </div>
          )}
          
          {title && (
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          )}
          
          {showCloseButton && (
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <span className="close-icon">×</span>
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
