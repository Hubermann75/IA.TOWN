# IA TOWN & CCC.CONNECT HUB — ÉTAT D'AVANCEMENT & PROGRÈS V5.0

**Mise à jour :** 31 Octobre 2026  
**Déclaration historique :** « 100% » — chiffre non mesuré et non confirmé par l’audit technique; ne pas l’utiliser comme avancement réel.

> **Note historique — 1 novembre 2026 :** le tableau et les indicateurs ci-dessous proviennent des déclarations antérieures du projet. Ils ne constituent pas des preuves de fonctionnement réel. Les tests/build/contrôles HTTP mentionnés dans cette note historique n’ont pas tous été réexécutés pendant la phase V6. Les montants de revenus, le hashrate et les appareils restent des valeurs de démonstration sans sources authentifiées. L’état contrôlé de cette phase est consigné ci-dessous.

## État technique V6 — 2 novembre 2026

### Phases réalisées : cycle de missions, OPPORTUNITY.LAB et pilotes CENTMINE

- Un schéma commun dérive une définition d’exécution pour les 94 profils historiques du registre. Il distingue les outils déclarés, les outils locaux connectés, les permissions réellement appliquées, les budgets inconnus et les tests individuels absents.
- Une file locale persistante enregistre les missions avec priorité, historique, tentatives, résultat, erreur, revue et annulation avant exécution. L’ordre de priorité est déterministe.
- La vue Agents enregistre désormais la mission en file sans augmenter les compteurs de travail terminé. La vue détaillée lance un outil local ou une proposition Gemini seulement après une action explicite de l’utilisateur.
- Les profils sans exécuteur restent en file et ne sont pas envoyés au fournisseur. Un rechargement pendant un appel marque la tâche en échec avec résultat inconnu; aucune relance automatique n’a lieu.
- Les propositions sont persistées localement et soumises à revue humaine. « Relue » ne signifie pas action autorisée ni exécutée.
- Le coût d’appel Gemini demeure non mesuré. `localStorage` n’est pas une base serveur et ne synchronise pas les appareils.
- Cinq outils déterministes locaux couvrent des tâches délimitées des rôles historiques `SCOUT.AI` (ID 71), `NICHE.DRILLER` (75), `MARGIN.PREDICTOR` (73), `PROTOTYPE.TRIGGER` (76) et `REVENUE.ENGINE` (74). Ils sont associés comme pilotes aux cibles V6 80 `DEMAND.SCOUT`, 81 `COMPETITOR.ANALYST`, 82 `MARGIN.CALCULATOR`, 83 `VALIDATION.AGENT` et 84 `PORTFOLIO.MANAGER`.
- Chaque exécuteur pilote expose maintenant la référence du test qui valide sa fonction; le registre signale les profils déterministes sans test associé.
- Le profil historique `MINE.GUARD` (ID 38) est relié au rôle cible V6 16. Son outil local filtre les signaux de risque déclarés, les conditions de paiement, les règles de plateforme et les droits d’usage; l’entrée garde ses sources et dates.
- MINE.GUARD classe un dossier `BLOCKED`, `REVIEW_REQUIRED` ou `NO_RED_FLAGS_RESEARCH_ONLY`. Même le dernier état ne certifie rien : les champs et sources sont fournis par l’utilisateur, non vérifiés; aucune action web, plateforme ou financière n’est exécutée.
- Le registre historique présente six profils CENTMINE (IDs 38 à 43), alors que la spécification V6 en demande huit. `MINER.PRIME` (ID 39) possède un connecteur de recherche publique BOAMP en lecture seule, associé comme pilote au rôle cible V6 14 `PROSPECTOR`. `ORE.REFINER` (ID 41) possède maintenant un calculateur économique local associé comme pilote au rôle V6 15 `GOLD ANALYST`. Ces correspondances ne renomment ni ne réconcilient le catalogue; les autres rôles CENTMINE restent à implémenter.
- Le connecteur BOAMP interroge uniquement l’API officielle et n’accepte aucun URL libre. Il sélectionne les champs d’identifiant, objet, publication, échéance, nature et type de marché; il examine jusqu’à 30 enregistrements et en présente au plus 10. Il rejette les avis qui ne sont pas des appels d’offres, les titres/identifiants inutilisables, les échéances absentes ou non ISO, ainsi que les échéances passées.
- Les résultats conservent la requête, l’heure de collecte, les compteurs, le lien BOAMP construit depuis l’identifiant source et un indicateur d’admissibilité non vérifiée. Le résultat est conservé dans l’historique `localStorage` et attend la revue humaine. Aucune candidature, prise de contact, dépense, vente ou écriture financière n’est déclenchée.
- Garde-fous du connecteur : rôle ID/nom/type et capacité appliquée, contrôle d’origine, 12 requêtes/minute/IP, délai réseau de 8 s, redirections refusées, réponse limitée à 512 Ko et champs minimaux. Les recherches passent par le serveur IA TOWN; les mots-clés sont envoyés à BOAMP. Les titres d’avis peuvent contenir des renseignements personnels; le coût d’hébergement et de bande passante n’est pas mesuré.
- Vérification live en lecture seule le 2 novembre 2026 : « prestations » a produit 125 623 correspondances annoncées, 30 enregistrements examinés, 10 avis encore ouverts retenus et 4 écartés; « développement application web » a produit 96 correspondances annoncées, 30 examinés et aucun avis avec échéance future parmi ces 30. Un POST à la route de l’application compilée a retourné le même résultat (HTTP 200; 10 liens BOAMP officiels validés). Les résultats ne prouvent pas que la source est exhaustive ou mise à jour à l’instant de la collecte.
- `SCOUT.AI` structure les signaux et sources saisis par l’utilisateur sans recherche web ni vérification en ligne. `NICHE.DRILLER` compare les mentions présentes dans des fiches saisies; l’absence de mention n’est pas une preuve d’absence. `PROTOTYPE.TRIGGER` prépare un plan qui n’est pas exécuté. `REVENUE.ENGINE` classe des hypothèses avec un indice documenté, pas une probabilité de succès ni un revenu réel. Tous ces outils restent locaux, sans frais API ni effet externe.
- Le registre principal garde encore les anciens IDs/noms; les correspondances sont des pilotes d’exécution et ne valent pas réconciliation complète du catalogue V6. Les projections affichent zéro revenu confirmé.
- Le registre ne correspond pas encore aux 94 rôles nommés de la spécification V6. Il comporte 8 profils avec exécuteur local déterministe, 1 pilote de recherche publique distant en lecture seule, 34 profils de proposition Gemini conditionnelle et 51 profils sans exécuteur. Neuf profils historiques sur 94 ont donc un exécuteur ou connecteur ciblé (9,6 %), mais aucun n’est compté comme agent V6 complet avec toutes ses fonctions métier, collaboration inter-bâtiments et parcours externe validé.

