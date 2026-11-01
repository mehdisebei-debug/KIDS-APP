# Feature Specification: Intégration du nouveau design « KidMap Paris » (maquette Figma)

**Feature Branch**: `002-integration-design-figma`

**Created**: 2026-11-01

**Status**: Draft

**Input**: User description: "connect avec figma et recuprer maquette kids-app et intgrer le nouveau design"

## Contexte

La maquette « App-kids » (prototype Figma Make, relevé détaillé dans
[maquette-figma.md](./maquette-figma.md)) propose une nouvelle identité, **KidMap Paris** :
chaleureuse et ludique, palette corail sur fond crème, coins très arrondis, couleur propre à
chaque catégorie, et une navigation en 4 onglets (Carte · Explorer · Favoris · Profil) avec une
fiche détail en page complète et une version desktop.

L'application publique actuelle (accueil, liste, carte, fiches activité et événement,
navigation Accueil · Liste · Carte) utilise un habillage provisoire (indigo/gris, emoji, police
par défaut). Cette fonctionnalité aligne l'interface visible par les parents sur la maquette, en
conservant les données réelles et les parcours existants.

## Clarifications

### Session 2026-11-01

- Q: La Carte devient-elle l'écran d'entrée (sans Accueil) ? → A: Oui, l'Accueil disparaît (FR-004).
- Q: Livraison en une fois ou par lots ? → A: Par lots — fondations/navigation/cartes/Explorer/
  fiche, puis Carte, puis Favoris/Profil, puis desktop (FR-008).
- Q: Favoris et Profil dans le périmètre ? → A: Oui, avec connexion du parent (FR-012).
- Précision du porteur : la partie connexion est isolée en stories basse priorité (US6, US7,
  lot 5), à discuter ultérieurement (FR-018).
- Q: Où les événements apparaissent-ils dans la nouvelle navigation ? → A: Explorer, section
  « Événements à venir » en tête quand le filtre catégorie est Tous ou Événements ; Carte :
  activités seulement (FR-005, FR-006).
- Q: Quand une activité est-elle adaptée à une tranche d'âge choisie ? → A: Dès que sa plage
  d'âge chevauche la tranche, bornes comprises (« 0–24 mois » apparaît aussi dans « 2–3 ans »)
  (FR-011).
- Q: Sur quelles informations porte la recherche par mot-clé d'Explorer ? → A: Nom,
  description, adresse/ville et tags des activités, et titre, description et lieu des événements ;
  la section « Événements à venir » est filtrée elle aussi (FR-006).
- Q: La distance entre le parent et l'activité est-elle affichée ? → A: Non, nulle part (ni
  cartes, ni panneau bas, ni fiche) ; la géolocalisation sert uniquement au recentrage de la
  carte (FR-007, Assumptions).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Une identité visuelle « KidMap Paris » cohérente (Priority: P1)

Un parent ouvre l'application sur son téléphone. Il retrouve partout la palette corail/crème, la
typographie ronde des titres, les puces arrondies et une couleur distincte par catégorie, comme
dans la maquette.

**Why this priority**: les fondations visuelles conditionnent tous les écrans ; sans elles,
chaque écran redessiné serait incohérent.

**Independent Test**: sur un téléphone (375 px), parcourir tous les écrans publics et comparer
couleurs, polices, boutons, badges et puces au tableau « Fondations visuelles » du relevé.

**Acceptance Scenarios**:

1. **Given** les fondations relevées dans la maquette, **When** un parent consulte n'importe quel
   écran public, **Then** seules ces couleurs et ces deux familles de polices sont utilisées.
2. **Given** les 6 catégories de l'app, **When** une activité est affichée (badge, marqueur,
   filtre), **Then** sa catégorie a une couleur, un fond et une icône propres, identiques sur
   tous les écrans.
3. **Given** un bouton, une puce de filtre ou un badge, **When** il apparaît sur deux écrans
   différents, **Then** son rendu est identique.

---

### User Story 2 - Trouver une sortie depuis la carte (Priority: P1)

Un parent arrive sur la carte. Il choisit la tranche d'âge de son enfant via des puces
(0–6 mois … 5–6 ans), filtre par catégorie, voit les marqueurs colorés se mettre à jour et
parcourt les activités dans un panneau en bas d'écran qu'il peut déplier en liste. Un bouton le
recentre sur sa position.

**Why this priority**: la carte est l'écran d'entrée et le cœur de la maquette.

