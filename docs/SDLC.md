# SDLC — Kids Activity App

> Cycle de vie du développement logiciel (*Software Development Life Cycle*) du projet **kids-app** :
> de l'idée jusqu'à la production, qui fait quoi, avec quels outils et quelles règles.
>
> Documents de référence (en cas de conflit, cet ordre fait foi) :
> 1. [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) — les principes non négociables
> 2. [`CLAUDE.md`](../CLAUDE.md) — conventions quotidiennes + contrat de handoff multi-agents
> 3. ce document — la vue d'ensemble et le mode d'emploi

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Acteurs et outils](#2-acteurs-et-outils)
3. [Architecture cible](#3-architecture-cible)
4. [Phase 0 — Gouvernance](#4-phase-0--gouvernance)
5. [Phase 1 — Idée et cadrage](#5-phase-1--idée-et-cadrage)
6. [Phase 2 — User Story](#6-phase-2--user-story)
7. [Phase 3 — Développement](#7-phase-3--développement)
8. [Phase 4 — Code review](#8-phase-4--code-review)
9. [Phase 5 — QA](#9-phase-5--qa)
10. [Phase 6 — Merge et déploiement](#10-phase-6--merge-et-déploiement)
11. [Phase 7 — Exploitation et données](#11-phase-7--exploitation-et-données)
12. [Machine à états du board](#12-machine-à-états-du-board)
13. [Stratégie Git](#13-stratégie-git)
14. [Portes de qualité](#14-portes-de-qualité)
15. [Incidents et hotfix](#15-incidents-et-hotfix)
16. [Aide-mémoire des commandes](#16-aide-mémoire-des-commandes)
17. [Limites connues et évolutions](#17-limites-connues-et-évolutions)

---

## 1. Vue d'ensemble

Le projet suit un cycle **itératif et incrémental** : une User Story à la fois, livrée en continu
sur `main` (= production Vercel). Chaque étape est tenue par un rôle distinct et séparée de la
suivante par une **porte de qualité**.

```mermaid
flowchart LR
    A([💡 Idée / besoin]) --> B{Grosse feature ?}
    B -- oui --> C[Spec-Kit<br/>specify → plan → tasks]
    B -- non --> D[/new-story/]
    C --> D2[Issues GitHub<br/>taskstoissues]
    D --> E[📋 User Story<br/>Backlog → Ready]
    D2 --> E
    E --> F[👩‍💻 Développement<br/>branche + PR]
    F --> G[🔍 Code review]
    G -- CHANGES_REQUESTED --> F
    G -- APPROVED --> H[🧪 QA]
    H -- NO-GO --> F
    H -- GO --> I{🙋 Validation<br/>humaine}
    I -- oui --> J[🔀 Merge squash<br/>sur main]
    J --> K[🚀 Vercel<br/>production]
    K --> L[📈 Exploitation<br/>données, retours]
    L --> A
```

| Phase | Sortie attendue | Responsable | Porte de sortie |
|---|---|---|---|
| 0. Gouvernance | Constitution + CLAUDE.md | Humain | PR dédiée d'amendement |
| 1. Cadrage | `specs/<NNN>-*/spec.md`, `plan.md`, `tasks.md` | Humain + Spec-Kit | Gate « approve » à chaque étape |
| 2. User Story | Issue `[US]` avec Gherkin | `product-owner` | Checklist INVEST → `status: ready` |
| 3. Développement | Branche + PR `Closes #N` | `developer` | lint + type-check + build verts |
| 4. Review | Commentaire `VERDICT: *` | `reviewer` | `VERDICT: APPROVED` |
| 5. QA | Tableau de preuves sur l'issue | `qa` | `QA: GO` + CI verte |
| 6. Merge | Commit squash sur `main` | **Humain** | Accord explicite |
| 7. Exploitation | Prod Vercel, données Supabase | Humain | Vérification prod |

---

## 2. Acteurs et outils

### 2.1 Rôles

```mermaid
flowchart TB
    H((🙋 Humain<br/>Mehdi))
    subgraph Agents[".claude/agents/"]
        PO[product-owner<br/><i>spécifie, ne code jamais</i>]
        DEV[developer<br/><i>code, ne relit pas</i>]
        REV[reviewer<br/><i>relit, ne code pas</i>]
        QA[qa<br/><i>valide, ne modifie pas la feature</i>]
    end
    H -- "/new-story" --> PO
    H -- "/pick-next" --> DEV
    H -- "/review-pr N" --> REV
    H -- "/run-sprint" --> DEV
    PO -- "status: ready" --> DEV
    DEV -- "status: review" --> REV
    REV -- "status: qa" --> QA
    REV -. "CHANGES_REQUESTED" .-> DEV
    QA -. "NO-GO" .-> DEV
    QA -- "QA: GO → demande d'accord" --> H
    H -- "merge squash" --> MAIN[(main)]
```

| Acteur | Fichier de définition | Skill chargée | Peut | Ne peut pas |
|---|---|---|---|---|
| Humain | — | — | Tout décider, **seul à autoriser un merge** | — |
| `product-owner` | `.claude/agents/product-owner.md` | `writing-user-stories` | Créer/affiner des issues | Coder |
| `developer` | `.claude/agents/developer.md` | `feature-development` | Brancher, coder, ouvrir une PR | Merger, relire son code |
| `reviewer` | `.claude/agents/reviewer.md` | `code-review` | Commenter la PR, poser un verdict | Modifier le code |
| `qa` | `.claude/agents/qa.md` | `testing` | Tester, écrire des tests, `QA: GO/NO-GO` | Modifier la feature, merger seul |

### 2.2 Outils

| Besoin | Outil |
|---|---|
| Code | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Données | Supabase (PostgreSQL + PostGIS, RLS, Auth) |
| Carte | Mapbox GL JS via `react-map-gl` |
| Suivi | GitHub Issues + Project **KIDS-APP Pipeline** (n° 1) |
| Spécification | GitHub Spec-Kit (`.specify/`, skills `speckit-*`) |
| CI | GitHub Actions (`.github/workflows/ci.yml`, job `test`) |
| Protection | Ruleset GitHub `protect-main` (PR obligatoire, squash, check `test` requis) |
| Hébergement | Vercel (`main` = production automatique) |
| Agents | Claude Code (sous-agents, slash commands, hooks) |

---

## 3. Architecture cible

```mermaid
flowchart LR
    subgraph Client["📱 Navigateur (mobile-first)"]
        UI[Pages App Router<br/>accueil · liste · carte · fiches]
        MAP[ActivityMap<br/>dynamic ssr:false]
    end
    subgraph Vercel["▲ Vercel"]
        RSC[Server Components<br/>force-dynamic]
        MW[middleware.ts<br/>garde /admin/*]
        ADM[/admin/events<br/>Server Actions/]
    end
    subgraph Supabase["🟢 Supabase"]
        DB[(PostgreSQL + PostGIS<br/>RLS activée)]
        RPC[[get_nearby_activities]]
    end
    subgraph Ext["🌐 Sources externes"]
        OA[OpenAgenda API]
        MB[Mapbox tiles]
        SOC[Réseaux sociaux<br/>Instagram, Facebook]
    end
    UI --> RSC --> DB
    MAP --> MB
    RSC --> RPC --> DB
    MW --> ADM --> DB
    OA -- "scripts/import-openagenda.ts<br/>(service role)" --> DB
    SOC -- "Projet Claude + connecteur<br/>→ activities_drafts" --> DB
```

Règles d'architecture qui découlent de la constitution :

- **Secrets** : `SUPABASE_SERVICE_ROLE_KEY` uniquement dans `scripts/` et le code serveur, jamais dans
  un composant client. Tout est dans `.env.local` (local) et les variables d'environnement Vercel (prod).
- **Âges** : stockés en **mois** en base, convertis en années uniquement à l'affichage.
- **Carte** : toujours `dynamic(() => import(...), { ssr: false })` (Mapbox utilise `window`).
- **États** : tout composant qui fetch gère `loading`, `error`, `empty`.

---

## 4. Phase 0 — Gouvernance

La gouvernance définit les règles du jeu **avant** d'écrire du code.

| Document | Rôle | Comment le modifier |
|---|---|---|
| `constitution.md` | 5 principes (mobile-first, âge en mois, états explicites, typage strict, secrets) | PR dédiée + bump de version sémantique (skill `speckit-constitution`) |
| `CLAUDE.md` | Conventions, stack, contrat de handoff, IDs du Project | PR `chore:` |
| `.claude/agents/*.md` | Périmètre de chaque agent | PR `chore:` |
| `.claude/skills/*/SKILL.md` | Méthode détaillée de chaque rôle | PR `chore:` |
| `.claude/settings.json` | Hooks automatiques (type-check après chaque édition, lint + type-check en fin de tour) | PR `chore:` |

**Versionnage de la constitution :**

| Bump | Quand |
|---|---|
| MAJOR | Retrait ou redéfinition incompatible d'un principe |
| MINOR | Ajout d'un principe/section (ex. : arrivée de Vitest) |
| PATCH | Reformulation sans effet sémantique |

> ⚠️ Un amendement ne se glisse **jamais** dans une PR de fonctionnalité.

---

## 5. Phase 1 — Idée et cadrage

Deux chemins selon la taille du besoin :

```mermaid
flowchart TD
    I([Besoin brut]) --> Q{"Touche plusieurs écrans,<br/>le schéma de données,<br/>ou > 2 US ?"}
    Q -- Non --> S1["/new-story &lt;besoin&gt;<br/>→ une issue directement"]
    Q -- Oui --> S2[speckit-specify<br/>spec.md]
    S2 --> G1{Gate : spec OK ?}
    G1 -- non --> CL[speckit-clarify<br/>≤ 5 questions] --> S2
    G1 -- oui --> P[speckit-plan<br/>plan.md + design]
    P --> G2{Gate : plan OK ?}
    G2 -- oui --> T[speckit-tasks<br/>tasks.md]
    T --> AN[speckit-analyze<br/>cohérence spec/plan/tasks]
    AN --> TI[speckit-taskstoissues<br/>→ issues GitHub]
    TI --> R[Phase 2 : affinage par le PO]
    S1 --> R
```

### Instructions — chemin Spec-Kit

1. Décrire le besoin en langage naturel et lancer la skill `speckit-specify`.
   → crée `specs/<NNN>-<slug>/spec.md` et met à jour `.specify/feature.json`.
2. Relire la spec. Si des zones sont floues : `speckit-clarify`.
3. `speckit-plan` → `plan.md` (choix techniques confrontés à la constitution).
4. `speckit-tasks` → `tasks.md` ordonné par dépendances.
5. `speckit-analyze` → rapport de cohérence (non destructif).
6. `speckit-taskstoissues` → une issue par tâche/US, ensuite affinées par le `product-owner`.
7. Plus tard, `speckit-converge` compare le code au plan et ajoute les tâches manquantes.

> Exemple en cours : `specs/001-ingestion-sans-code/` (ingestion d'activités en brouillon depuis les
> réseaux sociaux, validation humaine avant publication).

---

## 6. Phase 2 — User Story

**Responsable :** `product-owner` · **Déclencheur :** `/new-story <besoin>`

### Format obligatoire

```markdown
## User Story
- **En tant que** parent d'un enfant de 18 mois
- **Je veux** filtrer les activités par âge
- **Afin de** ne voir que ce qui convient à mon enfant

## Critères d'acceptation

### Critère 1 : filtre appliqué
Étant donné la liste des activités
Quand je choisis « 1–2 ans »
Alors seules les activités dont la tranche couvre 12–24 mois s'affichent

### Critère 2 : aucun résultat
Étant donné un filtre sans correspondance
Quand la liste se recharge
Alors un message « Aucune activité » avec un bouton « Réinitialiser » s'affiche
```

### Règles

- Titre préfixé `[US]`, verbe d'action.
- 2 à 5 critères Gherkin ; chaque « Alors » est **observable dans l'UI**.
- Toujours un critère pour l'état vide ou d'erreur si la feature fetch des données.
- Une US = moins de 1–2 jours de dev à temps partiel ; sinon, découper.

### Checklist INVEST (avant `Ready`)

- [ ] **I**ndependent · [ ] **N**egotiable · [ ] **V**aluable · [ ] **E**stimable · [ ] **S**mall · [ ] **T**estable

### Labels

| Label | Valeurs |
|---|---|
| Type | `type: user-story` (toujours) |
| Zone | `area: age-filter` · `area: map` · `area: admin` |
| Priorité | `priority: p1` (bloquant MVP) · `priority: p2` |
| Statut | `status: ready` → `in-progress` → `review` → `qa` |

### Commandes

```bash
gh issue create --title "[US] ..." --body-file us.md --label "type: user-story" --label "priority: p1"
```

```bash
gh project item-add 1 --owner mehdisebei-debug --url <url-issue>
```

---

## 7. Phase 3 — Développement

**Responsable :** `developer` · **Déclencheur :** `/pick-next [num]`

```mermaid
sequenceDiagram
    autonumber
    participant DEV as developer
    participant GH as GitHub (Issue + Project)
    participant GIT as Git local
    participant CI as GitHub Actions
    DEV->>GH: gh issue list --label "status: ready"
    DEV->>GH: label status: in-progress + carte "In Progress"
    DEV->>GIT: git switch main && git pull
    DEV->>GIT: git switch -c feat/<num>-slug
    loop Implémentation
        DEV->>GIT: Edit / Write
        Note over GIT: Hook PostToolUse → npm run type-check
    end
    DEV->>GIT: npm run lint && npm run type-check && npm run build
    DEV->>GIT: git commit (Conventional Commits FR)
    DEV->>GH: git push + gh pr create (body : Closes #<num>)
    GH->>CI: déclenche le job test
    DEV->>GH: label status: review + carte "In Review"
```

### Instructions pas à pas

1. Prendre l'issue (1re `status: ready`, p1 avant p2).
2. Passer en `status: in-progress` et déplacer la carte :
   ```bash
   gh issue edit <num> --remove-label "status: ready" --add-label "status: in-progress"
   ```
3. Créer la branche depuis `main` à jour : `feat/<num>-slug` ou `fix/<num>-slug`.
4. Implémenter **chaque** critère d'acceptation, en respectant :
   - mobile-first (base Tailwind = 375 px, puis `md:` / `lg:`) ;
   - `export default` + props typées par `interface` ;
   - `async/await` (jamais `.then()`), `<Image>` (jamais `<img>`), pas de `any`, pas de `localStorage` ;
   - commentaires en français, identifiants en anglais ;
   - aucune nouvelle librairie sans accord humain.
5. Si un critère est ambigu : **commenter l'issue** plutôt qu'inventer.
6. Vérifier localement :
   ```bash
   npm run lint && npm run type-check && npm run build
   ```
7. Committer (`feat: …`, `fix: …`, `test: …`, `chore: …`), pousser, ouvrir la PR avec `Closes #<num>`.
8. Passer en `status: review`, carte « In Review ».

---

## 8. Phase 4 — Code review

**Responsable :** `reviewer` · **Déclencheur :** `/review-pr <num>`

### Grille de lecture

| Axe | Ce qui est vérifié |
|---|---|
| Fonctionnel | Chaque critère d'acceptation est couvert par le code |
| Constitution | Mobile-first, âges en mois, états loading/error/empty, pas de `any`, secrets côté serveur |
| Qualité | Lisibilité, pas de code mort, nommage, types partagés dans `lib/types/` |
| Performance | Pas de fetch inutile, carte en `dynamic`, images optimisées |
| Accessibilité | Labels, contrastes, cibles tactiles |
| Sécurité | RLS respectée, pas de clé en dur, pas de secret dans la PR |

### Verdict

```bash
gh pr review <num> --comment --body-file review.md
```

La dernière ligne du corps contient **exactement** l'un des deux verdicts :

```
VERDICT: APPROVED
VERDICT: CHANGES_REQUESTED
```

> ⚠️ Jamais `--approve` : le compte GitHub est le même que celui de l'auteur, GitHub refuse.
> Le verdict textuel + les labels portent l'état du workflow.

| Verdict | Label suivant | Colonne |
|---|---|---|
| `APPROVED` | `status: qa` | QA |
| `CHANGES_REQUESTED` | `status: in-progress` | In Progress (liste numérotée des changements) |

**Boucle plafonnée** : 2 allers-retours dev ↔ review (QA NO-GO compris) ; au 3e, escalade à l'humain.

---

## 9. Phase 5 — QA

**Responsable :** `qa`

```mermaid
flowchart TD
    A[gh pr checkout N] --> B[lint + type-check + build]
    B --> C[gh pr checks N<br/>CI verte ?]
    C --> D[npm run dev]
    D --> E[Rejouer chaque critère Gherkin<br/>Étant donné / Quand / Alors]
    E --> F[Cas limites :<br/>état vide · erreur réseau · 375 px]
    F --> G[Tableau de preuves<br/>commenté sur l'issue]
    G --> H{Tout ✅ ?}
    H -- oui --> GO[QA: GO<br/>→ demande d'accord humain]
    H -- non --> NOGO[QA: NO-GO<br/>status: in-progress]
```

### Modèle de rapport (commentaire sur l'issue)

```markdown
## Validation QA — PR #<num>
| Critère | Résultat | Preuve |
|---|---|---|
| 1. Filtre appliqué | ✅ | 4 activités 12–24 mois affichées, 0 hors tranche |
| 2. Aucun résultat | ✅ | Message + bouton « Réinitialiser » visibles |
Checks : lint ✅ · type-check ✅ · build ✅ · CI ✅
```

> Aucun `QA: GO` si un critère n'est pas **prouvé** (test automatisé ou vérification manuelle documentée).

---

## 10. Phase 6 — Merge et déploiement

```mermaid
sequenceDiagram
    autonumber
    participant QA as qa
    participant H as Humain
    participant GH as GitHub
    participant V as Vercel
    QA->>H: QA: GO — puis-je merger la PR #N ?
    H-->>QA: Oui, merge.
    QA->>GH: gh pr merge N --squash
    Note over GH: ruleset protect-main :<br/>PR obligatoire · check "test" vert · squash
    GH->>V: push sur main → build de production
    GH-->>GH: Closes #N ferme l'issue
    QA->>GH: carte → "Deployed"
    QA->>V: vérifie la feature en production
```

### Conditions cumulatives du merge

1. `VERDICT: APPROVED` du reviewer
2. `QA: GO` du QA
3. CI verte (job `test`)
4. **Validation humaine explicite**
5. Merge en **squash** uniquement

### Après le merge

- Supprimer la branche distante (option de `gh pr merge --delete-branch` ou via l'UI).
- Vérifier la feature sur l'URL de production Vercel.
- Revenir sur `main` en local : `git switch main && git pull`.

---

## 11. Phase 7 — Exploitation et données

La valeur de l'app dépend de la fraîcheur des données. Trois canaux d'alimentation :

```mermaid
flowchart LR
    OA[OpenAgenda] -->|npm run import:openagenda| EV[(events)]
    ADM[Admin /admin/events<br/>CRUD protégé] --> EV
    SOC[Lien / capture<br/>réseaux sociaux] -->|Projet Claude<br/>+ confirmation « ok »| DR[(activities_drafts<br/>RLS sans policy)]
    DR -->|validation humaine| ACT[(activities<br/>lecture publique)]
    EV --> APP[App parents]
    ACT --> APP
```

| Canal | Commande / accès | Garde-fou |
|---|---|---|
| Import OpenAgenda | `npm run import:openagenda` | Service role côté script uniquement |
| Admin CRUD | `/admin/events` | `middleware.ts` + cookie `admin_session` (`ADMIN_PASSWORD`) |
| Ingestion réseaux (spec 001) | Projet Claude + connecteur Supabase | Brouillons invisibles aux parents ; publication après validation |

### Schéma de base

Les scripts SQL sont versionnés dans `scripts/sql/` et appliqués manuellement dans l'éditeur SQL
Supabase (ou via `supabase db push` si la CLI est installée). Toute modification de schéma passe par
une US + PR comme le reste du code.

### Suivi en production

- Logs de build et de runtime : tableau de bord Vercel.
- Données : tableau de bord Supabase (tables, RLS, logs API).
- Retours utilisateurs → nouvelles idées → retour en Phase 1.

---

## 12. Machine à états du board

Chaque handoff = **changement de label** `status: *` **ET** **déplacement de carte** dans le Project.

```mermaid
stateDiagram-v2
    [*] --> Backlog : /new-story
    Backlog --> Ready : INVEST OK<br/>+ status: ready
    Ready --> InProgress : developer prend la carte<br/>status: in-progress
    InProgress --> InReview : PR ouverte<br/>status: review
    InReview --> InProgress : VERDICT: CHANGES_REQUESTED
    InReview --> QA : VERDICT: APPROVED<br/>status: qa
    QA --> InProgress : QA: NO-GO
    QA --> Deployed : QA: GO + accord humain<br/>merge squash
    InReview --> Escalade : > 2 boucles
    QA --> Escalade : > 2 boucles
    Escalade --> InProgress : décision humaine
    Deployed --> [*]
```

| Colonne | Label | option-id |
|---|---|---|
| Backlog | — | `58e7e7d9` |
| Ready | `status: ready` | `0031a187` |
| In Progress | `status: in-progress` | `e31e8ab5` |
| In Review | `status: review` | `ea1503a2` |
| QA | `status: qa` | `e01d3446` |
| Deployed | — (issue fermée) | `4cf0d3db` |

```bash
# Déplacer une carte
gh project item-edit --id <item-id> --project-id PVT_kwHOEgSBb84BfnM_ \
  --field-id PVTSSF_lAHOEgSBb84BfnM_zhZ43jw --single-select-option-id <option-id>
```

---

## 13. Stratégie Git

Modèle **trunk-based** : `main` est toujours déployable, branches courtes, merge squash.

```mermaid
gitGraph
    commit id: "init Next.js"
    commit id: "ci (#1)"
    branch feat/5-carte-mapbox
    commit id: "feat: carte"
    commit id: "fix: review"
    checkout main
    merge feat/5-carte-mapbox id: "squash #6"
    branch feat/7-fiche-detail-evenement
    commit id: "feat: fiche"
    checkout main
    merge feat/7-fiche-detail-evenement id: "squash #10"
    branch feat/13-tables-ingestion
    commit id: "chore: SQL"
    checkout main
    merge feat/13-tables-ingestion id: "squash (à venir)"
```

| Élément | Convention | Exemple |
|---|---|---|
| Branche feature | `feat/<num>-slug` | `feat/13-tables-ingestion` |
| Branche correctif | `fix/<num>-slug` | `fix/21-carte-vide-safari` |
| Branche outillage | `chore/<slug>` | `chore/spec-kit` |
| Commit | Conventional Commits en français | `feat: filtre les activités par âge en mois` |
| PR | Corps avec `Closes #<num>` | — |
| Merge | Squash uniquement | Titre final : `feat: … (#N)` |

---

## 14. Portes de qualité

```mermaid
flowchart LR
    E[Édition] -->|hook PostToolUse| TC1[type-check]
    TC1 --> FIN[Fin de tour agent]
    FIN -->|hook Stop| L1[lint + type-check]
    L1 --> PR[Avant PR :<br/>lint + type-check + build]
    PR --> CI[CI GitHub<br/>job test]
    CI --> RV[VERDICT: APPROVED]
    RV --> QG[QA: GO]
    QG --> HU[Accord humain]
    HU --> M[Merge squash]
```

| # | Porte | Automatique ? | Bloquante ? | Où |
|---|---|---|---|---|
| 1 | Type-check à chaque édition | ✅ hook | Signal | `.claude/settings.json` |
| 2 | Lint + type-check en fin de tour | ✅ hook | Signal | `.claude/settings.json` |
| 3 | Lint + type-check + build locaux | Manuel (dev) | ✅ | Avant `gh pr create` |
| 4 | CI `test` (lint, type-check, build) | ✅ GitHub Actions | ✅ ruleset | `.github/workflows/ci.yml` |
| 5 | Review | Agent | ✅ | Commentaire PR |
| 6 | QA | Agent | ✅ | Commentaire issue + PR |
| 7 | Accord humain | — | ✅ | Chat / PR |

> Le build CI ne nécessite aucun secret : les pages qui lisent Supabase sont en `force-dynamic` et
> `createServerClient()` renvoie `null` si l'environnement manque.

---

## 15. Incidents et hotfix

```mermaid
flowchart TD
    P([🔥 Prod cassée]) --> S{Gravité}
    S -- "Bloquant<br/>(page blanche, fuite)" --> RB[Vercel : Instant Rollback<br/>vers le déploiement précédent]
    RB --> FIX
    S -- "Non bloquant" --> ISS[Issue fix + priority: p1]
    ISS --> FIX[Branche fix/&lt;num&gt;-slug]
    FIX --> PIPE[Pipeline normal :<br/>review → QA → accord → squash]
    PIPE --> V[Vérif prod]
```

Règles :

- Le QA **signale immédiatement** à l'humain ; aucun rollback automatique par un agent.
- Un hotfix suit le même pipeline (les portes ne sautent pas, elles vont juste vite).
- **Fuite de secret** : révoquer/regénérer la clé dans Supabase/Mapbox **d'abord**, puis mettre à jour
  `.env.local` et Vercel, puis nettoyer le code. Supprimer un commit ne suffit pas.

---

## 16. Aide-mémoire des commandes

### Slash commands (Claude Code)

| Commande | Effet |
|---|---|
| `/new-story <besoin>` | Le `product-owner` crée l'issue US |
| `/pick-next [num]` | Le `developer` développe jusqu'à la PR |
| `/review-pr <num>` | Le `reviewer` poste sa review + verdict |
| `/run-sprint [num]` | Pipeline complet dev → review → QA, puis **stop** avant merge |

### Développement

```bash
npm run dev
```

```bash
npm run lint && npm run type-check && npm run build
```

```bash
npm run import:openagenda
```

### GitHub

```bash
gh issue list --label "status: ready" --json number,title,labels
```

```bash
gh pr create --title "feat: ..." --body "Closes #<num>"
```

```bash
gh pr checks <num>
```

```bash
gh pr merge <num> --squash --delete-branch
```

```bash
gh project item-list 1 --owner mehdisebei-debug --format json
```

### Variables d'environnement (`.env.local`, jamais commité)

| Variable | Portée |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + serveur |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + serveur |
| `SUPABASE_SERVICE_ROLE_KEY` | **Serveur / scripts uniquement** |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Client |
| `GOOGLE_PLACES_API_KEY` | Scripts d'import uniquement |
| `ADMIN_PASSWORD` | Serveur (middleware admin) — ⚠️ absente de `.env.local.example`, à y ajouter |

Modèle : `.env.local.example`.

---

## 17. Limites connues et évolutions

Écarts constatés entre la cible (`CLAUDE.md`) et l'état actuel du dépôt :

| Sujet | État actuel | Évolution prévue |
|---|---|---|
| Tests automatisés | Aucun framework ; QA manuelle documentée | Vitest (+ e2e) → bump MINOR de la constitution, QA exige un test par critère |
| Client Supabase navigateur | Seul `lib/supabase/server.ts` existe | Ajouter `lib/supabase/client.ts` à la 1re feature client authentifiée |
| State management | Zustand / TanStack Query pas encore installés | À installer avec accord humain quand les filtres seront branchés |
| Auth parents | Supabase Auth non branché (seul l'admin a un mot de passe) | US « profil + favoris » |
| Migrations | SQL versionné dans `scripts/sql/`, appliqué à la main | Passer à `supabase/migrations` + `supabase db push` |
| Previews | Pas de vérification systématique des Preview Deployments Vercel | Ajouter l'URL de preview au rapport QA |
| Mobile natif | Hors MVP | React Native + Expo après le MVP web |

---

*Dernière mise à jour : 2026-11-01 — à maintenir à chaque changement de workflow (PR `chore:`).*