**Validation de la phase initiale du moteur (2 novembre 2026) :** `npm test` passait 52/52; `npm run lint` et `npm run build` réussissaient. Ces chiffres sont historiques; la validation la plus récente du pilote Prospector figure ci-dessous.

### Extension livrée : recherche publique PROSPECTOR

- Les résultats de l’API sont lus et validés côté serveur avant d’être rattachés à une tâche. L’interface affiche les avis source, leurs échéances interprétées et le niveau de vérification; les liens mènent au site BOAMP officiel.
- Tests automatisés au checkpoint PROSPECTOR : 59/59 réussis, incluant parsing de mission, champs bornés, dates avec fuseau, avis clos/invalides, format de réponse, profils autorisés, origine HTTP, file et persistance. Voir le checkpoint GOLD ANALYST ci-dessous pour les résultats actuels.
- `npm run lint` (`tsc --noEmit`) réussit.
- Le connecteur a réussi deux recherches publiques en direct et n’a lu que les champs sélectionnés. Son test automatisé de route HTTP utilise un connecteur simulé; en plus, le serveur compilé et sa route ont été lancés puis vérifiés en direct contre BOAMP.
- `npm run build` réussit pour le client et le serveur. Le bundle JavaScript minifié est de 976,88 kB (au-dessus du seuil d’avertissement de 500 kB); le precache PWA est de 26 833,46 KiB, en hausse par rapport au relevé précédent (969,05 kB JS; 26 825,64 KiB precache).
- Le serveur compilé a été lancé sur `127.0.0.1:31917`, puis la route `/api/agents/prospect` a été appelée en direct vers BOAMP et a retourné HTTP 200; le serveur a ensuite été arrêté. Cette vérification prouve le chemin API et la recherche publique en lecture seule, pas l’affichage graphique dans un navigateur.
- Aucun appel Gemini, déploiement public, appareil CCC, candidature, vente, paiement ou circuit commercial complet n’a été testé.

