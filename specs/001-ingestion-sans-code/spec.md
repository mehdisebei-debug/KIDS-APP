# Feature Specification: Ingestion d'activités sans code (Étape 1)

**Feature Branch**: `001-ingestion-sans-code`

**Created**: 2026-10-11

**Status**: Draft

**Input**: User description: "Alimenter la base avec les activités trouvées chaque jour sur les réseaux (Instagram, Facebook, sites). Étape 1, sans code : un Projet Claude, avec le connecteur Supabase, extrait les infos d'un lien ou d'une capture d'écran et les insère dans une table de brouillons. Je valide ensuite avant publication. Rien n'est visible par les parents sans validation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capturer une activité repérée en brouillon (Priority: P1)

L'administrateur (seul acteur, le développeur du projet) repère une activité pour enfants sur un
réseau social ou un site. Depuis son téléphone ou son ordinateur, il transmet à l'assistant un lien,
une capture d'écran ou une légende copiée. L'assistant extrait les informations, présente un résumé,
attend la confirmation explicite « ok », puis enregistre l'activité comme brouillon « à valider ».

**Why this priority**: c'est la boucle de valeur centrale : sans elle, la base ne se remplit pas.

**Independent Test**: transmettre une publication réelle, répondre « ok », constater qu'un brouillon
apparaît dans la file « à valider » avec les champs extraits.

**Acceptance Scenarios**:

1. **Given** une publication Instagram contenant nom, lieu et tranche d'âge, **When** l'admin envoie
   le lien, **Then** l'assistant affiche un résumé champ par champ et n'enregistre rien avant « ok ».
2. **Given** le résumé affiché, **When** l'admin répond « ok », **Then** un brouillon est créé avec le
   statut « à valider » et la source d'origine.
3. **Given** une information absente de la publication (ex. prix), **When** l'assistant extrait,
   **Then** le champ est laissé vide et signalé comme manquant, jamais deviné.
4. **Given** une tranche d'âge exprimée en années (« dès 3 ans »), **When** l'assistant extrait,
   **Then** elle est enregistrée en mois (36).

---

### User Story 2 - Éviter les doublons (Priority: P1)

Avant toute insertion, l'assistant vérifie qu'aucun brouillon ni aucune activité publiée ne porte déjà
la même source d'origine.

**Why this priority**: les mêmes activités circulent sur plusieurs comptes ; les doublons pollueraient
la file de validation.

**Independent Test**: soumettre deux fois le même lien ; la seconde tentative est signalée et rien
n'est inséré.

**Acceptance Scenarios**:

1. **Given** un brouillon existant pour un lien, **When** l'admin soumet ce même lien, **Then**
   l'assistant signale le doublon et n'insère rien.
2. **Given** une capture d'écran sans lien, **When** une activité au nom et à la ville proches existe
   déjà, **Then** l'assistant signale un doublon probable et demande quoi faire.

---

### User Story 3 - Garantir que rien n'est public sans validation (Priority: P1)

Les brouillons ne sont jamais lisibles par les parents. Seule une validation humaine les fait passer
au statut publié.

**Why this priority**: exigence non négociable de l'admin ; une donnée erronée sur une activité pour
tout-petits nuit à la confiance.

**Independent Test**: créer un brouillon, puis interroger les données avec un accès visiteur : aucun
brouillon n'est retourné.

**Acceptance Scenarios**:

1. **Given** un brouillon « à valider », **When** un visiteur anonyme consulte l'application ou les
   données publiques, **Then** le brouillon n'apparaît nulle part.
2. **Given** l'assistant connecté à la base, **When** il reçoit une demande d'écriture hors de la
   table de brouillons, **Then** il refuse.

---

### User Story 4 - Éprouver le flux sur 10 activités réelles (Priority: P2)

L'admin teste le flux sur 10 activités réelles (3 liens, 3 captures, 3 légendes copiées, 1 doublon
volontaire) et consigne les problèmes dans un tableau.

