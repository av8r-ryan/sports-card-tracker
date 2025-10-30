import React, { useState, useEffect, useCallback } from 'react';
import { usePerformanceMonitoring, getPerformanceMetrics } from '../../utils/performanceMonitoring';
import './PerformanceMonitoring.css';

interface PerformanceMonitoringProps {
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoHide?: boolean;
  hideDelay?: number;
}

const PerformanceMonitoring: React.FC<PerformanceMonitoringProps> = ({
  showDetails = false,
  position = 'bottom-right',
  autoHide = true,
  hideDelay = 5000
}) => {
  const { metrics } = usePerformanceMonitoring();
  const [isVisible, setIsVisible] = useState(!autoHide);
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  useEffect(() => {
    let timer: number | ReturnType<typeof setTimeout> | undefined;
    if (autoHide) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    }
    return () => {
      if (timer) clearTimeout(timer as any);
    };
  }, [autoHide, hideDelay, metrics]);

  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const toggleDetails = useCallback(() => {
    setShowFullDetails(prev => !prev);
  }, []);

  const getRatingColor = (rating: number): string => {
    switch (rating) {
      case 1: return '#10b981'; // green
      case 2: return '#f59e0b'; // yellow
      case 3: return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getRatingText = (rating: number): string => {
    switch (rating) {
      case 1: return 'Good';
      case 2: return 'Needs Improvement';
      case 3: return 'Poor';
      default: return 'Unknown';
    }
  };

  const formatValue = (value: number | null, unit: string = 'ms'): string => {
    if (value === null) return 'N/A';
    return `${Math.round(value)}${unit}`;
  };

  if (!metrics || !isVisible) {
    return (
      <button
        className={`performance-monitor-toggle performance-monitor-${position}`}
        onClick={toggleVisibility}
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className={`performance-monitor performance-monitor-${position}`}>
      <div className="performance-monitor-header">
        <h4>Performance Monitor</h4>
        <div className="performance-monitor-controls">
          <button
            className="performance-monitor-toggle-details"
            onClick={toggleDetails}
            title={showFullDetails ? 'Hide Details' : 'Show Details'}
          >
            {showFullDetails ? '−' : '+'}
          </button>
          <button
            className="performance-monitor-close"
            onClick={toggleVisibility}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="performance-monitor-content">
        {/* Core Web Vitals */}
        <div className="performance-section">
          <h5>Core Web Vitals</h5>
          <div className="metric-grid">
            <div className="metric-item">
              <span className="metric-label">CLS</span>
              <span 
                className="metric-value"
                style={{ 
                  color: getRatingColor(metrics.customMetrics['cls-rating'] || 0) 
                }}
              >
                {formatValue(metrics.cls, '')}
              </span>
              <span className="metric-rating">
                {getRatingText(metrics.customMetrics['cls-rating'] || 0)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">FID</span>
              <span 
                className="metric-value"
                style={{ 
                  color: getRatingColor(metrics.customMetrics['fid-rating'] || 0) 
                }}
              >
                {formatValue(metrics.fid)}
              </span>
              <span className="metric-rating">
                {getRatingText(metrics.customMetrics['fid-rating'] || 0)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">LCP</span>
              <span 
                className="metric-value"
                style={{ 
                  color: getRatingColor(metrics.customMetrics['lcp-rating'] || 0) 
                }}
              >
                {formatValue(metrics.lcp)}
              </span>
              <span className="metric-rating">
                {getRatingText(metrics.customMetrics['lcp-rating'] || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="performance-section">
          <h5>Additional Metrics</h5>
          <div className="metric-grid">
            <div className="metric-item">
              <span className="metric-label">FCP</span>
              <span className="metric-value">
                {formatValue(metrics.fcp)}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">TTFB</span>
              <span className="metric-value">
                {formatValue(metrics.ttfb)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        {showFullDetails && (
          <div className="performance-section">
            <h5>Detailed Metrics</h5>
            <div className="metric-list">
              {Object.entries(metrics.customMetrics).map(([key, value]) => (
                <div key={key} className="metric-detail">
                  <span className="metric-detail-label">{key}</span>
                  <span className="metric-detail-value">
                    {typeof value === 'number' ? formatValue(value) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="performance-section">
          <h5>System Info</h5>
          <div className="system-info">
            <div className="system-item">
              <span className="system-label">Connection</span>
              <span className="system-value">
                {metrics.connectionType || 'Unknown'}
              </span>
            </div>
            <div className="system-item">
              <span className="system-label">Memory Used</span>
              <span className="system-value">
                {formatValue(metrics.customMetrics['memory-used'], 'B')}
              </span>
            </div>
            <div className="system-item">
              <span className="system-label">Memory Total</span>
              <span className="system-value">
                {formatValue(metrics.customMetrics['memory-total'], 'B')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoring;
