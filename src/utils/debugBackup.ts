// Debug utility for backup/restore functionality
import { clearAutoBackup, getAutoBackupSize } from './backupRestore';
import { backupDatabase } from '../db/backupDatabase';

export async function debugBackup() {
  console.log('=== BACKUP DEBUG ===');
  
  // Check localStorage usage
  let totalSize = 0;
  const items: { key: string; size: number }[] = [];
  
  for (let key in localStorage) {
    const item = localStorage.getItem(key);
    if (item) {
      const size = new Blob([item]).size;
      totalSize += size;
      items.push({ key, size });
    }
  }
  
  // Sort by size
  items.sort((a, b) => b.size - a.size);
  
  console.log(`Total localStorage usage: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('Top 10 largest items:');
  items.slice(0, 10).forEach(item => {
    console.log(`  ${item.key}: ${(item.size / 1024).toFixed(2)} KB`);
  });
  
  // Check backup database stats
  try {
    const stats = await backupDatabase.getBackupStats();
    console.log('\nBackup Database Stats (IndexedDB):');
    console.log(`  Total backups: ${stats.totalBackups}`);
    console.log(`  Auto backups: ${stats.autoBackups}`);
    console.log(`  Manual backups: ${stats.manualBackups}`);
    console.log(`  Total size: ${stats.totalSizeMB.toFixed(2)} MB`);
    
    const backupInfo = await getAutoBackupSize();
    console.log(`\nCurrent auto-backup size: ${backupInfo.sizeInMB.toFixed(2)} MB (exists: ${backupInfo.exists})`);
  } catch (error) {
    console.error('Error getting backup stats:', error);
  }
  
  console.log('\nBackups are now stored in IndexedDB, which has much higher storage limits than localStorage.');
  console.log('To clear auto-backup, run: clearAutoBackup()');
  console.log('=== END DEBUG ===');
}

// Make functions available globally for debugging
(window as any).debugBackup = debugBackup;
(window as any).clearAutoBackup = clearAutoBackup;
(window as any).getAutoBackupSize = getAutoBackupSize;
(window as any).backupDatabase = backupDatabase;

// Migration function to clean up old localStorage backups
(window as any).migrateBackupsToIndexedDB = async () => {
  console.log('Checking for old localStorage backups to migrate...');
  
  const oldBackupKey = 'sports-cards-auto-backup';
  const oldBackup = localStorage.getItem(oldBackupKey);
  
  if (oldBackup) {
    try {
      console.log('Found old backup in localStorage, migrating to IndexedDB...');
      const backupData = JSON.parse(oldBackup);
      await backupDatabase.saveBackup(backupData, 'auto');
      localStorage.removeItem(oldBackupKey);
      localStorage.removeItem('sports-cards-auto-backup-meta');
      console.log('Migration complete! Old localStorage backup has been moved to IndexedDB.');
    } catch (error) {
      console.error('Failed to migrate backup:', error);
      console.log('You can manually clear the old backup with: localStorage.removeItem("sports-cards-auto-backup")');
    }
  } else {
    console.log('No old localStorage backups found.');
  }
};