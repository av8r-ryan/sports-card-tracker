import React, { useState, useEffect, useRef } from 'react';
import { migrateToSupabase, clearIndexedDBAfterMigration, MigrationProgress, MigrationResult } from '../db/migrationTools';
import { supabase } from '../lib/supabase';

export const AutoMigration: React.FC = () => {
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' | 'warning' }>({
    message: 'Ready to migrate your data from IndexedDB to Supabase PostgreSQL',
    type: 'info',
  });
  const [progress, setProgress] = useState({ percentage: 0, step: '' });
  const [logs, setLogs] = useState<string[]>([]);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    // Auto-start after 3 seconds
    addLog('⏱️  Auto-starting migration in 3 seconds...');
    addLog('📝 Click "Start Migration" to begin now, or wait...');

    const timer = setTimeout(() => {
      if (!isRunning) {
        handleStartMigration();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleStartMigration = async () => {
    setIsRunning(true);
    addLog('🚀 Starting migration...');
    setStatus({ message: 'Migration in progress...', type: 'info' });

    try {
      const result = await migrateToSupabase((progressData: MigrationProgress) => {
        setProgress({ percentage: progressData.percentage, step: progressData.step });
        addLog(`[${progressData.percentage}%] ${progressData.step} - ${progressData.current}/${progressData.total}`);
      });

      setMigrationResult(result);

      if (result.success) {
        setStatus({
          message: `✅ Migration completed successfully! Cards: ${result.cardsMigrated}, Collections: ${result.collectionsMigrated}`,
          type: 'success',
        });
        addLog(`✅ Migration complete! ${result.cardsMigrated} cards, ${result.collectionsMigrated} collections`);
      } else {
        setStatus({
          message: `⚠️ Migration completed with errors. Check logs.`,
          type: 'warning',
        });
        addLog(`⚠️ Errors: ${result.errors.join(', ')}`);
      }
    } catch (error: any) {
      setStatus({ message: `❌ Migration failed: ${error.message}`, type: 'error' });
      addLog(`❌ Error: ${error.message}`);
      setIsRunning(false);
    }
  };

  const handleVerifyData = async () => {
    addLog('🔍 Verifying data in Supabase...');

    try {
      const { data: cards, error: cardsError } = await supabase.from('cards').select('*', { count: 'exact' });

      const { data: collections, error: collectionsError } = await supabase
        .from('collections')
        .select('*', { count: 'exact' });

      if (cardsError || collectionsError) {
        addLog(`❌ Verification failed: ${cardsError?.message || collectionsError?.message}`);
        return;
      }

      addLog(`✅ Found ${cards?.length || 0} cards in Supabase`);
      addLog(`✅ Found ${collections?.length || 0} collections in Supabase`);
      setStatus({
        message: `✅ Verification complete: ${cards?.length || 0} cards, ${collections?.length || 0} collections`,
        type: 'success',
      });
    } catch (error: any) {
      addLog(`❌ Verification error: ${error.message}`);
    }
  };

  const handleClearIndexedDB = async () => {
    if (
      !window.confirm(
        '⚠️  WARNING: This will permanently delete all data from IndexedDB!\n\nMake sure your data is safely in Supabase first!\n\nDo you want to continue?'
      )
    ) {
      return;
    }

    try {
      addLog('🗑️  Clearing IndexedDB...');
      await clearIndexedDBAfterMigration();
      addLog('✅ IndexedDB cleared successfully');
      setStatus({ message: '✅ IndexedDB cleared. All data is now in Supabase only.', type: 'success' });
    } catch (error: any) {
      addLog(`❌ Error clearing IndexedDB: ${error.message}`);
      setStatus({ message: `❌ Failed to clear IndexedDB: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', background: '#f5f5f5' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#333' }}>🚀 Automatic Migration to Supabase</h1>

        <div
          style={{
            padding: '15px',
            margin: '15px 0',
            borderRadius: '4px',
            fontFamily: 'monospace',
            background: status.type === 'info' ? '#e3f2fd' : status.type === 'success' ? '#e8f5e9' : status.type === 'error' ? '#ffebee' : '#fff3e0',
            borderLeft: `4px solid ${status.type === 'info' ? '#2196F3' : status.type === 'success' ? '#4CAF50' : status.type === 'error' ? '#f44336' : '#ff9800'}`,
          }}
        >
          {status.message}
        </div>

        {progress.percentage > 0 && (
          <div
            style={{
              width: '100%',
              height: '30px',
              background: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '20px 0',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                width: `${progress.percentage}%`,
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {progress.percentage}% - {progress.step}
            </div>
          </div>
        )}

        <div>
          <button
            onClick={handleStartMigration}
            disabled={isRunning}
            style={{
              background: isRunning ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              margin: '10px 5px',
            }}
          >
            {isRunning ? 'Migrating...' : 'Start Migration'}
          </button>

          {migrationResult?.success && (
            <>
              <button
                onClick={handleVerifyData}
                style={{
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  margin: '10px 5px',
                }}
              >
                Verify Data
              </button>
              <button
                onClick={handleClearIndexedDB}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  margin: '10px 5px',
                }}
              >
                Clear IndexedDB
              </button>
            </>
          )}
        </div>

        <div
          ref={logContainerRef}
          style={{
            background: '#263238',
            color: '#aed581',
            padding: '15px',
            borderRadius: '4px',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
            marginTop: '20px',
          }}
        >
          {logs.map((log, index) => (
            <div key={index} style={{ margin: '5px 0', padding: '3px 0' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
