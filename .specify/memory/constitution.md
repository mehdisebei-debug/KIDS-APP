<!--
SYNC IMPACT REPORT — scratch de revue, à supprimer avant commit de l'amendement
================================================================================
Changement de version : (scaffold non versionné) → 1.0.0
Type de bump : MAJOR initial — ratification de la constitution du projet.

Principes définis (tous les placeholders remplacés) :
  [PRINCIPLE_1_NAME] → I. Mobile-first absolu (NON NÉGOCIABLE)
  [PRINCIPLE_2_NAME] → II. L'âge se mesure en mois
  [PRINCIPLE_3_NAME] → III. Aucun état de données implicite
  [PRINCIPLE_4_NAME] → IV. Typage strict
  [PRINCIPLE_5_NAME] → V. Les secrets ne quittent jamais le serveur

Sections ajoutées :
  [SECTION_2_NAME] → Contraintes techniques
  [SECTION_3_NAME] → Workflow de développement et portes de qualité
  [GOVERNANCE_RULES] → règles d'amendement, versionnage, contrôle de conformité

Sections supprimées : aucune.

Sources d'inférence (input utilisateur vide) :
  - CLAUDE.md (conventions de code, règles Supabase, règles importantes, workflow multi-agents)
  - .github/workflows/ci.yml (portes de qualité réelles)
  - ruleset GitHub `protect-main` (PR obligatoire, squash, check `test` requis)

TODO reportés : aucun.
================================================================================
-->

# Kids Activity App Constitution

## Core Principles

### I. Mobile-first absolu (NON NÉGOCIABLE)

Les parents consultent cette application sur un téléphone, en mobilité, souvent d'une seule main.
Toute interface DOIT être conçue pour un viewport de 375 px d'abord, puis élargie.

- Les classes Tailwind de base DOIVENT cibler le mobile ; `md:` et `lg:` ne font qu'élargir.
- Aucune page ne DOIT provoquer de défilement horizontal à 375 px.
- Tout contrôle interactif DOIT rester manipulable au pouce.

*Rationale* : un parcours cassé sur mobile équivaut à un produit cassé pour la quasi-totalité
des utilisateurs réels.

### II. L'âge se mesure en mois

La précision au mois sur la tranche 0–72 est le différenciateur central du produit. Un besoin à
8 mois n'a rien de commun avec un besoin à 4 ans.

- La base de données DOIT stocker tout âge en mois, sans exception.
- La conversion vers un libellé en années DOIT avoir lieu uniquement à la frontière d'affichage.
- L'âge d'un enfant DOIT être calculé dynamiquement depuis sa date de naissance, jamais stocké.
- Toute double conversion (mois → années → mois) est un défaut bloquant.

*Rationale* : la confusion d'unité est l'erreur la plus coûteuse de ce domaine métier, car elle
produit des résultats plausibles mais faux.

### III. Aucun état de données implicite

Tout composant qui récupère des données DOIT traiter explicitement trois états : `loading`,
`error` et `empty`.

- Une erreur de récupération DOIT dégrader proprement : la page reste utilisable.
- Une absence de résultat DOIT afficher un état vide orienté action, jamais un message d'erreur.
- Une page blanche ou une erreur technique brute exposée à l'utilisateur est un défaut bloquant.

*Rationale* : les sources de données externes (Supabase, OpenAgenda, Mapbox) échouent ; l'accueil
ne doit jamais tomber avec elles.

### IV. Typage strict

Le type est la première ligne de documentation et le premier filet de sécurité.

- `any` est interdit. Utiliser `unknown` ou typer correctement.
- Les types partagés DOIVENT vivre dans `lib/types/` et être réutilisés, jamais redéclarés.
- Les props de composant DOIVENT être typées par une interface explicite.
- `npm run type-check` DOIT passer avant toute Pull Request.

*Rationale* : en solo et à temps partiel, le compilateur remplace la relecture croisée que l'on
n'a pas.

### V. Les secrets ne quittent jamais le serveur

- `SUPABASE_SERVICE_ROLE_KEY` DOIT rester exclusivement côté serveur. Tout usage dans du code
  atteignable par le navigateur est un défaut bloquant.
- Aucune clé d'API ne DOIT être écrite en dur : `.env.local` et variables d'environnement Vercel
  uniquement.
