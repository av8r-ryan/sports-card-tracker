import { backupDatabase } from '../db/backupDatabase';
import { cardDatabase } from '../db/simpleDatabase';
import { Card } from '../types';

export interface BackupData {
  version: string;
  timestamp: string;
  appName: string;
  userId: string;
  cards: Card[];
  metadata: {
    totalCards: number;
    totalValue: number;
    exportedBy?: string;
    userName?: string;
  };
}

// Get current user info from auth state
function getCurrentUserInfo(): { id: string; username: string } {
  const authDataStr = localStorage.getItem('auth-state');
  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      return {
        id: authData.user?.id || 'anonymous',
        username: authData.user?.username || 'Anonymous User',
      };
    } catch {
      return { id: 'anonymous', username: 'Anonymous User' };
    }
  }
  return { id: 'anonymous', username: 'Anonymous User' };
}

/**
 * Create a backup of all cards in the database for the current user
 */
export async function createBackup(exportedBy?: string): Promise<BackupData> {
  try {
    const cards = await cardDatabase.getAllCards(); // This already filters by current user
    const userInfo = getCurrentUserInfo();

    const backup: BackupData = {
      version: '2.0', // Version 2.0 includes userId
      timestamp: new Date().toISOString(),
      appName: 'Sports Card Tracker',
      userId: userInfo.id,
      cards: cards,
      metadata: {
        totalCards: cards.length,
        totalValue: cards.reduce((sum, card) => sum + card.currentValue, 0),
        exportedBy,
        userName: userInfo.username,
      },
    };

    return backup;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup');
  }
}

/**
 * Download backup as JSON file
 */
export async function downloadBackup(exportedBy?: string): Promise<void> {
  try {
    const backup = await createBackup(exportedBy);
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `sports-cards-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Backup downloaded: ${backup.metadata.totalCards} cards`);
  } catch (error) {
    console.error('Error downloading backup:', error);
    throw error;
  }
}

/**
 * Validate backup data structure
 */
function validateBackup(data: any): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  if (!data.version || !data.timestamp || !data.appName) return false;
  if (!Array.isArray(data.cards)) return false;
  if (!data.metadata || typeof data.metadata !== 'object') return false;

  // Version 2.0 requires userId
  if (data.version === '2.0' && !data.userId) return false;

  // Validate each card has required fields
  for (const card of data.cards) {
    if (!card.id || !card.player || !card.year || !card.brand) {
      return false;
    }
    // Version 2.0 cards should have userId
    if (data.version === '2.0' && !card.userId) {
      return false;
    }
  }

  return true;
}

/**
 * Restore cards from backup data
 */
