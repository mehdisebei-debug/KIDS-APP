'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/mapbox'
import type { ErrorEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Activity } from '@/lib/types/activity'
import { CATEGORY_LABELS } from '@/lib/types/activity'
import { ageRangeLabel, priceLabel } from '@/lib/utils/format'

interface ActivityMapProps {
  activities: Activity[]
  loading: boolean
  error: string | null
}

// Le token est injecté au build par Next (préfixe NEXT_PUBLIC_) — jamais de clé en dur
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12'

// Vue initiale : centre de l'Île-de-France
const INITIAL_VIEW_STATE = {
  latitude: 48.86,
  longitude: 2.35,
  zoom: 10,
}

// Une activité sans coordonnées exploitables n'est simplement pas affichée
function hasValidCoordinates(activity: Activity): boolean {
  const { lat, lng } = activity
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Erreur d'authentification Mapbox (token absent, invalide ou restreint)
function isUnauthorizedError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const status = 'status' in error ? (error as { status?: unknown }).status : undefined
  if (status === 401 || status === 403) return true
  const message = 'message' in error ? (error as { message?: unknown }).message : undefined
  return typeof message === 'string' && /401|403|unauthorized|access token/i.test(message)
}

export default function ActivityMap({ activities, loading, error }: ActivityMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const mapLoadedRef = useRef(false)

  const mappableActivities = useMemo(() => activities.filter(hasValidCoordinates), [activities])

  const selectedActivity = useMemo(
    () => mappableActivities.find((activity) => activity.id === selectedId) ?? null,
    [mappableActivities, selectedId],
  )

  // État erreur : données indisponibles
  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">
        <p className="mb-1 text-3xl">⚠️</p>
        <p className="font-medium">{error}</p>
      </div>
    )
  }

  // État erreur : pas de token Mapbox, ou carte impossible à initialiser
  if (!MAPBOX_TOKEN || mapError) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center rounded-3xl border border-amber-100 bg-amber-50 p-6 text-center md:h-[72vh]">
        <p className="mb-2 text-4xl">🗺️</p>
        <p className="font-medium text-amber-900">Carte indisponible pour le moment</p>
        <p className="mt-1 max-w-xs text-sm text-amber-800">
          Réessaie plus tard, ou consulte les activités depuis la{' '}
          <Link href="/liste" className="font-medium underline">
            liste
          </Link>
          .
        </p>
      </div>
    )
  }

  // État chargement : squelette occupant la zone de la carte (pas d'écran blanc)
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Chargement de la carte"
        className="flex h-[70vh] w-full items-center justify-center rounded-3xl bg-gray-100 md:h-[72vh]"
      >
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
        <span className="sr-only">Chargement de la carte...</span>
      </div>
    )
  }

  return (
    // z-0 : la carte et ses popups restent sous la BottomNav (z-20)
    <div className="relative z-0 h-[70vh] w-full overflow-hidden rounded-3xl border border-gray-100 md:h-[72vh]">
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => {
          mapLoadedRef.current = true
        }}
        onError={(event: ErrorEvent) => {
          // Erreur bloquante uniquement si la carte n'a jamais chargé ou si le token est refusé
          if (!mapLoadedRef.current || isUnauthorizedError(event.error)) {
            setMapError('Carte indisponible pour le moment')
          }
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {mappableActivities.map((activity) => {
          const { emoji, label } = CATEGORY_LABELS[activity.category]
          return (
            <Marker
              key={activity.id}
              latitude={activity.lat}
              longitude={activity.lng}
              anchor="bottom"
              onClick={(event) => {
                // Évite que le clic atteigne la carte et referme aussitôt la popup
                event.originalEvent.stopPropagation()
                setSelectedId(activity.id)
              }}
            >
              <button
                type="button"
                aria-label={`${activity.name} — ${label}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl shadow-md transition hover:scale-110"
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            </Marker>
          )
        })}

        {selectedActivity && (
          <Popup
            latitude={selectedActivity.lat}
            longitude={selectedActivity.lng}
            anchor="bottom"
            offset={44}
            closeButton
            closeOnClick
            maxWidth="260px"
            onClose={() => setSelectedId(null)}
          >
            <div className="space-y-1 pr-2">
              <p className="text-sm font-semibold text-gray-900">{selectedActivity.name}</p>
              <p className="text-xs text-gray-600">
                {CATEGORY_LABELS[selectedActivity.category].emoji}{' '}
                {ageRangeLabel(selectedActivity.age_min, selectedActivity.age_max)}
              </p>
              <p className="text-xs text-gray-600">
                {priceLabel(selectedActivity.price_min, selectedActivity.price_max)}
              </p>
              <Link
                href={`/activite/${selectedActivity.id}`}
                className="mt-1 inline-block text-xs font-medium text-indigo-600 underline"
              >
                Voir la fiche
              </Link>
            </div>
          </Popup>
        )}
      </Map>

      {/* État vide : la carte reste affichée, le message se superpose */}
      {mappableActivities.length === 0 && (
        <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-center">
          <p className="rounded-full bg-white/95 px-4 py-2 text-center text-sm font-medium text-gray-700 shadow">
            Aucune activité à afficher sur la carte
          </p>
        </div>
      )}
    </div>
  )
}
