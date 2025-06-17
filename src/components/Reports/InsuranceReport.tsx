import React, { useMemo } from 'react';
import { ReportingService } from '../../services/reportingService';
import { ReportFilter } from '../../types/reports';
import { format } from 'date-fns';

interface Props {
  reportingService: ReportingService;
  filters?: ReportFilter;
}

const InsuranceReport: React.FC<Props> = ({ reportingService, filters }) => {
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

  return (
    <div className="insurance-report">
      <div className="report-header">
        <h2>🛡️ Insurance Appraisal Report</h2>
        <p>Professional documentation for insurance purposes</p>
      </div>

      <div className="insurance-summary">
        <div className="insurance-card primary">
          <h3>Total Replacement Value</h3>
          <div className="insurance-value">{formatCurrency(insuranceData.totalReplacementValue)}</div>
          <div className="insurance-subtitle">Current market value</div>
        </div>
        
        <div className="insurance-card">
          <h3>Recommended Coverage</h3>
          <div className="insurance-value">{formatCurrency(insuranceData.recommendedCoverage)}</div>
          <div className="insurance-subtitle">20% buffer included</div>
        </div>
        
        <div className="insurance-card">
          <h3>High-Value Items</h3>
          <div className="insurance-value">{insuranceData.highValueCards.length}</div>
          <div className="insurance-subtitle">Requiring special coverage</div>
        </div>
      </div>

      <div className="category-breakdown">
        <h3>Coverage by Category</h3>
        <div className="breakdown-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Card Count</th>
                <th>Total Value</th>
                <th>Highest Value</th>
                <th>Average Value</th>
              </tr>
            </thead>
            <tbody>
              {insuranceData.categoryBreakdown.map((category) => (
                <tr key={category.category}>
                  <td>{category.category}</td>
                  <td>{category.cardCount}</td>
                  <td>{formatCurrency(category.totalValue)}</td>
                  <td>{formatCurrency(category.highestValue)}</td>
                  <td>{formatCurrency(category.averageValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="high-value-items">
        <h3>High-Value Items Requiring Special Coverage</h3>
        <div className="high-value-grid">
          {insuranceData.highValueCards.slice(0, 20).map((card) => (
            <div key={card.id} className="high-value-item">
              <div className="item-details">
                <div className="item-name">{card.player}</div>
                <div className="item-description">{card.year} {card.brand} #{card.cardNumber}</div>
                <div className="item-condition">Condition: {card.condition}</div>
                {card.gradingCompany && (
                  <div className="item-grading">Graded by: {card.gradingCompany}</div>
                )}
              </div>
              <div className="item-value">{formatCurrency(card.currentValue || 0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="insurance-notes">
        <h3>Important Notes</h3>
        <div className="notes-content">
          <ul>
            <li>This appraisal is based on current market values as of {format(insuranceData.lastUpdated, 'MMMM d, yyyy')}</li>
            <li>Recommended coverage includes a 20% buffer for market fluctuations</li>
            <li>High-value items (top 10%) may require individual scheduling</li>
            <li>Graded cards should be insured at replacement cost including grading fees</li>
            <li>Store cards in climate-controlled environment to maintain value</li>
            <li>Update appraisal annually or when market values change significantly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InsuranceReport;