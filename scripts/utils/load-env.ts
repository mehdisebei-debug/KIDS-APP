import { readFileSync } from 'fs'
import { resolve } from 'path'

// Charge .env.local dans process.env sans dépendance externe (dotenv non installé).
// Les variables déjà présentes dans l'environnement ne sont pas écrasées.
export function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), '.env.local')

  let content: string
  try {
    content = readFileSync(envPath, 'utf-8')
  } catch {
    console.error('❌ Fichier .env.local introuvable à la racine du projet')
    process.exit(1)
  }

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
