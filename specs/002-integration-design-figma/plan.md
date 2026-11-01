# Implementation Plan: Intégration du nouveau design « KidMap Paris »

**Branch**: `002-integration-design-figma` | **Date**: 2026-11-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-integration-design-figma/spec.md`

**Périmètre de ce plan** : lots 1 et 2 détaillés (fondations, navigation, cartes, Explorer,
fiche détail, Carte). Lots 3 à 5 (Favoris/Profil, desktop, connexion « à discuter ») esquissés
seulement en fin de document.

## Summary

Remplacer l'habillage provisoire (indigo/gris, Geist) par l'identité KidMap Paris relevée dans
la maquette Figma Make ([maquette-figma.md](./maquette-figma.md)) : jetons de design centralisés
dans la config Tailwind, polices Nunito + DM Sans via `next/font/google` (aucune dépendance
ajoutée), style par catégorie pour les 6 catégories de l'app, navigation 4 onglets avec la Carte
en écran d'entrée, Explorer = page liste redessinée (activités + événements à venir), fiche
détail en page complète, puis écran Carte plein écran avec puces d'âge en mois et panneau bas.
Aucune nouvelle librairie, aucun changement de schéma de base pour les lots 1–2.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 18

**Primary Dependencies**: Next.js 14.2 (App Router), Tailwind CSS 3.4, react-map-gl 8 + mapbox-gl 3,
@supabase/supabase-js 2 — **aucune dépendance ajoutée** (polices via `next/font/google`, intégré
à Next)

**Storage**: Supabase (table `events` lue côté serveur) ; activités encore servies par
`lib/data/mock-activities.ts` (inchangé par ce plan). Aucune migration pour les lots 1–2.

**Testing**: pas de framework de test (limite connue de la constitution) → `npm run lint`,
`npm run type-check`, `npm run build` + validation manuelle guidée par [quickstart.md](./quickstart.md)

**Target Platform**: navigateurs mobiles (Safari iOS, Chrome Android) d'abord, desktop ensuite ;
déploiement Vercel

**Project Type**: application web Next.js (front + Server Components), dépôt unique

**Performance Goals**: premier écran mobile 4G pas plus de 10 % plus lent qu'aujourd'hui
(SC-006) ; polices auto-hébergées par Next, `display: swap`, 2 familles × 3 graisses max

**Constraints**: mobile-first 375 px sans défilement horizontal, zones tactiles ≥ 44 px,
contraste AA, âges en mois, états loading/error/empty partout, pas de `localStorage`, pas de
`<img>`, `async/await` uniquement, Mapbox via `dynamic(..., { ssr: false })`

**Scale/Scope**: 6 écrans publics touchés (`/`, `/liste`, `/carte`, `/activite/[id]`,
`/evenement/[id]`, 404 événement), ~8 composants redessinés, 3 nouveaux petits composants
(puces d'âge, panneau bas, bouton partager)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | Statut |
|---|---|---|
| I. Mobile-first absolu | Classes de base mobiles, `md:`/`lg:` n'élargissent ; Carte plein écran pensée à 375 px ; zones tactiles ≥ 44 px (puces `min-h-11`) ; contrôle à 375 px dans quickstart | ✅ |
| II. L'âge se mesure en mois | Tranches d'âge définies en mois (0, 6, 12, 24, 36, 48, 60, 72) ; filtre exprimé en mois ; libellés calculés à l'affichage seulement ; aucune conversion années→mois→années | ✅ (voir note ci-dessous) |
| III. Aucun état implicite | Chaque écran qui charge (Explorer, Carte, fiches) garde loading/error/empty, restylés ; états vides avec les textes de la maquette | ✅ |
| IV. Typage strict | Nouveaux types (`AgeGroup`, `CategoryStyle`, `TabItem`) dans `lib/types/` ; props par interface ; pas de `any` | ✅ |
| V. Secrets serveur | Seul `NEXT_PUBLIC_MAPBOX_TOKEN` (déjà public) est utilisé côté client, y compris pour la mini-carte statique ; aucune clé ajoutée | ✅ |
| Contraintes techniques | Pas de nouvelle librairie ; `<Image>` partout ; Mapbox en `dynamic` ; pas de `localStorage` ; structure de dossiers conservée (ajout d'un `app/(public)/layout.tsx` dans un dossier existant) | ✅ |
| Workflow | Un lot = une ou plusieurs US GitHub, PR `Closes #n`, lint/type-check/build verts, review + QA + validation humaine | ✅ |

