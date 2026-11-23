# Contrat : Server Actions (`app/admin/brouillons/actions.ts`)

Toutes les actions :
1. commencent par `requireAdmin()` (extrait dans `lib/admin-auth.ts`) et renvoient
   `{ ok: false, message: 'Session admin invalide — reconnecte-toi.' }` si la session est absente ;
2. renvoient `{ ok: false, message: 'Supabase non configuré (.env.local)' }` si le client serveur
   est `null` ;
3. ne jettent jamais d'exception vers le client : elles renvoient toujours un `ActionResult` ;
4. en cas de succès, appellent `revalidatePath('/admin/brouillons')` et
   `revalidatePath('/admin/brouillons/' + id)`.

```ts
interface ActionResult<T = undefined> {
  ok: boolean
  message: string
  data?: T
}
```

## `saveDraft(id: string, payload: DraftFormPayload): Promise<ActionResult>`

- Valide le payload (règles de [data-model.md](../data-model.md)).
- `UPDATE activities_drafts SET <champs éditables>, missing_fields = computeMissingFields(...)
  WHERE id = $id AND status = 'a_valider'`.
- Résultats :
  | Cas | ok | message |
  |---|---|---|
  | Succès | true | « Brouillon enregistré ✅ » |
  | Validation échouée | false | message de la règle |
  | 0 ligne modifiée | false | « Ce brouillon a déjà été traité » |
  | Erreur SQL | false | `Erreur Supabase : <message>` |
- Ne modifie jamais `lat`, `lng`, `status`, `source`, `source_url`, `images`, `raw_text`.

## `geocodeDraft(id: string): Promise<ActionResult<GeocodeProposal>>`

```ts
interface GeocodeProposal { lat: number; lng: number; label: string; score: number }
```

- Lit l'adresse du brouillon (`address`, `postal_code`, `city` concaténés sans doublon via la
  logique de `eventVenueLabel`).
- Appelle `https://data.geopf.fr/geocodage/search?q=<adresse encodée>&limit=1` (timeout 8 s).
- **N'écrit rien en base.**
  | Cas | ok | message |
  |---|---|---|
  | Score ≥ 0,7 | true | « Adresse reconnue : <label> » (avec `data`) |
  | Pas d'adresse | false | « Renseigne d'abord l'adresse » |
  | Aucun résultat ou score < 0,7 | false | « Adresse introuvable ou ambiguë » |
  | Erreur réseau ou timeout | false | « Service de géocodage indisponible, réessaie plus tard » |

## `confirmGeocode(id: string, lat: number, lng: number): Promise<ActionResult>`

- Vérifie que les coordonnées sont des nombres finis et qu'elles se trouvent dans une boîte
  englobant la France métropolitaine (lat 41–51.5, lng −5.5–10).
- `UPDATE … SET lat, lng, missing_fields = … WHERE id AND status = 'a_valider'`. Le trigger remplit
  `location`.
- Réussite : « Coordonnées enregistrées ✅ ».

## `publishDraft(id: string): Promise<ActionResult<{ activityId: string }>>`

- Pré-contrôle : relit le brouillon et calcule `computeMissingFields`. S'il manque des champs
  requis, renvoie `{ ok: false, message: 'Champs obligatoires manquants : <liste>' }` sans appeler
  SQL.
- Appelle `supabase.rpc('publish_activity_draft', { p_draft_id: id })`.
- Correspondance des erreurs (voir [sql-publish.md](./sql-publish.md)) :
  | Erreur | message |
  |---|---|
  | `P0002` (introuvable) | « Brouillon introuvable » |
  | `P0001` avec `DRAFT_ALREADY_PROCESSED` | « Ce brouillon a déjà été traité » |
  | `23505` (unique `source_url`) | « Une activité publiée a déjà ce lien d'origine » |
  | `23502` (not null) | « Champ obligatoire manquant : <colonne> » |
  | autre | `Erreur Supabase : <message>` |
- Réussite : « Activité publiée ✅ » ; le client redirige vers la file.
- Revalide aussi `/` et `/liste` en prévision du branchement public.

## `rejectDraft(id: string, reason: string | null): Promise<ActionResult>`

- `reason` : trim, 500 caractères maximum, `null` si vide.
- `UPDATE … SET status = 'rejete', review_notes = $reason WHERE id AND status = 'a_valider'`.
- 0 ligne : « Ce brouillon a déjà été traité ». Réussite : « Brouillon rejeté ».
