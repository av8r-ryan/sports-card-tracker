import { supabaseCardDatabase } from './supabaseDatabase';
import { Card } from '../types';

// Supabase-backed wrapper preserving the original API surface
export const cardDatabase = supabaseCardDatabase;

// No-op exports retained for legacy callers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = undefined;
export async function migrateFromLocalStorage(): Promise<void> {
  // Dexie has been removed; nothing to migrate
  return;
}
