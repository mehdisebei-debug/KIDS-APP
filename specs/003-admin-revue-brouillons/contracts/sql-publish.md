# Contrat : fonction SQL `publish_activity_draft`

Fichier : `scripts/sql/create-publish-draft-function.sql`. Il est exécuté à la main dans le SQL
Editor, comme les autres scripts du dossier, et doit pouvoir être relancé sans erreur
(`CREATE OR REPLACE`).

## Signature

```text
publish_activity_draft(p_draft_id uuid) RETURNS uuid   -- id de l'activité créée
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
```

## Comportement (une seule transaction)

1. `SELECT … FROM activities_drafts WHERE id = p_draft_id FOR UPDATE` : verrouille la ligne.
2. Si aucune ligne : `RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'DRAFT_NOT_FOUND'`.
3. Si `status <> 'a_valider'` :
   `RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'DRAFT_ALREADY_PROCESSED'`.
4. `INSERT INTO activities (<colonnes de data-model.md>) SELECT … RETURNING id`.
   - Les contraintes `NOT NULL` lèvent `23502` si un champ requis manque.
   - La contrainte `UNIQUE (source_url)` lève `23505` en cas de doublon.
5. `UPDATE activities_drafts SET status = 'publie', published_activity_id = <id> WHERE id = p_draft_id`.
6. `RETURN <id>`.

Toute erreur aux étapes 4 et 5 annule l'ensemble : aucune activité orpheline, aucun brouillon
marqué à tort.

## Droits

```text
REVOKE EXECUTE ON FUNCTION publish_activity_draft(uuid) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION publish_activity_draft(uuid) TO service_role;
```

## Vérifications attendues (quickstart V6 et V7)

| Appel | Résultat attendu |
|---|---|
| Clé anon : `POST /rest/v1/rpc/publish_activity_draft` | refusé (401 ou 403, « permission denied ») |
| `service_role`, brouillon complet | renvoie un uuid ; brouillon `publie` |
| Même appel une seconde fois | `DRAFT_ALREADY_PROCESSED` |
| Brouillon sans `lat` | `23502`, rien n'est créé, brouillon toujours `a_valider` |
