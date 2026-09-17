import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cjccdvdmsxhbsyztdblj.supabase.co'
export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_nVNHHSO_IUVKcd-6GQ6lWg_9WvM9tP_'

export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey
  ? 'Ukalism enquiry service is not configured correctly.'
  : ''

if (supabaseConfigError) {
  console.warn('Supabase is not configured correctly for the enquiry service.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''
