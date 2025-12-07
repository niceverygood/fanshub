import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Supabase configuration for fanshub project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pjinagrooiszytijruo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_prl5TbFnBI0ggpprhfGgkA_HzvrjN38';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl.includes('supabase.co') && !supabaseAnonKey.includes('placeholder');
};

