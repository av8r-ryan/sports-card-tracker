import React, { useMemo, useState } from 'react';
import { ReportingService } from '../../services/reportingService';
import { ReportFilter } from '../../types/reports';
import { format } from 'date-fns';

interface Props {
  reportingService: ReportingService;
  filters?: ReportFilter;
}

const TaxReport: React.FC<Props> = ({ reportingService, filters }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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

  return (
    <div className="tax-report">
      <div className="report-header">
        <h2>📋 Tax Report</h2>
        <div className="year-selector">
          <label htmlFor="tax-year">Tax Year:</label>
          <select
            id="tax-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="tax-summary">
        <div className="tax-card">
          <h3>Short-Term Capital Gains</h3>
          <div className="tax-value">{formatCurrency(taxData.totalShortTerm)}</div>
          <div className="tax-subtitle">{taxData.shortTermGains.length} transactions</div>
        </div>
        
        <div className="tax-card">
          <h3>Long-Term Capital Gains</h3>
          <div className="tax-value">{formatCurrency(taxData.totalLongTerm)}</div>
          <div className="tax-subtitle">{taxData.longTermGains.length} transactions</div>
        </div>
        
        <div className="tax-card total">
          <h3>Net Capital Gain/Loss</h3>
          <div className={`tax-value ${taxData.netGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(taxData.netGainLoss)}
          </div>
          <div className="tax-subtitle">For {selectedYear}</div>
        </div>
      </div>

      <div className="tax-transactions">
        <h3>Transaction Details</h3>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Card</th>
                <th>Purchase Date</th>
                <th>Sale Date</th>
                <th>Cost Basis</th>
                <th>Sale Price</th>
                <th>Gain/Loss</th>
                <th>Term</th>
              </tr>
            </thead>
            <tbody>
              {[...taxData.shortTermGains, ...taxData.longTermGains].map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.card.player} - {transaction.card.year} {transaction.card.brand}</td>
                  <td>{format(transaction.purchaseDate, 'MM/dd/yyyy')}</td>
                  <td>{format(transaction.sellDate, 'MM/dd/yyyy')}</td>
                  <td>{formatCurrency(transaction.costBasis)}</td>
                  <td>{formatCurrency(transaction.salePrice)}</td>
                  <td className={transaction.gainLoss >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(transaction.gainLoss)}
                  </td>
                  <td>{transaction.holdingPeriod > 365 ? 'Long-term' : 'Short-term'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaxReport;