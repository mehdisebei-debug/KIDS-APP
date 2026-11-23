---

description: "Liste des tâches : espace admin de revue des brouillons"
---

# Tasks: Espace admin de revue des activités et événements à vérifier

**Input**: Documents de conception de `/specs/003-admin-revue-brouillons/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: aucune tâche de test automatisé. La spec n'en demande pas, et la constitution indique
qu'aucun framework de test n'est installé. Chaque phase se termine par les scénarios manuels de
[quickstart.md](./quickstart.md).

**Organization**: tâches groupées par user story ; chaque story est livrable et testable seule.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichier différent, aucune dépendance vers une tâche non terminée)
- **[Story]** : user story de rattachement (US1 à US4)
- Chemins relatifs à la racine du dépôt (projet Next.js unique, voir plan.md)

**Conventions à respecter dans chaque tâche** (CLAUDE.md et constitution) :
- commentaires en français, identifiants en anglais ;
- composants en `export default` avec props typées par une `interface` ;
- `async/await` uniquement ; pas de `any` ; `<Image>` de Next.js, jamais `<img>` ;
- Tailwind mobile-first (base = mobile, puis `md:` et `lg:`) ;
- âges en mois, conversion lisible uniquement à l'affichage ;
- états chargement, erreur et vide toujours traités.

---

## Phase 1: Setup (infrastructure partagée)

**Purpose**: types et authentification partagés, sans effet visible.

- [ ] T001 [P] Créer `lib/types/draft.ts` : `DraftStatus = 'a_valider' | 'publie' | 'rejete'`,
  `InputType = 'lien' | 'capture' | 'legende'`, `interface ActivityDraft` reprenant exactement les
  colonnes de `activities_drafts` (voir data-model.md : champs nullables typés `| null`, `tags` et
  `images` en `string[]`, `opening_hours: Record<string, string> | null`, `category: Category | null`
  importé de `lib/types/activity.ts`), `interface DraftFormPayload` (champs éditables uniquement :
  name, description, category, age_min, age_max, price_min, price_max, address, city, postal_code,
  venue_name, opening_hours, date_start, date_end, tags) et `interface GeocodeProposal { lat: number;
  lng: number; label: string; score: number }`
- [ ] T002 [P] Créer `lib/admin-auth.ts` : y déplacer `requireAdmin()` et l'interface
  `ActionResult` depuis `app/admin/events/actions.ts`, en rendant `ActionResult` générique
  (`ActionResult<T = undefined> { ok: boolean; message: string; data?: T }`) ; le message de refus
  reste « Session admin invalide — reconnecte-toi. »
- [ ] T003 Mettre à jour `app/admin/events/actions.ts` pour importer `requireAdmin` et
  `ActionResult` depuis `lib/admin-auth.ts` (aucun changement de comportement ; vérifier que
  `/admin/events` fonctionne toujours)

---

## Phase 2: Foundational (prérequis bloquants)

**Purpose**: helpers purs utilisés par toutes les stories.

**⚠️ CRITICAL**: aucune story ne commence avant la fin de cette phase.

- [ ] T004 [P] Ajouter dans `lib/utils/format.ts` :
  `ageLabel(ageMinMonths: number | null, ageMaxMonths: number | null): string` (« dès 3 ans » si
  le max est null, « jusqu'à 4 ans » si le min est null, « âge non renseigné » si les deux sont
  null, sinon réutilise `ageRangeLabel`) et
  `priceLabelOrUnknown(priceMin: number | null, priceMax: number | null): string` (« non
  renseigné » si l'un est null, sinon `priceLabel`). R6 et R7 : un prix absent ne doit jamais
  afficher « Gratuit ».
- [ ] T005 [P] Créer `lib/utils/draft.ts` :
  `REQUIRED_FOR_PUBLISH = ['name','category','age_min','age_max','price_min','price_max','address','lat','lng'] as const`,
  `computeMissingFields(draft): string[]` (renvoie les champs de `REQUIRED_FOR_PUBLISH` qui sont
  null ou vides, plus les champs facultatifs vides suivis par l'ingestion : description,
  opening_hours, date_start, date_end, source_url),
  `missingRequiredFields(draft): string[]` (sous-ensemble requis),
  `isEvent(draft)` = `category === 'EVENEMENT' || date_start !== null`,
  `isPast(draft)` = `isEvent && (date_end ?? date_start) < now`, et
  `FIELD_LABELS: Record<string, string>` (libellés français des champs pour l'UI)

**Checkpoint**: fondations prêtes, les stories peuvent démarrer.

---

## Phase 3: User Story 1 - Voir la file des éléments à vérifier (Priority: P1) 🎯 MVP

**Goal**: `/admin/brouillons` liste les brouillons `a_valider`, avec filtre et compteur dans la nav.

**Independent Test**: avec 3 brouillons `a_valider` et 1 `rejete`, seuls les 3 apparaissent, du
plus récent au plus ancien (quickstart V1 à V4).

- [ ] T006 [US1] Créer `app/admin/brouillons/page.tsx` (Server Component async,
  `export const dynamic = 'force-dynamic'`) : `createServerClient()` ; si `null`, encadré ambre
  identique à `app/admin/events/page.tsx` ; requête
  `from('activities_drafts').select('id,name,category,city,age_min,age_max,date_start,date_end,source,created_at,missing_fields', { count: 'exact' }).eq('status','a_valider').order('created_at', { ascending: false }).range(...)`
  avec 50 éléments par page via `searchParams.page` ; filtre `searchParams.type` ∈
  `tous | activites | evenements` (défaut `tous`), appliqué côté serveur
  (`evenements` = `category.eq.EVENEMENT,date_start.not.is.null` via `.or()`, `activites` = négation) ;
  en cas d'erreur, encadré rouge avec `error.message` ; passe les lignes à `DraftList`
- [ ] T007 [P] [US1] Créer `app/admin/brouillons/DraftList.tsx` (Server Component, props
  `interface DraftListProps { drafts: ActivityDraft[]; type: string; page: number; total: number }`) :
  onglets de filtre (liens `?type=`) ; état vide « Aucun brouillon à vérifier 🎉 » avec le rappel
  « Ajoute des activités via le Projet Claude « Ajout activités app-kids » » ; sur mobile, cartes
  empilées ; à partir de `md:`, tableau ; chaque élément affiche le nom, l'emoji et le libellé de
  `CATEGORY_LABELS`, la ville, `ageLabel()`, la date (`eventDateRangeLabel`) si `isEvent`, un badge
  « date passée » si `isPast`, la source, la date d'ajout (fr-FR) et un badge « N champs manquants »
  à partir de `missingRequiredFields` ; lien vers `/admin/brouillons/[id]` ; pagination
  précédent/suivant si total > 50 ; cibles tactiles d'au moins 44 px
- [ ] T008 [US1] Modifier `app/admin/layout.tsx` : le passer en Server Component async ; ajouter
  une navigation « Événements » (`/admin/events`) et « Brouillons (N) » (`/admin/brouillons`) ;
  ne calculer N (`select('id', { count: 'exact', head: true }).eq('status','a_valider')`) **que si**
  la session admin est valide (`verifySessionToken` sur le cookie, comme dans `lib/admin-auth.ts`),
  pour ne rien révéler sur `/admin/login` ; masquer N en cas d'erreur sans casser le layout ;
  nav lisible à 375 px
- [ ] T009 [US1] Dérouler les scénarios V1 à V4 de `specs/003-admin-revue-brouillons/quickstart.md`
  et noter le résultat dans la PR

**Checkpoint**: la file est consultable. Cette story est livrable seule (MVP).

---

## Phase 4: User Story 2 - Examiner le détail d'un élément (Priority: P1)

**Goal**: `/admin/brouillons/[id]` affiche tous les champs, la source et les manques, en lecture.

**Independent Test**: ouvrir un brouillon connu : chaque champ est affiché, le lien d'origine
s'ouvre, les manques sont signalés (quickstart V5).

- [ ] T010 [P] [US2] Créer `app/admin/brouillons/[id]/not-found.tsx` : message « Brouillon
  introuvable » et lien retour vers `/admin/brouillons`
- [ ] T011 [US2] Créer `app/admin/brouillons/[id]/page.tsx` (Server Component async,
  `force-dynamic`) : valider que `params.id` est un UUID, sinon `notFound()` ; lire la ligne
  complète (`select('*').eq('id', id).maybeSingle()`) ; si absente, `notFound()` ; gérer Supabase
  non configuré et l'erreur de lecture comme T006 ; si le statut est `publie` ou `rejete`, afficher
  le bandeau « Déjà traité (statut) » avec `review_notes` le cas échéant, sans actions ; afficher
  l'en-tête (nom, statut, source, lien `source_url` en `target="_blank" rel="noopener noreferrer"`
  ou « Pas de lien d'origine (capture ou légende) », `input_type`, date d'ajout) ; le bloc
  « Champs manquants » (libellés `FIELD_LABELS`, requis en rouge, facultatifs en gris) ; les
  champs en lecture : description, `ageLabel()` avec la valeur brute en mois, `priceLabelOrUnknown()`,
  adresse complète (`eventVenueLabel`), coordonnées ou « non renseignées », horaires par jour,
  dates (`eventDateRangeLabel`), tags ; le bloc repliable « Texte source » (`raw_text` dans un
  `<details>`) ; lien retour vers la file
- [ ] T012 [P] [US2] Créer `app/admin/brouillons/[id]/DraftImages.tsx` : vignettes des `images`
  avec `<Image unoptimized width={160} height={120} alt=... />` de `next/image`, défilement
  horizontal **interne** au bloc (pas de la page) ; rien n'est rendu si la liste est vide ; brancher
  dans T011
- [ ] T013 [US2] Dérouler le scénario V5 du quickstart

**Checkpoint**: la file et le détail fonctionnent ensemble.

---

## Phase 5: User Story 3 - Publier ou rejeter un élément (Priority: P1)

**Goal**: publier (atomique, sans doublon) ou rejeter (avec motif) depuis le détail.

**Independent Test**: publier `[TEST] Atelier complet` : il est lisible avec la clé anon dans
`activities` et sort de la file ; rejeter `[TEST] À rejeter` : il sort de la file
(quickstart V10 à V15).

- [ ] T014 [US3] Créer `scripts/sql/create-publish-draft-function.sql` selon
  `contracts/sql-publish.md` : `CREATE OR REPLACE FUNCTION publish_activity_draft(p_draft_id uuid)
  RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = public` ; `SELECT … FOR UPDATE` ;
  `RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'DRAFT_NOT_FOUND'` ;
  `RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'DRAFT_ALREADY_PROCESSED'` si le statut est
  différent de `'a_valider'` ; INSERT dans `activities` avec exactement les colonnes de
  data-model.md (« Correspondance brouillon → activité publiée », `COALESCE(opening_hours, '{}')`) ;
  UPDATE `status = 'publie', published_activity_id` ; `RETURN` de l'id ; puis
  `REVOKE EXECUTE ON FUNCTION publish_activity_draft(uuid) FROM PUBLIC, anon, authenticated;` et
  `GRANT EXECUTE ON FUNCTION publish_activity_draft(uuid) TO service_role;` ; en-tête de commentaire
  en français (exécution manuelle, ré-exécutable)
- [ ] T015 [US3] **Manuel (humain)** : exécuter `scripts/sql/create-publish-draft-function.sql`
  dans le SQL Editor Supabase, puis vérifier le scénario V15 (RPC refusée avec la clé anon)
- [ ] T016 [US3] Créer `app/admin/brouillons/actions.ts` (`'use server'`) avec
  `publishDraft(id: string): Promise<ActionResult<{ activityId: string }>>` : `requireAdmin()` ;
  client `null` → « Supabase non configuré (.env.local) » ; relire le brouillon et, si
  `missingRequiredFields` n'est pas vide, renvoyer « Champs obligatoires manquants : <libellés> »
  sans appeler SQL ; sinon `supabase.rpc('publish_activity_draft', { p_draft_id: id })` ;
  correspondance des erreurs : `P0002` → « Brouillon introuvable », message
  `DRAFT_ALREADY_PROCESSED` → « Ce brouillon a déjà été traité », `23505` → « Une activité publiée
  a déjà ce lien d'origine », `23502` → « Champ obligatoire manquant : <colonne> », sinon
  `Erreur Supabase : <message>` ; en cas de succès, « Activité publiée ✅ » et `revalidatePath` de
  `/admin/brouillons`, `/admin/brouillons/[id]`, `/` et `/liste` ; ne jamais lever d'exception vers
  le client
- [ ] T017 [US3] Ajouter dans `app/admin/brouillons/actions.ts`
  `rejectDraft(id: string, reason: string | null): Promise<ActionResult>` : motif nettoyé (trim),
  « 500 caractères maximum », `null` si vide ;
  `update({ status: 'rejete', review_notes }).eq('id', id).eq('status', 'a_valider').select('id')` ;
  0 ligne → « Ce brouillon a déjà été traité » ; succès → « Brouillon rejeté » et `revalidatePath`
  de la file et du détail
- [ ] T018 [US3] Créer `app/admin/brouillons/[id]/DecisionBar.tsx` (`'use client'`, props
  `interface DecisionBarProps { draftId: string; missingRequired: string[] }`) : bouton
  « Publier » désactivé tant que `missingRequired` n'est pas vide, avec la liste affichée sous le
  bouton ; confirmation explicite avant publication (FR-011 : boîte de confirmation intégrée, pas
  `window.confirm`) ; bouton « Rejeter » qui ouvre un champ de motif facultatif (`maxLength={500}`)
  puis valide ; `useTransition` pour l'état de chargement (boutons désactivés pendant l'appel) ;
  message de l'`ActionResult` affiché ; après succès, `router.push('/admin/brouillons')` ; barre
  fixée en bas sur mobile (`fixed bottom-0 inset-x-0`, `md:static`), avec un padding bas de page
  compensatoire
- [ ] T019 [US3] Brancher `DecisionBar` dans `app/admin/brouillons/[id]/page.tsx` (uniquement si le
  statut est `a_valider`), avec `missingRequired = missingRequiredFields(draft)`
- [ ] T020 [US3] Dérouler les scénarios V10 à V15 du quickstart avec des brouillons `[TEST]`, puis le
  nettoyage (avec accord humain explicite avant tout `DELETE`)

**Checkpoint**: le cycle complet (voir, examiner, décider) fonctionne pour les brouillons complets.

---

## Phase 6: User Story 4 - Compléter les champs manquants avant publication (Priority: P2)

**Goal**: éditer un brouillon et obtenir ses coordonnées par géocodage confirmé.

**Independent Test**: sur Rêvopolie (sans coordonnées), calculer, confirmer, enregistrer : le
bouton Publier s'active (quickstart V6 à V9).

- [ ] T021 [US4] Ajouter dans `app/admin/brouillons/actions.ts`
  `saveDraft(id: string, payload: DraftFormPayload): Promise<ActionResult>` avec les règles de
  data-model.md et leurs messages exacts : « Le nom est obligatoire » ; « Catégorie invalide » ;
  « Âge invalide (en mois, 0 à 216) » (entiers ≥ 0, max ≤ 216) ; « L'âge minimum dépasse l'âge
  maximum » ; « Prix invalide » (≥ 0, min ≤ max) ; « La date de fin précède la date de début » ;
  jours d'horaires vides ignorés (clés ∈ lun…dim) ; tags séparés par des virgules, nettoyés,
  vides retirés ; `update({...champs éditables, missing_fields: computeMissingFields(merged)})
  .eq('id', id).eq('status','a_valider').select('id')` ; 0 ligne → « Ce brouillon a déjà été
  traité » ; ne modifie **jamais** `lat`, `lng`, `status`, `source`, `source_url`, `images`,
  `raw_text` ; succès → « Brouillon enregistré ✅ » et `revalidatePath`
- [ ] T022 [US4] Ajouter dans `app/admin/brouillons/actions.ts`
  `geocodeDraft(id: string): Promise<ActionResult<GeocodeProposal>>` : lire l'adresse du brouillon
  et la composer avec `eventVenueLabel` sans `venue_name` ; pas d'adresse → « Renseigne d'abord
  l'adresse » ; `fetch('https://data.geopf.fr/geocodage/search?q=' + encodeURIComponent(q) + '&limit=1',
  { signal: AbortSignal.timeout(8000), cache: 'no-store' })` ; résultat absent ou
  `properties.score < 0.7` → « Adresse introuvable ou ambiguë » ; erreur réseau ou timeout →
  « Service de géocodage indisponible, réessaie plus tard » ; succès →
  `data = { lng: coordinates[0], lat: coordinates[1], label, score }` et le message « Adresse
  reconnue : <label> » ; **n'écrit rien en base** ; typer la réponse JSON en `unknown`, puis la
  valider avant usage (pas de `any`)
- [ ] T023 [US4] Ajouter dans `app/admin/brouillons/actions.ts`
  `confirmGeocode(id: string, lat: number, lng: number): Promise<ActionResult>` : refuser si les
  valeurs ne sont pas des nombres finis ou sortent de la boîte « lat 41–51.5, lng −5.5–10 » ;
  relire le brouillon, puis
  `update({ lat, lng, missing_fields: computeMissingFields({...draft, lat, lng}) }).eq('id', id).eq('status','a_valider')` ;
  succès → « Coordonnées enregistrées ✅ » et `revalidatePath`
- [ ] T024 [P] [US4] Créer `app/admin/brouillons/[id]/GeocodeButton.tsx` (`'use client'`, props
  `interface GeocodeButtonProps { draftId: string; lat: number | null; lng: number | null; hasAddress: boolean }`) :
  affiche les coordonnées actuelles ou « non renseignées » ; le bouton « Calculer depuis
  l'adresse » appelle `geocodeDraft` ; il affiche la proposition (adresse reconnue, lat/lng arrondis
  à 5 décimales, score) avec « Confirmer » (appelle `confirmGeocode`) et « Refuser » (efface la
  proposition sans appel serveur) ; affiche les messages d'erreur ; `useTransition` ; désactivé si
  `hasAddress` est faux
- [ ] T025 [P] [US4] Créer `app/admin/brouillons/[id]/DraftForm.tsx` (`'use client'`, props
  `interface DraftFormProps { draft: ActivityDraft; missingRequired: string[] }`) : formulaire en
  une colonne (deux à partir de `md:`) pour les champs de `DraftFormPayload` ; catégorie en
  `<select>` (6 valeurs et « — ») ; âges en **mois** (`type="number" min=0 max=216 step=1`) avec à
  côté le libellé `ageLabel()` recalculé en direct ; prix en euros (`step=0.01 min=0`) ;
  `datetime-local` pour les dates, converties en ISO avec le fuseau Europe/Paris à l'envoi ;
  7 champs d'horaires (lun…dim) ; tags en texte séparé par des virgules ; champs requis manquants
  surlignés (bordure rouge et libellé « manquant ») ; bouton « Enregistrer » qui appelle `saveDraft`
  avec `useTransition` ; message de résultat affiché ; `router.refresh()` après succès
- [ ] T026 [US4] Brancher `DraftForm` et `GeocodeButton` dans `app/admin/brouillons/[id]/page.tsx`
  à la place des champs en lecture, uniquement si le statut est `a_valider` (les brouillons traités
  restent en lecture seule, voir T011)
- [ ] T027 [US4] Dérouler les scénarios V6 à V9 du quickstart, puis vérifier que Rêvopolie devient
  publiable (bouton Publier actif, sans publier si ce n'est pas souhaité)

**Checkpoint**: toutes les stories fonctionnent ; les brouillons incomplets sont publiables
depuis l'interface.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T028 [P] Vérifier à 375 px (outils de dev) la file, le détail, le formulaire et la barre de
  décision : aucun défilement horizontal de la page, cibles d'au moins 44 px (SC-005)
- [ ] T029 [P] Dérouler le scénario V16 (réseau coupé) : messages d'erreur lisibles, pas de page
  blanche, layout admin toujours navigable
- [ ] T030 [P] Mettre à jour `README.md` (section admin) : nouvelle route `/admin/brouillons` et
  exécution préalable de `scripts/sql/create-publish-draft-function.sql`
- [ ] T031 Lancer `npm run lint && npm run type-check && npm run build`, tout doit être vert
- [ ] T032 Dérouler l'intégralité de `specs/003-admin-revue-brouillons/quickstart.md` (V1 à V16)
  et joindre le résultat à la PR (preuve pour le QA)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance. T003 dépend de T002.
- **Foundational (Phase 2)** : après le Setup (T004 et T005 utilisent les types de T001).
- **US1 (Phase 3)** : après la Phase 2.
- **US2 (Phase 4)** : après la Phase 2. Le lien depuis la file suppose US1, mais la page de détail
  se teste seule par son URL.
- **US3 (Phase 5)** : après US2 (la barre de décision vit dans la page de détail). T015 (humain)
  doit précéder T020.
- **US4 (Phase 6)** : après US2. Elle peut se faire en parallèle de US3, sauf T021 à T023 et T016
  et T017, qui partagent `actions.ts` (à faire l'un après l'autre).
- **Polish (Phase 7)** : après les stories retenues.
- **Dépendance externe** : idéalement après les issues #16 et #17 (ajustement du schéma). Si #17
  modifie des colonnes, mettre à jour T001, T005, T014 et data-model.md avant l'implémentation.

### User Story Dependencies

```text
Setup → Foundational → US1 ─┐
                     └→ US2 ─┼→ US3 (publier / rejeter)
                             └→ US4 (compléter)  → Polish
