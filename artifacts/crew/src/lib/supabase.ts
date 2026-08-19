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
 * Uploads an image through the API so it is processed server-side:
 * HEIC/HEIF (iPhone) is transcoded to JPEG, EXIF orientation is applied,
 * and it is downscaled. Returns the public URL (or null on failure).
 */
export async function uploadPublicImage(kind: 'post' | 'avatar', file: File): Promise<string | null> {
  try {
    const token = await getAccessToken();
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}
