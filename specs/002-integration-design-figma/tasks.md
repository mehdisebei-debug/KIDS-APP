---

description: "Tâches — Intégration du nouveau design KidMap Paris (lots 1 et 2 détaillés)"
---

# Tasks: Intégration du nouveau design « KidMap Paris »

**Input**: Design documents from `specs/002-integration-design-figma/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md),
référence visuelle [maquette-figma.md](./maquette-figma.md)

**Tests**: aucune tâche de test automatisé (pas de framework installé, non demandé par la spec).
La validation se fait par `npm run lint && npm run type-check && npm run build` et par les
scénarios numérotés de [quickstart.md](./quickstart.md).

**Organization**: une phase par user story de la spec, dans l'ordre des lots du plan
(FR-008). Correspondance avec les stories GitHub du plan :

| Phase | User story spec | Lot | Stories plan |
|---|---|---|---|
| 2 | — (fondations) | 1 | 1a |
| 3 | US1 Identité visuelle | 1 | 1a (composants), 1b |
| 4 | US3 Explorer + fiche | 1 | 1c, 1d |
| 5 | US2 Carte | 2 | 2a, 2b, 2c |
| 7 | US4, US5, US6, US7 | 3–5 | esquisse |

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, aucune dépendance sur une tâche non terminée)
- **[Story]** : user story de la spec (US1, US2, US3…)
- Conventions de code : commentaires en français, identifiants en anglais, `export default`,
  props typées par interface, `<Image>` (jamais `<img>`), `async/await`, pas de `any`, pas de
  `localStorage`, classes Tailwind mobile d'abord puis `md:`/`lg:`.

---

## Phase 1: Setup

**Purpose**: préparer la branche et la référence avant tout code

- [ ] T001 Créer les issues GitHub des stories 1a, 1b, 1c, 1d, 2a, 2b, 2c (label `type: user-story`, Project KIDS-APP Pipeline) en reprenant le tableau « Découpage en lots » de specs/002-integration-design-figma/plan.md — **sur accord humain**, via l'agent product-owner
- [ ] T002 Pour chaque story, créer la branche `feat/<num>-slug` depuis `main` à jour (une branche par story, pas de branche unique pour toute la fonctionnalité)
- [ ] T003 [P] Mesurer la référence « avant » : Lighthouse mobile (Performance, LCP, Accessibilité) sur `/`, `/liste`, `/carte` et une fiche, noter les valeurs dans specs/002-integration-design-figma/quickstart.md (section Contrôles transverses) pour SC-006

---

## Phase 2: Foundational — fondations visuelles (story 1a, lot 1)

**Purpose**: jetons, polices et types dont dépendent tous les écrans

**⚠️ CRITICAL**: aucune phase user story ne commence avant la fin de cette phase

- [ ] T004 Ajouter les jetons dans `theme.extend` de tailwind.config.ts, valeurs exactes de data-model.md §1 : couleurs `brand #FF5533`, `brand-soft #FF8566`, `brand-tint #FFF1ED`, `brand-ink #C8331A`, `accent #4A90E2`, `star #FFBA08`, `ink #1C1B22`, `ink-soft #4A4554`, `muted #757080`, `cream #FAFAF5`, `surface #F4F0EB`, `line #E8E2DA` ; `fontFamily.display: ['var(--font-display)', 'sans-serif']`, `fontFamily.body: ['var(--font-body)', 'sans-serif']` ; `borderRadius.card 20px`, `tile 14px`, `sheet 24px` ; `boxShadow.card 0 2px 10px rgba(0,0,0,.06)`, `raised 0 8px 24px rgba(0,0,0,.10)` ; supprimer les couleurs `background`/`foreground` inutilisées
- [ ] T005 Remplacer Geist par `next/font/google` dans app/layout.tsx : `Nunito({ subsets: ['latin'], weight: ['700','800'], variable: '--font-display', display: 'swap' })` et `DM_Sans({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-body', display: 'swap' })` ; `<body className="... bg-cream font-body text-ink antialiased">` ; retirer `<Navbar />`, `<BottomNav />` et le `<main>` du layout racine (déplacés en T008) ; mettre à jour `metadata.title` en « KidMap Paris — Sorties et activités pour les 0-6 ans en Île-de-France » ; commentaire expliquant que `next/font` auto-héberge les polices au build (spécificité Next.js)
- [ ] T006 Mettre à jour app/globals.css : retirer la référence `--font-geist-sans`, définir `body { font-family: var(--font-body) }` et `h1,h2,h3 { font-family: var(--font-display) }`, ajouter l'utilitaire `.scrollbar-none` (défilement horizontal sans barre) ; garder « thème clair uniquement »
- [ ] T007 Ajouter `CategoryStyle` et `CATEGORY_STYLES: Record<Category, CategoryStyle>` dans lib/types/activity.ts avec des classes Tailwind **écrites en entier** (pas de `bg-${x}`), valeurs data-model.md §2 : PARC solid `bg-[#2A9D5C]` bg `bg-[#E8F7EF]` text `text-[#1F7A47]` ; SPECTACLE `#BB2D6E` / `#FAEDF4` / `#BB2D6E` ; ATELIER `#D4621A` / `#FDF0E6` / `#B4501A` ; AIRE_JEUX `#1A7FC1` / `#E5F3FB` / `#146AA3` ; RESTAURANT `#9B5C1A` / `#FDF2E9` / `#9B5C1A` ; EVENEMENT `#6B4FBB` / `#F0ECF9` / `#6B4FBB` ; conserver `CATEGORY_LABELS` tel quel
- [ ] T008 Créer app/(public)/layout.tsx (Server Component) qui rend `<Navbar />`, `<main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 md:pb-10">{children}</main>`, `<BottomNav />` ; commentaire expliquant qu'un layout de groupe de routes `(public)` s'applique à toutes ses pages sans changer leurs URL et exclut ainsi `/admin` (spécificité Next.js)
- [ ] T009 Vérifier que app/admin/layout.tsx garde un rendu lisible sans le layout public (fond `bg-gray-50` déjà présent) ; aucun changement attendu sauf si la police par défaut casse la mise en page