**Independent Test**: sur mobile, ouvrir la carte, choisir « 2–3 ans » puis « Parcs », vérifier
que marqueurs, compteur et panneau ne montrent que les activités correspondantes, puis ouvrir une
fiche depuis le panneau.

**Acceptance Scenarios**:

1. **Given** la carte affichée, **When** le parent touche la puce « 1–2 ans », **Then** seules les
   activités compatibles avec 12–24 mois restent visibles et le compteur indique leur nombre et la
   tranche (« N activités · 1–2 ans »).
2. **Given** le panneau bas replié, **When** le parent le fait glisser ou le touche, **Then** il se
   déplie en liste verticale ; replié, il présente des cartes compactes défilant horizontalement.
3. **Given** un marqueur sur la carte, **When** le parent le touche, **Then** l'activité
   correspondante est mise en avant (nom visible au-dessus du marqueur, carte mise en évidence).
4. **Given** le parent a autorisé la localisation, **When** il touche le bouton « me localiser »,
   **Then** la carte se recentre sur sa position.
5. **Given** aucun résultat pour les filtres choisis, **When** la carte se met à jour, **Then** un
   état vide « Aucune activité trouvée — Essayez un autre âge ou une autre catégorie » s'affiche.

---

### User Story 3 - Explorer la liste et consulter une fiche (Priority: P1)

Un parent ouvre l'onglet Explorer, cherche par mot-clé, filtre par catégorie, parcourt des cartes
complètes (photo, catégorie, nom, lieu, note, âge, prix) puis ouvre la fiche détail :
grande photo, note, description, lieu, tarif, horaires, âge, bloc « Localisation »,
bouton « Voir l'itinéraire », lien vers le site, retour aux activités.

**Why this priority**: c'est le second chemin de découverte et la page de décision.

**Independent Test**: rechercher une activité réelle, l'ouvrir, vérifier que la fiche suit la
maquette et que « Voir l'itinéraire » et le lien de partage fonctionnent.

**Acceptance Scenarios**:

1. **Given** l'onglet Explorer, **When** le parent tape un mot-clé (nom, ville, thème…), **Then**
   les activités et les événements à venir se filtrent ; sans résultat, l'état vide « Aucun
   résultat — Essayez un autre mot-clé » s'affiche.
2. **Given** une fiche ouverte, **When** le parent touche « Voir l'itinéraire », **Then** un
   itinéraire vers l'adresse de l'activité s'ouvre dans l'application de cartographie du téléphone.
3. **Given** une fiche ouverte, **When** le parent partage son adresse, **Then** le lien rouvre
   directement cette fiche.
4. **Given** une activité ou un événement sans photo, site web ou horaires, **When** sa fiche
   s'affiche, **Then** les blocs manquants sont masqués proprement (visuel de remplacement pour la
   photo), sans champ vide.
5. **Given** les données en cours de chargement ou en erreur, **When** un écran s'affiche,
   **Then** un état de chargement ou d'erreur stylé apparaît, jamais une page blanche.

---

### User Story 4 - Favoris et profil enfant (Priority: P2)

Un parent connecté marque des activités d'un cœur et les retrouve dans l'onglet Favoris. Dans
l'onglet Profil, il indique le prénom et la date de naissance de son enfant ; l'âge calculé
pré-filtre la carte et la liste. La partie connexion elle-même est traitée à part (US6, US7).

**Why this priority**: forte valeur, mais ce sont de nouvelles fonctionnalités (pas seulement du
design) qui supposent un parent connecté (lot 3, voir FR-008 et FR-012).

**Independent Test**: avec un compte parent de test déjà connecté, ajouter deux favoris et les
retrouver dans l'onglet ; renseigner une date de naissance et constater le pré-filtrage de la carte.

**Acceptance Scenarios**:

1. **Given** un parent connecté et une activité affichée, **When** il touche le cœur, **Then**
   elle apparaît dans Favoris ; touchée à nouveau, elle en disparaît.
2. **Given** aucun favori, **When** le parent ouvre l'onglet, **Then** l'état vide « Pas encore de
   favoris — Appuyez sur ❤️ sur une activité pour la retrouver ici facilement » s'affiche.
3. **Given** un enfant né il y a 26 mois, **When** le parent ouvre la carte, **Then** la puce
   « 2–3 ans » est présélectionnée ; le mois suivant son 3ᵉ anniversaire, c'est « 3–4 ans »
   sans aucune action du parent.
4. **Given** un profil enfant, **When** le parent le supprime, **Then** plus aucune tranche n'est
   présélectionnée et ses données d'enfant ne sont plus conservées.

