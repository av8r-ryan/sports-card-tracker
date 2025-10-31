import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dicstmwvrpyyszqxubhu.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('REACT_APP_SUPABASE_ANON_KEY is not set. Please add it to your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

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
