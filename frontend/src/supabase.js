import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bzaaslqmraubolrccsli.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.warn('Falta la VITE_SUPABASE_ANON_KEY en el archivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
