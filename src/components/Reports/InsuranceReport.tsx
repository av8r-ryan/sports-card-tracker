import React, { useMemo, useState } from 'react';
import { ReportingService } from '../../services/reportingService';
import { ReportFilter } from '../../types/reports';
import { format } from 'date-fns';
import './InsuranceReport.css';

interface Props {
  reportingService: ReportingService;
  filters?: ReportFilter;
}

const InsuranceReport: React.FC<Props> = ({ reportingService, filters }) => {
  const [activeView, setActiveView] = useState<'overview' | 'details' | 'documentation'>('overview');
  
  const insuranceData = useMemo(() => 
    reportingService.generateInsuranceReport(filters), 
    [reportingService, filters]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate additional metrics
  const totalCards = insuranceData.categoryBreakdown.reduce((sum, cat) => sum + cat.cardCount, 0);
  const averageCardValue = insuranceData.totalReplacementValue / totalCards;
  const highValuePercentage = (insuranceData.highValueCards.length / totalCards) * 100;
  
  // Get top categories by value
  const topCategories = [...insuranceData.categoryBreakdown]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  return (
    <div className="insurance-report">
      {/* Header Section */}
      <div className="insurance-header">
        <h1>
          <span className="icon">🛡️</span>
          Insurance Appraisal Report
        </h1>
        <p>Professional collection valuation for insurance coverage</p>
        <div className="header-date">
          Generated on {format(insuranceData.lastUpdated, 'MMMM d, yyyy')}
        </div>
      </div>

      {/* View Tabs */}
      <div className="view-tabs">
        <button 
          className={`tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button 
          className={`tab ${activeView === 'details' ? 'active' : ''}`}
          onClick={() => setActiveView('details')}
        >
          <span className="tab-icon">📋</span>
          Detailed Inventory
        </button>
        <button 
          className={`tab ${activeView === 'documentation' ? 'active' : ''}`}
          onClick={() => setActiveView('documentation')}
        >
          <span className="tab-icon">📄</span>
          Documentation
        </button>
      </div>

      {activeView === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="insurance-summary">
            <div className="summary-card primary">
              <div className="card-icon">💰</div>
              <div className="card-label">Total Replacement Value</div>
              <div className="card-value">{formatCurrency(insuranceData.totalReplacementValue)}</div>
              <div className="card-subtitle">Current market valuation</div>
            </div>
            
            <div className="summary-card secondary">
              <div className="card-icon">🔒</div>
              <div className="card-label">Recommended Coverage</div>
              <div className="card-value">{formatCurrency(insuranceData.recommendedCoverage)}</div>
              <div className="card-subtitle">Includes 20% buffer</div>
            </div>
            
            <div className="summary-card tertiary">
              <div className="card-icon">⭐</div>
              <div className="card-label">High-Value Items</div>
              <div className="card-value">{insuranceData.highValueCards.length}</div>
              <div className="card-subtitle">{highValuePercentage.toFixed(1)}% of collection</div>
            </div>
          </div>

          {/* Coverage Analysis */}
          <div className="coverage-analysis">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">📈</span>
                Coverage Analysis
              </h2>
            </div>
            <div className="analysis-grid">
              <div className="analysis-card">
                <div className="analysis-icon">📦</div>
                <div className="analysis-title">Total Cards</div>
                <div className="analysis-value">{totalCards.toLocaleString()}</div>
                <div className="analysis-description">Items in collection</div>
              </div>
              <div className="analysis-card">
                <div className="analysis-icon">💵</div>
                <div className="analysis-title">Average Value</div>
                <div className="analysis-value">{formatCurrency(averageCardValue)}</div>
                <div className="analysis-description">Per card average</div>
              </div>
              <div className="analysis-card">
                <div className="analysis-icon">📊</div>
                <div className="analysis-title">Categories</div>
                <div className="analysis-value">{insuranceData.categoryBreakdown.length}</div>
                <div className="analysis-description">Distinct categories</div>
              </div>
              <div className="analysis-card">
                <div className="analysis-icon">🏆</div>
                <div className="analysis-title">Graded Cards</div>
                <div className="analysis-value">
                  {insuranceData.highValueCards.filter(c => c.gradingCompany).length}
                </div>
                <div className="analysis-description">Professionally graded</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="category-breakdown">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">🗂️</span>
                Category Breakdown
              </h2>
            </div>
            <div className="category-grid">
              {topCategories.map((category) => (
                <div key={category.category} className="category-card">
                  <div className="category-name">{category.category}</div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <div className="stat-label">Cards</div>
                      <div className="stat-value">{category.cardCount}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Total</div>
                      <div className="stat-value">{formatCurrency(category.totalValue)}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Highest</div>
                      <div className="stat-value">{formatCurrency(category.highestValue)}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Average</div>
                      <div className="stat-value">{formatCurrency(category.averageValue)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Value Items */}
          <div className="high-value-section">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">💎</span>
                High-Value Items Requiring Special Coverage
              </h2>
            </div>
            <div className="high-value-grid">
              {insuranceData.highValueCards.slice(0, 10).map((card, index) => (
                <div key={card.id} className="high-value-item">
                  <div className="item-rank">{index + 1}</div>
                  <div className="item-details">
                    <div className="item-player">{card.player}</div>
                    <div className="item-info">
                      {card.year} {card.brand} #{card.cardNumber}
                    </div>
                    <div className="item-badges">
                      <span className="badge condition">{card.condition}</span>
                      {card.gradingCompany && (
                        <span className="badge graded">{card.gradingCompany}</span>
                      )}
                    </div>
                  </div>
                  <div className="item-value-box">
                    <div className="value-label">Value</div>
                    <div className="value-amount">{formatCurrency(card.currentValue || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeView === 'details' && (
        <div className="detailed-inventory">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-icon">📋</span>
              Complete Inventory Breakdown
            </h2>
          </div>
          <div className="inventory-table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Player</th>
                  <th>Year</th>
                  <th>Brand</th>
                  <th>Card #</th>
                  <th>Condition</th>
                  <th>Grading</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {insuranceData.highValueCards.map((card) => (
                  <tr key={card.id}>
                    <td>{card.category}</td>
                    <td>{card.player}</td>
                    <td>{card.year}</td>
                    <td>{card.brand}</td>
                    <td>#{card.cardNumber}</td>
                    <td>{card.condition}</td>
                    <td>{card.gradingCompany || '-'}</td>
                    <td className="value-cell">{formatCurrency(card.currentValue || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'documentation' && (
        <>
          {/* Documentation Section */}
          <div className="documentation-section">
            <div className="section-header">
              <h2 className="section-title" style={{ color: 'white' }}>
                <span className="section-icon">📄</span>
                Insurance Documentation
              </h2>
            </div>
            <div className="documentation-content">
              <div className="doc-card">
                <h4>Coverage Recommendations</h4>
                <ul>
                  <li>Total collection coverage: {formatCurrency(insuranceData.recommendedCoverage)}</li>
                  <li>Schedule high-value items individually (over $1,000)</li>
                  <li>Include grading fees in replacement cost calculations</li>
                  <li>Consider agreed value policy for stable collections</li>
                  <li>Review coverage annually or after major acquisitions</li>
                </ul>
              </div>
              <div className="doc-card">
                <h4>Storage Requirements</h4>
                <ul>
                  <li>Climate-controlled environment (65-70°F, 40-50% humidity)</li>
                  <li>UV-protected storage away from direct sunlight</li>
                  <li>Acid-free holders and storage materials</li>
                  <li>Secure location with limited access</li>
                  <li>Fire-resistant safe for highest value items</li>
                </ul>
              </div>
              <div className="doc-card">
                <h4>Documentation Best Practices</h4>
                <ul>
                  <li>Photograph all high-value cards (front and back)</li>
                  <li>Keep receipts and purchase documentation</li>
                  <li>Maintain grading certificates and reports</li>
                  <li>Update inventory quarterly</li>
                  <li>Store digital copies in multiple locations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">💡</span>
                Insurance Recommendations
              </h2>
            </div>
            <div className="recommendation-list">
              <div className="recommendation-item">
                <div className="rec-icon">🔍</div>
                <div className="rec-content">
                  <div className="rec-title">Annual Appraisal Updates</div>
                  <div className="rec-description">
                    Update your collection appraisal annually to reflect market changes. 
                    Sports card values can fluctuate significantly based on player performance and market trends.
                  </div>
                </div>
              </div>
              <div className="recommendation-item">
                <div className="rec-icon">📸</div>
                <div className="rec-content">
                  <div className="rec-title">Comprehensive Documentation</div>
                  <div className="rec-description">
                    Photograph all cards valued over $100. Include close-ups of any defects or unique characteristics. 
                    This documentation is crucial for claims processing.
                  </div>
                </div>
              </div>
              <div className="recommendation-item">
                <div className="rec-icon">🏢</div>
                <div className="rec-content">
                  <div className="rec-title">Specialized Insurance Providers</div>
                  <div className="rec-description">
                    Consider collectibles-specific insurance providers who understand the unique nature of sports cards 
                    and can offer better coverage terms than standard homeowners policies.
                  </div>
                </div>
              </div>
              <div className="recommendation-item">
                <div className="rec-icon">🔒</div>
                <div className="rec-content">
                  <div className="rec-title">Security Measures</div>
                  <div className="rec-description">
                    Implement proper security including safes, alarm systems, and restricted access. 
                    Many insurers offer discounts for documented security measures.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="report-actions">
        <button className="action-button primary">
          <span>📥</span>
          Download Full Report
        </button>
        <button className="action-button secondary">
          <span>🖨️</span>
          Print Report
        </button>
        <button className="action-button secondary">
          <span>📧</span>
          Email to Insurance
        </button>
      </div>
    </div>
  );
};

export default InsuranceReport;