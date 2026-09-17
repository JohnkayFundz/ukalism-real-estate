import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cjccdvdmsxhbsyztdblj.supabase.co'
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey
  ? 'Ukalism enquiry service is not configured correctly.'
  : ''

if (supabaseConfigError) {
  console.warn(
    'Supabase is not configured. Add VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY to your environment.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''
