# Research: Espace admin de revue des brouillons

Toutes les inconnues du Technical Context sont résolues ci-dessous. Aucune ne reste
« NEEDS CLARIFICATION ».

## R1. Publication atomique et sans doublon

- **Decision** : fonction PostgreSQL `publish_activity_draft(p_draft_id uuid)` appelée par
  `supabase.rpc()` depuis une Server Action. Elle verrouille la ligne
  (`SELECT … FOR UPDATE`), vérifie `status = 'a_valider'`, insère dans `activities`, puis met à jour
  le brouillon (`status = 'publie'`, `published_activity_id`). Tout se passe dans la même
  transaction implicite de la fonction.
- **Rationale** : supabase-js n'offre pas de transaction multi-requêtes côté client. Deux appels
  séparés (INSERT puis UPDATE) pourraient laisser une activité publiée avec un brouillon resté
  `a_valider`. Le verrou empêche deux onglets de publier deux fois (edge case de la spec). Les
  contraintes `NOT NULL` et `UNIQUE (source_url)` de `activities`, déjà testées dans #13, font
  office de garde-fou final.
- **Sécurité** : par défaut, PostgreSQL accorde `EXECUTE` à `PUBLIC`. Les rôles `anon` et
  `authenticated` pourraient donc appeler la fonction via `/rest/v1/rpc`. Le script fait
  `REVOKE EXECUTE … FROM PUBLIC, anon, authenticated` et `GRANT EXECUTE … TO service_role`. La
  fonction reste en `SECURITY INVOKER` avec `SET search_path = public`.
- **Alternatives considérées** : deux requêtes supabase-js (pas atomique) ; un trigger sur
  `status` (logique cachée, difficile à déboguer) ; une Edge Function (infrastructure en plus,
  inutile pour un seul admin).

## R2. Géocodage de l'adresse (Clarification Q2 : calcul automatique, puis confirmation)

- **Decision** : API publique de géocodage de la Géoplateforme (IGN), qui a succédé à
  `api-adresse.data.gouv.fr`. Requête :
  `GET https://data.geopf.fr/geocodage/search?q=<adresse>&limit=1`, appelée par `fetch` dans la
  Server Action `geocodeDraft`. On retient `geometry.coordinates` ([lng, lat]),
  `properties.label` et `properties.score`.
  - Score ≥ 0,7 : proposition affichée avec l'adresse reconnue, que l'admin confirme ou refuse.
  - Score < 0,7 ou aucun résultat : message « adresse introuvable ou ambiguë », rien n'est proposé.
- **Rationale** : aucune clé ni compte nécessaire. Les données sont ouvertes, donc on peut stocker
  les coordonnées. La couverture est très bonne pour l'Île-de-France. Aucune nouvelle dépendance :
  un simple `fetch`. Essai réel le 2026-11-24 : « 25 rue Desnouettes 75015 Paris » donne
  [2.290697, 48.835967], score 0,98, type `housenumber`.
- **Alternatives considérées** :
  - *Mapbox Geocoding* (token déjà présent) : rejeté. Le mode temporaire interdit de stocker les
    résultats, et le mode `permanent=true` demande une facturation dédiée.
    Source : <https://docs.mapbox.com/api/search/geocoding/>, section « Storing geocoding results ».
    C'est un écart avec l'hypothèse initiale de la spec, qui est mise à jour.
  - *Nominatim (OpenStreetMap)* : la politique d'usage limite les appels et exige un User-Agent
    identifiant, et la qualité est moindre sur les numéros de rue français.
  - *Saisie manuelle* : hors périmètre v1 (Clarification Q2).

## R3. Calcul des champs manquants

- **Decision** : une fonction pure `computeMissingFields(draft)` dans `lib/utils/draft.ts`,
  appelée par `saveDraft` et par la confirmation du géocodage. Elle réécrit la colonne
  `missing_fields`. La liste `REQUIRED_FOR_PUBLISH` est la source unique des champs obligatoires :
  `name, category, age_min, age_max, price_min, price_max, address, lat, lng`.
- **Rationale** : `missing_fields` est rempli par l'assistant d'ingestion au moment de l'insertion ;
  après une modification par l'admin, il doit refléter l'état réel (FR-014). La même liste sert à
  l'affichage avant publication, ce qui permet un message clair avant même l'appel SQL (FR-010).