**Note principe II / écart à `CLAUDE.md`** : `CLAUDE.md` décrit `FilterState.age_min/age_max` en
**années**. La maquette exige la tranche « 0–6 mois », non représentable en années entières. Le
plan remplace ces deux champs par `age_group` (tranche définie en mois). C'est **plus** conforme
au principe II (la constitution prévaut) ; `CLAUDE.md` devra être mis à jour dans la même PR
(lot 2, story 2a, quand `FilterState` change). Aucune violation à justifier.

**Re-check post-design (après Phase 1)** : ✅ — data-model et contrats ne stockent aucun âge en
années, n'exposent aucun secret, et n'ajoutent aucune dépendance.

## Project Structure

### Documentation (this feature)

```text
specs/002-integration-design-figma/
├── spec.md              # Spécification (/speckit-specify)
├── maquette-figma.md    # Relevé de la maquette Figma Make (référence visuelle)
├── plan.md              # Ce fichier
├── research.md          # Phase 0 — décisions techniques
├── data-model.md        # Phase 1 — types et constantes de design
├── quickstart.md        # Phase 1 — scénarios de validation manuelle
├── contracts/
│   ├── routes.md        # Contrat des routes et paramètres d'URL
│   └── ui-components.md # Contrat des composants partagés (props)
└── tasks.md             # Phase 2 (/speckit-tasks — non créé ici)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                     # MODIFIÉ : polices Nunito + DM Sans, fond crème, plus de Navbar/BottomNav
├── globals.css                    # MODIFIÉ : variables CSS des jetons, styles de base
├── (public)/
│   ├── layout.tsx                 # NOUVEAU : en-tête KidMap + BottomNav (hors /admin)
│   ├── page.tsx                   # MODIFIÉ : redirige vers /carte (l'Accueil disparaît)
│   ├── carte/page.tsx             # MODIFIÉ (lot 2) : carte plein écran + puces + panneau bas
│   ├── liste/page.tsx             # MODIFIÉ : écran « Explorer » (activités + événements à venir)
│   ├── activite/[id]/page.tsx     # MODIFIÉ : fiche détail maquette
│   └── evenement/[id]/            # MODIFIÉ : fiche détail maquette (+ not-found restylé)
└── admin/                         # INCHANGÉ (garde Geist/gris via son propre layout)

components/
├── ui/                            # NOUVEAU contenu : Chip, CategoryBadge, StarRating, EmptyState, ShareButton
├── activity/
│   ├── ActivityCard.tsx           # MODIFIÉ : carte complète (variant "full")
│   ├── ActivityCardCompact.tsx    # NOUVEAU (lot 2) : carte compacte du panneau bas
│   ├── EventCard.tsx              # MODIFIÉ : même langage visuel
│   ├── ActivityList.tsx           # MODIFIÉ : états restylés
│   ├── ActivityMap.tsx            # MODIFIÉ (lot 2) : marqueurs catégorie, label sélection, recentrage
│   └── ActivityDetail.tsx         # NOUVEAU : corps commun des fiches activité/événement
├── filters/
│   ├── FilterBar.tsx              # MODIFIÉ : recherche + CategoryBar
│   ├── CategoryBar.tsx            # NOUVEAU : puces catégories défilantes
│   └── AgeGroupChips.tsx          # NOUVEAU (lot 2) : 7 tranches d'âge
└── layout/
    ├── Navbar.tsx                 # MODIFIÉ : en-tête KidMap Paris
    ├── BottomNav.tsx              # MODIFIÉ : 4 onglets (Favoris/Profil masqués jusqu'au lot 3)
    └── BottomSheet.tsx            # NOUVEAU (lot 2) : panneau bas repliable

lib/
├── types/
│   ├── activity.ts                # MODIFIÉ : FilterState.age_group, CATEGORY_STYLES
│   └── ui.ts                      # NOUVEAU : AgeGroup, TabItem
├── utils/
│   ├── format.ts                  # MODIFIÉ : ageGroupOf, matchesAgeGroup, directionsUrl
│   └── geo.ts                     # NOUVEAU (lot 2) : distanceKm (haversine), formatDistance
└── data/events.ts                 # NOUVEAU : getUpcomingEvents() extrait de l'ancien Accueil

hooks/
├── useActivities.ts               # MODIFIÉ : filtre par age_group
└── useGeolocation.ts              # NOUVEAU (lot 2) : position + état de permission

tailwind.config.ts                 # MODIFIÉ : couleurs, polices, rayons, ombres de la maquette
next.config.mjs                    # INCHANGÉ (images externes servies en unoptimized, comme aujourd'hui)
CLAUDE.md                          # MODIFIÉ : FilterState (age_group en mois)
```

