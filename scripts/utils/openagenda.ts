// Helpers pour l'API OpenAgenda : recherche d'agendas, fetch d'événements avec
// pagination par curseur, filtrage IDF/enfants, mapping vers le schéma Supabase.
//
// Note : l'endpoint global /v2/events nécessite un accès spécial. Avec une clé
// publique, on passe par /v2/agendas (recherche) puis /v2/agendas/{uid}/events.
import type { EventInsert } from '../../lib/types/event'

// Avec monolingual=fr, les champs texte sont des chaînes simples (pas {fr: ...})
export interface OpenAgendaEvent {
  uid: number
  title: string | null
  description: string | null
  longDescription?: string | null
  image: { base?: string; filename?: string } | null
  location: {
    name?: string
    address?: string
    postalCode?: string
    city?: string
    latitude?: number
    longitude?: number
  } | null
  firstTiming: { begin: string; end: string } | null
  lastTiming: { begin: string; end: string } | null
  slug?: string
  updatedAt?: string
}

export interface OpenAgendaSummary {
  uid: number
  title: string
}

export interface AgendaEventsPage {
  total: number
  events: OpenAgendaEvent[]
  after: string[] | null // curseur pour la page suivante
}

const BASE_URL = 'https://api.openagenda.com/v2'
export const PAGE_SIZE = 100

// Termes de recherche pour trouver des agendas pertinents (IDF + jeune public)
export const AGENDA_SEARCH_TERMS = [
  'enfants paris',
  'famille île-de-france',
  'jeune public paris',
  'que faire à paris',
  'sortir île-de-france',
]

// Mots-clés "enfants / famille" — un événement est gardé s'il en contient au moins un
const KEYWORDS = [
  'enfant',
  'enfants',
  'famille',
  'familles',
  'jeune public',
  'kids',
  'bébé',
  'bebe',
  'petite enfance',
  'maternelle',
  'éveil',
  'atelier enfant',
  'spectacle jeunesse',
  'animation jeunesse',
  'crèche',
  'creche',
]

// Codes postaux Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)
const IDF_POSTAL_REGEX = /\b((?:75|77|78|91|92|93|94|95)\d{3})\b/

function getApiKey(): string {
  const apiKey = process.env.OPENAGENDA_API_KEY
  if (!apiKey) {
    console.error('❌ Variable OPENAGENDA_API_KEY manquante dans .env.local')
    process.exit(1)
  }
  return apiKey
}

// fetch avec retry (3 essais, backoff progressif)
async function fetchJson<T>(url: string): Promise<T> {
  const MAX_ATTEMPTS = 3
  let lastError: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} — ${response.statusText}`)
      }
      return (await response.json()) as T
    } catch (error) {
      lastError = error
      if (attempt < MAX_ATTEMPTS) {
        const delayMs = attempt * 1000
        console.warn(`  ⚠️  Tentative ${attempt}/${MAX_ATTEMPTS} échouée, retry dans ${delayMs}ms...`)
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }

  throw new Error(`Échec après ${MAX_ATTEMPTS} tentatives : ${String(lastError)}`)
}

// Recherche des agendas correspondant à un terme
export async function searchAgendas(term: string, size = 10): Promise<OpenAgendaSummary[]> {
  const params = new URLSearchParams({
    key: getApiKey(),
    size: String(size),
    search: term,
  })
  const data = await fetchJson<{ agendas?: Array<{ uid: number; title: string }> }>(
    `${BASE_URL}/agendas?${params.toString()}`
  )
  return (data.agendas ?? []).map((a) => ({ uid: a.uid, title: a.title }))
}

// Récupère une page d'événements futurs (60 jours) d'un agenda, via curseur `after`
export async function fetchAgendaEventsPage(
  agendaUid: number,
  after: string[] | null
): Promise<AgendaEventsPage> {
  const now = new Date()
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    key: getApiKey(),
    size: String(PAGE_SIZE),
    monolingual: 'fr',
  })
  params.append('timings[gte]', now.toISOString().slice(0, 10))
  params.append('timings[lte]', in60Days.toISOString().slice(0, 10))
  if (after) {
    for (const cursor of after) params.append('after[]', cursor)
  }

  const data = await fetchJson<{
    total?: number
    events?: OpenAgendaEvent[]
    after?: string[]
  }>(`${BASE_URL}/agendas/${agendaUid}/events?${params.toString()}`)

  return {
    total: data.total ?? 0,
    events: data.events ?? [],
    after: data.after ?? null,
  }
}

// Extrait le code postal IDF de l'adresse (l'API ne fournit pas toujours postalCode)
function extractPostalCode(event: OpenAgendaEvent): string {
  const direct = event.location?.postalCode
  if (direct) return direct
  const match = (event.location?.address ?? '').match(IDF_POSTAL_REGEX)
  return match ? match[1] : ''
}

// Garde uniquement les événements IDF contenant au moins un mot-clé enfants/famille
export function isRelevant(event: OpenAgendaEvent): boolean {
  const postalCode = extractPostalCode(event)
  const city = (event.location?.city ?? '').toLowerCase()
  const isIdf = IDF_POSTAL_REGEX.test(postalCode) || city === 'paris'
  if (!isIdf) return false

  const haystack = [event.title ?? '', event.description ?? '', event.longDescription ?? '']
    .join(' ')
    .toLowerCase()

  return KEYWORDS.some((keyword) => haystack.includes(keyword))
}

// Transforme un événement OpenAgenda vers le schéma de la table `events`
export function mapToSupabase(event: OpenAgendaEvent): EventInsert | null {
  const location = event.location
  const firstTiming = event.firstTiming
  const lastTiming = event.lastTiming ?? event.firstTiming

  // Sans titre, lieu ou horaire, l'événement est inexploitable
  if (!event.title || !location || !firstTiming || !lastTiming) return null

  const imageUrl =
    event.image?.base && event.image?.filename ? `${event.image.base}${event.image.filename}` : null

  const timings = firstTiming.begin === lastTiming.begin ? [firstTiming] : [firstTiming, lastTiming]

  return {
    openagenda_uid: event.uid,
    name: event.title,
    description: event.description ?? event.longDescription ?? '',
    image_url: imageUrl,
    address: location.address ?? '',
    city: location.city ?? '',
    postal_code: extractPostalCode(event),
    lat: location.latitude ?? null,
    lng: location.longitude ?? null,
    venue_name: location.name ?? '',
    date_start: firstTiming.begin,
    date_end: lastTiming.end,
    all_timings: timings,
    source: 'openagenda',
    category: 'EVENEMENT',
    age_min: 0,
    age_max: 72,
    price_min: 0,
    price_max: 0,
    verified: false,
    updated_at: event.updatedAt ?? new Date().toISOString(),
  }
}