- **Alternatives considérées** : une colonne générée en SQL (impossible de lister des noms de
  champs simplement) ; un calcul à l'affichage seulement (la colonne en base deviendrait fausse).

## R4. Rendu et mutations dans Next.js 14 (spécifique à Next.js)

- **Decision** : pages en Server Components async (`export const dynamic = 'force-dynamic'`) ;
  mutations par Server Actions dans `app/admin/brouillons/actions.ts`, chacune commence par
  `requireAdmin()` puis appelle `revalidatePath('/admin/brouillons')` et le chemin du détail.
  Les composants interactifs (formulaire, confirmation, géocodage) sont des Client Components qui
  appellent les actions avec `useTransition` pour l'état de chargement.
- **Rationale** : c'est le patron déjà validé dans `app/admin/events`. Pas de route API à créer.
  La clé `service_role` ne quitte jamais le serveur. *Différence avec React pur* : une Server
  Action est une fonction serveur appelée comme une fonction normale depuis un composant client,
  et Next.js génère l'appel réseau à ta place.
- **Alternatives considérées** : Route Handlers (`app/api/...`), plus de code pour le même
  résultat ; TanStack Query, inutile ici puisque les données sont chargées côté serveur.

## R5. Images des brouillons

- **Decision** : `<Image>` de Next.js avec `unoptimized`, `width` et `height` fixes (vignettes) ;
  aucun changement de `next.config.mjs`.
- **Rationale** : les URLs viennent de domaines arbitraires (sites des organisateurs).
  `unoptimized` évite de déclarer chaque domaine dans `remotePatterns`, tout en respectant la règle
  « toujours `<Image>` ». L'admin a seulement besoin d'un aperçu.
- **Alternatives considérées** : `remotePatterns: [{ hostname: '**' }]` (ouvre l'optimiseur à
  n'importe quel domaine, ce qui crée un risque d'abus) ; `<img>` (interdit par la constitution).

## R6. Saisie des âges dans le formulaire

- **Decision** : champs numériques en **mois**, avec à côté le libellé lisible calculé en direct
  (« 36 mois = dès 3 ans »). Le libellé est produit par un nouveau helper
  `ageLabel(min, max | null)` dans `lib/utils/format.ts`, qui gère l'âge maximum absent.
- **Rationale** : principe II, aucune conversion années → mois dans l'interface admin, donc aucun
  risque de double conversion. L'admin est le développeur et connaît l'unité.
  `ageRangeLabel` existant n'accepte pas `null` pour le maximum.
- **Alternatives considérées** : saisie en années (perte de précision pour 18 mois et conversion à
  risque) ; sélecteur de tranches prédéfinies (moins flexible que la saisie libre).

## R7. Affichage des prix inconnus

- **Decision** : nouveau helper `priceLabelOrUnknown(min | null, max | null)`, qui renvoie
  « non renseigné » si l'une des deux valeurs est nulle, sinon délègue à `priceLabel`.
- **Rationale** : FR-008 (« null ≠ gratuit ») ; `priceLabel` existant affiche « Gratuit » pour 0
  et n'accepte pas `null`.

## R8. Rejet et motif

- **Decision** : `UPDATE activities_drafts SET status = 'rejete', review_notes = <motif>` avec
  `WHERE id = … AND status = 'a_valider'`. Si aucune ligne n'est touchée, on renvoie « déjà
  traité ».
- **Rationale** : la colonne `review_notes` existe déjà ; le filtre sur le statut empêche de
  rejeter un brouillon déjà publié (FR-013).

## R9. Compteur dans la navigation admin (FR-017)

- **Decision** : `select('id', { count: 'exact', head: true }).eq('status', 'a_valider')` dans
  `app/admin/layout.tsx`, qui devient un Server Component async. Le layout enveloppe aussi
  `/admin/login`, donc la requête n'est faite que si la session admin est valide : un visiteur ne
  doit pas voir le nombre de brouillons. En cas d'erreur, le compteur est masqué, mais la
  navigation reste affichée.
- **Rationale** : une requête légère qui ne ramène pas les lignes ; le layout reste fonctionnel
  si la base est indisponible (principe III).
