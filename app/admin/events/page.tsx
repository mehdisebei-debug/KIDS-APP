// Page admin /admin/events — Server Component : les données Supabase sont
// chargées côté serveur au rendu (pas de useEffect ni de fetch client).
// Spécificité Next.js : un composant async qui await ses données directement.
import { createServerClient } from '@/lib/supabase/server'
import type { EventRow } from '@/lib/types/event'
import EventTable from './EventTable'

export const dynamic = 'force-dynamic' // toujours re-lire la base (pas de cache statique)

export default async function AdminEventsPage() {
  const supabase = createServerClient()

  if (!supabase) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h1 className="mb-2 text-lg font-bold">⚠️ Supabase non configuré</h1>
        <p className="text-sm">
          Renseigne <code className="rounded bg-amber-100 px-1">SUPABASE_URL</code> (ou{' '}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>) et{' '}
          <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> dans{' '}
          <code className="rounded bg-amber-100 px-1">.env.local</code>, puis relance le serveur.
        </p>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date_start', { ascending: true })

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="mb-2 text-lg font-bold">❌ Erreur de chargement</h1>
        <p className="text-sm">
          Impossible de lire la table <code className="rounded bg-red-100 px-1">events</code> :{' '}
          {error.message}
        </p>
        <p className="mt-2 text-sm">
          As-tu bien exécuté le SQL de{' '}
          <code className="rounded bg-red-100 px-1">scripts/sql/create-events-table.sql</code> dans le
          SQL Editor de Supabase ?
        </p>
      </div>
    )
  }

  const events = (data ?? []) as EventRow[]

  return <EventTable events={events} />
}
