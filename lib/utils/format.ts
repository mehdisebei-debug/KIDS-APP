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