```

### Within Each User Story

- Actions serveur avant les composants clients qui les appellent.
- Composants avant leur branchement dans `page.tsx`.
- Scénarios du quickstart en dernier.

### Parallel Opportunities

- Phase 1 : T001 et T002 en parallèle.
- Phase 2 : T004 et T005 en parallèle.
- US1 : T007 (`DraftList.tsx`) en parallèle de T006 dès que les props sont convenues.
- US2 : T010 et T012 en parallèle de T011.
- US4 : T024 et T025 en parallèle (fichiers distincts) une fois T021 à T023 écrites.
- Polish : T028, T029 et T030 en parallèle.

---

## Parallel Example: User Story 4

```bash
# Après T021 à T023 (actions.ts), lancer ensemble :
Task: "T024 [US4] GeocodeButton.tsx dans app/admin/brouillons/[id]/"
Task: "T025 [US4] DraftForm.tsx dans app/admin/brouillons/[id]/"
```

---

## Implementation Strategy

### MVP First (User Story 1 seule)

1. Phase 1 et Phase 2.
2. Phase 3 (US1) : la file est visible, on sait ce qui attend.
3. **Stop et validation** avec les scénarios V1 à V4, puis une PR.

### Incremental Delivery (une PR par story, workflow du projet)

1. Setup, Foundational et US1 : PR 1 (file).
2. US2 : PR 2 (détail en lecture).
3. US3 : PR 3 (publier et rejeter ; inclut l'exécution manuelle du SQL).
4. US4 : PR 4 (édition et géocodage) ; rend les brouillons réels publiables.
5. Polish dans la dernière PR.

Chaque PR suit le contrat de handoff : issue `type: user-story`, branche `feat/<num>-slug`,
`Closes #<num>`, review, `QA: GO`, puis merge sur validation humaine.

### Notes

- [P] = fichiers différents, sans dépendance ; plusieurs tâches touchent `actions.ts` et
  `[id]/page.tsx`, elles sont donc séquentielles.
- Ne jamais publier ou supprimer les vraies activités pendant les tests : utiliser des brouillons
  `[TEST]`.
- Les issues GitHub peuvent être générées avec `/speckit-taskstoissues`.
