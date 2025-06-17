import React, { useState } from 'react';
import { logger } from '../../utils/logger';
import './DebugPanel.css';

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterComponent, setFilterComponent] = useState<string>('all');

  const logs = logger.getLogs();
  
  const filteredLogs = logs.filter(log => {
    const levelMatch = filterLevel === 'all' || log.level === filterLevel;
    const componentMatch = filterComponent === 'all' || log.component === filterComponent;
    return levelMatch && componentMatch;
  });

  const uniqueComponents = [...new Set(logs.map(log => log.component))];

  const handleExportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      window.location.reload();
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Debug Panel"
      >
        🐛
      </button>

      {isOpen && (
        <div className="debug-panel">
          <div className="debug-header">
            <h3>Debug Logs</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="debug-controls">
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>

            <select 
              value={filterComponent} 
              onChange={(e) => setFilterComponent(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Components</option>
              {uniqueComponents.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>

            <button onClick={handleExportLogs} className="action-btn">
              Export
            </button>
            
            <button onClick={handleClearLogs} className="action-btn danger">
              Clear
            </button>
          </div>

          <div className="debug-logs">
            {filteredLogs.length === 0 ? (
              <p className="no-logs">No logs to display</p>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className={`log-entry ${log.level}`}>
                  <div className="log-header">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`log-level ${log.level}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="log-component">{log.component}</span>
                  </div>
                  <div className="log-message">{log.message}</div>
                  {log.data && (
                    <details className="log-data">
                      <summary>Data</summary>
                      <pre>{JSON.stringify(log.data, null, 2)}</pre>
                    </details>
                  )}
                  {log.error && (
                    <details className="log-error">
                      <summary>Error</summary>
                      <pre>{log.error.stack || log.error.toString()}</pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;