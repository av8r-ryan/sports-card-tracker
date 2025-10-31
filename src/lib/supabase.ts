import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dicstmwvrpyyszqxubhu.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create a safe fallback client if env is missing so the app doesn't crash
function createFallbackSupabase() {
  // Minimal, no-op implementations that allow the UI to render in "offline" mode
  const queryBuilder = {
    select: async () => ({ data: [], error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
    update: async () => ({ data: null, error: new Error('Supabase not configured') }),
    delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
    eq(this: any) {
      return this;
    },
    in(this: any) {
      return this;
    },
    order(this: any) {
      return this;
    },
    limit(this: any) {
      return this;
    },
  } as const;

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_event: unknown, _cb?: unknown) => ({
        data: { subscription: { unsubscribe: () => {} } },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: new Error('Supabase not configured'),
      }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => queryBuilder,
  } as const;
}

let supabaseClient: any;
if (!supabaseAnonKey) {
  // Log once and continue with fallback so production doesn't hard-crash
  console.error('⚠️  REACT_APP_SUPABASE_ANON_KEY is not set!');
  console.error('Please add it to your .env.local file');
  console.error('Get it from: https://supabase.com/dashboard/project/dicstmwvrpyyszqxubhu/settings/api');
  supabaseClient = createFallbackSupabase();
  if (typeof window !== 'undefined') {
    (window as any).__SUPABASE_OFFLINE__ = true;
  }
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// Export a single supabase instance (fallback or real)
export const supabase = supabaseClient;

// Database types
export interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string;
          user_id: string;
          collection_id: string | null;
          player: string;
          year: number;
          brand: string;
          card_number: string | null;
          category: string;
          team: string | null;
          condition: string | null;
          grading_company: string | null;
          grade: string | null;
          cert_number: string | null;
          purchase_price: number | null;
          current_value: number | null;
          purchase_date: string | null;
          sell_price: number | null;
          sell_date: string | null;
          notes: string | null;
          image_url: string | null;
          image_front: string | null;
          image_back: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cards']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cards']['Insert']>;
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['collections']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['collections']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          role: string;
          profile_photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      backups: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          data: any;
          size_bytes: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['backups']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['backups']['Insert']>;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
