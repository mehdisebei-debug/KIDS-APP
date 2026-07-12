import Image from 'next/image'
import type { EventRow } from '@/lib/types/event'
import { ageRangeLabel, priceLabel } from '@/lib/utils/format'

interface EventCardProps {
  event: EventRow
}

// Ex : "sam. 18 juil." ou "18 juil. - 5 oct."
function dateRangeLabel(event: EventRow): string {
  const start = new Date(event.date_start)
  const end = event.date_end ? new Date(event.date_end) : null
  const fmt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }

  if (!end || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('fr-FR', { weekday: 'short', ...fmt })
  }
  return `${start.toLocaleDateString('fr-FR', fmt)} - ${end.toLocaleDateString('fr-FR', fmt)}`
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Image de l'événement, ou visuel placeholder */}
      {event.image_url ? (
        <div className="relative h-32 md:h-40">
          <Image
            src={event.image_url}
            alt={event.name}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center bg-yellow-100 text-5xl md:h-40">
          <span role="img" aria-label="Événement">
            🎪
          </span>
        </div>
      )}

      <div className="space-y-1.5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {dateRangeLabel(event)}
          {event.city ? ` · ${event.city}` : ''}
        </p>
        <h3 className="line-clamp-2 font-semibold text-gray-900">{event.name}</h3>
        {event.description && (
          <p className="line-clamp-2 text-sm text-gray-500">{event.description}</p>
        )}
        <p className="pt-1 text-xs text-gray-500">
          {ageRangeLabel(event.age_min, event.age_max)} ·{' '}
          {priceLabel(event.price_min, event.price_max)}
        </p>
      </div>
    </article>
  )
}
