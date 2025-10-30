import Dexie, { Table } from 'dexie';

import { BackupData } from '../utils/backupRestore';

interface BackupRecord {
  id?: number;
  timestamp: string;
  backup: BackupData;
  type: 'auto' | 'manual';
  sizeInMB: number;
}

class BackupDatabase extends Dexie {
  backups!: Table<BackupRecord>;

  constructor() {
    super('BackupDatabase');

    this.version(1).stores({
      backups: '++id, timestamp, type',
    });
  }
}

const db = new BackupDatabase();

export const backupDatabase = {
  // Save a backup
  async saveBackup(backup: BackupData, type: 'auto' | 'manual' = 'manual'): Promise<void> {
    try {
      const backupJson = JSON.stringify(backup);
      const sizeInBytes = new Blob([backupJson]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      const record: BackupRecord = {
        timestamp: backup.timestamp,
        backup,
        type,
        sizeInMB,
      };

      // For auto-backups, keep only the latest one
      if (type === 'auto') {
        // Delete existing auto-backups
        await db.backups.where('type').equals('auto').delete();
      }

      await db.backups.add(record);
      console.log(`Backup saved to IndexedDB: ${type} backup, ${sizeInMB.toFixed(2)} MB`);
    } catch (error) {
      console.error('Error saving backup to IndexedDB:', error);
      throw error;
    }
  },

  // Get auto-backup
  async getAutoBackup(): Promise<BackupData | null> {
    try {
      const autoBackup = await db.backups.where('type').equals('auto').first();

      return autoBackup?.backup || null;
    } catch (error) {
      console.error('Error getting auto-backup:', error);
      return null;
    }
  },

  // Get all backups
  async getAllBackups(): Promise<BackupRecord[]> {
    try {
      return await db.backups.toArray();
    } catch (error) {
      console.error('Error getting all backups:', error);
      return [];
    }
  },

  // Clear auto-backup
  async clearAutoBackup(): Promise<void> {
    try {
      await db.backups.where('type').equals('auto').delete();
      console.log('Auto-backup cleared from IndexedDB');
    } catch (error) {
      console.error('Error clearing auto-backup:', error);
      throw error;
    }
  },

  // Clear all backups
  async clearAllBackups(): Promise<void> {
    try {
      await db.backups.clear();
      console.log('All backups cleared from IndexedDB');
    } catch (error) {
      console.error('Error clearing all backups:', error);
      throw error;
    }
  },

  // Get backup statistics
  async getBackupStats(): Promise<{
    totalBackups: number;
    autoBackups: number;
    manualBackups: number;
    totalSizeMB: number;
  }> {
    try {
      const allBackups = await db.backups.toArray();

      const stats = {
        totalBackups: allBackups.length,
        autoBackups: allBackups.filter((b) => b.type === 'auto').length,
        manualBackups: allBackups.filter((b) => b.type === 'manual').length,
        totalSizeMB: allBackups.reduce((sum, b) => sum + b.sizeInMB, 0),
      };

      return stats;
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return {
        totalBackups: 0,
        autoBackups: 0,
        manualBackups: 0,
        totalSizeMB: 0,
      };
    }
  },
};

// Export the db instance for direct access if needed
export { db as backupDb };