---

### User Story 6 - Se connecter pour enregistrer favoris et profil (Priority: P4 — à discuter)

Un parent qui veut garder un favori ou renseigner le profil de son enfant crée un compte ou se
connecte, puis revient exactement là où il était, avec l'action demandée appliquée.

**Why this priority**: priorité basse à la demande du porteur ; les modalités de connexion
(méthodes, moment où elle est demandée, parcours d'inscription) seront définies lors d'une
discussion dédiée. Prérequis du lot 3 (US4).

**Independent Test**: depuis un navigateur non connecté, toucher un cœur, se connecter, constater
le retour à l'écran d'origine avec l'activité en favori.

**Acceptance Scenarios** *(provisoires, à confirmer en discussion)*:

1. **Given** un parent non connecté, **When** il touche un cœur ou ouvre Favoris/Profil, **Then**
   il est invité à se connecter, sans perdre l'écran en cours.
2. **Given** la connexion réussie, **When** il revient, **Then** l'action demandée (ajout du
   favori) est appliquée.
3. **Given** la connexion annulée ou en échec, **When** il revient, **Then** rien n'est ajouté et
   un message clair s'affiche.

---

### User Story 7 - Retrouver ses données sur tous ses appareils (Priority: P4 — à discuter)

Un parent connecté sur son téléphone puis sur son ordinateur retrouve les mêmes favoris et le
même profil enfant.

**Why this priority**: priorité basse, dépend des choix faits pour US6.

**Independent Test**: ajouter un favori sur un appareil, se connecter sur un autre, le retrouver.

**Acceptance Scenarios** *(provisoires, à confirmer en discussion)*:

1. **Given** des favoris et un profil enregistrés, **When** le parent se connecte sur un autre
   appareil, **Then** il les retrouve à l'identique.
2. **Given** deux parents distincts, **When** chacun consulte ses Favoris, **Then** aucun ne voit
   les données de l'autre.

---

### User Story 5 - Version desktop (Priority: P3)

Sur ordinateur (≥ 1024 px), le parent voit une barre de navigation latérale, la liste des
activités à gauche et la carte à droite ; survoler une ligne met en avant son marqueur, cliquer
un marqueur fait défiler la liste jusqu'à la ligne. Explorer et Favoris passent en grille, la
fiche détail s'affiche en carte centrée sur deux colonnes.

**Why this priority**: l'usage est très majoritairement mobile.

**Independent Test**: afficher chaque écran à 375, 768 et 1280 px ; vérifier la disposition
desktop et l'absence de défilement horizontal.

**Acceptance Scenarios**:

1. **Given** une largeur ≥ 1024 px, **When** la carte s'affiche, **Then** liste et carte sont côte
   à côte et synchronisées (survol ↔ marqueur, clic marqueur ↔ défilement de la liste).
2. **Given** une largeur de 375 px, **When** n'importe quel écran s'affiche, **Then** aucun
   défilement horizontal n'apparaît et la navigation basse est utilisée.

---

### Edge Cases

- Le parent refuse la géolocalisation : la carte reste centrée sur Paris, le bouton « me
  localiser » explique comment l'activer.
- Une activité couvre plusieurs tranches d'âge : elle apparaît dans chacune d'elles, y compris
  celle qui commence exactement à son âge maximum (règle de FR-011).
- Une activité sans coordonnées : elle est listée dans Explorer mais n'a pas de marqueur.
- Nom d'activité ou adresse très long : passage à la ligne ou troncature sans casser la carte.
- Beaucoup de marqueurs proches : ils restent touchables (pas de superposition illisible).
- Une couleur de la maquette ne permet pas un contraste suffisant sur un texte (ex. corail sur
  crème pour un petit texte) : une variante conforme est utilisée et l'écart est noté.
- Une activité mise en favori est ensuite retirée de la base : elle disparaît des favoris sans
  erreur.
- *(US6, à discuter)* La connexion échoue ou est annulée : le parent revient à l'écran d'origine, sans favori ajouté,
  avec un message clair.
- Date de naissance dans le futur ou enfant de plus de 6 ans : la saisie est refusée ou un message
  indique que l'app cible les 0–6 ans, et aucune tranche n'est présélectionnée au-delà.
- Un ancien lien vers l'accueil ou la liste : il mène à l'onglet équivalent (Carte, Explorer).
- L'espace d'administration (`/admin`) n'est pas concerné.

## Requirements *(mandatory)*

### Functional Requirements

**Fondations**

- **FR-001**: Les fondations visuelles de la maquette (palette, deux familles de polices, rayons,
  ombres, espacements) DOIVENT être définies une seule fois et réutilisées par tous les écrans.
- **FR-002**: Chacune des 6 catégories de l'app (Parcs & loisirs, Spectacles & théâtre, Ateliers
  & créatifs, Aires de jeux, Restaurants family-friendly, Événements ponctuels) DOIT recevoir une
  couleur, un fond et une icône dans l'esprit de la maquette ; les catégories propres à la
  maquette (Musées, Piscines, Bibliothèques) ne sont pas ajoutées.
- **FR-003**: Les éléments récurrents (bouton, puce, badge catégorie, carte compacte, carte
  complète, note étoilée, en-tête, navigation) DOIVENT avoir un rendu unique conforme à la maquette.

**Écrans**

- **FR-004**: La navigation DOIT suivre la maquette : 4 onglets Carte · Explorer · Favoris ·
  Profil, la **Carte devient l'écran d'entrée** et l'écran Accueil actuel disparaît. Son contenu
  utile (activités, événements à venir) reste accessible via la Carte et Explorer ; les anciennes
  adresses (accueil, liste) redirigent vers l'onglet équivalent.
- **FR-005**: L'écran Carte DOIT offrir : puces de tranche d'âge (7 tranches de 0 à 6 ans),
  barre de catégories, marqueurs colorés par catégorie, bouton de recentrage, compteur
  « N activités · tranche », panneau bas repliable (cartes compactes horizontales ↔ liste).
  La Carte n'affiche que les activités ; les événements n'y ont pas de marqueur.
- **FR-006**: L'écran Explorer DOIT offrir recherche par mot-clé, filtre catégorie et liste de
  cartes complètes. Une section « Événements à venir » DOIT apparaître en tête d'Explorer quand le
  filtre catégorie est « Tous » ou « Événements », et être masquée pour toute autre catégorie.
  La recherche par mot-clé DOIT porter sur le nom, la description, l'adresse (dont la ville) et les
  tags des activités, ainsi que sur le titre, la description et le lieu des événements ; elle
  filtre à la fois la liste d'activités et la section « Événements à venir ».
- **FR-007**: La fiche détail (activité et événement) DOIT être une page complète avec lien
  partageable, et afficher photo, note, description, lieu, tarif, horaires, âge, bloc
  Localisation, « Voir l'itinéraire », site web et retour ; les blocs sans donnée sont masqués.
- **FR-008**: La livraison DOIT se faire **par lots**, chacun livrable et utilisable seul :
  - **Lot 1** : fondations, navigation 4 onglets, cartes d'activité, Explorer, fiche détail
    (US1, US3) ;
  - **Lot 2** : écran Carte redessiné (US2) ;
  - **Lot 3** : Favoris et Profil enfant (US4) ;
  - **Lot 4** : version desktop (US5) ;
  - **Lot 5 — basse priorité, à discuter** : connexion du parent (US6, US7).
  Le lot 3 dépend de la connexion : tant que le lot 5 n'est pas tranché et livré, les onglets
  Favoris et Profil restent masqués, et le lot 4 peut être livré avant le lot 3.

**Comportements transverses**

- **FR-009**: Chaque écran DOIT présenter des états chargement, erreur et vide stylés, avec les
  textes d'état vide de la maquette.
- **FR-010**: Chaque écran DOIT être conçu pour 375 px d'abord, sans défilement horizontal, avec
  des zones tactiles d'au moins 44 × 44 px.
- **FR-011**: Les tranches d'âge DOIVENT reposer sur les âges existants exprimés en mois
  (bornes 0, 6, 12, 24, 36, 48, 60, 72) ; seuls les libellés sont en mois ou en années. Chaque
  tranche couvre de sa borne basse (incluse) à sa borne haute (exclue), ex. « 2–3 ans » = 24 à
  35 mois. Une activité correspond à une tranche dès que sa plage d'âge la chevauche, son âge
  maximum étant inclus : « 0–24 mois » apparaît dans 0–6 m, 6–12 m, 1–2 ans et 2–3 ans.
- **FR-012**: Favoris et Profil sont **inclus** (lot 3) pour un parent connecté :
  - consulter la carte, Explorer et les fiches reste possible sans compte ;
  - les favoris et le profil enfant sont rattachés au compte du parent ;
  - le profil enfant contient un prénom (facultatif) et une **date de naissance** ; l'âge affiché
    et la tranche présélectionnée sont calculés à partir d'elle, jamais enregistrés ;
  - un parent ne voit et ne modifie que ses propres favoris et son propre profil.
