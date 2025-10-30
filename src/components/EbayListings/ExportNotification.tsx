import React, { useEffect, useState } from 'react';
import './ExportNotification.css';

interface Props {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
}

const ExportNotification: React.FC<Props> = ({ show, message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    if (!show) return;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to finish
    }, 5000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div className={`export-notification ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-icon">
        {type === 'success' && '✅'}
        {type === 'info' && 'ℹ️'}
        {type === 'error' && '❌'}
      </div>
      <div className="notification-content">
        <p>{message}</p>
      </div>
      <button className="notification-close" onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }}>
        ×
      </button>
    </div>
  );
};

export default ExportNotification;