**Checkpoint**: `npm run build` vert ; toutes les pages publiques ont le fond crème et les nouvelles polices ; `/admin/events` n'affiche plus l'en-tête public

---

## Phase 3: User Story 1 — Identité visuelle cohérente + navigation (Priority: P1) 🎯 MVP — lot 1 (1a, 1b)

**Goal**: composants de base au style de la maquette, en-tête KidMap Paris, BottomNav 4 onglets (2 visibles), Carte en écran d'entrée

**Independent Test**: quickstart scénarios 2, 3, 12 à 375 px — aucune trace d'indigo/Geist, onglets Carte et Explorer seuls visibles (le scénario 1, redirection `/` → `/carte`, se valide avec la PR 1c car T017 y est livré)

### Implementation for User Story 1

- [ ] T010 [P] [US1] Créer lib/types/ui.ts avec `type TabId = 'carte' | 'explorer' | 'favoris' | 'profil'` et `interface TabItem { id: TabId; href: string; label: string; emoji: string; enabled: boolean }`, plus la constante `TABS: TabItem[]` = Carte `/carte` 🗺️, Explorer `/liste` 🔍, Favoris `/favoris` ❤️ (`enabled: false`), Profil `/profil` 👤 (`enabled: false`)
- [ ] T011 [P] [US1] Créer components/ui/Chip.tsx selon contracts/ui-components.md : props `label`, `emoji?`, `active`, `onClick`, `tone?: Category` ; `rounded-full`, `min-h-11` (44 px), `aria-pressed={active}` ; inactif `bg-white text-ink-soft shadow-card`, actif `bg-brand-tint text-brand-ink` ou, si `tone`, `CATEGORY_STYLES[tone].bg` + `.text`
- [ ] T012 [P] [US1] Créer components/ui/CategoryBadge.tsx : props `category: Category`, `size?: 'sm' | 'md'` ; emoji + libellé court depuis `CATEGORY_LABELS`, couleurs `CATEGORY_STYLES[category].bg/.text`, `rounded-full font-display font-bold`
- [ ] T013 [P] [US1] Créer components/ui/StarRating.tsx : props `rating: number`, `count?: number` ; 5 étoiles `text-star` (pleines/vides arrondies au demi), note « 4,7 » en `text-ink`, `(count)` en `text-muted`, `aria-label` « Note 4,7 sur 5 »
- [ ] T014 [P] [US1] Créer components/ui/EmptyState.tsx (props `emoji`, `title`, `hint?`, `action?: { label: string; href: string }`, centré, couleurs `ink`/`muted`, jamais rouge) et components/ui/ErrorState.tsx (props `message`, `retryHref?`, fond `bg-surface`, texte humain, bouton « Réessayer » si `retryHref`)
- [ ] T015 [US1] Réécrire components/layout/Navbar.tsx : pastille logo `bg-brand` arrondie avec 🗺️, « KidMap Paris » en `font-display font-extrabold text-ink`, sous-titre « Île-de-France » `text-muted text-xs` ; liens desktop (`hidden md:flex`) générés depuis `TABS.filter(t => t.enabled)`, actif `bg-brand-tint text-brand-ink` ; fond `bg-cream/90 backdrop-blur`, plus de bordure grise ; pas de cloche ni d'avatar (masqués jusqu'au lot 3)
- [ ] T016 [US1] Réécrire components/layout/BottomNav.tsx depuis `TABS.filter(t => t.enabled)` : fond blanc arrondi en haut (`rounded-t-sheet shadow-raised`), chaque onglet `min-h-14` emoji + libellé `text-xs font-display`, actif = libellé `text-brand-ink` + pastille `bg-brand-tint` derrière l'emoji ; actif si `pathname.startsWith(tab.href)` ; propager la query string courante (`useSearchParams`) dans le `href` des onglets Carte ↔ Explorer (contracts/routes.md) dans une frontière `Suspense` ; `md:hidden`
- [ ] T017 [US1] *(livré avec la PR 1c, voir Notes)* Remplacer le contenu de app/(public)/page.tsx par une redirection serveur : `redirect('/carte' + query string)` depuis `next/navigation`, en lisant `searchParams` ; commentaire expliquant que `redirect()` dans un Server Component renvoie une redirection HTTP avant tout rendu (spécificité Next.js) ; supprimer les imports devenus inutiles (la récupération des événements est déplacée en T021)
- [ ] T018 [US1] Restyler l'état minimal de app/(public)/carte/page.tsx pour le lot 1 : titre `font-display` « Carte des activités », compteur `text-muted`, squelette de chargement `bg-surface` ; et dans components/activity/ActivityMap.tsx remplacer les couleurs indigo/amber/red par `brand`, `surface`, `ErrorState`/`EmptyState` (pas de refonte de la carte, prévue en Phase 5)
- [ ] T019 [US1] Passer en revue `grep -rn "indigo\|gray-\|emerald\|amber" app/\(public\) components` et remplacer chaque occurrence restante hors carte détaillée par les jetons (`ink`, `ink-soft`, `muted`, `line`, `surface`, `brand-*`) pour satisfaire SC-002