### Extension livrée : calcul économique GOLD ANALYST

- Le profil historique `ORE.REFINER` (ID 41) exécute localement le rôle pilote V6 15 `GOLD ANALYST` via `centmine.gold-analyst-economic-screening.v1`; son grant est dédié et l’outil n’a aucun effet externe.
- À partir d’un identifiant BOAMP et de montants entrés manuellement, il calcule la réserve de risque, les coûts estimés totaux, le seuil de valeur contractuelle, le résultat projeté et la marge. L’identifiant produit un lien source officiel, mais l’avis, son échéance, les coûts et l’admissibilité ne sont pas revérifiés.
- Les chiffres sont des hypothèses fournies par l’utilisateur : l’outil n’extrait pas la valeur du marché ni ses coûts. Le revenu confirmé est toujours fixé à 0 €; le résultat affiché ne signifie ni attribution, ni commande, ni encaissement. Aucun registre comptable ni agent bancaire n’est appelé.
- Validation du checkpoint GOLD ANALYST seul : `npm test` 60/60 réussis; `npm run lint` (`tsc --noEmit`) réussi; `npm run build` réussi pour le client et le serveur. Le checkpoint courant, après ajout du transfert, est détaillé ci-dessous.

### Transfert supervisé PROSPECTOR → GOLD ANALYST

- Un avis BOAMP ne peut être transmis depuis l’interface qu’après avoir marqué sa recherche PROSPECTOR comme relue. Le transfert s’appuie sur un résultat distant dont le profil et le lien BOAMP sont validés.
- Le formulaire GOLD ANALYST reçoit le titre, l’identifiant, l’échéance et l’horodatage de collecte de l’avis. Les cinq hypothèses financières sont laissées à `null`; aucun prix, coût ni taux de risque n’est supposé.
- La file refuse d’enregistrer une mission GOLD ANALYST tant que ses hypothèses ne passent pas le parseur borné. La tâche financière enregistre le `parentTaskId` de la recherche PROSPECTOR dans `localStorage` et l’affiche dans son historique.
- Ce transfert demeure humain et local au navigateur; ce n’est pas encore un bus autonome entre agents, une base serveur ou une vérification d’admissibilité. La recherche source reste seulement consultée et relue; l’analyse n’entraîne aucune candidature, vente ou écriture bancaire.
- Validation de ce checkpoint précédent (avant l’ajout CEO) : `npm test` 62/62 réussis; `npm run lint` (`tsc --noEmit`) réussi; `npm run build` réussi pour le client et le serveur. Le checkpoint le plus récent est décrit ci-dessous.

### Extension livrée : CEO.AGENT — plan local et transmissions supervisées

