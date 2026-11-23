# Feature Specification: Espace admin de revue des activités et événements à vérifier (Étape 2)

**Feature Branch**: `003-admin-revue-brouillons`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "creer une url admin pour les activite ou event pnctuel a verifier"

## Contexte

L'Étape 1 (spec `001-ingestion-sans-code`) alimente une file de brouillons « à valider » à partir
des activités et événements ponctuels repérés sur les réseaux. Aujourd'hui, la seule façon de les
relire et de les publier est de lancer des requêtes à la main dans la console de la base de données.
La spec 001 renvoie explicitement « l'interface de revue » à l'Étape 2 : c'est l'objet de cette
spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Voir la file des éléments à vérifier (Priority: P1)

L'administrateur (seul acteur, le développeur du projet) ouvre une adresse dédiée de l'espace admin
et voit la liste de toutes les activités et de tous les événements ponctuels en attente de
vérification, du plus récent au plus ancien. Chaque ligne montre assez d'informations pour
reconnaître l'élément d'un coup d'œil : nom, catégorie, ville, tranche d'âge, date (pour un
événement), source d'origine, date d'ajout, et le nombre de champs manquants.

**Why this priority**: sans cette vue, l'admin ne sait pas ce qui attend sa validation ; c'est le
point d'entrée de tout le reste et elle apporte déjà de la valeur seule (savoir quoi traiter).

**Independent Test**: avec 3 brouillons « à valider » et 1 brouillon « rejeté » en base, ouvrir la
page : exactement les 3 brouillons à valider apparaissent, avec leurs informations clés.

**Acceptance Scenarios**:

1. **Given** l'admin est connecté et 3 brouillons sont « à valider », **When** il ouvre la page de
   revue, **Then** les 3 brouillons sont listés, du plus récent au plus ancien.
2. **Given** des brouillons « publiés » ou « rejetés » existent, **When** l'admin ouvre la page,
   **Then** ils n'apparaissent pas dans la file par défaut.
3. **Given** aucun brouillon n'est « à valider », **When** l'admin ouvre la page, **Then** un état
   vide explique que la file est vide et rappelle comment en ajouter (le Projet d'ingestion).
4. **Given** un visiteur non connecté, **When** il tente d'ouvrir l'adresse de revue, **Then** il
   est renvoyé vers la connexion admin et ne voit aucun brouillon.
5. **Given** l'admin consulte la page sur un téléphone (375 px de large), **When** la liste
   s'affiche, **Then** elle est lisible sans défilement horizontal.

---

### User Story 2 - Examiner le détail d'un élément (Priority: P1)

Depuis la file, l'admin ouvre un élément et voit toutes ses informations : description, adresse,
âge (affiché en années ou en mois selon la tranche), prix, horaires, dates, tags, images, lien
d'origine cliquable, type d'entrée (lien, capture, légende), texte brut extrait, et la liste des
champs manquants mise en évidence. Il peut ainsi comparer avec la source avant de décider.

**Why this priority**: valider sans voir le détail et la source reviendrait à publier à l'aveugle,
ce que l'exigence « rien de faux pour les parents » interdit.

**Independent Test**: ouvrir le détail d'un brouillon connu et vérifier que chaque champ enregistré
est affiché, que le lien d'origine s'ouvre, et que les champs manquants sont signalés.

**Acceptance Scenarios**:

1. **Given** un brouillon avec un âge minimum de 36 mois et sans âge maximum, **When** l'admin ouvre son
   détail, **Then** l'âge s'affiche « dès 3 ans ».
2. **Given** un brouillon sans prix, **When** l'admin ouvre son détail, **Then** le prix s'affiche
   « non renseigné » (et non « gratuit ») et figure parmi les champs manquants.
3. **Given** un brouillon avec un lien d'origine, **When** l'admin clique dessus, **Then** la source
   s'ouvre dans un nouvel onglet.

---

### User Story 3 - Publier ou rejeter un élément (Priority: P1)

Après examen, l'admin publie l'élément (il devient visible des parents) ou le rejette avec un motif
facultatif (il sort de la file sans être publié). La publication refuse un élément incomplet en
indiquant précisément les champs obligatoires manquants.

**Why this priority**: c'est la décision qui fait sortir l'élément de la file ; sans elle, la page
n'est qu'une lecture et la publication reste une manipulation manuelle risquée.

**Independent Test**: publier un brouillon complet et constater qu'il apparaît dans l'application
publique ; rejeter un autre et constater qu'il disparaît de la file sans apparaître côté public.

**Acceptance Scenarios**:

1. **Given** un brouillon complet « à valider », **When** l'admin clique sur « Publier » et
   confirme, **Then** l'activité devient visible dans l'application publique, le brouillon passe à
   « publié » et sort de la file.
2. **Given** un brouillon sans coordonnées GPS ou sans prix, **When** l'admin clique sur « Publier »,
   **Then** la publication est refusée, rien n'est publié, et un message liste les champs
   obligatoires manquants.
3. **Given** un brouillon « à valider », **When** l'admin clique sur « Rejeter » en saisissant un
   motif, **Then** le brouillon passe à « rejeté », le motif est conservé, et il sort de la file.
4. **Given** l'admin vient de publier un élément, **When** il recharge la page, **Then** l'élément
   n'est plus dans la file (pas de double publication possible).

---

### User Story 4 - Compléter les champs manquants avant publication (Priority: P2)

Les brouillons arrivent souvent incomplets : par règle, l'assistant d'ingestion n'invente jamais de
coordonnées GPS ni de prix. L'admin doit donc pouvoir corriger ou compléter les champs d'un
brouillon directement depuis la page de détail, puis le publier.

**Why this priority**: sans cela, la majorité des brouillons ne sont pas publiables depuis
l'interface (sur les 3 brouillons réels actuels, 1 n'a pas de coordonnées). Elle passe après les
stories P1 car la complétion peut, en dépannage, se faire hors de l'interface.

**Independent Test**: ouvrir un brouillon sans coordonnées, compléter les champs manquants,
enregistrer, puis publier avec succès.

**Acceptance Scenarios**:

1. **Given** un brouillon sans coordonnées GPS mais avec une adresse, **When** l'admin demande le
   calcul de la localisation, **Then** le système propose des coordonnées calculées depuis
   l'adresse, avec l'adresse reconnue, sans rien enregistrer.
2. **Given** des coordonnées proposées, **When** l'admin les confirme et enregistre, **Then** le
   brouillon a des coordonnées et n'en signale plus l'absence ; s'il les refuse, rien ne change.
3. **Given** une adresse introuvable ou ambiguë, **When** l'admin demande le calcul, **Then** le
   système l'indique clairement et n'enregistre aucune coordonnée.
4. **Given** un brouillon modifié et enregistré, **When** l'admin consulte la liste des champs
   manquants, **Then** elle est mise à jour en conséquence.
5. **Given** l'admin saisit une tranche d'âge où le minimum dépasse le maximum, **When** il
   enregistre, **Then** l'enregistrement est refusé avec un message clair.

---

### Edge Cases

- Deux onglets ouverts sur le même brouillon : le second clic sur « Publier » ne crée pas de
  doublon et informe que l'élément a déjà été traité.
- Le lien d'origine d'un brouillon correspond déjà à une activité publiée : la publication est
  refusée avec un message de doublon, rien n'est créé.
- Événement ponctuel dont la date est déjà passée : il est signalé visuellement dans la file
  (« date passée ») pour inciter au rejet.
- Brouillon sans lien d'origine (capture ou légende) : le détail l'indique et affiche le texte brut
  à la place.
- Indisponibilité de la base de données : la page affiche un message d'erreur compréhensible, sans
  écran blanc, et l'espace admin reste navigable.
- File volumineuse (plus de 50 éléments) : la liste reste utilisable (pagination ou chargement
  progressif).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT offrir une adresse dédiée dans l'espace admin listant les éléments en
  attente de vérification.
- **FR-002**: Cette adresse DOIT être réservée à l'admin connecté ; tout visiteur non connecté DOIT
  être renvoyé vers la connexion admin.
- **FR-003**: La file DOIT inclure les activités et les événements ponctuels au statut « à valider »
  issus de l'ingestion, et uniquement eux. Les événements importés depuis OpenAgenda restent gérés
  par leur page admin existante et n'apparaissent pas dans cette file.
- **FR-004**: La file DOIT être triée du plus récent au plus ancien et permettre de filtrer entre
  activités et événements ponctuels.
- **FR-005**: Chaque ligne de la file DOIT afficher : nom, catégorie, ville, tranche d'âge, date de
  l'événement le cas échéant, source, date d'ajout et nombre de champs manquants.
- **FR-006**: La page de détail DOIT afficher tous les champs du brouillon, le lien d'origine
  cliquable, le texte brut extrait et les champs manquants mis en évidence.
- **FR-007**: Les âges DOIVENT être stockés en mois et affichés sous forme lisible (« dès 3 ans »,
  « 18 mois – 4 ans ») uniquement à l'affichage.
- **FR-008**: Un prix absent DOIT s'afficher « non renseigné », jamais « gratuit ».
- **FR-009**: L'admin DOIT pouvoir publier un brouillon ; la publication DOIT rendre l'élément
  visible des parents et passer le brouillon au statut « publié » en une seule opération
  indivisible (soit tout réussit, soit rien ne change).
- **FR-010**: La publication DOIT être refusée si un champ obligatoire d'une activité publiée manque
  (nom, catégorie, âges, prix, adresse, coordonnées), avec la liste des champs en cause.
