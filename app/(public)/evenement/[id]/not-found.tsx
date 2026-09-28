import Link from 'next/link'

// Affiché quand `notFound()` est déclenché dans page.tsx (id inconnu dans la table `events`)
export default function EventNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white px-6 py-16 text-center">
      <span role="img" aria-label="Événement introuvable" className="text-6xl">
        🎪
      </span>
      <h1 className="text-xl font-bold md:text-2xl">Événement introuvable</h1>
      <p className="max-w-sm text-sm text-gray-500">
        Cet événement n&apos;existe pas ou a peut-être été retiré.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
