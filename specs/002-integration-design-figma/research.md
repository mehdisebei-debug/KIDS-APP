# Research — Intégration du design KidMap Paris

**Date** : 2026-11-01 · **Portée** : décisions techniques des lots 1 et 2.
Aucun « NEEDS CLARIFICATION » ne restait dans le contexte technique ; chaque point ci-dessous
tranche une question d'implémentation.

## R1. Où vivent les jetons de design

- **Decision** : couleurs, polices, rayons et ombres déclarés dans `tailwind.config.ts`
  (`theme.extend`), avec des noms sémantiques (`brand`, `ink`, `muted`, `cream`, `surface`,
  `line`, `accent`, `star`). Les couleurs de catégorie vivent dans `CATEGORY_STYLES`
  (`lib/types/activity.ts`) sous forme de classes Tailwind complètes.
- **Rationale** : une seule source (FR-001) ; les classes restent mobile-first et lisibles ; les
  classes complètes (pas de concaténation `bg-${x}`) sont détectées par le purge Tailwind.
- **Alternatives** : variables CSS seules (perd l'autocomplétion Tailwind) ; un fichier
  `tokens.ts` importé par la config (indirection inutile à cette taille).

## R2. Polices Nunito + DM Sans

- **Decision** : `next/font/google` dans `app/layout.tsx`, variables `--font-display` (Nunito
  700/800) et `--font-body` (DM Sans 400/500/700), `display: 'swap'`, sous-ensemble `latin`.
  `app/admin` garde l'apparence actuelle via son layout.
- **Rationale** : intégré à Next (pas de dépendance npm), polices auto-hébergées au build →
  aucun appel à Google côté visiteur (vie privée) et pas de décalage de mise en page.
- **Alternatives** : `<link>` Google Fonts (requête tierce, plus lent) ; fichiers locaux
  `next/font/local` (maintenance manuelle).

## R3. Contraste AA (FR-013)

Mesures sur les couleurs de la maquette (ratio WCAG, seuil 4,5 pour le petit texte, 3 pour le
texte ≥ 18,7 px gras et les éléments non textuels) :

| Couleur | Sur | Ratio | Usage autorisé |
|---|---|---|---|
| Corail `#FF5533` | crème | 3,0 | fonds de bouton avec texte blanc **gras ≥ 18,7 px**, icônes, onglet actif (icône) |
| Blanc | corail `#FF5533` | 3,2 | idem (grand texte seulement) |
| Gris `#8A8090` | crème | 3,6 | ❌ petit texte → remplacé |
| Parc `#2A9D5C` / `#E8F7EF` | — | 3,1 | ❌ petit texte → assombri |
| Atelier `#D4621A` / `#FDF0E6` | — | 3,4 | ❌ → assombri |
| Bleu `#1A7FC1` / `#E5F3FB` | — | 3,8 | ❌ → assombri |
| Violet `#6B4FBB`, Spectacle `#BB2D6E`, Brun `#9B5C1A` | leur fond | 4,8–5,2 | ✅ |

- **Decision** : ajouter des variantes « texte » conformes, utilisées pour tout texte < 18,7 px :
  `brand-ink #C8331A` (5,1 sur crème, 5,3 en texte blanc sur ce fond), `muted #757080` (4,6 sur
  crème), parc `#1F7A47` (4,8), atelier `#B4501A` (4,6), bleu `#146AA3` (5,1). Les couleurs d'origine restent pour surfaces, icônes,
  marqueurs et grands textes. Chaque écart est consigné dans `data-model.md`.
- **Rationale** : la spec fait primer l'accessibilité sur la fidélité au pixel (edge case) ;
  l'écart visuel est minime.
- **Alternatives** : garder les couleurs telles quelles (échec FR-013) ; tout assombrir (perd la
  chaleur de la maquette).

## R4. Couleurs des 6 catégories de l'app

- **Decision** (couleur maquette réattribuée, l'icône reste celle de `CATEGORY_LABELS`) :

  | Catégorie app | Repris de | Couleur | Fond |
  |---|---|---|---|
  | PARC | Parcs | `#2A9D5C` | `#E8F7EF` |
  | SPECTACLE | Spectacles | `#BB2D6E` | `#FAEDF4` |
  | ATELIER | Ateliers | `#D4621A` | `#FDF0E6` |
  | AIRE_JEUX | Piscines (bleu) | `#1A7FC1` | `#E5F3FB` |
  | RESTAURANT | Biblio (brun) | `#9B5C1A` | `#FDF2E9` |
  | EVENEMENT | Musées (violet) | `#6B4FBB` | `#F0ECF9` |

- **Rationale** : 6 teintes déjà harmonisées par la maquette, aucune nouvelle couleur à inventer
  (FR-002). Le corail reste réservé à la marque, aucune catégorie ne le porte.
- **Alternatives** : créer de nouvelles teintes pour Aires de jeux / Restaurants (hors maquette).

## R5. Navigation et Accueil supprimé (FR-004)

- **Decision** : `app/(public)/page.tsx` devient un `redirect('/carte')` (Server Component,
  `next/navigation`). Les routes `/carte` (onglet Carte) et `/liste` (onglet Explorer) sont
  conservées. Les liens internes `?categorie=` restent valides.
- **Rationale** : ne casse aucun lien existant, ne modifie pas l'arborescence de `CLAUDE.md`.
  *Spécificité Next.js* : `redirect()` dans un Server Component renvoie une redirection HTTP
  avant tout rendu, sans `useEffect`.
- **Alternatives** : servir la carte directement sur `/` (déplacement de dossier, double URL) ;
  redirection dans `next.config.mjs` (moins lisible pour un débutant Next).

## R6. Où vont les « Événements à venir » de l'ancien Accueil (FR-014)

- **Decision** : `getUpcomingEvents()` est extrait dans `lib/data/events.ts`. La page `/liste`
  devient un Server Component qui récupère les événements et les passe à un composant client
  `ExplorerContent` (filtres + liste d'activités). Les événements s'affichent en section
  « Événements à venir » en tête d'Explorer quand le filtre catégorie est « Tous » (aucune
  catégorie) ou `EVENEMENT`, et sont masqués pour toute autre catégorie (clarification spec
  2026-11-01, FR-006). La Carte n'affiche pas d'événements.
- **Rationale** : aucune donnée ne disparaît avec l'Accueil ; même mécanisme serveur qu'aujourd'hui
  (états error/empty déjà gérés). *Spécificité Next.js* : un Server Component peut charger des
  données puis rendre un Client Component avec ces données en props.
- **Alternatives** : charger les événements côté client (nécessite `lib/supabase/client.ts`,
  hors périmètre lot 1) ; les afficher sur la Carte (pas de coordonnées fiables pour tous).

## R7. État des filtres sans Zustand

- **Decision** : pour les lots 1–2, l'état des filtres est local à chaque page (`useState`),
  initialisé depuis l'URL (`?categorie=`, `?age=`), et l'URL est mise à jour avec
  `router.replace` à chaque changement.
- **Rationale** : Zustand et TanStack Query ne sont **pas installés** et la règle interdit
  d'ajouter une librairie sans accord ; l'URL donne en plus des liens partageables et conserve
  les filtres quand on passe de Carte à Explorer (les onglets propagent la query string).
- **Alternatives** : installer Zustand maintenant (à demander ; utile surtout au lot 3) ;
  `localStorage` (interdit).

## R8. Tranches d'âge en mois (FR-011)

- **Decision** : constante `AGE_GROUPS` (7 tranches, bornes en mois `[min, max)`), filtre
  `FilterState.age_group: AgeGroupId | null`. Une activité correspond si son intervalle
  `[age_min, age_max]` chevauche la tranche : `age_min < group.max_months && age_max >=
  group.min_months`. `null` = tous âges.
- **Rationale** : seule représentation exacte de « 0–6 mois » ; aucune conversion années↔mois
  (principe II). Remplace `age_min`/`age_max` en années (écart `CLAUDE.md` documenté dans
  plan.md).
- **Alternatives** : garder les années (impossible pour 0–6 mois) ; curseur continu (prévu pour
  le Profil au lot 3, pas pour la Carte).

## R9. Carte plein écran et marqueurs (lot 2)

- **Decision** : garder react-map-gl/Mapbox (déjà en place, import `dynamic`), style
  `mapbox://styles/mapbox/light-v11` pour un fond neutre où les marqueurs colorés ressortent.
  Marqueur = pastille ronde 40 px (zone tactile 44 px) couleur catégorie + icône ; marqueur
  sélectionné agrandi avec étiquette du nom (remplace la Popup). Bouton « me localiser » →
  `useGeolocation` + `map.flyTo`. La page Carte utilise toute la hauteur entre en-tête et
  BottomNav (`h-[calc(100dvh-…)]`).
- **Rationale** : reprend le style de la maquette sans reproduire son illustration SVG
  (hypothèse de la spec) ; `dvh` gère la barre d'adresse mobile.
- **Alternatives** : style Mapbox personnalisé via Studio (dépend d'un compte, à envisager plus
  tard) ; clustering (inutile avec le volume actuel, à revoir si > 200 marqueurs).

## R10. Panneau bas repliable (lot 2)

- **Decision** : composant `BottomSheet` maison, deux états (replié ≈ 220 px avec cartes
  compactes en défilement horizontal `snap-x`, déplié ≈ 65 dvh avec liste verticale), bascule
  au toucher de la poignée et au glissé vertical (pointer events, seuil 40 px), transition CSS
  `transform`. Accessible : la poignée est un `button` avec `aria-expanded`.
- **Rationale** : deux états suffisent (maquette), pas de librairie, animation fluide sur mobile.
- **Alternatives** : librairie de bottom sheet (dépendance) ; trois crans (non demandé).

## R11. Géolocalisation (sans distance)

- **Decision** : `useGeolocation` demande la position uniquement au toucher du bouton
  « me localiser » (jamais au chargement) et ne sert **qu'au recentrage** de la Carte. Aucune
  distance n'est calculée ni affichée, nulle part (décision du porteur, clarification spec
  2026-11-01) : pas de `lib/utils/geo.ts`.
- **Rationale** : pas de demande de permission intrusive ; moins de code et de cas limites
  (position inconnue, fiche rendue côté serveur).
- **Alternatives** : géolocalisation par IP (imprécis, tiers) ; RPC `get_nearby_activities`
  (activités encore en mock, reporté au branchement Supabase).

## R12. Fiche détail : itinéraire, partage, localisation

- **Decision** :
  - « Voir l'itinéraire » = lien `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`
    (ou l'adresse encodée si pas de coordonnées), ouvert dans un nouvel onglet ; iOS/Android
    proposent l'app de cartographie.
  - Partage : `ShareButton` client, `navigator.share` si disponible, sinon copie du lien dans le
    presse-papiers avec confirmation « Lien copié ».
  - Bloc « Localisation » : image Mapbox Static Images (token public déjà exposé) via `<Image
    unoptimized>`, masquée si pas de coordonnées ou pas de token.
  - Note étoilée masquée pour les événements (pas de note en base) ; photo absente → visuel de
    remplacement couleur de catégorie + icône.
- **Rationale** : aucun SDK supplémentaire, fonctionne sans JavaScript lourd sur une page serveur.
- **Alternatives** : mini-carte interactive (charge Mapbox sur chaque fiche, plus lent) ;
  lien `maps.apple.com` (spécifique iOS).

## R13. Validation

- **Decision** : pas de framework de test ajouté. Validation par `lint` + `type-check` + `build`
  et par les scénarios de [quickstart.md](./quickstart.md) à 375 / 768 / 1280 px, plus un
  contrôle de contraste dans les DevTools (Lighthouse Accessibilité ≥ 95 sur Carte, Explorer,
  fiche) et un Lighthouse Performance mobile avant/après pour SC-006.
- **Rationale** : cohérent avec la « limite connue » de la constitution.

## R14. Recherche par mot-clé (FR-006)

- **Decision** : recherche insensible à la casse, par sous-chaîne, sur `name`, `description`,
  `address` et `tags` des activités (ajout de `address`, absent de `useActivities` aujourd'hui),
  et sur `title`, `description`, `venue_name` et `city` des événements. Le même `q` filtre la
  liste d'activités **et** la section « Événements à venir » ; le filtrage des événements se fait
  côté client dans `ExplorerContent`, sur les événements déjà chargés par `getUpcomingEvents()`.
- **Rationale** : un parent cherche surtout un lieu ou un thème (clarification spec 2026-11-01) ;
  le volume actuel ne justifie pas `pg_trgm`. *Limite* : seuls les événements chargés (limite de
  `getUpcomingEvents`) sont cherchés.
- **Alternatives** : recherche serveur `pg_trgm` (prévue dans la stack, à réserver à un volume
  plus important) ; nom seul (rejeté en clarification).
