import Link from 'next/link'
import type { Activity } from '@/lib/types/activity'
import { CATEGORY_LABELS } from '@/lib/types/activity'
import { ageRangeLabel, priceLabel } from '@/lib/utils/format'

interface ActivityCardProps {
  activity: Activity
}

// Couleur de fond du visuel placeholder selon la catégorie (pas encore d'images réelles)
const CATEGORY_COLORS: Record<string, string> = {
  PARC: 'bg-green-100',
  SPECTACLE: 'bg-purple-100',
  ATELIER: 'bg-orange-100',
  AIRE_JEUX: 'bg-sky-100',
  RESTAURANT: 'bg-rose-100',
  EVENEMENT: 'bg-yellow-100',
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const { label, emoji } = CATEGORY_LABELS[activity.category]

  return (
    <Link
      href={`/activite/${activity.id}`}
      className="block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Visuel placeholder en attendant les vraies images */}
      <div
        className={`flex h-32 items-center justify-center text-5xl md:h-40 ${CATEGORY_COLORS[activity.category]}`}
      >
        <span role="img" aria-label={label}>
          {emoji}
        </span>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{label}</span>
          {activity.verified && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
              Vérifié
            </span>
          )}
        </div>

        <h3 className="mb-1 font-semibold text-gray-900">{activity.name}</h3>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{activity.description}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
          <span>👶 {ageRangeLabel(activity.age_min, activity.age_max)}</span>
          <span>💶 {priceLabel(activity.price_min, activity.price_max)}</span>
          <span>
            ⭐ {activity.avg_rating.toFixed(1)}{' '}
            <span className="text-gray-400">({activity.reviews_count})</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
