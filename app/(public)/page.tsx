import Link from 'next/link'
import type { Category } from '@/lib/types/activity'
import { CATEGORY_LABELS } from '@/lib/types/activity'
import type { EventRow } from '@/lib/types/event'
import { MOCK_ACTIVITIES } from '@/lib/data/mock-activities'
import { createPublicServerClient } from '@/lib/supabase/server'
import ActivityCard from '@/components/activity/ActivityCard'
import EventCard from '@/components/activity/EventCard'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export const dynamic = 'force-dynamic' // données fraîches à chaque visite

// Récupère les 6 prochains événements depuis Supabase (API, clé publique anon).
// En cas de config manquante ou d'erreur, on renvoie une liste vide : la
// section est simplement masquée, l'accueil ne casse jamais.
async function getUpcomingEvents(): Promise<{ events: EventRow[]; error: string | null }> {
  const supabase = createPublicServerClient()
  if (!supabase) return { events: [], error: 'Supabase non configuré' }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date_end', new Date().toISOString()) // pas encore terminés
    .order('date_start', { ascending: true })
    .limit(6)

  if (error) return { events: [], error: error.message }
  return { events: (data ?? []) as EventRow[], error: null }
}

// Page d'accueil — Server Component async : les données Supabase sont chargées
// côté serveur pendant le rendu (spécificité Next.js, pas de useEffect)
export default async function HomePage() {
  const { events, error: eventsError } = await getUpcomingEvents()

  // Mise en avant : les mieux notées
  const featured = [...MOCK_ACTIVITIES]
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 3)

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-3xl bg-indigo-600 px-6 py-10 text-white md:px-10 md:py-14">
        <h1 className="mb-3 text-2xl font-bold md:text-4xl">
          Des sorties pour les 0-6 ans, près de chez toi 🎈
        </h1>
        <p className="mb-6 max-w-xl text-indigo-100">
          Parcs, spectacles, ateliers, aires de jeux... Toutes les activités pour enfants en
          Île-de-France, au même endroit.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/liste"
            className="rounded-xl bg-white px-5 py-2.5 text-center font-medium text-indigo-700 transition hover:bg-indigo-50"
          >
            Explorer les activités
          </Link>
          <Link
            href="/carte"
            className="rounded-xl border border-indigo-300 px-5 py-2.5 text-center font-medium text-white transition hover:bg-indigo-500"
          >
            Voir la carte
          </Link>
        </div>
      </section>

      {/* Catégories */}
      <section>
        <h2 className="mb-4 text-lg font-semibold md:text-xl">Par catégorie</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => {
            const { label, emoji } = CATEGORY_LABELS[category]
            return (
              <Link
                key={category}
                href={`/liste?categorie=${category}`}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition hover:shadow-md"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Événements à venir — données réelles Supabase (import OpenAgenda + admin) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold md:text-xl">Événements à venir 🎪</h2>
          <Link
            href="/liste?categorie=EVENEMENT"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Tout voir →
          </Link>
        </div>
        {eventsError ? (
          <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            Impossible de charger les événements pour le moment.
          </p>
        ) : events.length === 0 ? (
          <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
            Aucun événement à venir — revenez bientôt !
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Activités mises en avant */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold md:text-xl">Les mieux notées</h2>
          <Link href="/liste" className="text-sm font-medium text-indigo-600 hover:underline">
            Tout voir →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>
    </div>
  )
}
