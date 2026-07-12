import { MOCK_ACTIVITIES } from '@/lib/data/mock-activities'
import { CATEGORY_LABELS } from '@/lib/types/activity'
import Link from 'next/link'

// Placeholder du mode carte — Mapbox sera branché plus tard
// (import dynamique avec ssr: false obligatoire à ce moment-là)
export default function CartePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-xl font-bold md:text-2xl">Carte des activités</h1>
        <p className="text-sm text-gray-600">
          La carte interactive Mapbox arrive bientôt. En attendant, voici les lieux référencés.
        </p>
      </div>

      <div className="flex h-64 items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white md:h-80">
        <div className="text-center">
          <p className="mb-2 text-4xl">🗺️</p>
          <p className="font-medium text-gray-700">Carte Mapbox à venir</p>
          <p className="text-sm text-gray-500">Nécessite NEXT_PUBLIC_MAPBOX_TOKEN</p>
        </div>
      </div>

      <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {MOCK_ACTIVITIES.map((activity) => (
          <li key={activity.id}>
            <Link
              href={`/activite/${activity.id}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
            >
              <span className="text-xl">{CATEGORY_LABELS[activity.category].emoji}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{activity.name}</p>
                <p className="truncate text-xs text-gray-500">{activity.address}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
