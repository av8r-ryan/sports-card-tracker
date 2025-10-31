// Local auth has been removed in favor of Supabase Auth.
// This file remains as a no-op shim to avoid import breakages.
import { User } from '../types';

class LocalAuthService {
  async register(_username: string, _email: string, _password: string): Promise<{ user: User; token: string }> {
    throw new Error('Local auth is disabled. Use Supabase Auth.');
  }

  async login(_email: string, _password: string): Promise<{ user: User; token: string }> {
    throw new Error('Local auth is disabled. Use Supabase Auth.');
  }

  async createDefaultAdminUser(): Promise<void> {
    // No-op
  }

  async getAllUsers(): Promise<[]> {
    return [];
  }

  async debugUserExists(_email: string): Promise<boolean> {
    return false;
  }
}

export const localAuthService = new LocalAuthService();
