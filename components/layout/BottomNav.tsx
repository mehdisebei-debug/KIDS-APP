'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  emoji: string
}

const ITEMS: NavItem[] = [
  { href: '/', label: 'Accueil', emoji: '🏠' },
  { href: '/liste', label: 'Liste', emoji: '📋' },
  { href: '/carte', label: 'Carte', emoji: '🗺️' },
]

// Barre de navigation mobile fixée en bas — cachée sur desktop
export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-100 bg-white md:hidden">
      <div className="flex justify-around">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs ${
              pathname === item.href ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <span className="text-lg">{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
