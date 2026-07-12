// Session admin : jeton signé HMAC-SHA256 stocké dans le cookie `admin_session`.
// Utilise Web Crypto (crypto.subtle) pour fonctionner à la fois dans le
// middleware (Edge Runtime) et dans les Server Actions (Node.js).

export const ADMIN_COOKIE_NAME = 'admin_session'
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24h

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Crée un jeton "expiration.signature" signé avec le mot de passe admin
export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = String(Date.now() + SESSION_DURATION_MS)
  const signature = await hmacSign(`admin_session:${expiresAt}`, secret)
  return `${expiresAt}.${signature}`
}

// Vérifie la signature et l'expiration du jeton
export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false

  const [expiresAt, signature] = token.split('.')
  if (!expiresAt || !signature) return false
  if (Number(expiresAt) < Date.now()) return false

  const expected = await hmacSign(`admin_session:${expiresAt}`, secret)
  return signature === expected
}
