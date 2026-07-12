// Protection des routes /admin/* : vérifie le cookie admin_session,
// sinon redirige vers /admin/login.
// Spécificité Next.js : ce fichier s'exécute dans l'Edge Runtime AVANT chaque
// requête qui matche `config.matcher` — il n'y a pas d'équivalent en React pur.
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifySessionToken } from './lib/admin-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminPassword = process.env.ADMIN_PASSWORD
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const isAuthenticated = adminPassword
    ? await verifySessionToken(token, adminPassword)
    : false

  // Page de login : accessible sans session (mais on saute le login si déjà connecté)
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/events', request.url))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // /admin tout court → page principale
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/events', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
