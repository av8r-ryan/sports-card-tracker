import React, { memo, useMemo } from 'react';
import { useCards } from '../../context/CardContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { state, getPortfolioStats } = useCards();
  const stats = getPortfolioStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const recentCards = useMemo(() => {
    return [...state.cards]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }, [state.cards]);

  const topPerformers = useMemo(() => {
    return [...state.cards]
      .map(card => ({
        ...card,
        profit: card.currentValue - card.purchasePrice,
        profitPercent: ((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100
      }))
      .sort((a, b) => b.profitPercent - a.profitPercent)
      .slice(0, 5);
  }, [state.cards]);

  return (
    <div className="dashboard">
      <h1>Portfolio Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Cards</h3>
          <p className="stat-value">{stats.totalCards}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Investment</h3>
          <p className="stat-value">{formatCurrency(stats.totalCostBasis)}</p>
        </div>
        
        <div className="stat-card">
          <h3>Current Value</h3>
          <p className="stat-value">{formatCurrency(stats.totalCurrentValue)}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total P&L</h3>
          <p className={`stat-value ${stats.totalProfit >= 0 ? 'profit' : 'loss'}`}>
            {formatCurrency(stats.totalProfit)}
          </p>
        </div>
        
        <div className="stat-card">
          <h3>Cards Sold</h3>
          <p className="stat-value">{stats.totalSold}</p>
        </div>
        
        <div className="stat-card">
          <h3>Sales Revenue</h3>
          <p className="stat-value">{formatCurrency(stats.totalSoldValue)}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-cards">
          <h2>Recent Additions</h2>
          {recentCards.length > 0 ? (
            <div className="card-list">
              {recentCards.map(card => (
                <div key={card.id} className="card-item">
                  <div className="card-info">
                    <strong>{card.year} {card.brand} {card.player}</strong>
                    <span>{card.team} - #{card.cardNumber}</span>
                  </div>
                  <div className="card-value">
                    {formatCurrency(card.currentValue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No cards added yet.</p>
          )}
        </div>

        <div className="top-performers">
          <h2>Top Performers</h2>
          {topPerformers.length > 0 ? (
            <div className="card-list">
              {topPerformers.map(card => (
                <div key={card.id} className="card-item">
                  <div className="card-info">
                    <strong>{card.year} {card.brand} {card.player}</strong>
                    <span>{card.team} - #{card.cardNumber}</span>
                  </div>
                  <div className="card-performance">
                    <span className={`profit ${card.profit >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(card.profit)}
                    </span>
                    <span className={`percent ${card.profitPercent >= 0 ? 'positive' : 'negative'}`}>
                      ({card.profitPercent > 0 ? '+' : ''}{card.profitPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No performance data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Dashboard);