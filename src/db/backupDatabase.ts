import { supabase } from '../lib/supabase';
import { BackupData } from '../utils/backupRestore';

interface BackupRecord {
  id?: string;
  timestamp: string;
  backup: BackupData;
  type: 'auto' | 'manual';
  sizeInMB: number;
}

function getCurrentUserId(): string {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id || 'anonymous';
    } catch {}
  }
  const auth = localStorage.getItem('auth-state');
  if (auth) {
    try {
      const a = JSON.parse(auth);
      return a.user?.id || 'anonymous';
    } catch {}
  }
  return 'anonymous';
}

export const backupDatabase = {
  // Save a backup to Supabase
  async saveBackup(backup: BackupData, type: 'auto' | 'manual' = 'manual'): Promise<void> {
    const userId = getCurrentUserId();
    const backupJson = JSON.stringify(backup);
    const sizeInBytes = new Blob([backupJson]).size;

    if (type === 'auto') {
      // Keep only the latest one for this user
      await supabase.from('backups').delete().eq('user_id', userId).eq('type', 'auto');
    }

    const { error } = await supabase.from('backups').insert([
      {
        user_id: userId,
        type,
        data: backup,
        size_bytes: sizeInBytes,
        created_at: backup.timestamp
      }
    ]);

    if (error) throw error;
  },

  async getAutoBackup(): Promise<BackupData | null> {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'auto')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data?.data || null;
  },

  async getAllBackups(): Promise<BackupRecord[]> {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('backups')
      .select('id, created_at, type, data, size_bytes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map((row) => ({
      id: row.id as string,
      timestamp: row.created_at as string,
      backup: row.data as BackupData,
      type: row.type as 'auto' | 'manual',
      sizeInMB: ((row.size_bytes as number) || 0) / (1024 * 1024)
    }));
  },

  async clearAutoBackup(): Promise<void> {
    const userId = getCurrentUserId();
    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('user_id', userId)
      .eq('type', 'auto');
    if (error) throw error;
  },

  async clearAllBackups(): Promise<void> {
    const userId = getCurrentUserId();
    const { error } = await supabase.from('backups').delete().eq('user_id', userId);
    if (error) throw error;
  },

  async getBackupStats(): Promise<{
    totalBackups: number;
    autoBackups: number;
    manualBackups: number;
    totalSizeMB: number;
  }> {
    const rows = await this.getAllBackups();
    const totalBackups = rows.length;
    const autoBackups = rows.filter((r) => r.type === 'auto').length;
    const manualBackups = rows.filter((r) => r.type === 'manual').length;
    const totalSizeMB = rows.reduce((sum, r) => sum + r.sizeInMB, 0);
    return { totalBackups, autoBackups, manualBackups, totalSizeMB };
  }
};

// Legacy export retained for compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const backupDb: any = undefined;
