import Link from 'next/link'
import type { ReactNode } from 'react'

// Layout commun aux pages admin. La vérification de session est faite dans
// middleware.ts (avant même le rendu) — ici on ne gère que la coquille visuelle.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin/events" className="text-lg font-bold text-gray-900">
            🛠️ Admin — Kids App
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Retour au site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
