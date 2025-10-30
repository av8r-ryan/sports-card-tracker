import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

import { accessibilityManager } from '../../utils/accessibility';
import './AccessibilityTester.css';

interface AccessibilityTesterProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityTester: React.FC<AccessibilityTesterProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      runAccessibilityScan();
    }
  }, [isOpen]);

  const runAccessibilityScan = async () => {
    setIsScanning(true);

    // Simulate scanning delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const scanReport = accessibilityManager.validateAccessibility();
    setReport(scanReport);
    setIsScanning(false);
  };

  const handleIssueClick = (issue: any) => {
    setSelectedIssue(issue);

    // Scroll to element
    if (issue.element) {
      issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      issue.element.style.outline = '2px solid #ff6b6b';
      issue.element.style.outlineOffset = '2px';

      // Remove outline after 3 seconds
      setTimeout(() => {
        issue.element.style.outline = '';
        issue.element.style.outlineOffset = '';
      }, 3000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="accessibility-tester-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="accessibility-tester"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tester-header">
            <h2>Accessibility Tester</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close accessibility tester">
              ×
            </button>
          </div>

          <div className="tester-content">
            {isScanning ? (
              <div className="scanning-state">
                <div className="scanning-spinner" />
                <p>Scanning page for accessibility issues...</p>
              </div>
            ) : report ? (
              <>
                <div className="score-section">
                  <div className="score-circle">
                    <div
                      className="score-fill"
                      style={{
                        background: `conic-gradient(${getScoreColor(report.score)} 0deg ${report.score * 3.6}deg, #e0e0e0 0deg)`,
                      }}
                    >
                      <span className="score-value">{report.score}</span>
                    </div>
                  </div>
                  <div className="score-info">
                    <h3>Accessibility Score</h3>
                    <p>{report.score >= 90 ? 'Excellent' : report.score >= 70 ? 'Good' : 'Needs Improvement'}</p>
                  </div>
                </div>

                <div className="issues-section">
                  <h3>Issues Found ({report.issues.length})</h3>

                  {report.issues.length === 0 ? (
                    <div className="no-issues">
                      <div className="success-icon">✅</div>
                      <p>No accessibility issues found!</p>
                    </div>
                  ) : (
                    <div className="issues-list">
                      {report.issues.map((issue: any, index: number) => (
                        <motion.div
                          key={index}
                          className={`issue-item ${issue.severity}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleIssueClick(issue)}
                        >
                          <div className="issue-header">
                            <div className="issue-severity">
                              <div
                                className="severity-dot"
                                style={{ backgroundColor: getSeverityColor(issue.severity) }}
                              />
                              <span className="severity-text">{issue.severity.toUpperCase()}</span>
                            </div>
                            <span className="issue-type">{issue.type.replace('-', ' ')}</span>
                          </div>
                          <p className="issue-message">{issue.message}</p>
                          <div className="issue-fix">
                            <strong>Fix:</strong> {issue.fix}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {report.recommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h3>Recommendations</h3>
                    <ul className="recommendations-list">
                      {report.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : null}
          </div>

          <div className="tester-actions">
            <button className="rescan-btn" onClick={runAccessibilityScan} disabled={isScanning}>
              {isScanning ? 'Scanning...' : 'Rescan Page'}
            </button>
            <button
              className="export-btn"
              onClick={() => {
                const dataStr = JSON.stringify(report, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'accessibility-report.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
              disabled={!report}
            >
              Export Report
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AccessibilityTester;
