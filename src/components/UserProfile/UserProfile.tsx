import { motion } from 'framer-motion';
import React, { useState, useRef, useMemo } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useCards } from '../../context/DexieCardContext';
import { userService } from '../../services/userService';
import AnimatedWrapper from '../Animation/AnimatedWrapper';
import CollapsibleMenu from '../UI/CollapsibleMenu';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { state: authState, logout, updateUser } = useAuth();
  const { state: cardState } = useCards();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: authState.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profilePhoto, setProfilePhoto] = useState<string | null>(authState.user?.profilePhoto || null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Achievement system
  const achievements = useMemo(() => {
    const totalCards = cardState.cards.length;
    const totalValue = cardState.cards.reduce((sum, card) => sum + (card.currentValue || 0), 0);
    const soldCards = cardState.cards.filter((card) => card.sellDate).length;
    const profit = cardState.cards.reduce((sum, card) => {
      if (card.sellDate && card.sellPrice) {
        return sum + (card.sellPrice - (card.purchasePrice || 0));
      }
      return sum;
    }, 0);

    return [
      {
        id: 'first-card',
        title: 'First Card',
        description: 'Added your first card to the collection',
        icon: '🎯',
        unlocked: totalCards >= 1,
        progress: Math.min(totalCards, 1),
        maxProgress: 1,
      },
      {
        id: 'card-collector',
        title: 'Card Collector',
        description: 'Added 10 cards to your collection',
        icon: '📚',
        unlocked: totalCards >= 10,
        progress: Math.min(totalCards, 10),
        maxProgress: 10,
      },
      {
        id: 'serious-collector',
        title: 'Serious Collector',
        description: 'Added 50 cards to your collection',
        icon: '🏆',
        unlocked: totalCards >= 50,
        progress: Math.min(totalCards, 50),
        maxProgress: 50,
      },
      {
        id: 'high-roller',
        title: 'High Roller',
        description: 'Collection value exceeds $10,000',
        icon: '💰',
        unlocked: totalValue >= 10000,
        progress: Math.min(totalValue, 10000),
        maxProgress: 10000,
      },
      {
        id: 'trader',
        title: 'Trader',
        description: 'Sold your first card',
        icon: '💼',
        unlocked: soldCards >= 1,
        progress: Math.min(soldCards, 1),
        maxProgress: 1,
      },
      {
        id: 'profitable-trader',
        title: 'Profitable Trader',
        description: 'Made $1,000+ profit from sales',
        icon: '📈',
        unlocked: profit >= 1000,
        progress: Math.min(profit, 1000),
        maxProgress: 1000,
      },
    ];
  }, [cardState.cards]);

  // Activity timeline
  const activityTimeline = useMemo(() => {
    const activities: Array<{ id: string; title: string; description: string; icon: string; timestamp: Date }> = [];
    const now = new Date();

    // Recent card additions
    const recentCards = cardState.cards
      .filter((card) => card.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 5);

    recentCards.forEach((card) => {
      activities.push({
        id: `card-${card.id}`,
        title: 'Card Added',
        description: `Added ${card.year} ${card.brand} ${card.player}`,
        timestamp: new Date(card.createdAt!),
        icon: '➕',
      });
    });

    // Recent sales
    const recentSales = cardState.cards
      .filter((card) => card.sellDate)
      .sort((a, b) => new Date(b.sellDate!).getTime() - new Date(a.sellDate!).getTime())
      .slice(0, 3);

    recentSales.forEach((card) => {
      activities.push({
        id: `sale-${card.id}`,
        title: 'Card Sold',
        description: `Sold ${card.year} ${card.brand} ${card.player} for $${card.sellPrice}`,
        timestamp: new Date(card.sellDate!),
        icon: '💰',
      });
    });

    // Sort by timestamp
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }, [cardState.cards]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Image must be less than 100MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate password confirmation
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }

      const updateData: any = {
        email: formData.email,
        profilePhoto: previewPhoto || profilePhoto,
      };

      // Only include password fields if user is changing password
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          setError('Current password is required to change password');
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Use local userService for updates
      if (!authState.user) {
        throw new Error('User not found');
      }

      // Verify current password if changing password
      if (formData.newPassword) {
        const authenticated = userService.authenticateUser(authState.user.email, formData.currentPassword);
        if (!authenticated) {
          throw new Error('Current password is incorrect');
        }

        // Update password
        userService.resetUserPassword(authState.user.id, formData.newPassword);
      }

      // Update user profile
      const updatedUser = userService.updateUser(authState.user.id, {
        email: formData.email,
        profilePhoto: previewPhoto || profilePhoto,
      });

      if (!updatedUser) {
        throw new Error('Failed to update profile');
      }

      // Update auth context with new user data
      const newUserData = {
        ...authState.user,
        email: formData.email,
        profilePhoto: previewPhoto || profilePhoto,
      };
      updateUser(newUserData);

      // Update profile photo state
      if (previewPhoto) {
        setProfilePhoto(previewPhoto);
        setPreviewPhoto(null);
      }

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      email: authState.user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPreviewPhoto(null);
    setError(null);
    setSuccess(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPreviewPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPhoto = previewPhoto || profilePhoto;

  return (
    <div className="user-profile">
      <AnimatedWrapper animation="fadeInDown" duration={0.6}>
        <div className="profile-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Sports Card Tracker</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item current">Profile</span>
          </div>
          <h1 className="text-gradient">User Profile</h1>
          <p>Manage your account settings and preferences</p>
        </div>
      </AnimatedWrapper>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-photo-section">
            <div className="photo-container">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile" className="profile-photo" />
              ) : (
                <div className="default-avatar">
                  <span>{authState.user?.username?.charAt(0).toUpperCase()}</span>
                </div>
              )}

              {isEditing && (
                <div className="photo-controls">
                  <button type="button" onClick={triggerPhotoUpload} className="photo-btn upload">
                    📷 Upload
                  </button>
                  {displayPhoto && (
                    <button type="button" onClick={removePhoto} className="photo-btn remove">
                      🗑️ Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Account Information</h3>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={authState.user?.username || ''}
                  disabled
                  className="form-input disabled"
                />
                <small className="form-help">Username cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  className={`form-input ${!isEditing ? 'disabled' : ''}`}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  value={authState.user?.role || ''}
                  disabled
                  className="form-input disabled role-badge"
                />
              </div>
            </div>

            {isEditing && (
              <div className="form-section">
                <h3>Change Password</h3>
                <p className="section-help">Leave blank to keep current password</p>

                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="form-input"
                    placeholder="Enter current password to change"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="form-input"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="form-input"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                  {formData.newPassword &&
                    formData.confirmPassword &&
                    formData.newPassword !== formData.confirmPassword && (
                      <div className="field-error">Passwords do not match</div>
                    )}
                </div>
              </div>
            )}

            {error && <div className="form-error">{error}</div>}

            {success && <div className="form-success">{success}</div>}

            <div className="form-actions">
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="btn-primary">
                  Edit Profile
                </button>
              ) : (
                <div className="action-buttons">
                  <button type="button" onClick={handleCancel} className="btn-secondary" disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <div className="loading-inline">
                        <div className="spinner-small" />
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <p>Use the navigation menu above to access other sections</p>
          <div className="action-info">
            <div className="info-item">
              <span className="info-icon">📊</span>
              <span>Dashboard - View your collection overview and statistics</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📋</span>
              <span>Inventory - Browse and manage your card collection</span>
            </div>
            <div className="info-item">
              <span className="info-icon">➕</span>
              <span>Add Card - Add new cards to your collection</span>
            </div>
            {authState.user?.role === 'admin' && (
              <div className="info-item">
                <span className="info-icon">🔧</span>
                <span>Admin - Manage users and system settings</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Section */}
        <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.2}>
          <div className="achievements-section card-glass">
            <h2 className="section-title">Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-content">
                    <h3>{achievement.title}</h3>
                    <p>{achievement.description}</p>
                    <div className="achievement-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedWrapper>

        {/* Activity Timeline Section */}
        <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.4}>
          <div className="activity-section card-glass">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-timeline">
              {activityTimeline.length > 0 ? (
                activityTimeline.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="activity-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className="activity-time">
                        {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-activity">
                  <p>No recent activity to display</p>
                </div>
              )}
            </div>
          </div>
        </AnimatedWrapper>

        {/* Settings Section with Collapsible Menus */}
        <AnimatedWrapper animation="fadeInUp" duration={0.6} delay={0.6}>
          <div className="settings-section card-glass">
            <h2 className="section-title">Settings</h2>

            <CollapsibleMenu title="Account Settings" icon="👤" defaultOpen={true}>
              <div className="settings-content">
                <div className="setting-item">
                  <label>Email Notifications</label>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="setting-item">
                  <label>Collection Updates</label>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="setting-item">
                  <label>Price Alerts</label>
                  <input type="checkbox" />
                </div>
              </div>
            </CollapsibleMenu>

            <CollapsibleMenu title="Privacy Settings" icon="🔒">
              <div className="settings-content">
                <div className="setting-item">
                  <label>Profile Visibility</label>
                  <select>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Collection Visibility</label>
                  <select>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>
            </CollapsibleMenu>

            <CollapsibleMenu title="Data & Export" icon="📊">
              <div className="settings-content">
                <div className="setting-item">
                  <label>Export Collection</label>
                  <button className="btn-secondary">Download CSV</button>
                </div>
                <div className="setting-item">
                  <label>Backup Data</label>
                  <button className="btn-secondary">Create Backup</button>
                </div>
              </div>
            </CollapsibleMenu>
          </div>
        </AnimatedWrapper>

        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p>Irreversible actions</p>
          <button onClick={logout} className="btn-danger">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