export async function restoreFromBackup(
  backupData: BackupData,
  options: {
    clearExisting?: boolean;
    skipDuplicates?: boolean;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  const { clearExisting = false, skipDuplicates = true, onProgress } = options;
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Clear existing data if requested
    if (clearExisting) {
      await cardDatabase.clearAllCards();
      console.log('Cleared existing cards');
    }

    // Get existing card IDs if skipping duplicates
    const existingIds = new Set<string>();
    if (skipDuplicates && !clearExisting) {
      const existingCards = await cardDatabase.getAllCards();
      existingCards.forEach((card) => existingIds.add(card.id));
    }

    // Import cards
    const totalCards = backupData.cards.length;
    for (let i = 0; i < totalCards; i++) {
      const card = backupData.cards[i];

      try {
        // Skip if duplicate and skipDuplicates is true
        if (skipDuplicates && existingIds.has(card.id)) {
          results.skipped++;
          continue;
        }

        // Ensure dates are Date objects and handle userId
        const currentUserId = getCurrentUserInfo().id;
        const cardToImport: Card = {
          ...card,
          userId: card.userId || currentUserId, // Use current user if not present (for old backups)
          purchaseDate: card.purchaseDate instanceof Date ? card.purchaseDate : new Date(card.purchaseDate),
          sellDate: card.sellDate
            ? card.sellDate instanceof Date
              ? card.sellDate
              : new Date(card.sellDate)
            : undefined,
          createdAt: card.createdAt instanceof Date ? card.createdAt : new Date(card.createdAt),
          updatedAt: card.updatedAt instanceof Date ? card.updatedAt : new Date(card.updatedAt),
        };

        await cardDatabase.addCard(cardToImport);
        results.imported++;

        // Report progress
        if (onProgress) {
          onProgress(i + 1, totalCards);
        }
      } catch (error) {
        const errorMsg = `Failed to import card ${card.player} (${card.year}): ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(`Restore complete: ${results.imported} imported, ${results.skipped} skipped`);
    return results;
  } catch (error) {
    console.error('Error during restore:', error);
    throw new Error('Failed to restore backup');
  }
}

/**
 * Load backup from file
 */
export function loadBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!validateBackup(data)) {
          reject(new Error('Invalid backup file format'));
          return;
        }

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse backup file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Create automatic backup (can be scheduled)
 */
export async function createAutoBackup(): Promise<void> {
  try {
    const backup = await createBackup('auto');

    // Save to IndexedDB instead of localStorage
    await backupDatabase.saveBackup(backup, 'auto');

    const backupJson = JSON.stringify(backup);
    const sizeInMB = new Blob([backupJson]).size / (1024 * 1024);
    console.log(`Auto-backup created: ${backup.metadata.totalCards} cards (${sizeInMB.toFixed(2)} MB)`);

    // Clean up old localStorage entries if they exist
    try {
      localStorage.removeItem('sports-cards-auto-backup');
      localStorage.removeItem('sports-cards-auto-backup-meta');
    } catch (e) {
      // Ignore errors when cleaning up
    }
  } catch (error) {
    console.error('Auto-backup failed:', error);
    throw error;
  }
}

/**
 * Get list of automatic backups
 */
export async function getAutoBackups(): Promise<BackupData[]> {
  try {
    const autoBackup = await backupDatabase.getAutoBackup();
    return autoBackup ? [autoBackup] : [];
  } catch (error) {
    console.error('Failed to get auto-backups:', error);
    return [];
  }
}

/**
 * Clear auto-backup data
 */
export async function clearAutoBackup(): Promise<void> {
  try {
    // Clear from IndexedDB
    await backupDatabase.clearAutoBackup();

    // Also clear any legacy localStorage entries
    try {
      localStorage.removeItem('sports-cards-auto-backup');
      localStorage.removeItem('sports-cards-auto-backup-meta');
    } catch (e) {
      // Ignore errors when cleaning up legacy data
    }

    console.log('Auto-backup data cleared');
  } catch (error) {
    console.error('Failed to clear auto-backup:', error);
    throw error;
  }
}

/**
 * Get auto-backup storage size
 */
export async function getAutoBackupSize(): Promise<{ sizeInMB: number; exists: boolean }> {
  try {
    const stats = await backupDatabase.getBackupStats();

    if (stats.autoBackups === 0) {
      return { sizeInMB: 0, exists: false };
    }

    // Get the actual backup to calculate size
    const autoBackup = await backupDatabase.getAutoBackup();
    if (!autoBackup) {
      return { sizeInMB: 0, exists: false };
    }

    const backupJson = JSON.stringify(autoBackup);
    const sizeInMB = new Blob([backupJson]).size / (1024 * 1024);

    return { sizeInMB, exists: true };
  } catch (error) {
    console.error('Failed to get auto-backup size:', error);
    return { sizeInMB: 0, exists: false };
  }
}

/**
 * Export backup to CSV format
 */
export async function exportBackupAsCSV(): Promise<void> {
  try {
    const cards = await cardDatabase.getAllCards();

    if (cards.length === 0) {
      throw new Error('No cards to export');
    }

    // Define headers
    const headers = [
      'ID',
      'Player',
      'Team',
      'Year',
      'Brand',
      'Category',
      'Card Number',
      'Parallel',
      'Condition',
      'Grading Company',
      'Purchase Price',
      'Purchase Date',
      'Current Value',
      'Sell Price',
      'Sell Date',
      'Notes',
      'Created At',
      'Updated At',
    ];

    // Convert cards to CSV rows
    const rows = cards.map((card) => [
      card.id,
      card.player,
      card.team,
      card.year,
      card.brand,
      card.category,
      card.cardNumber,
      card.parallel || '',
      card.condition,
      card.gradingCompany || '',
      card.purchasePrice,
      card.purchaseDate instanceof Date ? card.purchaseDate.toISOString().split('T')[0] : card.purchaseDate,
      card.currentValue,
      card.sellPrice || '',
      card.sellDate ? (card.sellDate instanceof Date ? card.sellDate.toISOString().split('T')[0] : card.sellDate) : '',
      `"${card.notes.replace(/"/g, '""')}"`,
      card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
      card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
    ]);

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(',')
      ),
    ].join('\n');

    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sports-cards-backup-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`CSV backup exported: ${cards.length} cards`);
  } catch (error) {
    console.error('Error exporting CSV backup:', error);
    throw error;
  }
}
