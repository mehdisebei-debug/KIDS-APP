# Data Model — Intégration du design KidMap Paris

Lots 1 et 2 : **aucune table ni migration**. Le « modèle » de ces lots est un ensemble de types
TypeScript et de constantes de design partagés (`lib/types/`). Les entités du lot 3 sont
esquissées en fin de document.

## 1. Jetons de design (`tailwind.config.ts` → `theme.extend`)

| Jeton | Valeur | Usage |
|---|---|---|
| `brand` | `#FF5533` | fonds de bouton principal (texte blanc gras ≥ 18,7 px), icône onglet actif, marqueur sélection |
| `brand-soft` | `#FF8566` | survol / états pressés |
| `brand-tint` | `#FFF1ED` | fond de puce active, fond de mise en avant |
| `brand-ink` | `#C8331A` | **texte** corail (liens, libellé onglet actif, petits boutons) — écart AA, voir research R3 |
| `accent` | `#4A90E2` | bouton « me localiser », point de position |
| `star` | `#FFBA08` | étoiles de note |
| `ink` | `#1C1B22` | texte principal |
| `ink-soft` | `#4A4554` | texte courant secondaire |
| `muted` | `#757080` | texte tertiaire (méta, compteurs) — remplace `#8A8090` (AA) |
| `cream` | `#FAFAF5` | fond de page |
| `surface` | `#F4F0EB` | fond d'image manquante, puces inactives |
| `line` | `#E8E2DA` | bordures, séparateurs |
| `fontFamily.display` | Nunito 700/800 | titres, noms d'activité, boutons |
| `fontFamily.body` | DM Sans 400/500/700 | texte courant (police par défaut du `body`) |
| `borderRadius.card` | 20 px | cartes |
| `borderRadius.tile` | 14 px | vignettes, blocs d'info |
| `borderRadius.sheet` | 24 px | panneau bas, fiche |
| pilule | `rounded-full` | puces, boutons, badges |
| `boxShadow.card` | `0 2px 10px rgba(0,0,0,.06)` | cartes au repos |
| `boxShadow.raised` | `0 8px 24px rgba(0,0,0,.10)` | carte sélectionnée, panneau bas |

## 2. Style de catégorie (`lib/types/activity.ts`)

```ts
interface CategoryStyle {
  text: string     // classe Tailwind du texte du badge (variante AA)
  bg: string       // classe du fond de badge / placeholder
  solid: string    // classe du fond plein (marqueur, puce active)
}
const CATEGORY_STYLES: Record<Category, CategoryStyle>
```

`CATEGORY_LABELS` (libellé + emoji) est **conservé** ; `CATEGORY_STYLES` le complète.

| Category | solid (marqueur) | bg | text (AA) |
|---|---|---|---|
| PARC | `#2A9D5C` | `#E8F7EF` | `#1F7A47` |
| SPECTACLE | `#BB2D6E` | `#FAEDF4` | `#BB2D6E` |
| ATELIER | `#D4621A` | `#FDF0E6` | `#B4501A` |
| AIRE_JEUX | `#1A7FC1` | `#E5F3FB` | `#146AA3` |
| RESTAURANT | `#9B5C1A` | `#FDF2E9` | `#9B5C1A` |
| EVENEMENT | `#6B4FBB` | `#F0ECF9` | `#6B4FBB` |

Règle : les classes sont écrites en entier dans la constante (pas de `bg-${x}`), pour le purge.

## 3. Tranche d'âge (`lib/types/ui.ts`)

```ts
type AgeGroupId = '0-6m' | '6-12m' | '1-2a' | '2-3a' | '3-4a' | '4-5a' | '5-6a'

interface AgeGroup {
  id: AgeGroupId
  label: string        // « 0–6 mois », « 6m–1 an », « 1–2 ans » …
  emoji: string        // 🍼 🧸 🚶 🎠 🎨 🚲 ⚽
  min_months: number   // borne incluse
  max_months: number   // borne exclue
}
```

| id | label | min_months | max_months |
|---|---|---|---|
| `0-6m` | 0–6 mois | 0 | 6 |
| `6-12m` | 6m–1 an | 6 | 12 |
| `1-2a` | 1–2 ans | 12 | 24 |
| `2-3a` | 2–3 ans | 24 | 36 |
| `3-4a` | 3–4 ans | 36 | 48 |
| `4-5a` | 4–5 ans | 48 | 60 |
| `5-6a` | 5–6 ans | 60 | 72 |

**Règle de correspondance** : une activité / un événement `[age_min, age_max]` (mois) appartient
à la tranche `g` si `age_min < g.max_months && age_max >= g.min_months`. Une activité peut donc
apparaître dans plusieurs tranches (edge case de la spec).

## 4. Filtres (`lib/types/activity.ts`)

```ts
interface FilterState {
  category: Category | null
  age_group: AgeGroupId | null   // remplace age_min / age_max (années) — tranche en mois
  distance_km: number
  price_max: number | null
  search_query: string
}
```

Sérialisation URL (voir [contracts/routes.md](./contracts/routes.md)) : `categorie`, `age`, `q`,
`gratuit`.

## 5. Onglets (`lib/types/ui.ts`)

```ts
type TabId = 'carte' | 'explorer' | 'favoris' | 'profil'

interface TabItem {
  id: TabId
  href: string      // /carte, /liste, /favoris, /profil
  label: string     // Carte, Explorer, Favoris, Profil
  emoji: string     // 🗺️ 🔍 ❤️ 👤
  enabled: boolean  // false pour favoris/profil jusqu'au lot 3
}
```

## 6. Données affichées (inchangées)

- `Activity` (`lib/types/activity.ts`) et `EventRow` (`lib/types/event.ts`) : **aucune
  modification de champ**. Les fiches masquent un bloc quand la donnée est vide :
  `images` vide / `image_url` null → placeholder catégorie ; `opening_hours` vide → pas de bloc
  Horaires ; pas de `avg_rating` (événements) → pas d'étoiles ; `lat/lng` absents → pas de
  mini-carte ni de marqueur, itinéraire sur l'adresse.
- Distance : dérivée côté client (jamais stockée) à partir de la position du parent.

## 7. Esquisse lot 3 (à détailler dans un plan ultérieur)

| Entité | Champs | Règles |
|---|---|---|
| `favorites` | `user_id`, `item_type` (`activity`/`event`), `item_id`, `created_at` | unique (user_id, item_type, item_id) ; RLS : lecture/écriture par le propriétaire seul ; suppression en cascade avec le compte |
| `child_profiles` | `user_id` (unique), `first_name` (nullable), `birth_date` | âge **jamais stocké**, calculé en mois à l'affichage ; date ≤ aujourd'hui ; RLS propriétaire seul ; suppression à la demande (FR-016) |
