import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const record = client as unknown as Record<PropertyKey, unknown>;
    const value = record[prop];

    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }

    return value;
  },
}) as SupabaseClient;

// Database types
export interface Card {
  id: string;
  name: string;
  description: string;
  game: string;
  rarity: string;
  condition: string;
  price: number;
  image_url?: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
}
