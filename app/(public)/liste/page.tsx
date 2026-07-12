'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Category, FilterState } from '@/lib/types/activity'
import { CATEGORY_LABELS } from '@/lib/types/activity'
import FilterBar from '@/components/filters/FilterBar'
import ActivityList from '@/components/activity/ActivityList'
import useActivities from '@/hooks/useActivities'

const DEFAULT_FILTERS: FilterState = {
  category: null,
  age_min: 0,
  age_max: 6,
  distance_km: 20,
  price_max: null,
  search_query: '',
}

function ListePageContent() {
  // Pré-sélection de la catégorie via l'URL (?categorie=PARC) depuis l'accueil
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('categorie')
  const initialCategory =
    categoryParam && categoryParam in CATEGORY_LABELS ? (categoryParam as Category) : null

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: initialCategory,
  })

  const { activities, loading, error } = useActivities(filters)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-xl font-bold md:text-2xl">Toutes les activités</h1>
        <p className="text-sm text-gray-600">
          {loading ? 'Chargement...' : `${activities.length} activité${activities.length > 1 ? 's' : ''} en Île-de-France`}
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <ActivityList activities={activities} loading={loading} error={error} />
    </div>
  )
}

// useSearchParams exige une frontière Suspense en Next.js App Router
export default function ListePage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-gray-100" />}>
      <ListePageContent />
    </Suspense>
  )
}
