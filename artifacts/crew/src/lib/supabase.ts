import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient = createClient(
  url ?? 'http://localhost:5000',
  anonKey ?? 'missing-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } },
);

/** Returns the current access token (or null when signed out). */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Uploads an image to a public storage bucket and returns its public URL.
 * Uses a unique path per file (never upsert — Supabase's upsert path is blocked
 * by storage RLS because the replace leg runs as UPDATE/DELETE).
 */
export async function uploadPublicImage(bucket: 'avatars' | 'posts', file: File): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? 'me';
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `public/${userId}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
