import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'stat';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 1, type = 'card' }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'stat') {
    return (
      <div className="skeleton-stat-container">
        {skeletons.map(i => (
          <div key={i} className="skeleton-stat">
            <div className="skeleton-stat-label" />
            <div className="skeleton-stat-value" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="skeleton-list-container">
        {skeletons.map(i => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-list-content" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-card-container">
      {skeletons.map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-subtitle" />
            <div className="skeleton-text" />
            <div className="skeleton-footer">
              <div className="skeleton-price" />
              <div className="skeleton-price" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;