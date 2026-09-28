// Helpers de formatage — âges stockés en mois en base, affichés en années dans l'UI

export function monthsToYearsLabel(months: number): string {
  if (months === 0) return 'dès la naissance'
  if (months < 12) return `${months} mois`
  const years = Math.floor(months / 12)
  return `${years} an${years > 1 ? 's' : ''}`
}

// Ex : "0 - 6 ans" ou "18 mois - 4 ans"
export function ageRangeLabel(ageMinMonths: number, ageMaxMonths: number): string {
  const min = ageMinMonths < 12 && ageMinMonths > 0 ? `${ageMinMonths} mois` : `${Math.floor(ageMinMonths / 12)}`
  const max = monthsToYearsLabel(ageMaxMonths)
  if (ageMinMonths === 0) return `0 - ${max}`
  return `${min} - ${max}`
}

export function priceLabel(priceMin: number, priceMax: number): string {
  if (priceMin === 0 && priceMax === 0) return 'Gratuit'
  if (priceMin === priceMax) return `${priceMin} €`
  return `${priceMin} - ${priceMax} €`
}

// Conversion années (UI) → mois (base) pour les filtres
export function yearsToMonths(years: number): number {
  return years * 12
}

// Normalise une chaîne pour la comparaison : sans accents, sans casse, sans ponctuation/espaces
// (ex : "Saint-Ouen" et "SAINT OUEN" deviennent tous deux "saintouen")
function normalizeForComparison(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// Vrai si `needle` est déjà présent dans `haystack` (comparaison normalisée)
function isAlreadyIncluded(haystack: string, needle: string | null): boolean {
  if (!needle) return false
  const normalizedNeedle = normalizeForComparison(needle)
  if (!normalizedNeedle) return false
  return normalizeForComparison(haystack).includes(normalizedNeedle)
}

// Lieu complet d'un événement : nom du lieu (si renseigné), adresse, puis code postal + ville
// Ex : "Parc de la Villette, 211 Avenue Jean Jaurès, 75019 Paris"
// L'API OpenAgenda renvoie souvent une `address` qui contient déjà le code postal et/ou la
// ville (ex. "20 Rue de Poissy, 75005 Paris, France") : on ne les ré-ajoute donc que s'ils ne
// sont pas déjà présents dans `address`, pour éviter un doublon type "75005 Paris, ..., 75005 Paris".
export function eventVenueLabel(venue: {
  venue_name: string | null
  address: string | null
  postal_code: string | null
  city: string | null
}): string {
  const parts: string[] = []
  if (venue.venue_name) parts.push(venue.venue_name)
  if (venue.address) parts.push(venue.address)

  const postalCityParts = [venue.postal_code, venue.city].filter(
    (value): value is string => Boolean(value) && !isAlreadyIncluded(venue.address ?? '', value)
  )
  const postalCity = postalCityParts.join(' ')
  if (postalCity) parts.push(postalCity)

  return parts.join(', ')
}

// Plage de dates complète d'un événement, pour la fiche détail
// Ex : "samedi 18 juillet 2026" ou "Du 18 juillet 2026 au 5 octobre 2026"
export function eventDateRangeLabel(dateStart: string, dateEnd: string | null): string {
  const start = new Date(dateStart)
  const end = dateEnd ? new Date(dateEnd) : null
  const fmt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

  if (!end || start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('fr-FR', { weekday: 'long', ...fmt })
  }
  return `Du ${start.toLocaleDateString('fr-FR', fmt)} au ${end.toLocaleDateString('fr-FR', fmt)}`
}
