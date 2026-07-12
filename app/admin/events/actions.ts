'use server'

// Server Actions CRUD + lancement de l'import OpenAgenda.
// Chaque action revérifie la session admin (défense en profondeur, en plus du middleware).
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { ADMIN_COOKIE_NAME, verifySessionToken } from '@/lib/admin-session'
import { createServerClient } from '@/lib/supabase/server'
import type { EventFormPayload } from '@/lib/types/event'

const execFileAsync = promisify(execFile)

export interface ActionResult {
  ok: boolean
  message: string
}

async function requireAdmin(): Promise<ActionResult | null> {
  const adminPassword = process.env.ADMIN_PASSWORD
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value
  const valid = adminPassword ? await verifySessionToken(token, adminPassword) : false
  return valid ? null : { ok: false, message: 'Session admin invalide — reconnecte-toi.' }
}

// Valide le payload du formulaire et le transforme en ligne prête pour Supabase
function buildRow(payload: EventFormPayload): { row: Record<string, unknown> } | { error: string } {
  if (!payload.name.trim()) return { error: "Le nom de l'événement est obligatoire" }
  if (!payload.address.trim()) return { error: "L'adresse est obligatoire" }
  if (!payload.city.trim()) return { error: 'La ville est obligatoire' }
  if (!payload.date_start) return { error: 'La date de début est obligatoire' }

  return {
    row: {
      name: payload.name.trim(),
      description: payload.description.trim(),
      image_url: payload.image_url.trim() || null,
      venue_name: payload.venue_name.trim(),
      address: payload.address.trim(),
      city: payload.city.trim(),
      postal_code: payload.postal_code.trim(),
      lat: payload.lat,
      lng: payload.lng,
      date_start: new Date(payload.date_start).toISOString(),
      date_end: payload.date_end ? new Date(payload.date_end).toISOString() : null,
      age_min: payload.age_min,
      age_max: payload.age_max,
      price_min: payload.price_min,
      price_max: payload.price_max,
      verified: payload.verified,
      category: 'EVENEMENT',
    },
  }
}

export async function createEvent(payload: EventFormPayload): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createServerClient()
  if (!supabase) return { ok: false, message: 'Supabase non configuré (.env.local)' }

  const built = buildRow(payload)
  if ('error' in built) return { ok: false, message: built.error }

  const { error } = await supabase.from('events').insert({ ...built.row, source: 'manuel' })
  if (error) return { ok: false, message: `Erreur Supabase : ${error.message}` }

  revalidatePath('/admin/events')
  return { ok: true, message: 'Événement créé ✅' }
}

export async function updateEvent(id: string, payload: EventFormPayload): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createServerClient()
  if (!supabase) return { ok: false, message: 'Supabase non configuré (.env.local)' }

  const built = buildRow(payload)
  if ('error' in built) return { ok: false, message: built.error }

  const { error } = await supabase.from('events').update(built.row).eq('id', id)
  if (error) return { ok: false, message: `Erreur Supabase : ${error.message}` }

  revalidatePath('/admin/events')
  return { ok: true, message: 'Événement modifié ✅' }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return denied

  const supabase = createServerClient()
  if (!supabase) return { ok: false, message: 'Supabase non configuré (.env.local)' }

  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) return { ok: false, message: `Erreur Supabase : ${error.message}` }

  revalidatePath('/admin/events')
  return { ok: true, message: 'Événement supprimé' }
}

// Lance le script d'import OpenAgenda et renvoie les dernières lignes du log
export async function runImport(): Promise<ActionResult> {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { stdout } = await execFileAsync('npx', ['tsx', 'scripts/import-openagenda.ts'], {
      cwd: process.cwd(),
      timeout: 5 * 60 * 1000, // 5 min max
    })

    revalidatePath('/admin/events')
    // On renvoie les lignes de résumé (insertion, nettoyage, durée)
    const summary = stdout
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(-5)
      .join('\n')
    return { ok: true, message: summary || 'Import terminé' }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, message: `Échec de l'import : ${message}` }
  }
}
