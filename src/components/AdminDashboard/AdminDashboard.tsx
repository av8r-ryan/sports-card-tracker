import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

interface AdminStats {
  totalUsers: number;
  totalCollections: number;
  totalCards: number;
  totalMemberships: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  isDefault: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authState.user?.role !== 'admin') {
      setError('Admin access required');
      setLoading(false);
      return;
    }

    fetchAdminData();
  }, [authState.user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch stats, users, and collections in parallel
      const [statsRes, usersRes, collectionsRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/stats', { headers }),
        fetch('http://localhost:8000/api/admin/users', { headers }),
        fetch('http://localhost:8000/api/admin/collections', { headers })
      ]);

      if (!statsRes.ok || !usersRes.ok || !collectionsRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const [statsData, usersData, collectionsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        collectionsRes.json()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setCollections(collectionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
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
          <div className="spinner"></div>
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
          <button onClick={fetchAdminData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📂</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalCollections}</div>
              <div className="stat-label">Collections</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🃏</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalCards}</div>
              <div className="stat-label">Total Cards</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔗</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalMemberships}</div>
              <div className="stat-label">Memberships</div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-sections">
        <div className="admin-section">
          <h2>Users</h2>
          <div className="section-content">
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className="users-table">
                <div className="table-header">
                  <span>Username</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Created</span>
                </div>
                {users.map(user => (
                  <div key={user.id} className="table-row">
                    <span className="username">
                      {user.role === 'admin' ? '🔑' : '👤'} {user.username}
                    </span>
                    <span>{user.email}</span>
                    <span className={`role ${user.role}`}>{user.role}</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Collections</h2>
          <div className="section-content">
            {collections.length === 0 ? (
              <p>No collections found</p>
            ) : (
              <div className="collections-table">
                <div className="table-header">
                  <span>Name</span>
                  <span>Description</span>
                  <span>Type</span>
                  <span>Created</span>
                </div>
                {collections.map(collection => (
                  <div key={collection.id} className="table-row">
                    <span className="collection-name">
                      {collection.isDefault ? '🌟' : '📂'} {collection.name}
                    </span>
                    <span>{collection.description || 'No description'}</span>
                    <span className={`collection-type ${collection.isDefault ? 'default' : 'custom'}`}>
                      {collection.isDefault ? 'Default' : 'Custom'}
                    </span>
                    <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;