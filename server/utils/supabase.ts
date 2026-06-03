import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.warn('[Supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Using local JSON fallback.')
}

export const supabase = url && key
  ? createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

export function isSupabaseEnabled() {
  return !!supabase
}