**Checkpoint**: US1 livrable seule — quickstart 2, 3, 12 OK ; lint/type-check/build verts

---

## Phase 4: User Story 3 — Explorer et fiche détail (Priority: P1) — lot 1 (1c, 1d)

**Goal**: cartes d'activité/événement au style maquette, Explorer (recherche, catégories, événements à venir), fiches activité et événement en page complète avec itinéraire et partage

**Independent Test**: quickstart scénarios 4 à 11 à 375 px

### Implementation — story 1c (cartes + Explorer)

- [ ] T020 [P] [US3] Créer components/filters/CategoryBar.tsx selon contracts/ui-components.md : props `value: Category | null`, `onChange` ; puce « Tous » puis une `Chip tone={category}` par catégorie de `CATEGORY_LABELS` ; conteneur `flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4` sans débordement de page ; toucher la catégorie active la désélectionne
- [ ] T021 [P] [US3] Créer lib/data/events.ts avec `export async function getUpcomingEvents(limit = 6): Promise<{ events: EventRow[]; error: string | null }>` en déplaçant tel quel le code de l'ancien app/(public)/page.tsx (client `createPublicServerClient`, filtre `date_end >= maintenant`, tri `date_start`, retour `{ events: [], error }` si config absente) ; commentaire « serveur uniquement »
- [ ] T022 [P] [US3] Réécrire components/activity/ActivityCard.tsx (carte complète) : props `activity` ; `rounded-card bg-white shadow-card overflow-hidden` ; zone image `h-40` : `<Image fill unoptimized>` si `activity.images[0]`, sinon placeholder `CATEGORY_STYLES[cat].bg` + grand emoji ; `CategoryBadge` en surimpression en haut à gauche ; nom `font-display font-extrabold text-ink line-clamp-2` ; ligne adresse `text-muted text-sm` (aucune distance, research R11) ; `StarRating` ; âge (`ageRangeLabel`) et prix (`priceLabel`) ; lien vers `/activite/${id}`
- [ ] T023 [P] [US3] Réécrire components/activity/EventCard.tsx dans le même langage que T022 : date + ville en tête `text-brand-ink text-xs font-bold uppercase`, image `<Image fill unoptimized>` ou placeholder `CATEGORY_STYLES.EVENEMENT`, badge Événements, pas d'étoiles, âge + prix ; lien `/evenement/${id}`
- [ ] T024 [US3] Mettre à jour components/activity/ActivityList.tsx : props `activities`, `loading`, `error`, `emptyHint?` ; loading = 3 squelettes `rounded-card bg-surface animate-pulse` ; error = `ErrorState` ; empty = `EmptyState` emoji 🔍, titre « Aucun résultat », hint « Essayez un autre mot-clé » ; grille `grid gap-3 md:grid-cols-2 lg:grid-cols-3`
- [ ] T025 [US3] Réécrire components/filters/FilterBar.tsx : champ recherche `rounded-full bg-white shadow-card min-h-11` avec 🔍, placeholder « Rechercher une activité, un lieu… » ; `CategoryBar` ; conserver le filtre d'âge actuel (sélecteurs) restylé et la case « Gratuit uniquement » en `Chip` — les tranches d'âge arrivent en Phase 5
- [ ] T026 [US3] Transformer app/(public)/liste/page.tsx en Server Component « Explorer » : `export const dynamic = 'force-dynamic'`, appelle `getUpcomingEvents()` (T021) et rend `<ExplorerContent events={…} eventsError={…} />` dans `Suspense` ; créer app/(public)/liste/ExplorerContent.tsx (`'use client'`) qui reprend l'ancienne logique (filtres initialisés depuis `?categorie=`, `useActivities`) et ajoute la synchronisation URL via `router.replace` (`categorie`, `q`, `gratuit`) ; titre « Explorer » `font-display`, compteur `text-muted` ; section « Événements à venir » (grille d'`EventCard`, états error/empty stylés) affichée quand aucune catégorie n'est choisie ou quand `categorie=EVENEMENT`, et filtrée par `q` (insensible à la casse) sur `title`, `description`, `venue_name` et `city` — état vide de la section si aucun événement ne correspond (research R14) ; commentaire sur le passage de données serveur → client en props (spécificité Next.js)
- [ ] T056 [US3] Dans hooks/useActivities.ts, étendre la recherche par mot-clé à `activity.address` (en plus de `name`, `description`, `tags`), insensible à la casse ; commentaire renvoyant à research R14 (FR-006)