- Le rôle cible CEO.AGENT V6 #01 est servi par le profil historique DIRECTOR.GENCY #06 sans modifier le registre historique. Un grant dédié autorise uniquement la planification exécutive locale; aucune permission de budget, signature ou négociation n’est ajoutée.
- L’outil produit un instantané des 94 profils, 16 bâtiments et de la file locale du navigateur; les textes de missions ne sont pas recopiés. Il détaille cinq missions préparatoires vers les outils OPPORTUNITY.LAB existants, avec dépendances, état local et entrées requises.
- Les sous-missions ne sont pas envoyées automatiquement. Après relecture du résultat CEO, l’interface peut ouvrir un rôle cible. L’utilisateur saisit les données; la mise en file refuse les champs essentiels absents et conserve le `parentTaskId`. Le parseur métier du rôle cible vérifie le format complet à l’exécution. Il s’agit d’un transfert local médié par l’utilisateur, pas d’un bus d’agents.
- Une relecture Gemini est facultative et constitue une tâche distincte. Aucun appel Gemini n’a été réalisé pendant cette phase. Le coût fournisseur reste non mesuré.
- Résultats vérifiés le 2 novembre 2026 : `npm run lint` réussi; `npm run build` réussi pour client et serveur. Le bundle client minifié est de 1 008,44 kB, le precache PWA de 26 864,77 KiB; Vite signale le seuil de taille de bundle et deux imports sans extension dans son chargeur natif.
- `npm test` a exécuté 69 tests : 68 réussis; le test HTTP de route PROSPECTOR échoue avant ses assertions avec `EACCES` sur `127.0.0.1` (environnement d’exécution interdit à ce test son écoute/connexion loopback). Aucun autre échec n’a été observé. Ce résultat ne certifie pas le test HTTP dans cet environnement.
- Aucun test visuel navigateur, appel Gemini, appareil CCC, transmission vers un agent distant, dépense ou vente réelle n’a été exécuté.

---

## 1. Ancien tableau déclaratif V5 — non vérifié

| Domaine Fonctionnel | Exigences Clés | Taux de Complétion | État de Validation |
| :--- | :--- | :---: | :--- |
| **Infrastructures Bâtiments** | 16 bâtiments préservés et intégrés en coupe transversale | **100%** | Validé visuellement et unitairement |
| **Mines AI.DEPTH.CENTMINE** | 3 galeries souterraines, régulation thermique, Mine Guard | **100%** | Hashrate 142 MH/s actif, wagonnets animés |
| **Registre des Agents** | 94 agents avec typologie Type A, B et C | **100%** | Registre complet de 01 à 94 avec métriques |
| **Passerelles CCC (#85 à #94)** | Rôles dédiés Windows, Android, Wear OS, Google TV | **100%** | Appairage QR, commandes distantes, RBAC |
| **Moteur Économique** | Zéro gain fictif, ségrégation stricte des fonds encaissés | **100%** | La suite globale passe 31/31 tests au 1 novembre 2026 |
| **Cost Guard & Plafonds** | 60€/jour API, 250€/mois hébergement, suspension auto | **100%** | Mécanisme d'alerte et coupure testé |
| **Chaîne Commerciale** | 10 étapes mesurables + génération de fichiers réels | **100%** | Script shell, certificat JSON, facture textuelle |
| **Synchronisation d'États** | Windows 11 ⇄ Android 15, Last-Write-Wins, file hors-ligne | **100%** | Réconciliation delta instantanée validée |
| **Design System & Visuel** | Cyberpunk Shelter, Fallout Shelter + Nintendo + Bethesda | **100%** | Animations 60 FPS, zéro saturation agressive |
| **Suite Documentaire** | 7 fichiers markdown d'audit, architecture, agents, tests | **100%** | Documentation complète disponible |

---

## 2. Ancien snapshot déclaré « réel » — non authentifié
- **Fonds Encaissés Réels :** 1 965.00 € (En banque au compte scellé)
- **Dépenses Réelles Déduites :** 662.00 € (API, serveurs, publicité, commissions)
- **Résultat Net Réel :** 1 303.00 €
- **Gains Fictifs Autorisés :** 0.00 € (Interdiction absolue dans le code)
- **Hashrate Galeries CentMine :** 142.4 MH/s (Consommation régulée)
- **Terminaux CCC Connect Synchronisés :** 5 appareils (Windows 11, Pixel 9 Pro, Galaxy Tab, Watch 6, Sony TV)
- **Temps Moyen d'Exécution Téléchargement :** 1.2 seconde
- **Taux de Succès des Tests Unitaires :** 100% (31/31 tests passés le 1 novembre 2026)
