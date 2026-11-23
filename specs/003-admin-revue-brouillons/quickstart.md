# Quickstart : valider l'espace admin de revue

Guide de validation manuelle de bout en bout (aucun framework de test automatisé, conformément à
la constitution). Chaque scénario renvoie aux critères de la [spec](./spec.md).

## Prérequis

1. `.env.local` contient `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` et `ADMIN_PASSWORD`.
2. Le script `scripts/sql/create-publish-draft-function.sql` a été exécuté dans le SQL Editor
   (contrat : [contracts/sql-publish.md](./contracts/sql-publish.md)).
3. Au moins 3 brouillons `a_valider` existent, dont un **sans coordonnées** (Rêvopolie convient).
4. Pour les tests destructifs (publier ou rejeter), créer des brouillons de test dédiés via le
   Projet Claude, par exemple `[TEST] Atelier complet` et `[TEST] À rejeter`, plutôt que d'utiliser
   les vraies activités.

```bash
npm run dev
```

Ouvrir `http://localhost:3000/admin/login` et se connecter.

## Scénarios

| # | Action | Résultat attendu | Spec |
|---|---|---|---|
| V1 | Ouvrir `/admin/brouillons` dans une fenêtre privée, sans session | Redirection vers `/admin/login`, aucun brouillon visible | US1-4, FR-002 |
| V2 | Connecté, ouvrir `/admin/brouillons` | Seuls les brouillons `a_valider` sont listés, du plus récent au plus ancien ; la nav affiche « Brouillons (N) » avec le bon N | US1-1, US1-2, FR-017 |
| V3 | Filtre « Événements » | Seuls les brouillons de catégorie EVENEMENT ou datés restent | FR-004 |
| V4 | Outils de dev en viewport 375 px, file puis détail | Pas de défilement horizontal ; boutons utilisables au pouce | US1-5, SC-005 |
| V5 | Ouvrir un brouillon avec un âge minimum de 36 mois sans maximum, et sans prix | « dès 3 ans » ; prix « non renseigné » ; prix listés dans les champs manquants ; le lien d'origine s'ouvre dans un nouvel onglet | US2-1/2/3, FR-008 |
| V6 | Rêvopolie : « Calculer depuis l'adresse » | Proposition ≈ 48.836, 2.291 avec « 25 Rue Desnouettes 75015 Paris » ; **rien en base** tant qu'on n'a pas confirmé | US4-1 |
| V7 | Refuser la proposition, puis recommencer et confirmer | Refus : coordonnées toujours vides. Confirmation : coordonnées enregistrées, `lat` et `lng` retirés des champs manquants | US4-2, FR-018 |
| V8 | Saisir une adresse fantaisiste (« zzz ») et calculer | « Adresse introuvable ou ambiguë », rien d'enregistré | US4-3 |
| V9 | Âge min 48 et âge max 24, puis Enregistrer | Refus « L'âge minimum dépasse l'âge maximum » | US4-5 |
| V10 | Brouillon de test incomplet : bouton Publier | Désactivé ; la liste des champs manquants est affichée | US3-2, FR-010 |
| V11 | `[TEST] Atelier complet` : Publier puis confirmer | « Activité publiée ✅ » ; disparaît de la file ; N diminue | US3-1, FR-009 |
| V12 | Vérifier en lecture anon (commande ci-dessous) | L'activité de test apparaît dans `activities` ; aucun brouillon n'est lisible | US3-1, FR-015, SC-003 |
| V13 | Deux onglets sur le même brouillon complet : publier dans le premier, puis dans le second | Second onglet : « Ce brouillon a déjà été traité », aucun doublon | Edge case, FR-013 |
| V14 | `[TEST] À rejeter` : Rejeter avec le motif « test » | Sort de la file ; `review_notes = 'test'` | US3-3, FR-012 |
| V15 | Appeler la RPC avec la clé anon (commande ci-dessous) | Refusé (401 ou 403) | Sécurité R1 |
| V16 | Couper le réseau (outils de dev, mode offline) puis recharger la file | Message d'erreur lisible, pas de page blanche | Edge case, FR-016 |

### Commandes de vérification (sans afficher les clés)

```bash
set -a && . ./.env.local && set +a
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/activities?select=name,source_url" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

```bash
curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/activities_drafts?select=id" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/publish_activity_draft" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"p_draft_id":"00000000-0000-0000-0000-000000000000"}'
```

Attendu : la première commande liste l'activité de test, la deuxième renvoie `[]`, la troisième
renvoie `401` ou `403`.

## Nettoyage

Supprimer l'activité de test publiée et les brouillons `[TEST]` dans le SQL Editor (avec ton
accord explicite si c'est l'agent qui le fait) :

```sql
DELETE FROM activities_drafts WHERE name LIKE '[TEST]%';
DELETE FROM activities WHERE name LIKE '[TEST]%';
```

## Portes de qualité

```bash
npm run lint && npm run type-check && npm run build
```
