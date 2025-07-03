import { User } from '../types';

export interface UserData extends User {
  password?: string; // Only stored locally for demo purposes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const USERS_KEY = 'sports-card-tracker-users';

// Default admin user
const DEFAULT_ADMIN: UserData = {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@sportscard.local',
  role: 'admin',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  password: 'admin123' // In production, this would be hashed
};

class UserService {
  private users: Map<string, UserData> = new Map();

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    try {
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) {
        const usersArray = JSON.parse(storedUsers);
        usersArray.forEach((user: UserData) => {
          // Convert date strings back to Date objects
          user.createdAt = new Date(user.createdAt);
          user.updatedAt = new Date(user.updatedAt);
          this.users.set(user.id, user);
        });
      } else {
        // Initialize with default admin user
        this.users.set(DEFAULT_ADMIN.id, DEFAULT_ADMIN);
        this.saveUsers();
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Initialize with default admin user on error
      this.users.set(DEFAULT_ADMIN.id, DEFAULT_ADMIN);
    }
  }

  private saveUsers() {
    try {
      const usersArray = Array.from(this.users.values());
      localStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Get all users (admin only)
  getAllUsers(): UserData[] {
    return Array.from(this.users.values()).map(user => ({
      ...user,
      password: undefined // Don't expose passwords
    }));
  }

  // Get user by ID
  getUserById(id: string): UserData | null {
    const user = this.users.get(id);
    if (!user) return null;
    return {
      ...user,
      password: undefined // Don't expose password
    };
  }

  // Create new user
  createUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): UserData {
    const newUser: UserData = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(newUser.id, newUser);
    this.saveUsers();
    
    return {
      ...newUser,
      password: undefined // Don't expose password
    };
  }

  // Update user
  updateUser(id: string, updates: Partial<UserData>): UserData | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser: UserData = {
      ...user,
      ...updates,
      id: user.id, // Prevent ID changes
      createdAt: user.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    this.saveUsers();

    return {
      ...updatedUser,
      password: undefined // Don't expose password
    };
  }

  // Delete user (cannot delete the last admin)
  deleteUser(id: string): boolean {
    const user = this.users.get(id);
    if (!user) return false;

    // Check if this is the last admin
    if (user.role === 'admin') {
      const adminCount = Array.from(this.users.values())
        .filter(u => u.role === 'admin' && u.isActive).length;
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last active admin user');
      }
    }

    this.users.delete(id);
    this.saveUsers();
    return true;
  }

  // Toggle user active status
  toggleUserStatus(id: string): UserData | null {
    const user = this.users.get(id);
    if (!user) return null;

    // Check if this is the last active admin
    if (user.role === 'admin' && user.isActive) {
      const activeAdminCount = Array.from(this.users.values())
        .filter(u => u.role === 'admin' && u.isActive).length;
      if (activeAdminCount <= 1) {
        throw new Error('Cannot disable the last active admin user');
      }
    }

    return this.updateUser(id, { isActive: !user.isActive });
  }

  // Change user role
  changeUserRole(id: string, newRole: 'admin' | 'user'): UserData | null {
    const user = this.users.get(id);
    if (!user) return null;

    // Check if this is the last admin being demoted
    if (user.role === 'admin' && newRole === 'user') {
      const adminCount = Array.from(this.users.values())
        .filter(u => u.role === 'admin' && u.isActive).length;
      if (adminCount <= 1) {
        throw new Error('Cannot demote the last active admin user');
      }
    }

    return this.updateUser(id, { role: newRole });
  }

  // Reset user password (admin only)
  resetUserPassword(id: string, newPassword: string): boolean {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.set(id, {
      ...user,
      password: newPassword,
      updatedAt: new Date()
    });
    
    this.saveUsers();
    return true;
  }

  // Authenticate user (for local demo)
  authenticateUser(email: string, password: string): UserData | null {
    const user = Array.from(this.users.values())
      .find(u => u.email === email && u.password === password && u.isActive);
    
    if (!user) return null;
    
    return {
      ...user,
      password: undefined // Don't expose password
    };
  }

  // Get user statistics (admin only)
  getUserStatistics() {
    const users = Array.from(this.users.values());
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      regularUsers: users.filter(u => u.role === 'user').length,
      disabledUsers: users.filter(u => !u.isActive).length
    };
  }
}

export const userService = new UserService();