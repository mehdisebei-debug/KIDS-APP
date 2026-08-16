'use client'

import dynamic from 'next/dynamic'
import type { FilterState } from '@/lib/types/activity'
import useActivities from '@/hooks/useActivities'

// Mapbox GL ne fonctionne que dans le navigateur → jamais rendu côté serveur
const ActivityMap = dynamic(() => import('@/components/activity/ActivityMap'), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Chargement de la carte"
      className="h-[70vh] w-full animate-pulse rounded-3xl bg-gray-100 md:h-[72vh]"
    />
  ),
})

// Filtres par défaut — la synchronisation avec la FilterBar fera l'objet d'une autre US.
// Référence stable (hors composant) pour ne pas relancer le fetch à chaque rendu.
const DEFAULT_FILTERS: FilterState = {
  category: null,
  age_min: 0,
  age_max: 6,
  distance_km: 20,
  price_max: null,
  search_query: '',
}

export default function CartePage() {
  const { activities, loading, error } = useActivities(DEFAULT_FILTERS)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="mb-1 text-xl font-bold md:text-2xl">Carte des activités</h1>
        <p className="text-sm text-gray-600">
          {loading
            ? 'Chargement des activités...'
            : `${activities.length} activité${activities.length > 1 ? 's' : ''} en Île-de-France`}
        </p>
      </div>

      <ActivityMap activities={activities} loading={loading} error={error} />
    </div>
  )
}
