# Kids Activity App — Instructions Claude Code

## Projet

Application web et mobile qui centralise les activités et sorties pour enfants en France.
MVP ciblé sur l'Île-de-France, enfants de 0 à 6 ans.

**Catégories :** Parcs & loisirs · Spectacles & théâtre · Ateliers & créatifs · Aires de jeux · Restaurants family-friendly · Événements ponctuels

---

## Stack technique

- **Frontend web :** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Mobile :** React Native + Expo (plus tard, pas dans le MVP web)
- **Base de données :** Supabase (PostgreSQL + PostGIS)
- **Carte :** Mapbox GL JS via react-map-gl
- **State :** Zustand (global) + TanStack Query (server state) — **prévus, pas encore installés**
  (ne pas les ajouter sans accord ; aujourd'hui : Server Components + `useState` dans les hooks)
- **Déploiement :** Vercel (frontend) — branche main = production automatique
- **Recherche :** pg_trgm (Supabase natif, pas d'Algolia) — extension activée, utilisée pour les doublons
- **Auth :**
  - **Admin (en place)** : mot de passe `ADMIN_PASSWORD` + cookie de session signé (`lib/admin-session.ts`),
    vérifié par `middleware.ts` sur `/admin/*` et revérifié dans chaque Server Action
  - **Parents (prévu)** : Supabase Auth (email + Google OAuth), pas encore en place
- **Spécifications :** GitHub Spec-Kit (`.specify/`, une spec par dossier dans `specs/`)

> **État actuel (2026-11-24)** : les pages publiques lisent encore des données fictives
> (`lib/data/mock-activities.ts`). Le branchement sur la table `activities` est l'issue #35.

---

## Structure des dossiers

Arborescence réelle. Les éléments marqués *(prévu)* n'existent pas encore : les créer à cet
emplacement le moment venu.

```
kids-app/
├── app/                        # Next.js App Router
│   ├── (public)/               # Routes publiques
│   │   ├── page.tsx            # Accueil (événements à venir lus dans Supabase)
│   │   ├── liste/page.tsx      # Mode liste (données mock, voir #35)
│   │   ├── carte/page.tsx      # Mode carte (données mock, voir #35)
│   │   ├── activite/[id]/      # Fiche détail activité (données mock, voir #35)
│   │   └── evenement/[id]/     # Fiche détail événement (table events)
│   ├── admin/                  # Espace admin protégé par middleware.ts
│   │   ├── login/              # Connexion par mot de passe
│   │   ├── events/             # CRUD événements + import OpenAgenda
│   │   └── brouillons/         # (prévu, specs/003, #31 à #34) revue des brouillons
│   ├── (auth)/profil/          # (prévu) profil parent + favoris
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # (prévu, specs/002, #21) composants génériques
│   ├── activity/               # ActivityCard, ActivityList, ActivityMap, EventCard
│   ├── filters/                # FilterBar
│   └── layout/                 # Navbar, BottomNav
├── lib/
│   ├── supabase/server.ts      # Clients serveur (service_role et anon) ; pas de client navigateur
│   ├── admin-session.ts        # Signature / vérification du cookie admin
│   ├── data/mock-activities.ts # Données fictives (à retirer avec #35)
│   ├── types/                  # Types partagés (activity.ts, event.ts)
│   └── utils/format.ts         # Formatters (âge, prix, lieu, dates)
├── hooks/                      # useActivities (mock)
├── middleware.ts               # Protection des routes /admin/*
├── scripts/
│   ├── import-openagenda.ts    # Import des événements OpenAgenda
│   ├── utils/
│   └── sql/                    # SQL versionné, exécuté à la main dans le SQL Editor Supabase
├── specs/                      # Specs Spec-Kit (001 ingestion, 002 design KidMap, 003 revue admin)
├── .specify/                   # Configuration Spec-Kit + constitution (memory/constitution.md)
└── .claude/                    # Agents, skills et commandes du workflow multi-agents
```

---

## Types principaux

```typescript
type Category = 'PARC' | 'SPECTACLE' | 'ATELIER' | 'AIRE_JEUX' | 'RESTAURANT' | 'EVENEMENT'

interface Activity {
  id: string
  name: string
  description: string
  category: Category
  age_min: number        // en mois (ex: 0, 6, 12, 24, 36...)
  age_max: number        // en mois
  price_min: number
  price_max: number
  lat: number
  lng: number
  address: string
  opening_hours: Record<string, string>
  tags: string[]
  images: string[]
  avg_rating: number
  reviews_count: number
  verified: boolean
  source: string
  created_at: string
}
// ⚠️ La table `activities` a aussi city, postal_code, venue_name, date_start, date_end,
// source_url, et plusieurs colonnes nullables : ce type est à aligner sur la table (#35).
// Le brouillon d'ingestion (`activities_drafts`) est décrit dans
// specs/003-admin-revue-brouillons/data-model.md.

interface FilterState {
  category: Category | null
  age_min: number        // en années (pour l'UI)
  age_max: number
  distance_km: number
  price_max: number | null
  search_query: string
}
```

---

## Conventions de code

- **Langue :** Commentaires en français, code (variables, fonctions) en anglais
- **Composants :** toujours `export default`, props typées avec interface
- **Async :** `async/await` uniquement, jamais `.then()`
- **Erreurs :** toujours gérer les états `loading`, `error`, `empty` dans chaque composant
- **Images :** toujours le composant `<Image>` de Next.js, jamais `<img>`
- **Mobile-first :** toutes les classes Tailwind commencent par mobile, puis `md:` et `lg:`
- **Âges :** stockés en **mois** en base, convertis en années dans l'UI uniquement

---

## Commandes

```bash
# Développement
npm run dev              # Lance le serveur Next.js sur localhost:3000

# Build & checks
npm run build            # Build production
npm run type-check       # TypeScript sans compilation
npm run lint             # ESLint

# Import données
npm run import:openagenda                 # Import événements OpenAgenda (= npx tsx scripts/import-openagenda.ts)
```

**Schéma de base :** pas de Supabase CLI ni de dossier de migrations. Le SQL est versionné dans
`scripts/sql/` (ré-exécutable : `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP … IF EXISTS`) et
exécuté **à la main** dans le SQL Editor Supabase par l'humain. Les types TypeScript sont écrits
à la main dans `lib/types/`.

*(Prévu, pas encore écrit : `scripts/import-google-places.ts`.)*

---

## Variables d'environnement

Toujours utiliser `.env.local` pour les secrets. Ne jamais hardcoder de clé API.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=                    # Optionnel, côté serveur (sinon NEXT_PUBLIC_SUPABASE_URL)
SUPABASE_SERVICE_ROLE_KEY=       # Côté serveur uniquement (admin, scripts)
ADMIN_PASSWORD=                  # Mot de passe de l'espace /admin
NEXT_PUBLIC_MAPBOX_TOKEN=
OPENAGENDA_API_KEY=              # Script d'import OpenAgenda
GOOGLE_PLACES_API_KEY=           # (prévu) futur script Google Places
```

---

## Règles Supabase

- Clients serveur dans `lib/supabase/server.ts` (Server Components et Server Actions uniquement) :
  - `createServerClient()` : clé `service_role`, contourne le RLS, **réservé à l'admin**
  - `createPublicServerClient()` : clé anon, pour les pages publiques (lecture via RLS)
- Pas encore de client **navigateur** : s'il en faut un, le créer dans `lib/supabase/client.ts`
  (clé anon uniquement)
- Ne jamais utiliser `SUPABASE_SERVICE_ROLE_KEY` côté client
- Tables : `activities` (publiées), `activities_drafts` (brouillons d'ingestion, jamais lisibles
  par anon), `events` (OpenAgenda et saisie manuelle)
- La fonction RPC `get_nearby_activities(lat, lng, radius_km)` est **prévue mais n'existe pas
  encore** en base : la créer (SQL dans `scripts/sql/`) avant toute requête géospatiale
- Les Row Level Security (RLS) sont activées : lecture publique, écriture via `service_role`
  (admin, scripts, connecteur du Projet Claude d'ingestion)

---

## Règles importantes

- Ne pas installer de librairies supplémentaires sans demander d'abord
- Ne pas modifier la structure des dossiers sans raison explicite
- Ne pas utiliser `any` en TypeScript — préférer `unknown` ou typer correctement
- Ne pas utiliser `localStorage` — utiliser Supabase ou Zustand
- Les filtres d'âge dans l'UI sont en **années**, mais les queries Supabase sont en **mois** (multiplier par 12)
- La carte Mapbox doit toujours être importée avec `dynamic(() => import(...), { ssr: false })`
- Toujours inclure les états `loading` et `error` dans les composants qui fetch des données
- Le profil enfant stocke la date de naissance — l'âge est **calculé dynamiquement**, jamais stocké

---

## Contexte développeur

- Dev front React avec expérience React, débutant Next.js
- Solo developer, projet passion, 5-10h par semaine
- Préférence pour des explications sur les parties spécifiques à Next.js qui diffèrent de React
- MVP d'abord : fonctionnel > parfait
- Quand tu proposes du code, toujours inclure les imports

---

## Workflow multi-agents (contrat de handoff)

Quatre sous-agents (`.claude/agents/`) se passent le relais via GitHub Issues + le Project
**KIDS-APP Pipeline**. Ces règles sont la loi — ne jamais dévier.

### Signaux entre agents

- Une US = une Issue avec le label `type: user-story`.
- Un handoff = changement de label `status: *` **ET** déplacement de la carte dans le Project.
- Toute PR référence son issue avec `Closes #<num>` dans le corps.
- Le reviewer poste son verdict en texte (`VERDICT: APPROVED` / `VERDICT: CHANGES_REQUESTED`)
  via `gh pr review --comment` — jamais `--approve` (même compte que l'auteur → refusé par GitHub).
- Aucun merge sans : verdict APPROVED + `QA: GO` + CI verte + **validation humaine explicite**.
- Boucle dev↔review plafonnée à 2 allers-retours, ensuite escalade à l'humain.
- Merge en **squash uniquement** (imposé par le ruleset `protect-main`).

### Étapes et responsables

| Colonne | Label | Qui agit |
|---|---|---|
| `Backlog` | — | product-owner (affine l'US) |
| `Ready` | `status: ready` | US complète, attend le developer |
| `In Progress` | `status: in-progress` | developer (branche + code) |
| `In Review` | `status: review` | reviewer |
| `QA` | `status: qa` | qa |
| `Deployed` | — | mergé sur `main`, Vercel déploie |

### Commandes gh de référence (IDs réels du projet)

Project : numéro **1**, owner **mehdisebei-debug**, id `PVT_kwHOEgSBb84BfnM_`.
Champ Status : `PVTSSF_lAHOEgSBb84BfnM_zhZ43jw`.

```bash
# Créer une issue US
gh issue create --title "[US] ..." --body "..." --label "type: user-story" --label "priority: p1"

# Ajouter l'issue au board (retourne l'item-id de la carte)
gh project item-add 1 --owner mehdisebei-debug --url <url-issue>

# Retrouver l'item-id d'une carte existante
gh project item-list 1 --owner mehdisebei-debug --format json

# Déplacer une carte (option-id selon la colonne cible, voir table ci-dessous)
gh project item-edit --id <item-id> --project-id PVT_kwHOEgSBb84BfnM_ \
  --field-id PVTSSF_lAHOEgSBb84BfnM_zhZ43jw --single-select-option-id <option-id>

# Changer le label status d'une issue (retirer l'ancien, poser le nouveau)
gh issue edit <num> --remove-label "status: ready" --add-label "status: in-progress"
```

| Colonne | option-id |
|---|---|
| Backlog | `58e7e7d9` |
| Ready | `0031a187` |
| In Progress | `e31e8ab5` |
| In Review | `ea1503a2` |
| QA | `e01d3446` |
| Deployed | `4cf0d3db` |

### Branches et commits

- Branches : `feat/<num>-slug`, `fix/<num>-slug` — toujours depuis `main` à jour.
- Commits : Conventional Commits en français (`feat:`, `fix:`, `test:`, `chore:`).
- Avant toute PR : `npm run lint && npm run type-check && npm run build` verts.

### Garde-fous

- Un agent ne fait QUE son rôle : le developer ne review pas, le reviewer ne code pas,
  le qa ne modifie pas la feature.
- Secrets (Supabase, Mapbox) : jamais dans le code, les issues ou les PR.
- Tant que le workflow n'est pas éprouvé : merge uniquement sur ordre humain explicite.
