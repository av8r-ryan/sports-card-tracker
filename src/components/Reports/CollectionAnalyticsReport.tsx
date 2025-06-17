import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { ReportingService } from '../../services/reportingService';
import { ReportFilter } from '../../types/reports';

interface Props {
  reportingService: ReportingService;
  filters?: ReportFilter;
}

const CollectionAnalyticsReport: React.FC<Props> = ({ reportingService, filters }) => {
  const analytics = useMemo(() => 
    reportingService.generateCollectionAnalytics(filters), 
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

  const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

  return (
    <div className="collection-analytics-report">
      <div className="report-header">
        <h2>📈 Collection Analytics</h2>
        <p>Deep insights into your collection composition and trends</p>
      </div>

      {/* Distribution Charts Grid */}
      <div className="analytics-grid">
        {/* Category Distribution */}
        <div className="chart-container">
          <h3>🎯 Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <p>Most collected: <strong>{analytics.categoryDistribution[0]?.category}</strong> 
               ({analytics.categoryDistribution[0]?.count} cards)</p>
          </div>
        </div>

        {/* Condition Distribution */}
        <div className="chart-container">
          <h3>⭐ Condition Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.conditionDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="condition" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <p>Average value by condition varies significantly</p>
          </div>
        </div>

        {/* Year Distribution */}
        <div className="chart-container">
          <h3>📅 Year Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.yearDistribution.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#28a745" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <p>Collection spans {analytics.yearDistribution.length} different years</p>
          </div>
        </div>

        {/* Value Distribution */}
        <div className="chart-container">
          <h3>💰 Value Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.valueDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value: number, name: string) => [
                name === 'totalValue' ? formatCurrency(value) : value,
                name
              ]} />
              <Bar dataKey="count" fill="#ffc107" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-summary">
            <p>Most cards fall in the lower value ranges</p>
          </div>
        </div>
      </div>

      {/* Acquisition Pattern */}
      <div className="acquisition-section">
        <h3>📊 Acquisition Pattern</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analytics.acquisitionPattern}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number, name: string) => [
              name === 'totalSpent' || name === 'averagePrice' ? formatCurrency(value) : value,
              name
            ]} />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#007bff" name="Cards Acquired" />
            <Line yAxisId="right" type="monotone" dataKey="totalSpent" stroke="#dc3545" strokeWidth={3} name="Total Spent" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Statistics */}
      <div className="detailed-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <h4>📦 Brand Distribution</h4>
            <div className="stat-list">
              {analytics.brandDistribution.slice(0, 8).map((brand, index) => (
                <div key={brand.brand} className="stat-item">
                  <span className="stat-label">{brand.brand}</span>
                  <span className="stat-value">{brand.count} cards</span>
                  <span className="stat-percentage">{brand.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h4>🏟️ Team Distribution</h4>
            <div className="stat-list">
              {analytics.teamDistribution.slice(0, 8).map((team, index) => (
                <div key={team.team} className="stat-item">
                  <span className="stat-label">{team.team}</span>
                  <span className="stat-value">{team.count} cards</span>
                  <span className="stat-percentage">{team.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h4>💎 Condition Quality</h4>
            <div className="stat-list">
              {analytics.conditionDistribution.map((condition, index) => (
                <div key={condition.condition} className="stat-item">
                  <span className="stat-label">{condition.condition}</span>
                  <span className="stat-value">{condition.count} cards</span>
                  <span className="stat-price">{formatCurrency(condition.averageValue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h4>📈 Key Insights</h4>
            <div className="insights-list">
              <div className="insight-item">
                <span className="insight-icon">🏆</span>
                <span className="insight-text">
                  Top category: {analytics.categoryDistribution[0]?.category} 
                  ({analytics.categoryDistribution[0]?.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">💰</span>
                <span className="insight-text">
                  Highest value category: {analytics.categoryDistribution
                    .sort((a, b) => b.averageValue - a.averageValue)[0]?.category}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">⭐</span>
                <span className="insight-text">
                  Most common condition: {analytics.conditionDistribution
                    .sort((a, b) => b.count - a.count)[0]?.condition}
                </span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">📅</span>
                <span className="insight-text">
                  Most collected year: {analytics.yearDistribution[0]?.year}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionAnalyticsReport;