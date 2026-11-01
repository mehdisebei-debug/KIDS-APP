# Relevé de la maquette Figma « App-kids »

**Source** : Figma Make `App-kids` — https://www.figma.com/make/qbwEiAOGhYfOpsC69UdJR8/App-kids
**Relevé le** : 2026-11-01 (version de référence figée à cette date)
**Nature** : prototype React/Vite généré par Figma Make (`src/App.tsx` ≈ 1 800 lignes, `src/index.css`),
pas une maquette canevas. Données fictives (12 activités, photos Unsplash).

## Identité

- Nom affiché : **KidMap Paris** · sous-titre « Île-de-France »
- Intention : « chaleureux et ludique, sans être enfantin » — un guide parental français moderne.

## Fondations visuelles

| Rôle | Valeur |
|---|---|
| Primaire (corail) | `#FF5533` (variante claire `#FF8566`, fond teinté `#FFF1ED`) |
| Accent (bleu carte / localisation) | `#4A90E2` |
| Étoiles / mise en avant | `#FFBA08` |
| Texte principal | `#1C1B22` |
| Texte secondaire | `#8A8090` (intermédiaires `#6B6573`, `#4A4554`) |
| Fond de page (crème) | `#FAFAF5` |
| Surface neutre / placeholder image | `#F4F0EB` |
| Bordures / séparateurs | `#E8E2DA` (`#C8C2BA` plus marqué) |
| Carte (terres / parcs) | `#C8D8C8`, `#A8D4A8`, `#C8D9BD`, `#EAF6EA` |

**Typographie** : *Nunito* (titres, noms d'activité, poids 700–800) + *DM Sans* (texte courant).

**Rayons** : pilules `999` (puces, filtres, boutons) · cartes `20` · vignettes/blocs `12–14` · grands blocs `24`.

**Couleurs par catégorie** (texte / fond de badge) :

| Catégorie maquette | Icône | Couleur | Fond |
|---|---|---|---|
| Parcs | 🌳 | `#2A9D5C` | `#E8F7EF` |
| Musées | 🏛️ | `#6B4FBB` | `#F0ECF9` |
| Ateliers | 🎨 | `#D4621A` | `#FDF0E6` |
| Piscines | 🏊 | `#1A7FC1` | `#E5F3FB` |
| Spectacles | 🎭 | `#BB2D6E` | `#FAEDF4` |
| Biblio | 📚 | `#9B5C1A` | `#FDF2E9` |

⚠️ Ces catégories ne sont **pas** celles de l'app (Parcs, Spectacles, Ateliers, Aires de jeux,
Restaurants, Événements). Seul le principe (couleur + fond + icône par catégorie) est repris.

**Tranches d'âge (puces)** : 0–6 mois 🍼 · 6m–1 an 🧸 · 1–2 ans 🚶 · 2–3 ans 🎠 · 3–4 ans 🎨 ·
4–5 ans 🚲 · 5–6 ans ⚽ — bornes exprimées en mois (0, 6, 12, 24, 36, 48, 60, 72).

## Écrans et composants

| Élément maquette | Contenu | Équivalent app actuel |
|---|---|---|
| En-tête | logo, « KidMap Paris », cloche notifications, avatar | `Navbar` |
| **Carte** (onglet 1) | carte plein écran, marqueurs colorés par catégorie, bouton « me localiser », puces d'âge en haut, barre de catégories, panneau bas repliable (cartes compactes en défilement horizontal ↔ liste verticale), compteur « 12 activités · 2–3 ans » | `/carte` + `ActivityMap` |
| **Explorer** (onglet 2) | recherche, filtres catégorie, liste de cartes complètes avec photo | `/liste` + `ActivityList` |
| **Favoris** (onglet 3) | activités cœurées ; état vide « Pas encore de favoris » | ❌ inexistant |
| **Profil** (onglet 4) | prénom de l'enfant, curseur d'âge 0–72 mois (« Naissance » → « 6 ans ») qui filtre tout, statistiques, préférences de notification | ❌ inexistant (profil prévu sous `(auth)`) |
| **Fiche détail** (page) | photo, note étoilée, description, lieu, tarif, horaires, âge, distance, bloc « Localisation », bouton « Voir l'itinéraire », lien site web, « Retour aux activités », lien partageable | `/activite/[id]`, `/evenement/[id]` |
| Carte compacte | photo, badge catégorie, cœur, nom, lieu · distance, étoiles | `ActivityCard` / `EventCard` |
| Carte complète | idem + description courte, âge, prix | `ActivityCard` |
| Ligne (desktop) | vignette 104 px + texte, surlignée à la sélection | — |
| Navigation basse | Carte · Explorer · Favoris · Profil (icônes + libellés, onglet actif en corail) | `BottomNav` (Accueil · Liste · Carte) |
| États vides | « Aucune activité trouvée — Essayez un autre âge ou une autre catégorie », « Aucun résultat — Essayez un autre mot-clé » | partiels |

**Desktop (≥ 1024 px)** : barre latérale de navigation verticale + carte en deux panneaux
(liste ~380 px à gauche, carte à droite, survol d'une ligne = marqueur surligné, clic marqueur =
ligne défilée), grilles pour Explorer/Favoris, fiche détail en carte centrée deux colonnes.

## Écarts à arbitrer avec l'app réelle

- La carte de la maquette est une illustration SVG stylisée ; l'app utilise une vraie carte
  interactive : on reprend le style (marqueurs, couleurs, bouton localisation), pas l'illustration.
- La maquette n'a pas d'écran « Accueil » distinct : la Carte est l'écran d'entrée.
- Les icônes sont des emoji dans la maquette.
- Images : URLs Unsplash de démonstration, à ne pas reprendre (les images viennent des données).
