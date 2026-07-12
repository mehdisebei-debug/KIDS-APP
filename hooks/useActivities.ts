'use client'

import { useEffect, useState } from 'react'
import type { Activity, FilterState } from '@/lib/types/activity'
import { MOCK_ACTIVITIES } from '@/lib/data/mock-activities'
import { yearsToMonths } from '@/lib/utils/format'

interface UseActivitiesResult {
  activities: Activity[]
  loading: boolean
  error: string | null
}

// Hook de récupération des activités — version mock.
// Simule un petit délai réseau pour préparer le branchement Supabase plus tard.
export default function useActivities(filters: FilterState): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const timer = setTimeout(() => {
      try {
        // Les filtres d'âge UI sont en années → conversion en mois pour matcher la "base"
        const filterMinMonths = yearsToMonths(filters.age_min)
        const filterMaxMonths = yearsToMonths(filters.age_max)
        const query = filters.search_query.trim().toLowerCase()

        const results = MOCK_ACTIVITIES.filter((activity) => {
          if (filters.category && activity.category !== filters.category) return false
          // Chevauchement des tranches d'âge (activité vs filtre)
          if (activity.age_max < filterMinMonths || activity.age_min > filterMaxMonths) return false
          if (filters.price_max !== null && activity.price_min > filters.price_max) return false
          if (
            query &&
            !activity.name.toLowerCase().includes(query) &&
            !activity.description.toLowerCase().includes(query) &&
            !activity.tags.some((tag) => tag.toLowerCase().includes(query))
          ) {
            return false
          }
          return true
        })

        if (!cancelled) {
          setActivities(results)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Impossible de charger les activités.')
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filters])

  return { activities, loading, error }
}
