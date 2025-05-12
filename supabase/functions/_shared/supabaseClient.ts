import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { SupabaseClientOptions } from 'jsr:@supabase/supabase-js@2/dist/module/lib/types'

export function getNormalClient(options: SupabaseClientOptions = {}) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    options,
  )
}