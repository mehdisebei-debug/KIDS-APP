'use client'

// Modale créer / modifier un événement. Soumission via Server Action
// (createEvent / updateEvent) — pas de fetch ni d'axios.
import Image from 'next/image'
import { useState, useTransition } from 'react'
import type { EventFormPayload, EventRow } from '@/lib/types/event'
import { createEvent, updateEvent } from './actions'

// Options d'âge : libellé UI en années, valeur stockée en mois (règle projet)
const AGE_OPTIONS: Array<{ months: number; label: string }> = [
  { months: 0, label: '0' },
  { months: 6, label: '6 mois' },
  { months: 12, label: '1 an' },
  { months: 24, label: '2 ans' },
  { months: 36, label: '3 ans' },
  { months: 48, label: '4 ans' },
  { months: 60, label: '5 ans' },
  { months: 72, label: '6 ans' },
]

// ISO → valeur pour input datetime-local (format YYYY-MM-DDTHH:mm, heure locale)
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

interface EventModalProps {
  event: EventRow | null // null = création
  onClose: () => void
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const isEdit = event !== null
  const [saving, startSaving] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<EventFormPayload>({
    name: event?.name ?? '',
    description: event?.description ?? '',
    image_url: event?.image_url ?? '',
    venue_name: event?.venue_name ?? '',
    address: event?.address ?? '',
    city: event?.city ?? '',
    postal_code: event?.postal_code ?? '',
    lat: event?.lat ?? null,
    lng: event?.lng ?? null,
    date_start: toDatetimeLocal(event?.date_start ?? null),
    date_end: toDatetimeLocal(event?.date_end ?? null),
    age_min: event?.age_min ?? 0,
    age_max: event?.age_max ?? 72,
    price_min: event?.price_min ?? 0,
    price_max: event?.price_max ?? 0,
    verified: event?.verified ?? false,
  })

  function set<K extends keyof EventFormPayload>(key: K, value: EventFormPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startSaving(async () => {
      const result = isEdit ? await updateEvent(event.id, form) : await createEvent(form)
      if (result.ok) {
        onClose()
      } else {
        setError(result.message)
      }
    })
  }

  const inputClass =
    'w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {isEdit ? 'Modifier l’événement' : 'Créer un événement'}
        </h2>

        <div className="space-y-3">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nom de l&apos;événement *
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="image_url" className={labelClass}>
              Image URL
            </label>
            <input
              id="image_url"
              type="url"
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              className={inputClass}
            />
            {/* Aperçu si l'URL semble valide */}
            {form.image_url.startsWith('http') && (
              <Image
                src={form.image_url}
                alt="Aperçu"
                width={96}
                height={96}
                unoptimized
                className="mt-2 h-24 w-24 rounded-lg object-cover"
              />
            )}
          </div>

          <fieldset className="rounded-xl border border-gray-200 p-3">
            <legend className="px-1 text-sm font-semibold text-gray-900">Lieu</legend>
            <div className="space-y-3">
              <div>
                <label htmlFor="venue_name" className={labelClass}>
                  Nom du lieu
                </label>
                <input
                  id="venue_name"
                  type="text"
                  value={form.venue_name}
                  onChange={(e) => set('venue_name', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="address" className={labelClass}>
                  Adresse *
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className={labelClass}>
                    Ville *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="postal_code" className={labelClass}>
                    Code postal
                  </label>
                  <input
                    id="postal_code"
                    type="text"
                    value={form.postal_code}
                    onChange={(e) => set('postal_code', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lat" className={labelClass}>
                    Latitude
                  </label>
                  <input
                    id="lat"
                    type="number"
                    step="any"
                    value={form.lat ?? ''}
                    onChange={(e) => set('lat', e.target.value === '' ? null : Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lng" className={labelClass}>
                    Longitude
                  </label>
                  <input
                    id="lng"
                    type="number"
                    step="any"
                    value={form.lng ?? ''}
                    onChange={(e) => set('lng', e.target.value === '' ? null : Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-gray-200 p-3">
            <legend className="px-1 text-sm font-semibold text-gray-900">Dates</legend>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="date_start" className={labelClass}>
                  Date de début *
                </label>
                <input
                  id="date_start"
                  type="datetime-local"
                  required
                  value={form.date_start}
                  onChange={(e) => set('date_start', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="date_end" className={labelClass}>
                  Date de fin
                </label>
                <input
                  id="date_end"
                  type="datetime-local"
                  value={form.date_end}
                  onChange={(e) => set('date_end', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-gray-200 p-3">
            <legend className="px-1 text-sm font-semibold text-gray-900">Paramètres</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="age_min" className={labelClass}>
                  Âge minimum
                </label>
                <select
                  id="age_min"
                  value={form.age_min}
                  onChange={(e) => set('age_min', Number(e.target.value))}
                  className={inputClass}
                >
                  {AGE_OPTIONS.map((option) => (
                    <option key={option.months} value={option.months}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="age_max" className={labelClass}>
                  Âge maximum
                </label>
                <select
                  id="age_max"
                  value={form.age_max}
                  onChange={(e) => set('age_max', Number(e.target.value))}
                  className={inputClass}
                >
                  {AGE_OPTIONS.map((option) => (
                    <option key={option.months} value={option.months}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="price_min" className={labelClass}>
                  Prix minimum (€)
                </label>
                <input
                  id="price_min"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price_min}
                  onChange={(e) => set('price_min', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="price_max" className={labelClass}>
                  Prix maximum (€)
                </label>
                <input
                  id="price_max"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price_max}
                  onChange={(e) => set('price_max', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => set('verified', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Vérifié
            </label>
          </fieldset>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
