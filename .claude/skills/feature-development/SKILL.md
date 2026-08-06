---
name: feature-development
description: Méthode de développement d'une User Story - de la carte Ready à la Pull Request, en respectant les conventions du projet kids-app.
---

# Développement d'une feature

## Avant de coder

1. Lire l'issue **en entier**, y compris les commentaires.
2. Relire les sections utiles de `CLAUDE.md` (types, conventions, règles Supabase).
3. Repérer les composants/fichiers existants à réutiliser (`Grep` avant de créer).
4. `git checkout main && git pull` puis `git checkout -b feat/<num>-slug`.

## Pendant

- **Mobile-first** : classes Tailwind sans préfixe = mobile ; `md:`/`lg:` pour élargir.
- **Âges** : base en **mois**, UI en années — conversion aux frontières uniquement
  (helpers dans `lib/utils`).
- **Data** : états `loading`, `error`, `empty` obligatoires dans tout composant qui fetch.
- **Mapbox** : toujours `dynamic(() => import(...), { ssr: false })`.
- **Types** : pas de `any` ; réutiliser les types de `lib/types`.
- **Imports** : toujours complets dans le code proposé.
- Pas de nouvelle dépendance sans accord humain préalable.

## Commits

Conventional Commits, messages en français :
- `feat: ajoute le slider d'âge en mois (#12)`
- `fix: corrige la conversion années→mois du filtre (#12)`
- Commits petits et cohérents (un sujet par commit).

## Avant d'ouvrir la PR

```bash
npm run lint && npm run type-check && npm run build
```
Les trois doivent être verts. Sinon, corriger avant de pousser.

## La PR

```bash
gh pr create --base main --title "feat: <résumé>" --body "..."
```

Le corps contient obligatoirement :
- `Closes #<num>` (lie l'issue, la fermera au merge)
- Résumé de l'implémentation (3–5 lignes)
- La liste des critères d'acceptation avec, pour chacun, comment il est couvert
- Ce qui n'est PAS couvert, le cas échéant (et pourquoi)

## Handoff

Après ouverture de la PR : label `status: review`, carte en "In Review"
(commandes exactes dans `CLAUDE.md` § Workflow multi-agents).
