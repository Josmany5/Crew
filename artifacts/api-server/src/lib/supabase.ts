import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config";

let client: SupabaseClient | null = null;

/**
 * Supabase client using the service-role key.
 * Server-side only — bypasses RLS for admin operations.
 */
export function supabase(): SupabaseClient {
  if (client) return client;
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

/**
 * Supabase client using the anon key (for auth flows that need the public client).
 */
let anonClient: SupabaseClient | null = null;
export function supabaseAnon(): SupabaseClient {
  if (anonClient) return anonClient;
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");
  }
  anonClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  return anonClient;
}