- **FR-011**: La publication DOIT demander une confirmation explicite avant d'être exécutée.
- **FR-012**: L'admin DOIT pouvoir rejeter un brouillon avec un motif facultatif, conservé avec le
  brouillon.
- **FR-013**: Un brouillon déjà publié ou rejeté NE DOIT plus pouvoir être publié une seconde fois.
- **FR-014**: L'admin DOIT pouvoir modifier les champs d'un brouillon « à valider » et les
  enregistrer ; la liste des champs manquants DOIT être recalculée à l'enregistrement.
- **FR-015**: Les brouillons NE DOIVENT jamais devenir lisibles par les visiteurs du fait de cette
  fonctionnalité.
- **FR-016**: Chaque écran DOIT traiter les états chargement, erreur et vide, et être utilisable sur
  un écran de téléphone.
- **FR-017**: L'espace admin DOIT donner accès à la page de revue depuis sa navigation, avec le
  nombre d'éléments en attente.
- **FR-018**: L'admin DOIT pouvoir obtenir les coordonnées d'un brouillon par calcul automatique
  depuis son adresse ; les coordonnées proposées NE DOIVENT être enregistrées qu'après confirmation
  explicite de l'admin.

### Key Entities

- **Brouillon** : élément repéré par l'ingestion, en attente de décision. Attributs clés : nom,
  description, catégorie, âges (mois), prix, adresse et coordonnées, horaires, dates (événement
  ponctuel), tags, images, source et lien d'origine, type d'entrée, texte brut, champs manquants,
  statut (à valider / publié / rejeté), motif de revue, lien vers l'activité publiée.
- **Activité publiée** : élément visible des parents, créé à partir d'un brouillon validé. Tous ses
  champs obligatoires sont renseignés.
- **Événement ponctuel** : activité de catégorie « événement » ou portant une date de début ; il suit
  le même cycle de vie que les autres brouillons.
- **Administrateur** : unique utilisateur de l'espace admin, déjà authentifié par le mécanisme admin
  existant.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'admin traite (publie ou rejette) un brouillon complet en moins de 1 minute depuis
  l'ouverture de la file.
- **SC-002**: 100 % des publications et rejets se font depuis l'interface, sans aucune requête
  manuelle dans la console de la base de données.
- **SC-003**: 0 brouillon visible par un visiteur anonyme, avant comme après la mise en service.
- **SC-004**: 0 activité publiée avec un champ obligatoire manquant ; 0 publication en double.
- **SC-005**: La file et le détail sont utilisables sur un téléphone, sans défilement horizontal à
  375 px.
- **SC-006**: Au moins 8 brouillons sur 10 issus du test de l'Étape 1 (issue #16) peuvent être
  publiés depuis l'interface après complétion, sans recours à la console.

## Assumptions

- L'admin est le seul utilisateur ; le mécanisme de connexion admin existant (session protégeant
  toutes les adresses admin) est réutilisé tel quel.
- L'adresse proposée est `/admin/brouillons` ; le nom définitif est un détail de conception.
- Les « événements ponctuels à vérifier » sont, par défaut, les brouillons de catégorie
  « événement » ou datés ; ils vivent dans la même file que les activités.
- Un brouillon publié rejoint les activités publiées (dates incluses pour un événement), comme le
  prévoit la requête de publication de l'Étape 1.
- Les brouillons rejetés sont conservés (pas de suppression) pour l'historique et la détection de
  doublons futurs ; leur consultation dans un onglet « traités » est hors périmètre v1.
- Le calcul des coordonnées depuis l'adresse s'appuie sur un service public de géocodage
  français, gratuit et dont les résultats peuvent être stockés ; aucune nouvelle dépendance n'est
  nécessaire (choix détaillé dans research.md, R2).
- La saisie manuelle des coordonnées et le choix d'un point sur une carte sont hors périmètre v1.
- La refonte visuelle KidMap (specs 002) ne s'applique pas à l'espace admin.
- Dépendance : les ajustements de schéma prévus par l'issue #17 (après le test de l'issue #16)
  peuvent modifier des champs du brouillon ; la planification doit en tenir compte.
- Hors périmètre : modification ou dépublication d'une activité déjà publiée, édition en masse,
  notifications, revue des événements OpenAgenda (51 événements non vérifiés en base, tous passés,
  qui restent sur leur page admin actuelle).

## Clarifications

### Session 2026-11-23

- Q : La file doit-elle inclure les événements OpenAgenda non vérifiés ? → R : Non, seulement les
  brouillons de l'ingestion (FR-003).
- Q : Comment obtenir les coordonnées GPS manquantes ? → R : Calcul automatique depuis l'adresse,
  enregistré seulement après confirmation de l'admin (US4, FR-018).