- **FR-018** *(basse priorité, à discuter)* : la connexion du parent (méthodes, moment où elle
  est demandée, retour à l'écran d'origine, synchronisation entre appareils) est décrite par US6
  et US7 ; ses modalités seront arrêtées lors d'une discussion dédiée avant le lot 5.
- **FR-016**: Le parent DOIT pouvoir modifier ou supprimer à tout moment le profil de son enfant
  et ses favoris ; aucune de ces données n'est visible par d'autres utilisateurs.
- **FR-017**: Sans profil enfant renseigné, aucune tranche d'âge n'est présélectionnée et toutes
  les activités sont affichées.
- **FR-013**: Les contrastes texte/fond DOIVENT respecter le niveau AA.
- **FR-014**: Le design NE DOIT retirer aucune information ni fonction existante (filtres,
  passage liste/carte, accès aux fiches activité et événement).
- **FR-015**: Les données de démonstration de la maquette (12 activités, photos Unsplash) NE
  DOIVENT PAS être reprises : seules les données réelles sont affichées.

### Key Entities

- **Fondation visuelle** : valeur de design nommée (couleur, police, rayon, ombre, espacement).
- **Style de catégorie** : pour chaque catégorie de l'app, couleur, fond et icône.
- **Tranche d'âge** : libellé, icône, bornes min/max en mois.
- **Parent** : compte connecté (modalités à discuter, US6) ; propriétaire de ses favoris et profils.
- **Favori** : lien entre un parent et une activité (ou un événement), avec sa date d'ajout.
- **Profil enfant** : rattaché à un parent ; prénom facultatif et date de naissance ; l'âge et la
  tranche sont calculés, jamais enregistrés. Un seul enfant par parent dans ce périmètre.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100 % des écrans du périmètre sont validés visuellement par le porteur du projet
  face à la maquette, à 375 px de large.
- **SC-002**: 0 couleur ni police utilisée sur les écrans publics en dehors des fondations.
- **SC-003**: 0 écran public présentant un défilement horizontal à 375 px.
- **SC-004**: 100 % des fonctions publiques existantes restent accessibles après la refonte.
- **SC-005**: Un parent testeur trouve une activité adaptée à l'âge de son enfant depuis la
  carte en moins de 30 secondes.
- **SC-006**: Le temps d'affichage du premier écran sur mobile en 4G n'augmente pas de plus de
  10 % par rapport à la version actuelle.
- **SC-007** *(US6, provisoire)*: Un parent non connecté ajoute son premier favori (connexion comprise) en moins de
  1 minute.
- **SC-008** *(US7, provisoire)*: 100 % des favoris et profils enregistrés sont retrouvés à l'identique après
  reconnexion sur un autre appareil, et 0 sont visibles par un autre compte.

## Assumptions

- La version de référence de la maquette est celle relevée le 2026-11-01 ; toute évolution
  ultérieure fera l'objet d'une nouvelle demande.
- La carte de la maquette est une illustration stylisée : on reprend son style (marqueurs,
  couleurs, recentrage) sur la vraie carte interactive existante, pas l'illustration elle-même.
- Le nom affiché « KidMap Paris » et le logo de la maquette sont repris, sauf avis contraire.
- Aucune distance n'est affichée (cartes, panneau bas, fiche), même si la maquette en montre :
  la position du parent sert uniquement au bouton « me localiser » de la Carte.
- La cloche de notifications de l'en-tête et les préférences de notification du Profil sont
  masquées (pas de notifications dans ce périmètre) ; l'avatar mène au Profil.
- Les statistiques du Profil de la maquette (compteurs) sont hors périmètre.
- Un seul enfant par compte dans ce périmètre ; plusieurs enfants feront l'objet d'une User Story.
- Piste par défaut pour la discussion US6 : réutiliser la connexion e-mail / Google déjà prévue
  pour le projet (non arrêté).
- Les polices Nunito et DM Sans sont gratuites et autorisées pour le web.
- Les icônes restent des emoji comme dans la maquette, sauf si un jeu d'icônes existe déjà dans
  l'app.
- Seul le thème clair est concerné ; l'application mobile native et `/admin` sont hors périmètre.
- Aucune nouvelle bibliothèque n'est ajoutée sans accord explicite du porteur du projet.
- La validation de conformité est visuelle et manuelle, faute de tests automatisés de rendu.
