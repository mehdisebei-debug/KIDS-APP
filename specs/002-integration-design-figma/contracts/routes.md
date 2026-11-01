# Contrat — Routes publiques et paramètres d'URL

Interface exposée aux parents (liens partageables, favoris navigateur, liens externes). Toute
route listée ici DOIT répondre comme indiqué après les lots 1–2.

## Routes

| Route | Onglet | Rendu | Comportement |
|---|---|---|---|
| `/` | — | serveur | **redirection** vers `/carte` (query string conservée) |
| `/carte` | Carte | client (carte en `dynamic`, sans SSR) | écran d'entrée ; lot 1 = restylage minimal, lot 2 = plein écran |
| `/liste` | Explorer | serveur (événements) + client (filtres, activités) | recherche, catégories, tranches d'âge (lot 2), « Événements à venir » |
| `/activite/[id]` | — | serveur | fiche détail activité ; id inconnu → 404 |
| `/evenement/[id]` | — | serveur | fiche détail événement ; id inconnu → `not-found.tsx` restylé ; erreur Supabase → état d'erreur stylé |
| `/favoris`, `/profil` | Favoris, Profil | — | **n'existent pas** avant le lot 3 ; onglets masqués |
| `/admin/*` | — | — | inchangé, hors design |

## Paramètres de requête (Carte et Explorer)

| Paramètre | Valeurs | Effet | Invalide → |
|---|---|---|---|
| `categorie` | `PARC` `SPECTACLE` `ATELIER` `AIRE_JEUX` `RESTAURANT` `EVENEMENT` | filtre catégorie | ignoré (toutes) |
| `age` | `0-6m` `6-12m` `1-2a` `2-3a` `3-4a` `4-5a` `5-6a` | tranche d'âge (lot 2) | ignoré (tous âges) |
| `q` | texte | recherche (Explorer) | — |
| `gratuit` | `1` | uniquement gratuit | ignoré |

Règles :
- Les liens existants `/liste?categorie=PARC` continuent de fonctionner (rétrocompatibilité).
- Changer un filtre met à jour l'URL via `router.replace` (pas de nouvelle entrée d'historique).
- Les onglets Carte ↔ Explorer **conservent** `categorie` et `age` dans leur `href`.
- Le lien d'une fiche est stable et partageable : `/activite/<id>`, `/evenement/<id>`.

## Liens sortants

| Lien | Format |
|---|---|
| Itinéraire | `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` ; sans coordonnées : `destination=<adresse encodée>` ; `target="_blank" rel="noopener noreferrer"` |
| Site web | URL de la donnée si présente, mêmes attributs ; sinon bouton masqué |
| Mini-carte | image Mapbox Static Images avec `NEXT_PUBLIC_MAPBOX_TOKEN` ; masquée si token ou coordonnées absents |