### Implementation — story 1d (fiche détail)

- [ ] T027 [P] [US3] Ajouter dans lib/utils/format.ts `export function directionsUrl(location: { lat?: number | null; lng?: number | null; address?: string | null }): string | null` → `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` si coordonnées valides, sinon `destination=<adresse encodée>`, sinon `null` ; et `export function staticMapUrl(lat: number, lng: number, token: string): string` (Mapbox Static Images, style `light-v11`, marqueur corail `ff5533`, 600×300 @2x)
- [ ] T028 [P] [US3] Créer components/ui/ShareButton.tsx (`'use client'`) : props `url`, `title` ; `navigator.share` si disponible, sinon `navigator.clipboard.writeText` puis libellé « Lien copié » 2 s ; `try/catch` silencieux si l'utilisateur annule ; `Chip`-like `min-h-11`
- [ ] T029 [US3] Créer components/activity/ActivityDetail.tsx (Server Component) selon contracts/ui-components.md : props `kind`, `title`, `category`, `imageUrl?`, `rating?: { value: number; count: number }`, `description?`, `infos: { label: string; value: string; emoji: string }[]`, `location?: { lat: number; lng: number; address: string }`, `address?`, `website?`, `backHref`, `shareUrl` ; héros `h-56 rounded-b-sheet` image ou placeholder catégorie ; bouton retour rond en surimpression ; `CategoryBadge`, titre `text-2xl font-display font-extrabold`, `StarRating` si `rating` ; `description` si présente ; grille d'infos `rounded-tile bg-white shadow-card` (n'affiche que les valeurs non vides) ; bloc « Localisation » avec `<Image unoptimized src={staticMapUrl(...)}>` seulement si `location` et `process.env.NEXT_PUBLIC_MAPBOX_TOKEN` ; boutons « 🗺️ Voir l'itinéraire » (`bg-brand text-white font-display font-extrabold text-lg rounded-full`, `target="_blank" rel="noopener noreferrer"`, masqué si `directionsUrl` null), « Site web » si `website`, `ShareButton` ; lien « Retour aux activités » vers `backHref`
- [ ] T030 [US3] Réécrire app/(public)/activite/[id]/page.tsx pour rendre `ActivityDetail` : `infos` = Âge (`ageRangeLabel`), Tarif (`priceLabel`), Horaires (entrées de `opening_hours` jointes, omis si vide), Adresse ; `rating` = `avg_rating`/`reviews_count` ; `imageUrl = images[0]` ; `location` si coordonnées valides ; `backHref="/liste"` ; `notFound()` inchangé ; tags affichés en `Chip` non interactives sous la description
- [ ] T031 [US3] Réécrire app/(public)/evenement/[id]/page.tsx pour rendre `ActivityDetail` (`kind="event"`, catégorie `EVENEMENT`, pas de `rating`) : infos = Date (`eventDateRangeLabel`), Âge, Tarif, Lieu (`eventVenueLabel`, omis si vide) ; `location` si `lat`/`lng` non nuls ; état d'erreur Supabase → `ErrorState` avec lien retour `/liste` ; `backHref="/liste"`
- [ ] T032 [P] [US3] Restyler app/(public)/evenement/[id]/not-found.tsx avec `EmptyState` (🎪, « Événement introuvable », action « Voir les activités » → `/liste`)