- Aucun secret ne DOIT apparaître dans une issue, une Pull Request, un commit ou un log.
- Les Row Level Security DOIVENT rester actives : lecture publique, écriture authentifiée.

*Rationale* : le dépôt est public et l'application est déployée en continu ; une fuite est
immédiate et irréversible.

## Contraintes techniques

La stack est arrêtée. S'en écarter demande une décision humaine explicite, pas une initiative
d'agent.

- **Socle** : Next.js 14 (App Router), TypeScript, Tailwind CSS, déploiement Vercel.
- **Données** : Supabase (PostgreSQL + PostGIS). Les requêtes géospatiales passent par la RPC
  `get_nearby_activities`.
- **Carte** : Mapbox GL JS DOIT être importé via `dynamic(() => import(...), { ssr: false })`.
- **État** : Zustand pour l'état global, TanStack Query pour l'état serveur.
- **Interdits** : `localStorage` (utiliser Supabase ou Zustand), `<img>` (utiliser `<Image>`),
  `.then()` (utiliser `async/await`).
- **Dépendances** : aucune librairie supplémentaire ne DOIT être installée sans accord humain
  préalable.
- **Structure** : l'arborescence décrite dans `CLAUDE.md` ne DOIT pas être modifiée sans raison
  explicite.
- **Langue** : commentaires en français, identifiants de code en anglais.

## Workflow de développement et portes de qualité

Le développement passe par un pipeline multi-agents adossé aux Issues et au Project GitHub
**KIDS-APP Pipeline**. Le contrat de handoff détaillé fait foi dans `CLAUDE.md`.

**Portes de qualité, dans l'ordre :**

1. Avant toute Pull Request : `npm run lint`, `npm run type-check` et `npm run build` DOIVENT
   être verts localement.
2. La CI GitHub Actions (job `test`) DOIT être verte. Le ruleset `protect-main` l'exige.
3. Le relecteur DOIT rendre un verdict explicite `VERDICT: APPROVED` ou
   `VERDICT: CHANGES_REQUESTED`.
4. Le QA DOIT prouver chaque critère d'acceptation avant `QA: GO`.
5. Le merge sur `main` DOIT recevoir une validation humaine explicite, et se faire en squash.

**Règles de séparation :**

- Un agent ne remplit QUE son rôle : le développeur ne relit pas son code, le relecteur ne code
  pas, le QA ne modifie pas la fonctionnalité.
- La boucle développeur ↔ relecteur est plafonnée à 2 allers-retours, puis escalade à l'humain.
- Toute Pull Request DOIT référencer son issue par `Closes #<num>`.
- Les branches suivent `feat/<num>-slug` ou `fix/<num>-slug` ; les commits suivent Conventional
  Commits en français.

**Limite connue** : aucun framework de test automatisé n'est installé à ce jour. La validation
des critères d'acceptation est donc manuelle et documentée. L'ajout de tests automatisés est une
évolution attendue de cette section, et déclenchera un bump MINOR.

## Governance

Cette constitution prévaut sur toute autre pratique, habitude ou préférence ponctuelle. En cas de
contradiction entre un document du dépôt et ce texte, ce texte l'emporte.

- **Amendement** : tout changement passe par une Pull Request dédiée, avec justification du bump
  de version. Un amendement ne DOIT pas être glissé dans une PR de fonctionnalité.
- **Versionnage** (sémantique) :
  - MAJOR — retrait ou redéfinition incompatible d'un principe ou d'une règle de gouvernance.
  - MINOR — ajout d'un principe ou d'une section, ou extension matérielle d'une règle existante.
  - PATCH — clarification, reformulation, correction sans effet sémantique.
- **Conformité** : toute relecture de Pull Request DOIT vérifier le respect de ces principes.
  Une violation d'un principe marqué bloquant entraîne `VERDICT: CHANGES_REQUESTED`.
- **Complexité** : tout écart aux contraintes techniques DOIT être justifié par écrit dans la
  Pull Request. L'absence de justification vaut refus.
- **Guidage à l'exécution** : `CLAUDE.md` reste le document de référence opérationnel quotidien
  (conventions détaillées, commandes `gh`, identifiants du Project). Il met en œuvre cette
  constitution ; il ne la contredit jamais.

**Version**: 1.0.0 | **Ratified**: 2026-10-05 | **Last Amended**: 2026-10-05
