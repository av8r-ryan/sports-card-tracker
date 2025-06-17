import React, { useMemo } from 'react';
import { ReportingService } from '../../services/reportingService';
import { ReportFilter } from '../../types/reports';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Props {
  reportingService: ReportingService;
  filters?: ReportFilter;
  detailed?: boolean;
}

const MarketAnalysisReport: React.FC<Props> = ({ reportingService, filters, detailed = false }) => {
  const marketData = useMemo(() => 
    reportingService.generateMarketAnalysis(filters), 
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

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="market-analysis-report">
      <div className="report-header">
        <h2>📉 Market Analysis & Investment Insights</h2>
        <p>Performance analysis and market positioning</p>
      </div>

      {/* Market Comparison */}
      <div className="market-comparison-section">
        <h3>📊 Portfolio vs Market Performance</h3>
        <div className="comparison-cards">
          <div className="comparison-card portfolio">
            <div className="comparison-label">Your Portfolio</div>
            <div className="comparison-value">{formatPercent(marketData.marketComparison.portfolioReturn)}</div>
            <div className="comparison-subtitle">Total Return</div>
          </div>
          
          <div className="comparison-card market">
            <div className="comparison-label">Market Index</div>
            <div className="comparison-value">{formatPercent(marketData.marketComparison.marketIndex)}</div>
            <div className="comparison-subtitle">Benchmark</div>
          </div>
          
          <div className={`comparison-card outperformance ${marketData.marketComparison.outperformance >= 0 ? 'positive' : 'negative'}`}>
            <div className="comparison-label">Outperformance</div>
            <div className="comparison-value">
              {marketData.marketComparison.outperformance >= 0 ? '+' : ''}
              {formatPercent(marketData.marketComparison.outperformance)}
            </div>
            <div className="comparison-subtitle">vs Benchmark</div>
          </div>
        </div>
      </div>

      {/* Top Gainers and Losers */}
      <div className="gainers-losers-section">
        <div className="performers-grid">
          <div className="performers-card gainers">
            <h3>🚀 Top Gainers</h3>
            <div className="performers-list">
              {marketData.topGainers.slice(0, 8).map((performer, index) => (
                <div key={performer.card.id} className="performer-item">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-details">
                    <div className="performer-name">
                      {performer.card.player} - {performer.card.year} {performer.card.brand}
                    </div>
                    <div className="performer-team">{performer.card.team}</div>
                    <div className="performer-metrics">
                      <span className="performer-gain positive">
                        +{formatCurrency(performer.gainLoss)} ({formatPercent(performer.percentage)})
                      </span>
                      <span className="performer-value">
                        {formatCurrency(performer.currentValue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="performers-card losers">
            <h3>📉 Top Losers</h3>
            <div className="performers-list">
              {marketData.topLosers.slice(0, 8).map((performer, index) => (
                <div key={performer.card.id} className="performer-item">
                  <div className="performer-rank">#{index + 1}</div>
                  <div className="performer-details">
                    <div className="performer-name">
                      {performer.card.player} - {performer.card.year} {performer.card.brand}
                    </div>
                    <div className="performer-team">{performer.card.team}</div>
                    <div className="performer-metrics">
                      <span className="performer-gain negative">
                        {formatCurrency(performer.gainLoss)} ({formatPercent(performer.percentage)})
                      </span>
                      <span className="performer-value">
                        {formatCurrency(performer.currentValue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player Performance Analysis */}
      <div className="player-performance-section">
        <h3>👨‍💼 Player Performance Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={marketData.playerPerformance.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="player" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={formatPercent} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'totalValue' ? formatCurrency(value) : 
                name === 'averageGain' ? formatPercent(value) : value,
                name
              ]}
            />
            <Bar dataKey="averageGain" fill="#007bff" name="Average Gain %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Investment Insights */}
      {detailed && (
        <div className="investment-insights-section">
          <h3>🔍 Investment Insights & Recommendations</h3>
          
          <div className="insights-grid">
            <div className="insight-card risk-analysis">
              <h4>⚖️ Risk Analysis</h4>
              <div className="risk-metrics">
                <div className="risk-item">
                  <span className="risk-label">Portfolio Concentration</span>
                  <span className="risk-value">
                    {((marketData.playerPerformance[0]?.totalCards || 0) / 
                      marketData.playerPerformance.reduce((sum, p) => sum + p.totalCards, 0) * 100).toFixed(1)}%
                  </span>
                  <span className="risk-status moderate">Moderate</span>
                </div>
                <div className="risk-item">
                  <span className="risk-label">Top Player Exposure</span>
                  <span className="risk-value">{marketData.playerPerformance[0]?.player || 'N/A'}</span>
                  <span className="risk-status low">Manageable</span>
                </div>
                <div className="risk-item">
                  <span className="risk-label">Volatility Level</span>
                  <span className="risk-value">
                    {Math.abs(marketData.marketComparison.outperformance) > 10 ? 'High' : 'Moderate'}
                  </span>
                  <span className={`risk-status ${Math.abs(marketData.marketComparison.outperformance) > 10 ? 'high' : 'moderate'}`}>
                    {Math.abs(marketData.marketComparison.outperformance) > 10 ? 'Monitor' : 'Acceptable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="insight-card opportunities">
              <h4>🎯 Investment Opportunities</h4>
              <div className="opportunities-list">
                <div className="opportunity-item">
                  <span className="opportunity-icon">💎</span>
                  <div className="opportunity-content">
                    <div className="opportunity-title">Undervalued Assets</div>
                    <div className="opportunity-desc">
                      {marketData.topLosers.length} cards showing temporary weakness
                    </div>
                  </div>
                </div>
                <div className="opportunity-item">
                  <span className="opportunity-icon">🚀</span>
                  <div className="opportunity-content">
                    <div className="opportunity-title">Growth Momentum</div>
                    <div className="opportunity-desc">
                      {marketData.topGainers.filter(g => g.percentage > 50).length} cards with strong momentum
                    </div>
                  </div>
                </div>
                <div className="opportunity-item">
                  <span className="opportunity-icon">⚖️</span>
                  <div className="opportunity-content">
                    <div className="opportunity-title">Diversification</div>
                    <div className="opportunity-desc">
                      Consider expanding into underrepresented categories
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="insight-card recommendations">
              <h4>📋 Strategic Recommendations</h4>
              <div className="recommendations-list">
                {marketData.marketComparison.outperformance > 15 && (
                  <div className="recommendation-item positive">
                    <span className="rec-icon">✅</span>
                    <span className="rec-text">Strong outperformance - consider taking some profits</span>
                  </div>
                )}
                {marketData.marketComparison.outperformance < -10 && (
                  <div className="recommendation-item negative">
                    <span className="rec-icon">⚠️</span>
                    <span className="rec-text">Underperforming market - review strategy</span>
                  </div>
                )}
                <div className="recommendation-item neutral">
                  <span className="rec-icon">📊</span>
                  <span className="rec-text">Monitor top performers for selling opportunities</span>
                </div>
                <div className="recommendation-item neutral">
                  <span className="rec-icon">🎯</span>
                  <span className="rec-text">Consider dollar-cost averaging on favorite players</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysisReport;