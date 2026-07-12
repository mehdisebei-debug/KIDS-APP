'use client'

import type { Category, FilterState } from '@/lib/types/activity'
import { CATEGORY_LABELS } from '@/lib/types/activity'

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  function toggleCategory(category: Category) {
    onChange({ ...filters, category: filters.category === category ? null : category })
  }

  return (
    <div className="space-y-3">
      {/* Recherche texte */}
      <input
        type="search"
        value={filters.search_query}
        onChange={(e) => onChange({ ...filters, search_query: e.target.value })}
        placeholder="Rechercher une activité, un tag..."
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      {/* Catégories : pastilles scrollables sur mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((category) => {
          const { label, emoji } = CATEGORY_LABELS[category]
          const active = filters.category === category
          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {emoji} {label}
            </button>
          )
        })}
      </div>

      {/* Filtre d'âge — en années dans l'UI (converti en mois pour les requêtes) */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          Âge de
          <select
            value={filters.age_min}
            onChange={(e) => onChange({ ...filters, age_min: Number(e.target.value) })}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1"
          >
            {[0, 1, 2, 3, 4, 5].map((year) => (
              <option key={year} value={year}>
                {year} an{year > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          à
          <select
            value={filters.age_max}
            onChange={(e) => onChange({ ...filters, age_max: Number(e.target.value) })}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1"
          >
            {[1, 2, 3, 4, 5, 6].map((year) => (
              <option key={year} value={year}>
                {year} an{year > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.price_max === 0}
            onChange={(e) => onChange({ ...filters, price_max: e.target.checked ? 0 : null })}
            className="h-4 w-4 rounded border-gray-300"
          />
          Gratuit uniquement
        </label>
      </div>
    </div>
  )
}
