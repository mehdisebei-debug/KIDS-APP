'use server'

// Server Action de login : valide le mot de passe côté serveur, pose le cookie
// admin_session (24h) puis redirige vers /admin/events.
// Spécificité Next.js : une Server Action s'exécute sur le serveur mais peut
// être appelée directement depuis un <form> client — pas besoin de route API.
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, createSessionToken, SESSION_DURATION_MS } from '@/lib/admin-session'

export interface LoginState {
  error: string | null
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return { error: 'ADMIN_PASSWORD non configuré dans .env.local' }
  }

  const password = formData.get('password')
  if (typeof password !== 'string' || password !== adminPassword) {
    return { error: 'Mot de passe incorrect' }
  }

  const token = await createSessionToken(adminPassword)
  cookies().set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  })

  redirect('/admin/events')
}
