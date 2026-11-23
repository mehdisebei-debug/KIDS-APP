# Implementation Plan: Espace admin de revue des activités et événements à vérifier

**Branch**: `003-admin-revue-brouillons` (à créer ; le dépôt n'a pas de hook de branche) | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-admin-revue-brouillons/spec.md`

## Summary

Ajouter à l'espace admin existant une file `/admin/brouillons` qui liste les brouillons
`a_valider` de `activities_drafts`, une page de détail `/admin/brouillons/[id]` pour les examiner,
les compléter (dont le calcul des coordonnées depuis l'adresse, confirmé par l'admin), puis les
publier ou les rejeter.

Approche : même patron que `/admin/events`. Les pages sont des Server Components qui lisent avec le
client `service_role`, et les écritures passent par des Server Actions qui revérifient la session
admin. La publication est confiée à une fonction PostgreSQL `publish_activity_draft(uuid)`, appelée
en RPC. Elle copie le brouillon dans `activities` et le passe à `publie` en une seule transaction,
avec un verrou qui empêche la double publication. Le géocodage passe par l'API publique de la
Géoplateforme (IGN), via un `fetch` côté serveur, sans nouvelle dépendance (voir
[research.md](./research.md), R2).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 20

**Primary Dependencies**: Next.js 14.2 (App Router, Server Components, Server Actions),
`@supabase/supabase-js` 2.x, Tailwind CSS 3. Aucune nouvelle dépendance.

**Storage**: Supabase PostgreSQL 17 + PostGIS. Tables `activities_drafts` et `activities`
(`scripts/sql/create-activities-tables.sql`). Ajout d'une fonction SQL, sans changement de colonnes.

**Testing**: aucun framework automatisé (limite connue de la constitution). Validation manuelle
scénarisée dans [quickstart.md](./quickstart.md), plus `lint`, `type-check` et `build`.

**Target Platform**: web, déployé sur Vercel. Admin utilisable sur mobile (375 px) et sur desktop.

**Project Type**: application web Next.js monolithique (front et back dans le même projet).

**Performance Goals**: file et détail affichés en moins de 1 s pour moins de 200 brouillons ;
publication en moins de 2 s.

**Constraints**: la clé `service_role` reste côté serveur. Les brouillons ne sont jamais lisibles
avec la clé anon. Pas de `localStorage`. Images avec `<Image>` de Next.js en mode `unoptimized` (voir R5).
Les âges restent en mois.

**Scale/Scope**: un seul admin, quelques dizaines de brouillons par semaine. 2 nouvelles routes,
1 fichier d'actions, 1 fonction SQL, environ 6 composants.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Application à cette feature | Statut |
|---|---|---|
| I. Mobile-first | File en cartes empilées sur mobile, tableau à partir de `md:` ; formulaire en une colonne ; boutons d'au moins 44 px | ✅ |
| II. Âge en mois | Le formulaire saisit les âges en mois (champ admin, précision métier) avec l'équivalent lisible affiché à côté ; aucune conversion dans l'autre sens | ✅ |
| III. États explicites | Chaque page gère : Supabase non configuré, erreur, file vide (avec rappel du Projet d'ingestion), brouillon introuvable (`notFound`) | ✅ |
| IV. Typage strict | Nouveau type partagé `lib/types/draft.ts` ; pas de `any` ; payloads de formulaire typés | ✅ |
| V. Secrets serveur | Lecture et écriture uniquement depuis des Server Components ou Actions via `createServerClient` ; la fonction SQL est révoquée pour `anon` et `authenticated` ; le géocodage n'utilise aucune clé | ✅ |
| Contraintes techniques | Pas de nouvelle librairie ; structure `app/admin/*` existante réutilisée ; `async/await` uniquement | ✅ |
| Workflow | US découpées en issues, branches `feat/<num>-slug`, PR avec `Closes #`, QA manuel documenté | ✅ |

Aucune violation : la section Complexity Tracking est vide.

**Re-vérification après la Phase 1** (data-model, contrats, quickstart) : ✅ toujours conforme.
- II : le formulaire saisit les âges en mois, et `ageLabel` ne sert qu'à l'affichage (R6).
- III : chaque route liste ses états d'erreur, de vide et d'introuvable ([contracts/routes.md](./contracts/routes.md)).
- V : la RPC est révoquée pour `anon`, ce qui est vérifié par le scénario V15 du quickstart. Le
  compteur de la nav n'est calculé que si la session est valide (R9).
- Images : `<Image unoptimized>`, sans `<img>` ni modification de `next.config.mjs` (R5).

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-revue-brouillons/
├── plan.md              # Ce fichier
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   ├── routes.md        # Routes admin et comportements d'accès
│   ├── server-actions.md# Signatures et erreurs des Server Actions
│   └── sql-publish.md   # Contrat de la fonction publish_activity_draft
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
app/admin/
├── layout.tsx                    # MODIFIÉ : navigation Événements / Brouillons (+ compteur)
└── brouillons/
    ├── page.tsx                  # NOUVEAU : file a_valider (Server Component)
    ├── actions.ts                # NOUVEAU : saveDraft, geocodeDraft, confirmGeocode, publishDraft, rejectDraft
    ├── DraftList.tsx             # NOUVEAU : cartes mobile / tableau desktop + filtre type
    └── [id]/
        ├── page.tsx              # NOUVEAU : détail (Server Component)
        ├── not-found.tsx         # NOUVEAU
        ├── DraftForm.tsx         # NOUVEAU (client) : édition + champs manquants surlignés
        ├── GeocodeButton.tsx     # NOUVEAU (client) : proposer / confirmer les coordonnées
        └── DecisionBar.tsx       # NOUVEAU (client) : Publier (confirmation) / Rejeter (motif)

lib/
├── admin-auth.ts                 # NOUVEAU : requireAdmin() extrait de events/actions.ts, partagé
├── types/draft.ts                # NOUVEAU : ActivityDraft, DraftStatus, DraftFormPayload
└── utils/
    ├── format.ts                 # MODIFIÉ : ageLabel(min, max|null), priceLabelOrUnknown(...)
    └── draft.ts                  # NOUVEAU : computeMissingFields(), REQUIRED_FOR_PUBLISH

scripts/sql/
└── create-publish-draft-function.sql  # NOUVEAU : fonction publish_activity_draft + REVOKE
```

**Structure Decision**: on étend l'espace `app/admin/` existant (même layout, même middleware de
session, même patron Server Component + Server Actions que `app/admin/events`). `requireAdmin` est
extrait dans `lib/admin-auth.ts` pour être partagé sans duplication. Le SQL suit la convention du
dépôt : un fichier versionné dans `scripts/sql/`, exécuté à la main dans le SQL Editor.

## Points d'attention pour la suite

1. **Visibilité publique (US3, scénario 1)** : les pages publiques lisent encore
   `lib/data/mock-activities.ts`. Une activité publiée sera bien dans `activities` et lisible avec
   la clé anon, mais elle n'apparaîtra dans l'app qu'une fois les pages branchées sur Supabase.
   Le critère est donc vérifié par une lecture anon de `activities` (quickstart, V5), et le
   branchement des pages publiques fait l'objet d'une US séparée, hors de cette feature.
2. **Dépendance #17** : l'ajustement de schéma après le test des 10 activités peut ajouter ou
   renommer des colonnes. `REQUIRED_FOR_PUBLISH`, le type `ActivityDraft` et la fonction SQL
   devront alors suivre. Il est conseillé d'implémenter après #17.
3. **Écart avec une hypothèse de la spec** : la spec prévoyait le géocodage via « le service de
   cartographie déjà utilisé » (Mapbox). La recherche R2 retient la Géoplateforme, parce que les
   conditions Mapbox interdisent de stocker les résultats du géocodage temporaire. L'hypothèse de
   la spec est mise à jour en conséquence.

## Complexity Tracking

Aucune violation de la constitution à justifier.
