import Dexie, { Table } from 'dexie';

import { User } from '../types';
import { logDebug, logInfo, logError } from '../utils/logger';

interface LocalUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  role: 'admin' | 'user';
}

// Simple hash function (NOT for production - use bcrypt in real apps)
async function simpleHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'sports-card-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

class LocalAuthDatabase extends Dexie {
  users!: Table<LocalUser>;

  constructor() {
    super('LocalAuthDatabase');
    this.version(1).stores({
      users: 'id, email, username',
    });
  }
}

const localAuthDb = new LocalAuthDatabase();

class LocalAuthService {
  private generateToken(userId: string): string {
    // Generate a simple token (in production, use JWT)
    return btoa(`${userId}:${Date.now()}`);
  }

  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    logInfo('LocalAuthService', 'Starting registration', { username, email });

    try {
      // Check if user already exists
      const existingUser = await localAuthDb.users.where('email').equals(email.toLowerCase()).first();

      if (existingUser) {
        logError('LocalAuthService', 'Registration failed: user already exists', new Error('User exists'), { email });
        throw new Error('User with this email already exists');
      }

      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await simpleHash(password);

      const localUser: LocalUser = {
        id: userId,
        username,
        email: email.toLowerCase(),
        passwordHash,
        createdAt: new Date().toISOString(),
        role: 'user',
      };

      await localAuthDb.users.add(localUser);

      const user: User = {
        id: userId,
        username,
        email: email.toLowerCase(),
        role: 'user',
      };

      const token = this.generateToken(userId);

      logInfo('LocalAuthService', 'Registration successful', { userId, username });

      return { user, token };
    } catch (error) {
      logError('LocalAuthService', 'Registration failed', error as Error, { username, email });
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    logInfo('LocalAuthService', 'Starting login', { email });

    try {
      // Find user by email
      const localUser = await localAuthDb.users.where('email').equals(email.toLowerCase()).first();

      if (!localUser) {
        logError('LocalAuthService', 'Login failed: user not found', new Error('Invalid credentials'), { email });
        throw new Error('Invalid email or password');
      }

      // Verify password
      const passwordHash = await simpleHash(password);

      if (passwordHash !== localUser.passwordHash) {
        logError('LocalAuthService', 'Login failed: invalid password', new Error('Invalid credentials'), { email });
        throw new Error('Invalid email or password');
      }

      const user: User = {
        id: localUser.id,
        username: localUser.username,
        email: localUser.email,
        role: localUser.role,
      };

      const token = this.generateToken(localUser.id);

      logInfo('LocalAuthService', 'Login successful', { userId: user.id, username: user.username });

      return { user, token };
    } catch (error) {
      logError('LocalAuthService', 'Login failed', error as Error, { email });
      throw error;
    }
  }

  async createDefaultAdminUser(): Promise<void> {
    try {
      const adminEmail = 'admin@localhost';
      const existingAdmin = await localAuthDb.users.where('email').equals(adminEmail).first();

      if (!existingAdmin) {
        const adminUser: LocalUser = {
          id: 'admin_default',
          username: 'admin',
          email: adminEmail,
          passwordHash: await simpleHash('admin'),
          createdAt: new Date().toISOString(),
          role: 'admin',
        };

        await localAuthDb.users.add(adminUser);
        logInfo('LocalAuthService', 'Default admin user created', { email: adminEmail });
      }
    } catch (error) {
      logError('LocalAuthService', 'Failed to create default admin user', error as Error);
    }
  }
}

export const localAuthService = new LocalAuthService();

// Initialize default admin user on module load
localAuthService.createDefaultAdminUser();
