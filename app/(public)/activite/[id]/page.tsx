import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MOCK_ACTIVITIES } from '@/lib/data/mock-activities'
import { CATEGORY_LABELS } from '@/lib/types/activity'
import { ageRangeLabel, priceLabel } from '@/lib/utils/format'

interface ActivityPageProps {
  params: { id: string }
}

// Fiche détail — Server Component, les params dynamiques viennent de l'URL
export default function ActivityPage({ params }: ActivityPageProps) {
  const activity = MOCK_ACTIVITIES.find((a) => a.id === params.id)

  if (!activity) {
    notFound()
  }

  const { label, emoji } = CATEGORY_LABELS[activity.category]

  return (
    <div className="space-y-6">
      <Link href="/liste" className="text-sm text-indigo-600 hover:underline">
        ← Retour à la liste
      </Link>

      {/* Visuel placeholder */}
      <div className="flex h-48 items-center justify-center rounded-3xl bg-indigo-50 text-7xl md:h-64">
        <span role="img" aria-label={label}>
          {emoji}
        </span>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {label}
          </span>
          {activity.verified && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              ✓ Vérifié
            </span>
          )}
        </div>
        <h1 className="mb-1 text-2xl font-bold md:text-3xl">{activity.name}</h1>
        <p className="text-sm text-gray-600">
          ⭐ {activity.avg_rating.toFixed(1)} · {activity.reviews_count} avis
        </p>
      </div>

      {/* Infos clés */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Âge</p>
          <p className="font-semibold">👶 {ageRangeLabel(activity.age_min, activity.age_max)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Prix</p>
          <p className="font-semibold">💶 {priceLabel(activity.price_min, activity.price_max)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-500">Adresse</p>
          <p className="text-sm font-semibold">📍 {activity.address}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-semibold">À propos</h2>
        <p className="text-gray-700">{activity.description}</p>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Horaires</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          {Object.entries(activity.opening_hours).map(([days, hours]) => (
            <li key={days} className="flex justify-between rounded-lg bg-white px-3 py-2">
              <span className="capitalize">{days}</span>
              <span className="font-medium">{hours}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {activity.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
