import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { EventRow } from '@/lib/types/event'
import { createPublicServerClient } from '@/lib/supabase/server'
import { ageRangeLabel, eventDateRangeLabel, eventVenueLabel, priceLabel } from '@/lib/utils/format'

interface EventPageProps {
  params: { id: string }
}

export const dynamic = 'force-dynamic' // données fraîches à chaque visite

// Récupère un événement par id depuis Supabase (clé publique anon, lecture seule via RLS).
// `data` vaut `null` (sans erreur) si l'id ne correspond à aucune ligne — traduit en 404.
async function getEvent(id: string): Promise<{ event: EventRow | null; error: string | null }> {
  const supabase = createPublicServerClient()
  if (!supabase) return { event: null, error: 'Supabase non configuré' }

  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle()

  if (error) return { event: null, error: error.message }
  return { event: (data as EventRow | null) ?? null, error: null }
}

// Fiche détail d'un événement — Server Component async : les données Supabase sont
// chargées côté serveur pendant le rendu (pas de useEffect ni de state de loading client)
export default async function EventPage({ params }: EventPageProps) {
  const { event, error } = await getEvent(params.id)

  // État error : problème de config ou de requête Supabase, distinct du 404
  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          ← Retour à l&apos;accueil
        </Link>
        <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
          Impossible de charger cet événement pour le moment.
        </p>
      </div>
    )
  }

  // État empty : aucun événement pour cet id → page 404 dédiée (not-found.tsx)
  if (!event) {
    notFound()
  }

  const venue = eventVenueLabel(event)

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        ← Retour
      </Link>

      {/* Image de l'événement, ou visuel placeholder si image_url est vide */}
      {event.image_url ? (
        <div className="relative h-48 overflow-hidden rounded-3xl md:h-64">
          <Image
            src={event.image_url}
            alt={event.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-3xl bg-yellow-100 text-7xl md:h-64">
          <span role="img" aria-label="Événement">
            🎪
          </span>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-600">
          {eventDateRangeLabel(event.date_start, event.date_end)}
        </p>
        <h1 className="mb-1 text-2xl font-bold md:text-3xl">{event.name}</h1>
      </div>

      {/* Infos clés */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Âge</p>
          <p className="font-semibold">👶 {ageRangeLabel(event.age_min, event.age_max)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Prix</p>
          <p className="font-semibold">💶 {priceLabel(event.price_min, event.price_max)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Lieu</p>
          <p className="text-sm font-semibold">📍 {venue || 'Lieu non précisé'}</p>
        </div>
      </div>

      {event.description && (
        <section>
          <h2 className="mb-2 font-semibold">À propos</h2>
          <p className="text-gray-700">{event.description}</p>
        </section>
      )}
    </div>
  )
}
