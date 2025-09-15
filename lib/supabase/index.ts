// Export all Supabase utilities from a single entry point
export { supabase } from './client'
export { supabaseAdmin } from './server'
export type { Database } from './types'

// Re-export commonly used types from Supabase
export type { User, Session, AuthError } from '@supabase/supabase-js'
