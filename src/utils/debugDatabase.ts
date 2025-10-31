/* eslint-disable import/no-unresolved, @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

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

export async function debugDatabase() {
  // eslint-disable-next-line no-console
  console.log('=== DATABASE DEBUG (Supabase) ===');

  // eslint-disable-next-line no-console
  console.log('localStorage user:', localStorage.getItem('user'));
  // eslint-disable-next-line no-console
  console.log('localStorage auth-state:', localStorage.getItem('auth-state'));

  const userId = getCurrentUserId();

  try {
    const { data: cards, error: cardErr } = await supabase
      .from('cards')
      .select('id, user_id, player, collection_id, current_value, created_at')
      .eq('user_id', userId);
    if (cardErr) throw cardErr;
    // eslint-disable-next-line no-console
    console.log('Total cards:', cards?.length || 0);
    if (cards && cards.length > 0) {
      // eslint-disable-next-line no-console, max-len
      console.log('Sample card:', { id: cards[0].id, player: cards[0].player, collectionId: cards[0].collection_id });
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error reading cards from Supabase:', e);
  }

  try {
    const { data: collections, error: colErr } = await supabase
      .from('collections')
      .select('id, user_id, name, is_default')
      .eq('user_id', userId);
    if (colErr) throw colErr;
    // eslint-disable-next-line no-console
    console.log('Total collections:', collections?.length || 0);
    // eslint-disable-next-line no-console, max-len
    collections?.forEach((c) => console.log(` - ${c.name} (${c.id}) ${c.is_default ? '[DEFAULT]' : ''}`));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error reading collections from Supabase:', e);
  }

  // eslint-disable-next-line no-console
  console.log('=== END DEBUG ===');
}

export async function fixUserIdMismatch() {
  // eslint-disable-next-line no-console
  console.log('This operation is not applicable with Supabase backend.');
}

(window as any).debugDatabase = debugDatabase;
(window as any).fixUserIdMismatch = fixUserIdMismatch;
