# Contrat — Composants partagés

Signatures (props) des composants réutilisés entre écrans. Tous en `export default`, props
typées par interface, styles uniquement via les jetons de [data-model.md](../data-model.md).
Le rendu attendu de chacun est celui décrit dans [maquette-figma.md](../maquette-figma.md).

## `components/ui/`

| Composant | Props | Garanties |
|---|---|---|
| `Chip` | `label: string`, `emoji?: string`, `active: boolean`, `onClick: () => void`, `tone?: Category` | pilule, hauteur ≥ 44 px de zone tactile, `aria-pressed={active}` ; actif = fond `brand-tint` + texte `brand-ink` (ou couleur catégorie si `tone`) |
| `CategoryBadge` | `category: Category`, `size?: 'sm' \| 'md'` | emoji + libellé court, couleurs `CATEGORY_STYLES` |
| `StarRating` | `rating: number`, `count?: number` | 5 étoiles `star`, valeur lisible par lecteur d'écran (« 4,7 sur 5 ») |
| `EmptyState` | `emoji: string`, `title: string`, `hint?: string`, `action?: { label: string; href: string }` | texte centré, jamais en rouge (état vide ≠ erreur) |
| `ErrorState` | `message: string`, `retryHref?: string` | message humain, pas de texte technique brut |
| `ShareButton` *(client)* | `url: string`, `title: string` | `navigator.share` sinon copie + « Lien copié » ; ne plante jamais si l'API est refusée |

## `components/activity/`

| Composant | Props | Garanties |
|---|---|---|
| `ActivityCard` | `activity: Activity` | carte complète : image ou placeholder catégorie, badge, nom (Nunito), lieu, note, âge, prix ; lien vers la fiche |
| `ActivityCardCompact` *(lot 2)* | `activity: Activity`, `selected?: boolean` | largeur fixe ~240 px pour le défilement horizontal ; bordure couleur catégorie si `selected` |
| `EventCard` | `event: EventRow` | même langage visuel ; date en tête ; pas d'étoiles |
| `ActivityList` | `activities: Activity[]`, `loading: boolean`, `error: string \| null`, `emptyHint?: string` | loading = squelettes, error = `ErrorState`, empty = `EmptyState` « Aucun résultat — Essayez un autre mot-clé » |
| `ActivityDetail` | `kind: 'activity' \| 'event'`, `title`, `category`, `imageUrl?`, `rating?`, `description?`, `infos: { label: string; value: string; emoji: string }[]`, `location?: { lat: number; lng: number; address: string }`, `website?`, `backHref` | page complète ; blocs sans donnée masqués ; « Voir l'itinéraire » + `ShareButton` |
| `ActivityMap` *(lot 2)* | `activities: Activity[]`, `loading`, `error`, `selectedId: string \| null`, `onSelect: (id: string \| null) => void`, `userPosition?: { lat: number; lng: number } \| null` | marqueurs couleur catégorie, sélectionné agrandi + nom ; états inchangés (token absent → « Carte indisponible ») |

## `components/filters/`

| Composant | Props | Garanties |
|---|---|---|
| `CategoryBar` | `value: Category \| null`, `onChange: (c: Category \| null) => void` | puce « Tous » + 6 catégories, défilement horizontal sans barre visible, aucun débordement de page |
| `AgeGroupChips` *(lot 2)* | `value: AgeGroupId \| null`, `onChange: (g: AgeGroupId \| null) => void` | 7 puces ; toucher la puce active la désélectionne (tous âges) |
| `FilterBar` | `filters: FilterState`, `onChange: (f: FilterState) => void` | recherche + `CategoryBar` (+ `AgeGroupChips` au lot 2) + « Gratuit » |

## `components/layout/`

| Composant | Props | Garanties |
|---|---|---|
| `Navbar` | — | « KidMap Paris » + « Île-de-France » ; cloche masquée ; avatar masqué jusqu'au lot 3 |
| `BottomNav` | — | onglets `TabItem` avec `enabled: true` seulement ; actif = icône `brand` + libellé `brand-ink` ; masquée ≥ `md` |
| `BottomSheet` *(lot 2)* | `expanded: boolean`, `onExpandedChange: (v: boolean) => void`, `header: ReactNode`, `children: ReactNode` | poignée `button` `aria-expanded` ; glissé ≥ 40 px bascule ; ne recouvre jamais la BottomNav |

## Hooks

| Hook | Signature | Garanties |
|---|---|---|
| `useActivities` | `(filters: FilterState) => { activities, loading, error }` | filtre par `age_group` selon la règle de chevauchement en mois ; recherche `search_query` sur `name`, `description`, `address`, `tags` (research R14) |
| `useGeolocation` *(lot 2)* | `() => { position, status: 'idle' \| 'pending' \| 'granted' \| 'denied' \| 'unavailable', request: () => void }` | ne demande la permission que sur `request()` ; ne stocke rien |
