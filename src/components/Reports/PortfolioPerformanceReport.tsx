import { format } from 'date-fns';
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

import { ReportingService } from '../../services/reportingService';
import { ReportFilter } from '../../types/reports';

interface Props {
  reportingService: ReportingService;
  filters?: ReportFilter;
  detailed?: boolean;
}

const PortfolioPerformanceReport: React.FC<Props> = ({ reportingService, filters, detailed = false }) => {
  const portfolioData = useMemo(
    () => reportingService.generatePortfolioPerformance(filters),
    [reportingService, filters]
  );

  const metrics = useMemo(
    () => reportingService.calculateMetrics(reportingService.filterCards(filters)),
    [reportingService, filters]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];

  // Prepare chart data
  const monthlyChartData = portfolioData.monthlyReturns.map((item) => ({
    month: format(new Date(`${item.month}-01`), 'MMM yyyy'),
    value: item.value,
    cost: item.cost,
    return: item.return,
    percentage: item.percentage,
  }));

  const categoryChartData = portfolioData.categoryPerformance.map((item) => ({
    name: item.category,
    value: item.totalValue,
    return: item.return,
    percentage: item.percentage,
  }));

  return (
    <div className="portfolio-performance-report">
      <div className="report-header">
        <h2>📊 Portfolio Performance Analysis</h2>
        <p>Comprehensive financial performance metrics and insights</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Portfolio Value</h3>
            <div className="metric-value">{formatCurrency(portfolioData.totalValue)}</div>
            <div className="metric-change positive">
              +{formatCurrency(portfolioData.totalReturn)} ({formatPercent(metrics.roi)})
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Total Return</h3>
            <div className="metric-value">{formatCurrency(portfolioData.totalReturn)}</div>
            <div className="metric-subtitle">Annualized: {formatPercent(portfolioData.annualizedReturn)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>Cost Basis</h3>
            <div className="metric-value">{formatCurrency(portfolioData.totalCost)}</div>
            <div className="metric-subtitle">Avg per card: {formatCurrency(metrics.averageCost)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🃏</div>
          <div className="metric-content">
            <h3>Total Cards</h3>
            <div className="metric-value">{metrics.totalCards.toLocaleString()}</div>
            <div className="metric-subtitle">Avg value: {formatCurrency(metrics.averageValue)}</div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>📈 Portfolio Value Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'percentage' ? formatPercent(value) : formatCurrency(value),
                  name,
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#007bff" strokeWidth={3} name="Portfolio Value" />
              <Line type="monotone" dataKey="cost" stroke="#6c757d" strokeWidth={2} name="Cost Basis" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>🥧 Value by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gains/Losses Breakdown */}
      <div className="gains-losses-section">
        <div className="section-header">
          <h3>💹 Gains & Losses Breakdown</h3>
        </div>

        <div className="gains-grid">
          <div className="gains-card unrealized">
            <h4>Unrealized Gains</h4>
            <div className="gains-value">{formatCurrency(portfolioData.unrealizedGains)}</div>
            <div className="gains-subtitle">Current holdings</div>
          </div>

          <div className="gains-card realized">
            <h4>Realized Gains</h4>
            <div className="gains-value">{formatCurrency(portfolioData.realizedGains)}</div>
            <div className="gains-subtitle">{metrics.cardsSold} cards sold</div>
          </div>

          <div className="gains-card total">
            <h4>Total P&L</h4>
            <div className={`gains-value ${portfolioData.totalReturn >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(portfolioData.totalReturn)}
            </div>
            <div className="gains-subtitle">{formatPercent(metrics.roi)} return</div>
          </div>
        </div>
      </div>

      {/* Performance by Category */}
      <div className="category-performance-section">
        <h3>📊 Performance by Category</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={categoryChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'percentage' ? formatPercent(value) : formatCurrency(value),
                name,
              ]}
            />
            <Legend />
            <Bar dataKey="value" fill="#007bff" name="Current Value" />
            <Bar dataKey="return" fill="#28a745" name="Profit/Loss" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      {detailed && (
        <>
          <div className="performers-section">
            <div className="performers-grid">
              <div className="performers-card">
                <h3>🏆 Top Performers</h3>
                <div className="performers-list">
                  {portfolioData.bestPerformers.slice(0, 5).map((card, index) => {
                    const gain = (card.currentValue || 0) - (card.purchasePrice || 0);
                    const percentage = card.purchasePrice > 0 ? (gain / card.purchasePrice) * 100 : 0;

                    return (
                      <div key={card.id} className="performer-item">
                        <div className="performer-rank">#{index + 1}</div>
                        <div className="performer-details">
                          <div className="performer-name">
                            {card.player} - {card.year} {card.brand}
                          </div>
                          <div className="performer-metrics">
                            <span className="performer-gain positive">
                              +{formatCurrency(gain)} ({formatPercent(percentage)})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="performers-card">
                <h3>📉 Underperformers</h3>
                <div className="performers-list">
                  {portfolioData.worstPerformers.slice(0, 5).map((card, index) => {
                    const gain = (card.currentValue || 0) - (card.purchasePrice || 0);
                    const percentage = card.purchasePrice > 0 ? (gain / card.purchasePrice) * 100 : 0;

                    return (
                      <div key={card.id} className="performer-item">
                        <div className="performer-rank">#{index + 1}</div>
                        <div className="performer-details">
                          <div className="performer-name">
                            {card.player} - {card.year} {card.brand}
                          </div>
                          <div className="performer-metrics">
                            <span className="performer-gain negative">
                              {formatCurrency(gain)} ({formatPercent(percentage)})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioPerformanceReport;
