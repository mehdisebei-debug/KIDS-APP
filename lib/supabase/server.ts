// Clients Supabase côté serveur (Server Components + Server Actions uniquement).
// - createServerClient : service_role, réservé à l'admin (bypass RLS)
// - createPublicServerClient : clé anon, pour les pages publiques (lecture seule via RLS)
// Ne JAMAIS importer ce fichier depuis un Client Component.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Next.js 14 met en cache les fetch GET des Server Components par défaut ;
// no-store garantit des données fraîches à chaque requête
const freshFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: 'no-store' })

export function createServerClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Retourne null si la config est absente — les pages affichent alors un état d'erreur clair
  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: freshFetch },
  })
}

// Client public (clé anon) pour les pages publiques — la RLS limite à la lecture
export function createPublicServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) return null

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: freshFetch },
  })
}
