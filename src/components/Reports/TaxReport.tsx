import React, { useMemo, useState } from 'react';
import { ReportingService } from '../../services/reportingService';
import { ReportFilter } from '../../types/reports';
import { format } from 'date-fns';
import './TaxReport.css';

interface Props {
  reportingService: ReportingService;
  filters?: ReportFilter;
}

const TaxReport: React.FC<Props> = ({ reportingService, filters }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState<'all' | 'short-term' | 'long-term'>('all');
  
  const taxData = useMemo(() => 
    reportingService.generateTaxReport(selectedYear, filters), 
    [reportingService, selectedYear, filters]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - i
  );

  // Calculate additional metrics
  const totalTransactions = taxData.shortTermGains.length + taxData.longTermGains.length;
  const totalGains = [...taxData.shortTermGains, ...taxData.longTermGains]
    .filter(t => t.gainLoss > 0)
    .reduce((sum, t) => sum + t.gainLoss, 0);
  const totalLosses = [...taxData.shortTermGains, ...taxData.longTermGains]
    .filter(t => t.gainLoss < 0)
    .reduce((sum, t) => sum + t.gainLoss, 0);

  // Filter transactions based on selected type
  const filteredTransactions = useMemo(() => {
    const allTransactions = [...taxData.shortTermGains, ...taxData.longTermGains];
    
    switch (filterType) {
      case 'short-term':
        return taxData.shortTermGains;
      case 'long-term':
        return taxData.longTermGains;
      default:
        return allTransactions;
    }
  }, [taxData, filterType]);

  // Get category icons
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Baseball': '⚾',
      'Basketball': '🏀',
      'Football': '🏈',
      'Pokemon': '🎮',
      'Other': '🃏'
    };
    return icons[category] || '🃏';
  };

  if (totalTransactions === 0) {
    return (
      <div className="tax-report">
        <div className="tax-header">
          <h1>
            <span className="icon">📋</span>
            Tax Report
          </h1>
          <p>Capital gains and losses documentation for tax filing</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2 className="empty-title">No Transactions Found</h2>
          <p className="empty-message">
            No card sales were recorded for {selectedYear}. 
            Tax reports will be generated when you sell cards from your collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tax-report">
      {/* Header Section */}
      <div className="tax-header">
        <h1>
          <span className="icon">📋</span>
          Tax Report
        </h1>
        <p>Capital gains and losses documentation for tax filing</p>
        <div className="year-selector-container">
          <label htmlFor="tax-year">Tax Year:</label>
          <select
            id="tax-year"
            className="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tax Forms Quick Access */}
      <div className="tax-forms">
        <div className="form-card form-8949">
          <div className="form-icon">📄</div>
          <div className="form-name">Form 8949</div>
          <div className="form-description">Sales and Dispositions of Capital Assets</div>
          <div className="form-status">Ready to Generate</div>
        </div>
        <div className="form-card schedule-d">
          <div className="form-icon">📑</div>
          <div className="form-name">Schedule D</div>
          <div className="form-description">Capital Gains and Losses</div>
          <div className="form-status">Ready to Generate</div>
        </div>
        <div className="form-card form-1099">
          <div className="form-icon">📋</div>
          <div className="form-name">1099 Summary</div>
          <div className="form-description">Income Summary Report</div>
          <div className="form-status">Ready to Generate</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="tax-summary">
        <div className="summary-card gains">
          <div className="card-header">
            <h3 className="card-title">Total Capital Gains</h3>
            <span className="card-icon">📈</span>
          </div>
          <div className="card-value value-positive">{formatCurrency(totalGains)}</div>
          <div className="card-details">
            <div className="detail-item">
              <div className="detail-label">Short-Term</div>
              <div className="detail-value">{formatCurrency(Math.max(0, taxData.totalShortTerm))}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Long-Term</div>
              <div className="detail-value">{formatCurrency(Math.max(0, taxData.totalLongTerm))}</div>
            </div>
          </div>
        </div>
        
        <div className="summary-card losses">
          <div className="card-header">
            <h3 className="card-title">Total Capital Losses</h3>
            <span className="card-icon">📉</span>
          </div>
          <div className="card-value value-negative">{formatCurrency(totalLosses)}</div>
          <div className="card-details">
            <div className="detail-item">
              <div className="detail-label">Deductible</div>
              <div className="detail-value">{formatCurrency(Math.max(-3000, totalLosses))}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Carryforward</div>
              <div className="detail-value">{formatCurrency(Math.min(0, totalLosses + 3000))}</div>
            </div>
          </div>
        </div>
        
        <div className="summary-card net">
          <div className="card-header">
            <h3 className="card-title">Net Capital Gain/Loss</h3>
            <span className="card-icon">💰</span>
          </div>
          <div className={`card-value ${taxData.netGainLoss >= 0 ? 'value-positive' : 'value-negative'}`}>
            {formatCurrency(taxData.netGainLoss)}
          </div>
          <div className="card-details">
            <div className="detail-item">
              <div className="detail-label">Transactions</div>
              <div className="detail-value">{totalTransactions}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Tax Year</div>
              <div className="detail-value">{selectedYear}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Strategies */}
      <div className="tax-strategies">
        <div className="strategies-header">
          <h2 className="strategies-title">Tax Optimization Strategies</h2>
          <p className="strategies-subtitle">Maximize your after-tax returns</p>
        </div>
        <div className="strategies-grid">
          <div className="strategy-card">
            <div className="strategy-number">1</div>
            <h3 className="strategy-title">Hold for Long-Term</h3>
            <p className="strategy-description">
              Hold cards for over 365 days to qualify for lower long-term capital gains tax rates, 
              potentially saving 10-20% on taxes.
            </p>
          </div>
          <div className="strategy-card">
            <div className="strategy-number">2</div>
            <h3 className="strategy-title">Tax Loss Harvesting</h3>
            <p className="strategy-description">
              Offset gains by selling underperforming cards. You can deduct up to $3,000 
              in losses against ordinary income annually.
            </p>
          </div>
          <div className="strategy-card">
            <div className="strategy-number">3</div>
            <h3 className="strategy-title">Strategic Timing</h3>
            <p className="strategy-description">
              Time your sales across tax years to manage your tax bracket and optimize 
              your overall tax liability.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="transaction-breakdown">
        <div className="breakdown-header">
          <h2 className="breakdown-title">
            <span className="section-icon">📊</span>
            Transaction Details
          </h2>
          <div className="breakdown-filters">
            <button 
              className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All Transactions
            </button>
            <button 
              className={`filter-button ${filterType === 'short-term' ? 'active' : ''}`}
              onClick={() => setFilterType('short-term')}
            >
              Short-Term
            </button>
            <button 
              className={`filter-button ${filterType === 'long-term' ? 'active' : ''}`}
              onClick={() => setFilterType('long-term')}
            >
              Long-Term
            </button>
          </div>
        </div>
        
        <div className="transactions-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Card Details</th>
                <th>Purchase Date</th>
                <th>Sale Date</th>
                <th>Holding Period</th>
                <th>Cost Basis</th>
                <th>Sale Price</th>
                <th>Gain/Loss</th>
                <th>Tax Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>
                    <div className="card-info">
                      <div className="card-category">
                        {getCategoryIcon(transaction.card.category)}
                      </div>
                      <div className="card-details-cell">
                        <div className="player-name">{transaction.card.player}</div>
                        <div className="card-meta">
                          {transaction.card.year} {transaction.card.brand} #{transaction.card.cardNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="date-cell">{format(transaction.purchaseDate, 'MM/dd/yyyy')}</td>
                  <td className="date-cell">{format(transaction.sellDate, 'MM/dd/yyyy')}</td>
                  <td>{transaction.holdingPeriod} days</td>
                  <td className="amount-cell">{formatCurrency(transaction.costBasis)}</td>
                  <td className="amount-cell">{formatCurrency(transaction.salePrice)}</td>
                  <td className={`gain-loss-cell ${transaction.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(transaction.gainLoss)}
                  </td>
                  <td>
                    <span className={`term-badge ${transaction.holdingPeriod > 365 ? 'long-term' : 'short-term'}`}>
                      {transaction.holdingPeriod > 365 ? 'Long-Term' : 'Short-Term'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Insights */}
      <div className="tax-insights">
        <div className="insight-card">
          <div className="insight-header">
            <div className="insight-icon">💡</div>
            <h3 className="insight-title">Tax Efficiency Score</h3>
          </div>
          <p className="insight-content">
            {taxData.longTermGains.length > taxData.shortTermGains.length 
              ? `Great job! ${((taxData.longTermGains.length / totalTransactions) * 100).toFixed(0)}% of your sales qualified for favorable long-term capital gains treatment.`
              : `Consider holding cards longer. Only ${((taxData.longTermGains.length / totalTransactions) * 100).toFixed(0)}% of your sales qualified for long-term rates.`
            }
          </p>
          <div className="insight-action">
            Learn more about tax strategies →
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <div className="insight-icon">📈</div>
            <h3 className="insight-title">Estimated Tax Impact</h3>
          </div>
          <p className="insight-content">
            Based on your net gain of {formatCurrency(taxData.netGainLoss)}, 
            you may owe approximately {formatCurrency(taxData.netGainLoss * 0.15)} to {formatCurrency(taxData.netGainLoss * 0.28)} 
            in taxes, depending on your tax bracket and filing status.
          </p>
          <div className="insight-action">
            Calculate exact tax liability →
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <div className="insight-icon">📅</div>
            <h3 className="insight-title">Important Deadlines</h3>
          </div>
          <p className="insight-content">
            Remember to report these transactions on your {selectedYear + 1} tax return. 
            Form 8949 and Schedule D are due by April 15, {selectedYear + 1}. 
            Consider making estimated tax payments if your gains are substantial.
          </p>
          <div className="insight-action">
            Set tax reminders →
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <button className="export-button primary">
          <span>📥</span>
          Download Tax Report
        </button>
        <button className="export-button secondary">
          <span>📊</span>
          Export to TurboTax
        </button>
        <button className="export-button secondary">
          <span>📧</span>
          Email to Accountant
        </button>
      </div>
    </div>
  );
};

export default TaxReport;