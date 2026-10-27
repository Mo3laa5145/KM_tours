import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Public project URL and publishable key (safe to ship in the browser — data is protected by Row Level Security).
// Can be overridden with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://wbzuydvrnwjubldjqqjl.supabase.co'
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'sb_publishable_cgKMg01CknsbsNDZpcjvhw_3uYXwChF'

/** True when the site is connected to a Supabase project (see .env.example). */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'km-tours-admin' },
    })
  : null

export const TRIP_IMAGES_BUCKET = 'trip-images'
