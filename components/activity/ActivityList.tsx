'use client'

import type { Activity } from '@/lib/types/activity'
import ActivityCard from '@/components/activity/ActivityCard'

interface ActivityListProps {
  activities: Activity[]
  loading: boolean
  error: string | null
}

export default function ActivityList({ activities, loading, error }: ActivityListProps) {
  // État chargement : squelettes de cartes
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  // État erreur
  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
        {error}
      </div>
    )
  }

  // État vide
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-10 text-center">
        <p className="mb-1 text-3xl">🔍</p>
        <p className="font-medium text-gray-900">Aucune activité trouvée</p>
        <p className="text-sm text-gray-600">Essaie d&apos;élargir tes filtres.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