**Checkpoint**: lot 1 complet — quickstart 1 à 12 OK à 375/768/1280 px ; lint/type-check/build verts ; validation visuelle du porteur (SC-001)

---

## Phase 5: User Story 2 — Trouver une sortie depuis la carte (Priority: P1) — lot 2 (2a, 2b, 2c)

**Goal**: tranches d'âge en mois, carte plein écran aux marqueurs colorés, recentrage, panneau bas repliable

**Independent Test**: quickstart scénarios 13 à 23 à 375 px

### Implementation — story 2a (tranches d'âge)

- [ ] T033 [US2] Ajouter dans lib/types/ui.ts `type AgeGroupId = '0-6m' | '6-12m' | '1-2a' | '2-3a' | '3-4a' | '4-5a' | '5-6a'`, `interface AgeGroup { id: AgeGroupId; label: string; emoji: string; min_months: number /* incluse */; max_months: number /* exclue */ }` et `AGE_GROUPS` avec les valeurs exactes de data-model.md §3 : 0–6 mois 🍼 [0,6) · 6m–1 an 🧸 [6,12) · 1–2 ans 🚶 [12,24) · 2–3 ans 🎠 [24,36) · 3–4 ans 🎨 [36,48) · 4–5 ans 🚲 [48,60) · 5–6 ans ⚽ [60,72)
- [ ] T034 [US2] Dans lib/types/activity.ts remplacer `age_min`/`age_max` (années) de `FilterState` par `age_group: AgeGroupId | null` (commentaire « tranche définie en mois, null = tous âges ») et **supprimer `distance_km`** (filtre de rayon jamais utilisé, aucune distance dans l'app) ; dans lib/utils/format.ts ajouter `export function matchesAgeGroup(ageMinMonths: number, ageMaxMonths: number, group: AgeGroup): boolean` = `ageMinMonths < group.max_months && ageMaxMonths >= group.min_months`, et `parseAgeGroupId(value: string | null): AgeGroupId | null` ; supprimer `yearsToMonths` s'il n'est plus utilisé
- [ ] T035 [US2] Mettre à jour hooks/useActivities.ts pour filtrer avec `matchesAgeGroup` quand `filters.age_group` est non nul (plus aucune conversion années→mois) ; adapter les valeurs `DEFAULT_FILTERS` de app/(public)/liste/ExplorerContent.tsx et app/(public)/carte/page.tsx (`age_group: null`, retirer `distance_km: 20`)
- [ ] T036 [P] [US2] Créer components/filters/AgeGroupChips.tsx : props `value: AgeGroupId | null`, `onChange` ; une `Chip` par `AGE_GROUPS` (emoji + label), défilement horizontal `scrollbar-none` ; toucher la tranche active → `onChange(null)`
- [ ] T037 [US2] Dans components/filters/FilterBar.tsx remplacer les sélecteurs d'âge en années par `AgeGroupChips` ; dans app/(public)/liste/ExplorerContent.tsx lire/écrire `?age=` via `parseAgeGroupId` et `router.replace`
- [ ] T038 [US2] Mettre à jour CLAUDE.md (section « Types principaux » : `FilterState.age_group` en mois et suppression de `distance_km` ; section « Règles importantes » : préciser que les tranches d'âge UI sont définies en mois) — écart documenté dans plan.md « Note principe II »

### Implementation — story 2b (carte plein écran)

- [ ] T040 [P] [US2] Créer hooks/useGeolocation.ts selon contracts/ui-components.md : retourne `{ position, status: 'idle' | 'pending' | 'granted' | 'denied' | 'unavailable', request }` ; `navigator.geolocation.getCurrentPosition` appelé **uniquement** dans `request()` ; aucune persistance
- [ ] T041 [US2] Refondre components/activity/ActivityMap.tsx selon contracts/ui-components.md : props `activities`, `loading`, `error`, `selectedId`, `onSelect`, `userPosition?` ; style `mapbox://styles/mapbox/light-v11` ; hauteur 100 % du parent (plus de `h-[70vh]` ni `rounded-3xl`) ; marqueur = `button` 40 px rond `CATEGORY_STYLES[cat].solid` bordure blanche + emoji, zone tactile 44 px, `aria-label` nom + catégorie ; marqueur sélectionné agrandi (`scale-125`, `z-10`) avec étiquette du nom `bg-ink text-white rounded-full text-xs font-display` au-dessus ; supprimer la `Popup` ; point bleu `accent` pour `userPosition` ; clic carte vide → `onSelect(null)` ; garder les états token absent / erreur / chargement avec `ErrorState` et lien vers `/liste`
- [ ] T042 [US2] Ajouter dans components/activity/ActivityMap.tsx un bouton flottant « me localiser » (rond 48 px, `bg-white shadow-raised`, icône 📍 `text-accent`) qui appelle une prop `onLocate` et, quand `userPosition` change, `mapRef.current?.flyTo({ center, zoom: 13 })` ; si `status === 'denied'`, afficher une bulle « Activez la localisation dans les réglages de votre navigateur » et ne pas déplacer la carte
- [ ] T043 [US2] Réécrire app/(public)/carte/page.tsx en écran plein : conteneur `relative -mx-4 -mt-4 h-[calc(100dvh-<en-tête>-<BottomNav>)] md:h-[calc(100dvh-<en-tête>)]` ; en surimpression haute `AgeGroupChips` puis `CategoryBar` ; état `selectedId` ; filtres initialisés depuis `?age=` et `?categorie=` et synchronisés par `router.replace` ; `useGeolocation` branché sur `onLocate`/`userPosition` ; compteur « N activités · <tranche> » (ou « · tous âges ») ; état vide superposé `EmptyState` « Aucune activité trouvée — Essayez un autre âge ou une autre catégorie » ; `ActivityMap` toujours importée via `dynamic(() => import(...), { ssr: false })` ; `useSearchParams` dans une frontière `Suspense`

### Implementation — story 2c (panneau bas)

- [ ] T044 [P] [US2] Créer components/activity/ActivityCardCompact.tsx : props `activity`, `selected?` ; largeur `w-60 shrink-0 snap-start`, image `h-28` ou placeholder catégorie, `CategoryBadge`, nom `line-clamp-1 font-display`, adresse, `StarRating` ; `ring-2` couleur catégorie si `selected` ; lien vers la fiche
- [ ] T045 [P] [US2] Créer components/layout/BottomSheet.tsx (`'use client'`) selon contracts/ui-components.md : props `expanded`, `onExpandedChange`, `header`, `children` ; replié ≈ 220 px, déplié ≈ 65 dvh, transition CSS `transform` 300 ms ; poignée `button` `aria-expanded` `aria-label` « Afficher la liste / la carte » ; glissé vertical via pointer events, seuil 40 px ; `rounded-t-sheet bg-cream shadow-raised` ; positionné au-dessus de la BottomNav sans la recouvrir
- [ ] T046 [US2] Intégrer dans app/(public)/carte/page.tsx : `BottomSheet` avec en en-tête le compteur ; replié = rangée `flex gap-3 overflow-x-auto snap-x scrollbar-none` d'`ActivityCardCompact` ; déplié = `ActivityList` ; sélection d'un marqueur → déplie pas, mais fait défiler la rangée jusqu'à la carte compacte (`scrollIntoView({ inline: 'center', behavior: 'smooth' })`) et la marque `selected`

**Checkpoint**: lot 2 complet — quickstart 13 à 23 OK ; lint/type-check/build verts

---

## Phase 6: Polish & Cross-Cutting Concerns (lots 1–2)

- [ ] T048 Contrôle 375 / 768 / 1280 px sur toutes les routes publiques : `document.documentElement.scrollWidth === innerWidth` (SC-003), zones tactiles ≥ 44 px (FR-010)
- [ ] T049 Lighthouse mobile sur `/carte`, `/liste`, une fiche : Accessibilité ≥ 95, comparaison Performance/LCP à la référence T003 (≤ +10 %, SC-006) ; consigner les résultats dans la PR
- [ ] T050 [P] Vérifier qu'aucun `<img>`, `any`, `.then(`, `localStorage` n'a été introduit : `grep -rnE "<img|: any|\.then\(|localStorage" app components hooks lib`
- [ ] T051 [P] Supprimer le code mort : imports `ActivityCard`/`EventCard`/`MOCK_ACTIVITIES` de l'ancien accueil, `yearsToMonths` si inutilisé, polices `app/fonts/Geist*.woff` si plus aucune référence (vérifier `/admin`)
- [ ] T052 Dérouler l'intégralité de specs/002-integration-design-figma/quickstart.md et faire valider visuellement chaque écran par le porteur face au Figma Make (SC-001)

---

## Phase 7: Esquisse — lots 3 à 5 (non détaillés, à replanifier)

> Ces tâches sont des jalons, pas des tâches exécutables. Chaque lot fera l'objet d'un
> `/speckit-plan` puis `/speckit-tasks` dédiés avant développement.

- [ ] T053 [US6] Lot 5 — **discussion connexion** avec le porteur (méthodes, moment de la demande, retour `?next=`), puis mettre à jour US6/US7 et FR-018 dans specs/002-integration-design-figma/spec.md — prérequis du lot 3
- [ ] T054 [US4] Lot 3 — planifier Favoris et Profil enfant : tables `favorites` et `child_profiles` + RLS propriétaire (data-model.md §7), client `lib/supabase/client.ts`, décision d'installation Zustand / TanStack Query **sur accord humain**, onglets `enabled: true` dans lib/types/ui.ts
- [ ] T055 [US5] Lot 4 — planifier la version desktop ≥ 1024 px : barre latérale, Carte deux panneaux synchronisés, grilles Explorer, fiche deux colonnes (variantes `lg:` des écrans de app/(public)/) — peut passer avant le lot 3

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** : aucune dépendance ; T001 nécessite un accord humain
- **Phase 2 (Fondations)** : après Setup — **bloque** toutes les phases suivantes
- **Phase 3 (US1)** : après Phase 2
- **Phase 4 (US3)** : après Phase 2 ; utilise les composants `ui/` de Phase 3 (T011–T014) → démarrer après T014
- **Phase 5 (US2)** : après Phases 3 et 4 (réutilise `CategoryBar`, `ActivityCard`, `ActivityList`, `ExplorerContent`)
- **Phase 6 (Polish)** : à la fin de chaque lot (T048–T052 rejoués après le lot 1 puis après le lot 2)
- **Phase 7** : hors de ce cycle ; T053 avant T054

### Dépendances internes notables

- T005 → T008 (le layout public remplace ce qui est retiré du layout racine)
- T010 → T015, T016 ; T011 → T020, T036 ; T012/T013 → T022, T023, T029, T044
- T021 → T026 ; T017 doit être livré avec T026 (les événements ne doivent pas disparaître)
- T027, T028 → T029 → T030, T031
- T033 → T034 → T035 → T036/T037 ; T040 → T041 → T042 → T043 → T046

### Parallel Opportunities

- Phase 2 : T004 ∥ T007 (fichiers différents), puis T005 → T006/T008
- Phase 3 : T010, T011, T012, T013, T014 en parallèle
- Phase 4 : T020, T021, T022, T023, T027, T028, T032 en parallèle
- Phase 5 : T036, T040, T044, T045 en parallèle une fois T033–T035 faits

### Exemple parallèle — User Story 3

```text
Ensemble : T020 CategoryBar · T021 lib/data/events.ts · T022 ActivityCard · T023 EventCard
           T027 directionsUrl/staticMapUrl · T028 ShareButton · T032 not-found
Puis     : T024 → T025 → T026 (Explorer), T056 en parallèle (recherche) ; T029 → T030, T031 (fiches)
```

---

## Implementation Strategy

### MVP (lot 1 minimal)

1. Phase 1 puis Phase 2 (fondations)
2. Phase 3 (US1, sauf T017) → **stop & valider** quickstart 2, 3, 12 → PRs 1a, 1b
3. Phase 4 (US3) → valider quickstart 4–11 → PRs 1c, 1d

### Livraison incrémentale (une PR par story GitHub)

| PR | Tâches | Validation |
|---|---|---|
| 1a Fondations | T004–T009, T010–T014 | build vert, fond crème, admin intact |
| 1b Navigation | T015, T016, T018, T019 | quickstart 2, 3, 12 |
| 1c Cartes + Explorer | T017, T020–T026, T056 | quickstart 1, 4–7 |
| 1d Fiche détail | T027–T032 | quickstart 8–11 |
| 2a Tranches d'âge | T033–T038 | quickstart 14–16, 22 |
| 2b Carte plein écran | T040–T043 | quickstart 13, 17, 19–21, 23 |
| 2c Panneau bas | T044–T046 | quickstart 18 |

Chaque PR : `Closes #<num>`, lint/type-check/build verts, review, `QA: GO`, merge squash sur
ordre humain (contrat `CLAUDE.md`).

---

## Notes

- T039 (`lib/utils/geo.ts`) et T047 (calcul de distance) sont **supprimées** : aucune distance
  n'est affichée (décision du porteur, clarification spec 2026-11-01). Les numéros ne sont pas
  réattribués.
- Aucune nouvelle dépendance npm dans les lots 1–2 (polices via `next/font`, intégré à Next).
- La mise à jour de `CLAUDE.md` (`FilterState.age_group`) est faite en T038 (lot 2, story 2a),
  au moment où `FilterState` change.
- T017 (suppression de l'Accueil) est rattaché à la PR 1c : livré avant T026, il rendrait les
  événements à venir inaccessibles (FR-014).
