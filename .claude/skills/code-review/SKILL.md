---
name: code-review
description: Checklist et méthode de code review pour les PR du projet kids-app - verdict APPROVED ou CHANGES_REQUESTED.
---

# Code review

## Méthode

1. `gh pr view <num>` — lire la description et retrouver l'issue (`Closes #<num>`).
2. `gh issue view <num-issue>` — lire les critères d'acceptation.
3. `gh pr diff <num>` — lire TOUT le diff, fichier par fichier.
4. Pour chaque critère d'acceptation : trouver le code qui le couvre. Introuvable → changement demandé.

## Checklist

### Bloquant (→ CHANGES_REQUESTED)
- [ ] Un critère d'acceptation non couvert
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ou tout secret accessible côté client
- [ ] Requête Supabase sans gestion d'erreur, composant fetch sans état `loading`/`error`/`empty`
- [ ] `any` TypeScript, `<img>` au lieu de `<Image>`, `.then()` au lieu d'`async/await`
- [ ] Mapbox importé sans `dynamic(..., { ssr: false })`
- [ ] Âges : mois/années confondus (base = mois, UI = années)
- [ ] Desktop-first (classes de base non mobiles)
- [ ] Nouvelle dépendance non validée par l'humain

### Non bloquant (commentaire, n'empêche pas l'APPROVED)
- Nommage perfectible, duplication légère, optimisation possible
- Accessibilité améliorable (alt, labels, focus) — bloquant seulement si l'US porte sur l'a11y

## Format de la review

`gh pr review <num> --comment --body "..."` avec :

1. **Résumé** : 2–3 lignes sur la qualité globale.
2. **Commentaires** : liste `fichier:ligne — remarque`, groupés bloquant / non bloquant.
3. **Critères d'acceptation** : tableau critère → couvert ✅/❌.
4. Dernière ligne, seule : `VERDICT: APPROVED` ou `VERDICT: CHANGES_REQUESTED`.

⚠️ Jamais `--approve` ni `--request-changes` (même compte que l'auteur de la PR → GitHub refuse).
C'est la ligne `VERDICT:` + les labels qui portent la décision.

## Après le verdict

- APPROVED → label `status: qa`, carte "QA".
- CHANGES_REQUESTED → label `status: in-progress`, carte "In Progress",
  liste numérotée des changements en commentaire de la PR.
- 2 allers-retours max sur une même PR, ensuite escalade à l'humain.
