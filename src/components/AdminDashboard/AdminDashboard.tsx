import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/DexieCardContext';
import { cardDatabase } from '../../db/simpleDatabase';
import { getAutoBackups } from '../../utils/backupRestore';
import './AdminDashboard.css';

interface AdminStats {
  totalCards: number;
  totalUsers: number;
  totalValue: number;
  averageCardValue: number;
  mostValuableCard: string;
  totalBackups: number;
  lastBackupDate: string | null;
  categoriesBreakdown: { [key: string]: number };
  yearBreakdown: { [key: string]: number };
}

interface UserStats {
  userId: string;
  cardCount: number;
  totalValue: number;
  avgValue: number;
}

const AdminDashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: cardState, clearAllCards } = useCards();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (authState.user?.role !== 'admin') {
      setError('Admin access required');
      setLoading(false);
      return;
    }

    calculateStats();
  }, [authState.user, cardState.cards]);

  const calculateStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all cards for admin view
      const allCards = await cardDatabase.getAllCardsAdmin();
      const userStatistics = await cardDatabase.getUserStatistics();
      const autoBackups = getAutoBackups();

      // Calculate statistics
      const totalCards = allCards.length;
      const totalUsers = new Set(allCards.map(card => card.userId)).size;
      const totalValue = allCards.reduce((sum, card) => sum + card.currentValue, 0);
      const averageCardValue = totalCards > 0 ? totalValue / totalCards : 0;

      // Find most valuable card
      const mostValuableCard = allCards.reduce((prev, current) => 
        current.currentValue > (prev?.currentValue || 0) ? current : prev
      , allCards[0]);

      // Category breakdown
      const categoriesBreakdown: { [key: string]: number } = {};
      allCards.forEach(card => {
        categoriesBreakdown[card.category] = (categoriesBreakdown[card.category] || 0) + 1;
      });

      // Year breakdown
      const yearBreakdown: { [key: string]: number } = {};
      allCards.forEach(card => {
        yearBreakdown[card.year] = (yearBreakdown[card.year] || 0) + 1;
      });

      // Backup info
      const lastBackup = autoBackups.length > 0 ? autoBackups[0] : null;

      setStats({
        totalCards,
        totalUsers,
        totalValue,
        averageCardValue,
        mostValuableCard: mostValuableCard ? `${mostValuableCard.player} (${mostValuableCard.year})` : 'N/A',
        totalBackups: autoBackups.length,
        lastBackupDate: lastBackup ? new Date(lastBackup.timestamp).toLocaleString() : null,
        categoriesBreakdown,
        yearBreakdown
      });

      setUserStats(userStatistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate stats');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    try {
      if (selectedUserId) {
        // Clear specific user's cards
        const allCards = await cardDatabase.getAllCardsAdmin();
        const userCards = allCards.filter(card => card.userId === selectedUserId);
        for (const card of userCards) {
          await cardDatabase.deleteCard(card.id);
        }
      } else {
        // Clear all cards
        const allCards = await cardDatabase.getAllCardsAdmin();
        for (const card of allCards) {
          await cardDatabase.deleteCard(card.id);
        }
      }
      setShowClearConfirm(false);
      setSelectedUserId(null);
      // Refresh stats
      calculateStats();
    } catch (error) {
      setError('Failed to clear database');
    }
  };

  const exportDatabaseInfo = () => {
    const dbInfo = {
      appVersion: '1.0.0',
      databaseType: 'Dexie (IndexedDB)',
      timestamp: new Date().toISOString(),
      stats,
      userStats,
      browserInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };

    const json = JSON.stringify(dbInfo, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-database-info-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (authState.user?.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <p>Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={calculateStats}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>🔧 Admin Dashboard</h1>

      {stats && (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Total Cards</h3>
              <p className="stat-value">{stats.totalCards.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Total Value</h3>
              <p className="stat-value">${stats.totalValue.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Average Card Value</h3>
              <p className="stat-value">${stats.averageCardValue.toFixed(2)}</p>
            </div>
          </div>

          <div className="admin-section">
            <h2>👥 User Statistics</h2>
            <div className="user-stats-table">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Cards</th>
                    <th>Total Value</th>
                    <th>Avg Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map(user => (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>{user.cardCount.toLocaleString()}</td>
                      <td>${user.totalValue.toLocaleString()}</td>
                      <td>${user.avgValue.toFixed(2)}</td>
                      <td>
                        <button 
                          className="clear-user-btn"
                          onClick={() => {
                            setSelectedUserId(user.userId);
                            setShowClearConfirm(true);
                          }}
                        >
                          Clear
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-section">
            <h2>📊 Category Breakdown (All Users)</h2>
            <div className="breakdown-grid">
              {Object.entries(stats.categoriesBreakdown).map(([category, count]) => (
                <div key={category} className="breakdown-item">
                  <span className="category">{category}</span>
                  <span className="count">{count} cards</span>
                  <span className="percentage">
                    {((count / stats.totalCards) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>📅 Year Distribution (All Users)</h2>
            <div className="year-chart">
              {Object.entries(stats.yearBreakdown)
                .sort(([a], [b]) => Number(b) - Number(a))
                .slice(0, 10)
                .map(([year, count]) => (
                  <div key={year} className="year-bar">
                    <span className="year-label">{year}</span>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{ width: `${(count / stats.totalCards) * 100}%` }}
                      />
                    </div>
                    <span className="year-count">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>💾 Backup Information</h2>
            <div className="backup-info">
              <p><strong>Total Auto-Backups:</strong> {stats.totalBackups}</p>
              <p><strong>Last Backup:</strong> {stats.lastBackupDate || 'Never'}</p>
            </div>
          </div>

          <div className="admin-section">
            <h2>⚙️ Database Management</h2>
            <div className="admin-actions">
              <button 
                onClick={exportDatabaseInfo}
                className="admin-btn export"
              >
                📊 Export Database Info
              </button>
              
              <button 
                onClick={() => {
                  setSelectedUserId(null);
                  setShowClearConfirm(true);
                }}
                className="admin-btn danger"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>

          <div className="admin-section">
            <h2>ℹ️ System Information</h2>
            <div className="system-info">
              <p><strong>App Version:</strong> 1.0.0</p>
              <p><strong>Database:</strong> Dexie (IndexedDB)</p>
              <p><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}</p>
              <p><strong>Platform:</strong> {navigator.platform}</p>
              <p><strong>Language:</strong> {navigator.language}</p>
              <p><strong>Current User:</strong> {authState.user?.username} ({authState.user?.email})</p>
              <p><strong>Current User ID:</strong> {authState.user?.id}</p>
            </div>
          </div>
        </>
      )}

      {showClearConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>⚠️ Clear {selectedUserId ? `User ${selectedUserId}'s` : 'All'} Data?</h3>
            <p>
              This will permanently delete {selectedUserId ? `all cards for user ${selectedUserId}` : 'all cards from all users'}. 
              This action cannot be undone!
            </p>
            <p><strong>Are you absolutely sure?</strong></p>
            <div className="dialog-actions">
              <button 
                onClick={handleClearDatabase}
                className="btn-confirm-danger"
              >
                Yes, Delete {selectedUserId ? 'User Data' : 'Everything'}
              </button>
              <button 
                onClick={() => {
                  setShowClearConfirm(false);
                  setSelectedUserId(null);
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;