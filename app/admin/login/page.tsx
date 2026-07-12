'use client'

// Page de login admin. Client Component pour afficher l'erreur via useFormState.
// Spécificité Next.js : useFormState relie le retour de la Server Action au state
// du formulaire, sans fetch manuel ni useState pour la soumission.
import { useFormState, useFormStatus } from 'react-dom'
import { login, type LoginState } from './actions'

const initialState: LoginState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gray-900 px-4 py-2.5 font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? 'Connexion...' : 'Connexion'}
    </button>
  )
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(login, initialState)

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-1 text-xl font-bold text-gray-900">Espace admin</h1>
        <p className="mb-5 text-sm text-gray-500">Accès réservé — entre le mot de passe admin.</p>

        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Mot de passe admin
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mb-3 w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
        />

        {state.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <SubmitButton />
      </form>
    </div>
  )
}
