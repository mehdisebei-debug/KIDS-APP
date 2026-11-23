# Data Model: Espace admin de revue des brouillons

Aucune colonne n'est ajoutée : la feature s'appuie sur les tables créées dans #13
(`scripts/sql/create-activities-tables.sql`). Seule une fonction SQL est ajoutée
(voir [contracts/sql-publish.md](./contracts/sql-publish.md)).

## Entité `ActivityDraft` (table `activities_drafts`)

Type TypeScript à créer dans `lib/types/draft.ts`. Les noms de champs sont identiques aux colonnes.

| Champ | Type | Null ? | Éditable dans l'admin | Requis pour publier |
|---|---|---|---|---|
| id | uuid | non | non | — |
| name | text | non | oui | ✅ |
| description | text | oui | oui | |
| category | `Category` | oui | oui (liste) | ✅ |
| age_min | integer (mois) | oui | oui | ✅ |
| age_max | integer (mois) | oui | oui | ✅ |
| price_min | numeric (€) | oui | oui | ✅ |
| price_max | numeric (€) | oui | oui | ✅ |
| address | text | oui | oui | ✅ |
| city, postal_code, venue_name | text | oui | oui | |
| lat, lng | double | oui | **via géocodage confirmé uniquement** (v1) | ✅ |
| location | geography | oui | non (trigger) | — |
| opening_hours | jsonb `{lun..dim: "HH:MM-HH:MM"}` | oui | oui (7 champs texte) | |
| date_start, date_end | timestamptz | oui | oui | |
| tags | text[] | non (défaut `{}`) | oui (séparés par des virgules) | |
| images | text[] | non (défaut `{}`) | lecture seule (v1) | |
| source | text | non | non | |
| source_url | text unique | oui | non | |
| status | `'a_valider' \| 'publie' \| 'rejete'` | non | via les actions uniquement | — |
| input_type | `'lien' \| 'capture' \| 'legende'` | oui | non | |
| raw_text | text | oui | non (lecture, pour comparer) | |
| missing_fields | text[] | non | recalculé (R3) | — |
| review_notes | text | oui | via le rejet | |
| published_activity_id | uuid → activities.id | oui | non | — |
| created_at, updated_at | timestamptz | — | non | — |

**Dérivés (non stockés)**
- `isEvent` : `category === 'EVENEMENT' || date_start !== null`. Il sert au filtre
  « Activités / Événements » de la file (FR-004).
- `isPast` : `isEvent && (date_end ?? date_start) < maintenant`. Il affiche le badge « date
  passée » (edge case).
- `ageLabel`, `priceLabelOrUnknown` : affichage uniquement (R6, R7).

## Règles de validation (Server Action `saveDraft`)

| Règle | Message |
|---|---|
| `name` non vide après trim | « Le nom est obligatoire » |
| `category` ∈ les 6 valeurs ou vide | « Catégorie invalide » |
| `age_min`, `age_max` entiers ≥ 0, `age_max` ≤ 216 | « Âge invalide (en mois, 0 à 216) » |
| `age_min ≤ age_max` si les deux sont renseignés | « L'âge minimum dépasse l'âge maximum » |
| `price_min`, `price_max` ≥ 0 ; `min ≤ max` si les deux sont renseignés | « Prix invalide » |
| `date_end ≥ date_start` si les deux sont renseignés | « La date de fin précède la date de début » |
| `opening_hours` : clés ∈ {lun…dim}, valeurs non vides | jours vides ignorés |
| Brouillon toujours `a_valider` (filtre `WHERE status = 'a_valider'`) | « Ce brouillon a déjà été traité » |

Les mêmes règles existent en base (contraintes `CHECK`) : la validation applicative ne sert qu'à
donner un message clair avant l'erreur SQL.

## Transitions d'état

```text
                 saveDraft / geocodeDraft (confirmé)
                 ┌──────────────┐
                 ▼              │
   [ingestion] → a_valider ─────┘
                    │
        publishDraft│ (tous les champs requis présents,
                    │  source_url absent de activities)
                    ▼
                  publie  ──► crée 1 ligne dans activities (published_activity_id)
                    
   a_valider ── rejectDraft(motif?) ──► rejete (review_notes)
```

- `publie` et `rejete` sont **terminaux** en v1 : aucune action ne s'y applique (FR-013).
- Toute action sur un brouillon qui n'est plus `a_valider` renvoie « déjà traité » et ne modifie
  rien.

## Correspondance brouillon → activité publiée

C'est la même liste de colonnes que la requête de publication de l'Étape 1 :
`name, description, category, age_min, age_max, price_min, price_max, address, city, postal_code,
venue_name, lat, lng, opening_hours (COALESCE '{}'), date_start, date_end, tags, images, source,
source_url`.

Les colonnes `avg_rating`, `reviews_count`, `verified` et `created_at` de `activities` gardent
leurs valeurs par défaut.
