/* eslint-disable import/no-unresolved, @typescript-eslint/no-explicit-any */
// Debug utility for backup/restore functionality
import { backupDatabase } from '../db/backupDatabase';

import { clearAutoBackup, getAutoBackupSize } from './backupRestore';

export async function debugBackup() {
  // eslint-disable-next-line no-console
  console.log('=== BACKUP DEBUG ===');

  // Check localStorage usage
  let totalSize = 0;
  const items: { key: string; size: number }[] = [];

  for (const key in localStorage) {
    const item = localStorage.getItem(key);
    if (item) {
      const size = new Blob([item]).size;
      totalSize += size;
      items.push({ key, size });
    }
  }

  // Sort by size
  items.sort((a, b) => b.size - a.size);

  // eslint-disable-next-line no-console
  console.log(`Total localStorage usage: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  // eslint-disable-next-line no-console
  console.log('Top 10 largest items:');
  items.slice(0, 10).forEach((item) => {
    // eslint-disable-next-line no-console
    console.log(`  ${item.key}: ${(item.size / 1024).toFixed(2)} KB`);
  });

  // Check backup storage stats (Supabase)
  try {
    const stats = await backupDatabase.getBackupStats();
    // eslint-disable-next-line no-console
    console.log('\nBackup Storage Stats (Supabase):');
    // eslint-disable-next-line no-console
    console.log(`  Total backups: ${stats.totalBackups}`);
    // eslint-disable-next-line no-console
    console.log(`  Auto backups: ${stats.autoBackups}`);
    // eslint-disable-next-line no-console
    console.log(`  Manual backups: ${stats.manualBackups}`);
    // eslint-disable-next-line no-console
    console.log(`  Total size: ${stats.totalSizeMB.toFixed(2)} MB`);

    const backupInfo = await getAutoBackupSize();
    // eslint-disable-next-line no-console, max-len
    console.log(`\nCurrent auto-backup size: ${backupInfo.sizeInMB.toFixed(2)} MB (exists: ${backupInfo.exists})`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting backup stats:', error);
  }

  // eslint-disable-next-line no-console
  console.log('\nBackups are now stored in Supabase, not localStorage.');
  // eslint-disable-next-line no-console
  console.log('To clear auto-backup, run: clearAutoBackup()');
  // eslint-disable-next-line no-console
  console.log('=== END DEBUG ===');
}

// Make functions available globally for debugging
(window as any).debugBackup = debugBackup;
(window as any).clearAutoBackup = clearAutoBackup;
(window as any).getAutoBackupSize = getAutoBackupSize;
(window as any).backupDatabase = backupDatabase;

// Migration function to clean up old localStorage backups
(window as any).migrateBackupsToSupabase = async () => {
  // eslint-disable-next-line no-console
  console.log('Checking for old localStorage backups to migrate to Supabase...');

  const oldBackupKey = 'sports-cards-auto-backup';
  const oldBackup = localStorage.getItem(oldBackupKey);

  if (oldBackup) {
    try {
      // eslint-disable-next-line no-console
      console.log('Found old backup in localStorage, migrating to Supabase...');
      const backupData = JSON.parse(oldBackup);
      await backupDatabase.saveBackup(backupData, 'auto');
      localStorage.removeItem(oldBackupKey);
      localStorage.removeItem('sports-cards-auto-backup-meta');
      // eslint-disable-next-line no-console, max-len
      console.log('Migration complete! Old localStorage backup has been moved to Supabase.');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to migrate backup:', error);
      // eslint-disable-next-line no-console, max-len
      console.log('You can manually clear the old backup with: localStorage.removeItem("sports-cards-auto-backup")');
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('No old localStorage backups found.');
  }
};
