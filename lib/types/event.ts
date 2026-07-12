// Types partagés pour la table `events` (script d'import + interface admin)

export interface EventTiming {
  begin: string // ISO date
  end: string // ISO date
}

// Ligne complète telle que stockée dans Supabase
export interface EventRow {
  id: string
  openagenda_uid: number | null
  name: string
  description: string | null
  image_url: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  venue_name: string | null
  lat: number | null
  lng: number | null
  date_start: string
  date_end: string | null
  all_timings: EventTiming[] | null
  category: string
  age_min: number // en mois
  age_max: number // en mois
  price_min: number
  price_max: number
  source: string
  verified: boolean
  created_at: string
  updated_at: string
}

// Payload d'insertion/upsert (script d'import OpenAgenda)
export interface EventInsert {
  openagenda_uid: number
  name: string
  description: string
  image_url: string | null
  address: string
  city: string
  postal_code: string
  lat: number | null
  lng: number | null
  venue_name: string
  date_start: string
  date_end: string
  all_timings: EventTiming[]
  source: 'openagenda'
  category: 'EVENEMENT'
  age_min: number
  age_max: number
  price_min: number
  price_max: number
  verified: boolean
  updated_at: string
}

// Payload du formulaire admin (création / modification manuelle)
export interface EventFormPayload {
  name: string
  description: string
  image_url: string
  venue_name: string
  address: string
  city: string
  postal_code: string
  lat: number | null
  lng: number | null
  date_start: string
  date_end: string
  age_min: number
  age_max: number
  price_min: number
  price_max: number
  verified: boolean
}
