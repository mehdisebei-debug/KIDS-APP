---
name: testing
description: Stratégie de test et procédure de validation QA des PR du projet kids-app - verdict QA GO ou NO-GO.
---

# Validation QA

## État actuel de l'outillage

⚠️ **Pas encore de framework de test installé** (Vitest arrivera plus tard).
En attendant, la validation QA repose sur :
1. Les checks statiques : `npm run lint && npm run type-check && npm run build` (tous verts).
2. La CI de la PR : `gh pr checks <num>` (tout vert).
3. La **vérification manuelle documentée** de chaque critère d'acceptation.

Quand Vitest sera installé, chaque critère d'acceptation devra être couvert par un test
automatisé (unitaire ou e2e) avant tout `QA: GO` — cette section sera mise à jour.

## Procédure

1. `gh pr checkout <num>` — se placer sur la branche.
2. Lancer les checks statiques ci-dessus.
3. `npm run dev` puis vérifier chaque critère Gherkin de l'issue liée, un par un :
   - reproduire le « Étant donné / Quand »,
   - constater le « Alors » (ou son absence).
4. Vérifier les cas limites évidents : état vide, erreur réseau simulée, viewport mobile (375px).
5. Commenter l'**issue** avec le tableau de résultats :

```markdown
## Validation QA — PR #<num>
| Critère | Résultat | Preuve |
|---|---|---|
| 1. <titre> | ✅ | <ce qui a été observé> |
| 2. <titre> | ❌ | <écart constaté> |
Checks : lint ✅ · type-check ✅ · build ✅ · CI ✅
```

## Verdict

- Tout ✅ → commenter `QA: GO` sur la PR, label `status: qa` retiré au merge,
  **attendre la validation humaine avant `gh pr merge <num> --squash`**.
- Au moins un ❌ → commenter `QA: NO-GO` avec le détail, label `status: in-progress`,
  carte "In Progress" — retour au developer.

## Après merge

1. Carte en "Deployed".
2. Vérifier le déploiement Vercel (URL de prod) : la feature est visible en production.
3. Si la prod casse : le signaler immédiatement à l'humain (pas de rollback automatique).
