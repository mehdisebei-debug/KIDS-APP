# Quickstart — Valider le design KidMap Paris (lots 1–2)

Guide de validation manuelle (pas de tests automatisés dans le projet). Référence visuelle :
[maquette-figma.md](./maquette-figma.md) et le Figma Make « App-kids ».

## Prérequis

- `.env.local` renseigné (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_MAPBOX_TOKEN`) — jamais commité.
- Chrome avec DevTools (mode appareil) ; idéalement un vrai téléphone sur le même réseau.

## Portes automatiques (avant toute PR)

```bash
npm run lint
```

```bash
npm run type-check
```

```bash
npm run build
```

Attendu : les trois commandes vertes.

## Lancer

```bash
npm run dev
```

Ouvrir http://localhost:3000 en mode appareil 375 × 812.

## Scénarios — Lot 1

| # | Action | Attendu | Réf. |
|---|---|---|---|
| 1 | Ouvrir `/` | redirection immédiate vers `/carte` | FR-004 |
| 2 | Parcourir `/carte`, `/liste`, une fiche activité, une fiche événement | fond crème, titres Nunito, texte DM Sans, aucune trace d'indigo ni de Geist | SC-002 |
| 3 | Regarder la BottomNav | 2 onglets visibles (Carte, Explorer), l'actif en corail ; Favoris/Profil absents | FR-004, FR-008 |
| 4 | Dans Explorer, toucher « Parcs » puis « Aires de jeux » | badges et puces aux couleurs de `data-model.md` §2, identiques sur cartes et fiche | US1-2 |
| 5 | Ouvrir `/liste?categorie=PARC` (ancien lien) | Explorer filtré sur Parcs | contracts/routes |
| 6 | Explorer : section « Événements à venir » | événements Supabase présents ; config Supabase retirée → message d'erreur stylé, page utilisable | FR-014, III |
| 7 | Rechercher « zzzz » | « Aucun résultat — Essayez un autre mot-clé » | FR-009 |
| 8 | Ouvrir une fiche activité | photo ou placeholder catégorie, note, description, infos, Localisation, « Voir l'itinéraire », partager, retour | FR-007 |
| 9 | « Voir l'itinéraire » | Google Maps (ou app native) avec la destination | US3-2 |
| 10 | « Partager » sur mobile puis desktop | feuille de partage native ; sinon « Lien copié » ; le lien rouvre la fiche | US3-3 |
| 11 | Fiche événement sans image ni horaires | placeholder, pas de bloc vide, pas d'étoiles | US3-4 |
| 12 | `/admin/events` | apparence d'avant, sans en-tête KidMap | hors périmètre |

## Scénarios — Lot 2

| # | Action | Attendu | Réf. |
|---|---|---|---|
| 13 | Ouvrir `/carte` | carte plein écran entre en-tête et BottomNav, puces d'âge en haut, catégories, panneau bas replié avec cartes compactes | FR-005 |
| 14 | Toucher « 1–2 ans » | seules les activités chevauchant 12–24 mois ; compteur « N activités · 1–2 ans » ; URL `?age=1-2a` | US2-1 |
| 15 | Retoucher « 1–2 ans » | tous âges | contracts |
| 16 | Activité 0–72 mois | visible dans toutes les tranches | edge case |
| 17 | Toucher un marqueur | marqueur agrandi + nom, carte compacte correspondante mise en avant | US2-3 |
| 18 | Glisser la poignée vers le haut / toucher | panneau déplié en liste ; inverse pour replier | US2-2 |
| 19 | « Me localiser » → autoriser | recentrage sur la position, distances affichées sur les cartes | US2-4 |
| 20 | « Me localiser » → refuser | carte reste sur Paris, message expliquant comment activer, pas de distance | edge case |
| 21 | Filtres sans résultat | « Aucune activité trouvée — Essayez un autre âge ou une autre catégorie » | US2-5 |
| 22 | Passer de Carte à Explorer avec `?age=2-3a&categorie=PARC` | filtres conservés | contracts |
| 23 | Token Mapbox retiré | « Carte indisponible » stylé, lien vers Explorer | III |

## Contrôles transverses (chaque lot)

- Largeurs 375, 768, 1280 px : aucun défilement horizontal (DevTools → `document.documentElement.scrollWidth === innerWidth`). (SC-003)
- Lighthouse mobile sur `/carte`, `/liste`, une fiche : Accessibilité ≥ 95 (contrastes AA),
  Performance comparée à `main` : pas plus de 10 % de dégradation du LCP. (FR-013, SC-006)
- Validation visuelle du porteur face à la maquette, écran par écran. (SC-001)
