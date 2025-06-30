// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'mental-health-app'
    }
  }
});

// Database types will be generated from Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          privacy_level: 'anonymous' | 'email' | 'enhanced';
          display_name: string | null;
          emergency_contact: string | null;
          data_retention_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          privacy_level?: 'anonymous' | 'email' | 'enhanced';
          display_name?: string | null;
          emergency_contact?: string | null;
          data_retention_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          privacy_level?: 'anonymous' | 'email' | 'enhanced';
          display_name?: string | null;
          emergency_contact?: string | null;
          data_retention_days?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};