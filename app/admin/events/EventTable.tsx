'use client'

// Tableau interactif des événements : recherche, filtres rapides, pagination,
// lancement de l'import et ouverture des modales créer/modifier/supprimer.
import Image from 'next/image'
import { useMemo, useState, useTransition } from 'react'
import type { EventRow } from '@/lib/types/event'
import { deleteEvent, runImport, type ActionResult } from './actions'
import EventModal from './EventModal'

type QuickFilter = 'tous' | 'a_venir' | 'passes' | 'non_verifies'

const PAGE_SIZE = 20

const FILTER_LABELS: Record<QuickFilter, string> = {
  tous: 'Tous',
  a_venir: 'À venir',
  passes: 'Passés',
  non_verifies: 'Non vérifiés',
}

// Âge en mois → libellé en années pour l'UI (règle projet : base en mois)
function ageLabel(months: number): string {
  if (months === 0) return '0'
  if (months < 12) return `${months} mois`
  const years = Math.round(months / 12)
  return `${years} an${years > 1 ? 's' : ''}`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface EventTableProps {
  events: EventRow[]
}

export default function EventTable({ events }: EventTableProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<QuickFilter>('tous')
  const [page, setPage] = useState(1)

  // Modales
  const [modalEvent, setModalEvent] = useState<EventRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<EventRow | null>(null)

  // États import + suppression
  const [importing, startImport] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [importResult, setImportResult] = useState<ActionResult | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const now = Date.now()
    const query = search.trim().toLowerCase()

    return events
      .filter((event) => {
        if (query && !event.name.toLowerCase().includes(query)) return false
        const end = new Date(event.date_end ?? event.date_start).getTime()
        if (filter === 'a_venir') return end >= now
        if (filter === 'passes') return end < now
        if (filter === 'non_verifies') return !event.verified
        return true
      })
      // Tri par date_start, les plus proches en premier
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
  }, [events, search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageEvents = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleImport() {
    setImportResult(null)
    startImport(async () => {
      const result = await runImport()
      setImportResult(result)
    })
  }

  function handleDelete() {
    if (!toDelete) return
    setDeleteError(null)
    startDelete(async () => {
      const result = await deleteEvent(toDelete.id)
      if (result.ok) {
        setToDelete(null)
      } else {
        setDeleteError(result.message)
      }
    })
  }

  return (
    <div>
      {/* Header : import + total + ajout manuel */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button
          onClick={handleImport}
          disabled={importing}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {importing ? '⏳ Import en cours...' : "🔄 Lancer l'import OpenAgenda"}
        </button>
        <p className="text-sm font-medium text-gray-600">
          Total : {events.length} événement{events.length > 1 ? 's' : ''}
        </p>
        <button
          onClick={() => {
            setModalEvent(null)
            setModalOpen(true)
          }}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          + Ajouter manuellement
        </button>
      </div>

      {/* Résultat de l'import */}
      {importResult && (
        <pre
          className={`mb-4 whitespace-pre-wrap rounded-xl px-4 py-3 text-sm ${
            importResult.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {importResult.message}
        </pre>
      )}

      {/* Recherche + filtres rapides */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Rechercher par nom..."
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none md:max-w-xs"
        />
        <div className="flex gap-2">
          {(Object.keys(FILTER_LABELS) as QuickFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key)
                setPage(1)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100'
              }`}
            >
              {FILTER_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">Image</th>
              <th className="px-3 py-3">Nom</th>
              <th className="px-3 py-3">Ville</th>
              <th className="px-3 py-3">Dates</th>
              <th className="px-3 py-3">Catégorie</th>
              <th className="px-3 py-3">Âges</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Vérifié</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageEvents.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-gray-400">
                  Aucun événement — lance l&apos;import OpenAgenda ou ajoute-en un manuellement.
                </td>
              </tr>
            )}
            {pageEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-xl">
                      🎪
                    </div>
                  )}
                </td>
                <td className="max-w-[220px] truncate px-3 py-2 font-medium text-gray-900">
                  {event.name}
                </td>
                <td className="px-3 py-2 text-gray-600">{event.city || '—'}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                  {formatDate(event.date_start)} → {formatDate(event.date_end)}
                </td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    {event.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                  {ageLabel(event.age_min)} → {ageLabel(event.age_max)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.source === 'openagenda'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {event.source}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">{event.verified ? '✅' : '⏳'}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <button
                    onClick={() => {
                      setModalEvent(event)
                      setModalOpen(true)
                    }}
                    className="mr-2 text-gray-500 transition hover:text-gray-900"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      setDeleteError(null)
                      setToDelete(event)
                    }}
                    className="text-gray-500 transition hover:text-red-600"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg px-3 py-1.5 ring-1 ring-gray-200 transition hover:bg-gray-100 disabled:opacity-40"
          >
            ← Précédent
          </button>
          <span className="text-gray-600">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg px-3 py-1.5 ring-1 ring-gray-200 transition hover:bg-gray-100 disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Modale créer / modifier */}
      {modalOpen && (
        <EventModal
          event={modalEvent}
          onClose={() => {
            setModalOpen(false)
            setModalEvent(null)
          }}
        />
      )}

      {/* Modale confirmation suppression */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              Supprimer &quot;{toDelete.name}&quot; ?
            </h2>
            <p className="mb-4 text-sm text-gray-500">Cette action est irréversible.</p>
            {deleteError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
