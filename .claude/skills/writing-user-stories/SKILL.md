---
name: writing-user-stories
description: Méthode pour rédiger des User Stories INVEST avec critères d'acceptation Gherkin, adaptées à l'app enfants (0-6 ans, Île-de-France).
---

# Rédaction de User Stories

## Format de l'issue

**Titre** : verbe d'action court, préfixé `[US]`. Ex : `[US] Filtrer les activités par âge en mois`.

**Corps** (template) :

```markdown
## User Story
- **En tant que** <persona parent — ex : parent d'un enfant de 18 mois>
- **Je veux** <capacité>
- **Afin de** <bénéfice concret>

## Critères d'acceptation

### Critère 1 : <titre court>
Étant donné <contexte initial>
Quand <action de l'utilisateur>
Alors <résultat observable dans l'UI>

### Critère 2 : ...

## Notes techniques (optionnel)
<contraintes connues : composants concernés, RPC Supabase, etc.>
```

## Règles Gherkin

- Chaque « Alors » décrit un résultat **observable** (élément visible, navigation, message) —
  jamais un détail d'implémentation (« le state est mis à jour » est interdit).
- 2 à 5 critères par US. Plus de 5 → découper l'US.
- Toujours inclure un critère pour l'état vide ou l'état d'erreur quand la feature fetch des données.
- Les âges s'expriment côté utilisateur en années/mois lisibles, mais préciser la conversion
  en mois quand le critère touche au filtrage (base = mois).

## Checklist INVEST (à cocher avant de passer en Ready)

- [ ] **I**ndependent — développable sans attendre une autre US
- [ ] **N**egotiable — décrit le besoin, pas la solution
- [ ] **V**aluable — bénéfice clair pour le parent
- [ ] **E**stimable — le dev peut estimer sans question majeure
- [ ] **S**mall — < 1–2 jours de dev solo à temps partiel, sinon découper
- [ ] **T**estable — chaque critère est vérifiable par un test ou une manipulation

## Labels à poser

- `type: user-story` — toujours
- `area: age-filter` | `area: map` | `area: admin` — selon la zone touchée
- `priority: p1` (bloquant MVP) | `priority: p2` (important, pas bloquant)
- `status: ready` — seulement quand la checklist INVEST est cochée

## Priorités produit (pour arbitrer)

1. Filtrage d'âge précis en **mois** (0–72) — différenciateur n°1
2. Carte géolocalisée interactive
3. Expérience mobile-first irréprochable
