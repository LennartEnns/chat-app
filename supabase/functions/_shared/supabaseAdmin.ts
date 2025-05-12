import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { SupabaseClientOptions } from 'jsr:@supabase/supabase-js@2/dist/module/lib/types'

export function getAdminClient(options: SupabaseClientOptions = {}) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    options,
  )
}
