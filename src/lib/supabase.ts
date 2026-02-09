import { createClient } from '@supabase/supabase-js';

// 1. Import your types
import { Card, CardSet, Game } from '@/types/catalog';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 2. RE-EXPORT the types so other files can import them from here
export type { Card, CardSet, Game };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'catalog',
  },
});

/**
 * Formats standard Supabase errors into a readable string.
 */
export const formatSupabaseError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  return error.message || JSON.stringify(error);
};

/**
 * A small utility for logging errors consistently.
 */
export const errorForConsole = (context: string, error: any) => {
  console.error(`[Supabase Error - ${context}]:`, error);
};