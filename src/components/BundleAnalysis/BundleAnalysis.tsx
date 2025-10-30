import React, { useState, useCallback } from 'react';
import { useBundleAnalysis, formatBytes } from '../../utils/bundleAnalyzer';
import './BundleAnalysis.css';

const BundleAnalysis: React.FC = () => {
  const { analysis, isAnalyzing, error, runAnalysis } = useBundleAnalysis();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'chunks' | 'dependencies' | 'recommendations'>('overview');

  const handleTabChange = useCallback((tab: typeof selectedTab) => {
    setSelectedTab(tab);
  }, []);

  if (isAnalyzing) {
    return (
      <div className="bundle-analysis">
        <div className="analysis-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing bundle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bundle-analysis">
        <div className="analysis-error">
          <h3>Analysis Failed</h3>
          <p>{error}</p>
          <button onClick={runAnalysis} className="retry-btn">
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bundle-analysis">
        <div className="analysis-empty">
          <p>No analysis data available</p>
          <button onClick={runAnalysis} className="analyze-btn">
            Run Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bundle-analysis">
      <div className="analysis-header">
        <h2>Bundle Analysis</h2>
        <div className="analysis-actions">
          <button onClick={runAnalysis} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="analysis-tabs">
        <button
          className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${selectedTab === 'chunks' ? 'active' : ''}`}
          onClick={() => handleTabChange('chunks')}
        >
          Chunks ({analysis.chunks.length})
        </button>
        <button
          className={`tab ${selectedTab === 'dependencies' ? 'active' : ''}`}
          onClick={() => handleTabChange('dependencies')}
        >
          Dependencies ({analysis.dependencies.length})
        </button>
        <button
          className={`tab ${selectedTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => handleTabChange('recommendations')}
        >
          Recommendations ({analysis.recommendations.length})
        </button>
      </div>

      <div className="analysis-content">
        {selectedTab === 'overview' && (
          <div className="overview-tab">
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Total Bundle Size</h3>
                <div className="metric-value">{formatBytes(analysis.totalSize)}</div>
                <div className="metric-subtitle">
                  {analysis.chunks.length} chunks
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Largest Chunk</h3>
                <div className="metric-value">
                  {formatBytes(Math.max(...analysis.chunks.map(c => c.size)))}
                </div>
                <div className="metric-subtitle">
                  {analysis.chunks.find(c => c.size === Math.max(...analysis.chunks.map(c => c.size)))?.name}
                </div>
              </div>
              
              <div className="metric-card">
                <h3>Dependencies</h3>
                <div className="metric-value">{analysis.dependencies.length}</div>
                <div className="metric-subtitle">Total packages</div>
              </div>
              
              <div className="metric-card">
                <h3>Recommendations</h3>
                <div className="metric-value">{analysis.recommendations.length}</div>
                <div className="metric-subtitle">Optimization suggestions</div>
              </div>
            </div>

            {analysis.warnings.length > 0 && (
              <div className="warnings-section">
                <h3>⚠️ Warnings</h3>
                <ul className="warnings-list">
                  {analysis.warnings.map((warning, index) => (
                    <li key={index} className="warning-item">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'chunks' && (
          <div className="chunks-tab">
            <div className="chunks-list">
              {analysis.chunks
                .sort((a, b) => b.size - a.size)
                .map((chunk, index) => (
                  <div key={index} className="chunk-item">
                    <div className="chunk-header">
                      <h4>{chunk.name}</h4>
                      <div className="chunk-size">
                        {formatBytes(chunk.size)}
                        {chunk.gzippedSize && (
                          <span className="gzipped-size">
                            ({formatBytes(chunk.gzippedSize)} gzipped)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="chunk-progress">
                      <div 
                        className="progress-bar"
                        style={{ 
                          width: `${(chunk.size / analysis.totalSize) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="chunk-percentage">
                      {((chunk.size / analysis.totalSize) * 100).toFixed(1)}% of total bundle
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {selectedTab === 'dependencies' && (
          <div className="dependencies-tab">
            <div className="dependencies-list">
              {analysis.dependencies
                .sort((a, b) => b.size - a.size)
                .map((dep, index) => (
                  <div key={index} className="dependency-item">
                    <div className="dependency-header">
                      <h4>{dep.name}</h4>
                      <div className="dependency-size">
                        {formatBytes(dep.size)}
                      </div>
                    </div>
                    <div className="dependency-details">
                      <span className="dependency-version">v{dep.version}</span>
                      {dep.isDevDependency && (
                        <span className="dev-dependency">dev</span>
                      )}
                    </div>
                    {dep.alternatives && dep.alternatives.length > 0 && (
                      <div className="dependency-alternatives">
                        <strong>Alternatives:</strong> {dep.alternatives.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="recommendations-tab">
            <div className="recommendations-list">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-icon">💡</div>
                  <div className="recommendation-text">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BundleAnalysis;
