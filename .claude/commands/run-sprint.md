---
description: Fait tourner tout le pipeline sur la prochaine carte prête (dev → review → QA).
---
Orchestre le workflow complet, **une carte à la fois** :

1. Sous-agent `developer` : prendre la prochaine carte "Ready" (priorité p1 > p2) → PR ouverte.
2. Sous-agent `reviewer` : review de la PR.
   - `VERDICT: CHANGES_REQUESTED` → renvoyer au `developer` avec la liste des changements
     (maximum 2 boucles dev↔review, ensuite STOP et escalade à l'humain).
   - `VERDICT: APPROVED` → étape 3.
3. Sous-agent `qa` : validation des critères d'acceptation.
   - `QA: NO-GO` → retour au `developer` (compte dans la même limite de 2 boucles).
   - `QA: GO` → étape 4.
4. **STOP : demander la validation humaine avant tout merge sur `main`.**
   Après accord explicite seulement : merge squash, carte "Deployed", vérifier Vercel.

À la fin, rendre un résumé : issue, PR, verdicts, statut final, URL de déploiement.

Cible éventuelle (sinon 1re carte "Ready") : $ARGUMENTS
