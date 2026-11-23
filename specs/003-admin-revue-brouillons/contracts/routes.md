# Contrat : routes admin

Toutes les routes sont protégées par `middleware.ts` (cookie `admin_session`) : sans session,
l'utilisateur est redirigé vers `/admin/login`. Aucune modification du middleware n'est nécessaire,
car son matcher `/admin/:path*` couvre déjà ces routes.

## `GET /admin/brouillons`: la file

| Paramètre | Valeurs | Défaut | Effet |
|---|---|---|---|
| `type` (query) | `tous`, `activites`, `evenements` | `tous` | Filtre sur `isEvent` (data-model) |

- Contenu : brouillons `status = 'a_valider'`, triés par `created_at` décroissant.
- Chaque élément affiche : nom, catégorie (emoji + libellé), ville, âge (`ageLabel`), date si
  c'est un événement, badge « date passée » si besoin, source, date d'ajout, nombre de champs
  manquants. L'élément renvoie vers `/admin/brouillons/[id]`.
- Mobile (< `md`) : cartes empilées. À partir de `md:` : tableau.
- États :
  | Cas | Affichage |
  |---|---|
  | Supabase non configuré | encadré ambre (même texte que `/admin/events`) |
  | Erreur de lecture | encadré rouge avec le message, la page reste navigable |
  | File vide | « Aucun brouillon à vérifier 🎉 » et un rappel : ajouter des activités via le Projet Claude « Ajout activités app-kids » |
- Au-delà de 50 éléments : pagination par `?page=` (50 par page).

## `GET /admin/brouillons/[id]`: le détail

- `id` inconnu ou mal formé : `notFound()` (page `not-found.tsx` avec un lien retour vers la file).
- Brouillon `publie` ou `rejete` : affiché en lecture seule avec un bandeau « Déjà traité
  (statut) », sans actions.
- Brouillon `a_valider` :
  - En-tête : nom, statut, source avec lien d'origine (`target="_blank" rel="noopener noreferrer"`),
    type d'entrée, date d'ajout.
  - Bloc « Champs manquants » : la liste, avec chaque champ requis manquant mis en évidence dans
    le formulaire.
  - Formulaire d'édition (`DraftForm`) avec le bouton « Enregistrer ».
  - Bloc localisation (`GeocodeButton`) : coordonnées actuelles ou « non renseignées », bouton
    « Calculer depuis l'adresse ».
  - Bloc « Texte source » : `raw_text` en lecture seule, repliable.
  - Images : vignettes `<Image unoptimized>`.
  - Barre de décision (`DecisionBar`), fixée en bas sur mobile : « Rejeter » (motif facultatif) et
    « Publier » (désactivé, avec une infobulle listant les manques, tant que des champs requis
    manquent).

## Navigation (`app/admin/layout.tsx`)

- Liens « Événements » (`/admin/events`) et « Brouillons (N) » (`/admin/brouillons`), où N est le
  nombre de brouillons `a_valider`.
- Le compteur n'est calculé que si la session est valide, et il est masqué en cas d'erreur.
- La redirection de `/admin` vers `/admin/events` est inchangée.
