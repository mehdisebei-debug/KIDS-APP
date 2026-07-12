// IMPORTANT : ce fichier ne doit JAMAIS être importé depuis app/ ou components/
// Il est réservé aux scripts d'import côté serveur/terminal uniquement
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { loadEnvLocal } from './load-env'

export function createAdminClient(): SupabaseClient {
  loadEnvLocal()

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    console.error(
      '❌ Variables manquantes dans .env.local : SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY'
    )
    process.exit(1)
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
