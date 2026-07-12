export type Category =
  | 'PARC'
  | 'SPECTACLE'
  | 'ATELIER'
  | 'AIRE_JEUX'
  | 'RESTAURANT'
  | 'EVENEMENT'

export interface Activity {
  id: string
  name: string
  description: string
  category: Category
  age_min: number // en mois (ex: 0, 6, 12, 24, 36...)
  age_max: number // en mois
  price_min: number
  price_max: number
  lat: number
  lng: number
  address: string
  opening_hours: Record<string, string>
  tags: string[]
  images: string[]
  avg_rating: number
  reviews_count: number
  verified: boolean
  source: string
  created_at: string
}

export interface FilterState {
  category: Category | null
  age_min: number // en années (pour l'UI)
  age_max: number
  distance_km: number
  price_max: number | null
  search_query: string
}

// Libellés et emojis affichés dans l'UI pour chaque catégorie
export const CATEGORY_LABELS: Record<Category, { label: string; emoji: string }> = {
  PARC: { label: 'Parcs & loisirs', emoji: '🌳' },
  SPECTACLE: { label: 'Spectacles & théâtre', emoji: '🎭' },
  ATELIER: { label: 'Ateliers & créatifs', emoji: '🎨' },
  AIRE_JEUX: { label: 'Aires de jeux', emoji: '🛝' },
  RESTAURANT: { label: 'Restaurants family-friendly', emoji: '🍽️' },
  EVENEMENT: { label: 'Événements', emoji: '🎪' },
}
