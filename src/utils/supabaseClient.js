import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

// Create a safe (non-crashing) client. If env vars are missing, UI pages should handle the
// resulting error states rather than throwing at import time.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

