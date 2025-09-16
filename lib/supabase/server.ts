import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas')
}

export const supabaseServerClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export default supabaseServerClient