**Structure Decision**: on reste dans l'arborescence décrite par `CLAUDE.md`. Seul ajout de
fichier « structurant » : `app/(public)/layout.tsx`, dans un dossier existant, pour que l'en-tête
et la BottomNav ne s'appliquent plus à `/admin` et que la Carte puisse occuper tout l'écran.
Les routes `/carte` et `/liste` sont conservées (onglets Carte et Explorer) pour ne pas casser les
liens existants ; seule `/` redirige.

## Découpage en lots et stories GitHub proposées

| Lot | Stories (une issue chacune) | Contenu | Dépend de |
|---|---|---|---|
| **1** | 1a Fondations visuelles | jetons Tailwind, polices, `CATEGORY_STYLES`, composants `ui/`, layout public | — |
| | 1b Navigation KidMap | en-tête, BottomNav 4 onglets (2 visibles), Navbar desktop | 1a |
| | 1c Cartes + Explorer | `ActivityCard`, `EventCard`, `CategoryBar`, `/liste` = Explorer avec événements à venir, `/` → `/carte`, états | 1a |
| | 1d Fiche détail | `ActivityDetail`, fiches activité et événement, itinéraire, partage, mini-carte statique | 1a |
| **2** | 2a Tranches d'âge | `AgeGroup`, `FilterState.age_group`, `AgeGroupChips` (aussi dans Explorer) | 1c |
| | 2b Carte plein écran | marqueurs catégorie, label sélection, recentrage `useGeolocation`, compteur, état vide | 2a |
| | 2c Panneau bas | `BottomSheet` replié (cartes compactes) / déplié (liste), distance | 2b |
| 3 *(esquisse)* | Favoris, Profil enfant | tables `favorites`, `child_profiles` + RLS, onglets visibles, présélection d'âge | 5 |
| 4 *(esquisse)* | Desktop ≥ 1024 px | barre latérale, Carte deux panneaux synchronisés, grilles, fiche deux colonnes | 2 |
| 5 *(esquisse, à discuter)* | Connexion parent | méthodes, invitation au bon moment, retour à l'écran d'origine | discussion |

## Esquisse des lots 3 à 5 (non détaillés)

- **Lot 3 — Favoris / Profil** : deux tables Supabase `favorites (user_id, item_type, item_id,
  created_at)` et `child_profiles (user_id, first_name, birth_date)` avec RLS « propriétaire
  uniquement » ; âge calculé depuis `birth_date` à l'affichage ; état global des favoris côté
  client → **Zustand / TanStack Query à installer avec accord** (règle « pas de lib sans
  demander »). Nécessite le client navigateur `lib/supabase/client.ts` (inexistant aujourd'hui).
- **Lot 4 — Desktop** : variantes `lg:` des écrans existants ; synchronisation survol/marqueur
  via un état partagé de la page Carte ; aucune nouvelle route.
- **Lot 5 — Connexion (à discuter)** : piste par défaut Supabase Auth (e-mail + Google) ;
  questions ouvertes : lien magique vs mot de passe, moment de la demande, page dédiée ou
  feuille modale, retour à l'écran d'origine (`?next=`).

## Complexity Tracking

Aucune violation de la constitution à justifier.