**Why this priority**: les ajustements de schéma de l'Étape 1 et la conception de l'Étape 2 en dépendent.

**Independent Test**: le tableau de 10 lignes est rempli, et chaque problème a une décision associée.

---

### User Story 5 - Ajuster le schéma après les tests (Priority: P3)

À partir des constats du test, l'admin arrête les catégories définitives, les champs manquants, le
format des horaires et la stratégie de conservation des images.

**Independent Test**: chaque constat du tableau de test est soit traité dans le schéma, soit écarté
explicitement.

### Edge Cases

- Publication sans adresse précise (« dans le 11e ») : adresse partielle conservée, coordonnées vides.
- Événement ponctuel daté (atelier du 12/11) vs activité permanente (parc) : les dates sont optionnelles.
- Âge exprimé de façon floue (« pour les petits ») : âge laissé vide, signalé.
- Lien Instagram dont l'image expire après quelques jours : l'image ne doit pas être la seule trace.
- Capture d'écran sans aucun lien : la source est « capture » et la détection de doublon se fait sur
  nom + ville.
- Activité hors Île-de-France ou hors 0–6 ans : l'assistant le signale avant tout enregistrement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT conserver chaque activité ingérée comme brouillon, distinct des activités publiées.
- **FR-002**: Chaque brouillon DOIT avoir le statut « à valider » à sa création.
- **FR-003**: Le système DOIT refuser deux brouillons ayant la même source d'origine (lien).
- **FR-004**: Les âges DOIVENT être enregistrés en mois (0–72), jamais en années.
- **FR-005**: Une information absente de la source DOIT rester vide ; aucune valeur ne DOIT être inventée.
- **FR-006**: L'assistant DOIT présenter un résumé et attendre une confirmation explicite avant chaque insertion.
- **FR-007**: L'assistant DOIT écrire uniquement dans la table de brouillons.
- **FR-008**: Les brouillons NE DOIVENT PAS être lisibles par les visiteurs de l'application.
- **FR-009**: La structure d'un brouillon DOIT reprendre celle d'une activité publiée afin que la publication soit une simple copie.
- **FR-010**: Le flux DOIT être utilisable depuis un ordinateur et depuis un téléphone.
- **FR-011**: Chaque brouillon DOIT mémoriser son type d'entrée (lien, capture, légende) et le texte brut extrait, pour audit.

### Key Entities

- **Brouillon d'activité** : activité extraite en attente de validation. Mêmes attributs qu'une activité
  publiée (nom, description, catégorie, âges en mois, prix, adresse, coordonnées, horaires, tags,
  images, source), plus statut de validation, lien d'origine, type d'entrée, texte brut, dates
  optionnelles pour les événements ponctuels et notes de validation.
- **Activité publiée** : activité visible par les parents, obtenue après validation d'un brouillon.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Une activité repérée est transformée en brouillon en moins de 2 minutes.
- **SC-002**: 0 brouillon visible par un visiteur anonyme.
- **SC-003**: Sur les 10 activités de test, 100 % des doublons volontaires sont détectés.
- **SC-004**: Sur les 10 activités de test, 0 valeur inventée (champ rempli sans appui dans la source).
- **SC-005**: Au moins 8 sur 10 activités de test donnent un brouillon validable sans ressaisie complète.

## Assumptions

- L'admin est l'unique utilisateur du flux d'ingestion à l'Étape 1.
- La validation (brouillon → publié) est manuelle à l'Étape 1 ; l'interface de revue relève de l'Étape 2.
- La table des activités publiées n'existe pas encore en base (l'application utilise des données
  fictives) ; le brouillon s'aligne donc sur le type `Activity` du code, qui fait référence.
- Le géocodage (adresse → coordonnées) n'est pas fait à l'Étape 1 : coordonnées vides sauf si la source les fournit.
- Le connecteur de base de données ne permet pas de restreindre techniquement l'écriture à une seule
  table ; la restriction repose sur les instructions de l'assistant et sur l'approbation manuelle de
  chaque écriture.
