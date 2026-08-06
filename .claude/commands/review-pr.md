---
description: Relit une Pull Request et poste une review avec verdict.
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*)
---
PR à relire : #$ARGUMENTS

Contexte de la PR : !`gh pr view $ARGUMENTS`

Utilise le sous-agent `reviewer` pour poster une review complète sur cette PR
(diff intégral, checklist de sa skill, verdict `VERDICT: APPROVED` ou
`VERDICT: CHANGES_REQUESTED`, puis mise à jour des labels et de la carte).
