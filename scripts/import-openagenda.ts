// Script d'import OpenAgenda → Supabase
// Lancement : npm run import:openagenda
//
// Stratégie : l'endpoint global /v2/events est réservé (accès sur demande),
// donc on cherche des agendas pertinents (IDF / jeune public) puis on importe
// leurs événements futurs, filtrés sur les mots-clés enfants/famille.
import { createAdminClient } from './utils/supabase-admin'
import {
  AGENDA_SEARCH_TERMS,
  fetchAgendaEventsPage,
  isRelevant,
  mapToSupabase,
  searchAgendas,
  type OpenAgendaSummary,
} from './utils/openagenda'
import type { EventInsert } from '../lib/types/event'

const UPSERT_CHUNK_SIZE = 100
const MAX_PAGES_PER_AGENDA = 3 // 3 × 100 événements max par agenda

async function main(): Promise<void> {
  const startedAt = Date.now()
  console.log('🚀 Démarrage import OpenAgenda...')

  const supabase = createAdminClient()

  // --- 1. Recherche des agendas pertinents ---
  console.log('🔎 Recherche des agendas pertinents...')
  const agendasByUid = new Map<number, OpenAgendaSummary>()
  for (const term of AGENDA_SEARCH_TERMS) {
    try {
      const agendas = await searchAgendas(term, 10)
      for (const agenda of agendas) agendasByUid.set(agenda.uid, agenda)
    } catch (error) {
      console.warn(`  ⚠️  Recherche "${term}" échouée : ${String(error)}`)
    }
  }
  const agendas = Array.from(agendasByUid.values())
  console.log(`✅ ${agendas.length} agendas trouvés`)

  // --- 2. Récupération des événements de chaque agenda ---
  const relevantByUid = new Map<number, EventInsert>()
  let ignoredDuplicates = 0
  let scanned = 0

  for (let index = 0; index < agendas.length; index++) {
    const agenda = agendas[index]
    let after: string[] | null = null
    let pageCount = 0
    let agendaRelevant = 0
    let agendaTotal = 0

    try {
      do {
        const page = await fetchAgendaEventsPage(agenda.uid, after)
        agendaTotal = page.total
        scanned += page.events.length

        for (const event of page.events) {
          if (!isRelevant(event)) continue
          const mapped = mapToSupabase(event)
          if (!mapped) continue

          agendaRelevant++
          if (relevantByUid.has(mapped.openagenda_uid)) {
            ignoredDuplicates++
          } else {
            relevantByUid.set(mapped.openagenda_uid, mapped)
          }
        }

        after = page.events.length > 0 ? page.after : null
        pageCount++
      } while (after && pageCount < MAX_PAGES_PER_AGENDA)
    } catch (error) {
      console.warn(`  ⚠️  Agenda "${agenda.title}" ignoré : ${String(error)}`)
      continue
    }

    if (agendaTotal > 0) {
      console.log(
        `📡 [${index + 1}/${agendas.length}] ${agenda.title} — ${agendaRelevant} pertinents sur ${agendaTotal}`
      )
    }
  }

  console.log(`✅ ${relevantByUid.size} événements pertinents trouvés sur ${scanned} scannés`)

  // --- 3. Upsert en base ---
  console.log('💾 Insertion en base...')
  const toInsert = Array.from(relevantByUid.values())
  let upserted = 0
  const errors: string[] = []

  for (let i = 0; i < toInsert.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + UPSERT_CHUNK_SIZE)
    const { error } = await supabase.from('events').upsert(chunk, { onConflict: 'openagenda_uid' })
    if (error) {
      errors.push(`Chunk ${i / UPSERT_CHUNK_SIZE + 1} : ${error.message}`)
    } else {
      upserted += chunk.length
    }
  }

  console.log(`  ✅ ${upserted} événements insérés/mis à jour`)
  console.log(`  ⚠️  ${ignoredDuplicates} événements ignorés (doublons identiques)`)
  if (errors.length > 0) {
    console.log(`  ❌  ${errors.length} erreurs (voir détails ci-dessous)`)
    for (const err of errors) console.log(`     → ${err}`)
  }

  // --- 4. Nettoyage des événements passés depuis plus de 7 jours ---
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { count: endedCount, error: cleanupError } = await supabase
    .from('events')
    .delete({ count: 'exact' })
    .eq('source', 'openagenda')
    .lt('date_end', cutoff)

  // Événements sans date de fin : on se base sur la date de début
  const { count: noEndCount, error: cleanupError2 } = await supabase
    .from('events')
    .delete({ count: 'exact' })
    .eq('source', 'openagenda')
    .is('date_end', null)
    .lt('date_start', cutoff)

  if (cleanupError || cleanupError2) {
    console.log(`  ❌ Erreur nettoyage : ${cleanupError?.message ?? cleanupError2?.message}`)
  } else {
    console.log(`🗑️  Nettoyage — ${(endedCount ?? 0) + (noEndCount ?? 0)} événements passés supprimés`)
  }

  const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`✨ Import terminé en ${elapsedSeconds}s`)
}

main().catch((error) => {
  console.error('❌ Erreur fatale :', error)
  process.exit(1)
})
