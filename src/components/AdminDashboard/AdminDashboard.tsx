import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/DexieCardContext';
import { cardDatabase } from '../../db/simpleDatabase';
import { getAutoBackups } from '../../utils/backupRestore';
import { backupDatabase } from '../../db/backupDatabase';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
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
  username: string;
  cardCount: number;
  totalValue: number;
  avgValue: number;
}

interface BackupInfo {
  id?: number;
  timestamp: string;
  type: 'auto' | 'manual';
  sizeInMB: number;
  totalCards: number;
  totalValue: number;
  userName?: string;
}

const AdminDashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: cardState, clearAllCards } = useCards();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
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
      const autoBackups = await getAutoBackups();
      
      // Get all backups from IndexedDB
      const allBackups = await backupDatabase.getAllBackups();
      const backupInfos: BackupInfo[] = allBackups.map(b => ({
        id: b.id,
        timestamp: b.timestamp,
        type: b.type,
        sizeInMB: b.sizeInMB,
        totalCards: b.backup.metadata.totalCards,
        totalValue: b.backup.metadata.totalValue,
        userName: b.backup.metadata.userName
      }));

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
        totalBackups: allBackups.length,
        lastBackupDate: lastBackup ? new Date(lastBackup.timestamp).toLocaleString() : null,
        categoriesBreakdown,
        yearBreakdown
      });

      setUserStats(userStatistics);
      setBackups(backupInfos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
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
      <AnimatedWrapper animation="fadeInDown" duration={0.6}>
        <h1 className="text-gradient">🔧 Admin Dashboard</h1>
      </AnimatedWrapper>

      {stats && (
        <>
          <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
            <div className="admin-stats">
              <motion.div 
                className="stat-card card-glass hover-lift"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3>Total Users</h3>
                <p className="stat-value animate-pulse">{stats.totalUsers.toLocaleString()}</p>
              </motion.div>
              <motion.div 
                className="stat-card card-glass hover-lift"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3>Total Cards</h3>
                <p className="stat-value animate-pulse">{stats.totalCards.toLocaleString()}</p>
              </motion.div>
              <motion.div 
                className="stat-card card-glass hover-lift"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3>Total Value</h3>
                <p className="stat-value animate-pulse">${stats.totalValue.toLocaleString()}</p>
              </motion.div>
              <motion.div 
                className="stat-card card-glass hover-lift"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <h3>Average Card Value</h3>
                <p className="stat-value animate-pulse">${stats.averageCardValue.toFixed(2)}</p>
              </motion.div>
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.4}>
            <CollapsibleMenu title="User Statistics" icon="👥" defaultOpen={true}>
              <div className="user-stats-table">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Cards</th>
                      <th>Total Value</th>
                      <th>Avg Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((user, index) => (
                      <motion.tr 
                        key={user.userId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <td>{user.username}</td>
                        <td>{user.cardCount.toLocaleString()}</td>
                        <td>${user.totalValue.toLocaleString()}</td>
                        <td>${user.avgValue.toFixed(2)}</td>
                        <td>
                          <motion.button 
                            className="clear-user-btn"
                            onClick={() => {
                              setSelectedUserId(user.userId);
                              setShowClearConfirm(true);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Clear
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleMenu>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.6}>
            <CollapsibleMenu title="Category Breakdown" icon="📊">
              <div className="breakdown-grid">
                {Object.entries(stats.categoriesBreakdown).map(([category, count], index) => (
                  <motion.div 
                    key={category} 
                    className="breakdown-item card-glass"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="category">{category}</span>
                    <span className="count">{count} cards</span>
                    <span className="percentage">
                      {((count / stats.totalCards) * 100).toFixed(1)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </CollapsibleMenu>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.8}>
            <CollapsibleMenu title="Year Distribution" icon="📅">
              <div className="year-chart">
                {Object.entries(stats.yearBreakdown)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .slice(0, 10)
                  .map(([year, count], index) => (
                    <motion.div 
                      key={year} 
                      className="year-bar"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="year-label">{year}</span>
                      <div className="bar-container">
                        <motion.div 
                          className="bar" 
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / stats.totalCards) * 100}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="year-count">{count}</span>
                    </motion.div>
                  ))}
              </div>
            </CollapsibleMenu>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={1.0}>
            <CollapsibleMenu title="Backup & Restore" icon="💾">
              {backups.length === 0 ? (
                <div className="backup-info">
                  <p>No backups found</p>
                </div>
              ) : (
                <div className="backup-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>User</th>
                        <th>Cards</th>
                        <th>Total Value</th>
                        <th>Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup, index) => (
                        <motion.tr 
                          key={backup.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <td>{new Date(backup.timestamp).toLocaleString()}</td>
                          <td>
                            <span className={`backup-type ${backup.type}`}>
                              {backup.type === 'auto' ? '🔄 Auto' : '📦 Manual'}
                            </span>
                          </td>
                          <td>{backup.userName || 'Unknown'}</td>
                          <td>{backup.totalCards.toLocaleString()}</td>
                          <td>${backup.totalValue.toLocaleString()}</td>
                          <td>{backup.sizeInMB.toFixed(2)} MB</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="backup-summary">
                    <p><strong>Total Backups:</strong> {stats.totalBackups}</p>
                    <p><strong>Total Size:</strong> {backups.reduce((sum, b) => sum + b.sizeInMB, 0).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </CollapsibleMenu>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={1.2}>
            <CollapsibleMenu title="Database Management" icon="⚙️">
              <div className="admin-actions">
                <motion.button 
                  onClick={exportDatabaseInfo}
                  className="admin-btn export"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📊 Export Database Info
                </motion.button>
                
                <motion.button 
                  onClick={() => {
                    setSelectedUserId(null);
                    setShowClearConfirm(true);
                  }}
                  className="admin-btn danger"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗑️ Clear All Data
                </motion.button>
              </div>
            </CollapsibleMenu>
          </AnimatedWrapper>

          <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={1.4}>
            <CollapsibleMenu title="System Information" icon="ℹ️">
              <div className="system-info">
                <motion.div 
                  className="info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <strong>App Version:</strong> 1.0.0
                </motion.div>
                <motion.div 
                  className="info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <strong>Database:</strong> Dexie (IndexedDB)
                </motion.div>
                <motion.div 
                  className="info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}
                </motion.div>
                <motion.div 
                  className="info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <strong>Platform:</strong> {navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Win') ? 'Windows' : navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown'}
                </motion.div>
                <motion.div 
                  className="info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <strong>Language:</strong> {navigator.language}
                </motion.div>
                <motion.div 
                  className="info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <strong>Current User:</strong> {authState.user?.username} ({authState.user?.email})
                </motion.div>
                <motion.div 
                  className="info-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <strong>Current User ID:</strong> {authState.user?.id}
                </motion.div>
              </div>
            </CollapsibleMenu>
          </AnimatedWrapper>
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