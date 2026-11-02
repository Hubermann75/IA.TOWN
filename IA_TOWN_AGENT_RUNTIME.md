# IA TOWN — Runtime des agents

Le registre de 94 profils reste un catalogue descriptif. Le runtime actuel permet un appel réel à Gemini, à la demande, pour les profils `TYPE_A_IA` et `TYPE_C_HYBRID` : le modèle produit une proposition de travail en français, contextualisée par le rôle, la mission préchargée, les outils déclarés et les permissions déclarées. Ces outils et permissions restent des métadonnées; ils ne sont pas connectés au runtime. Le profil Type C ne dispose pas encore de sa partie déterministe. Cela ne fait donc pas de ces profils des agents autonomes. Le runtime ne lance aucune commande, ne modifie aucun fichier et ne touche ni aux paiements, ni aux appareils, ni aux comptes.

## Activation explicite

Le runtime est désactivé par défaut. Pour un environnement local contrôlé, configure les variables côté serveur :

```env
IA_TOWN_GEMINI_ENABLED=true
GEMINI_API_KEY=<clé conservée côté serveur>
GEMINI_MODEL=gemini-3.8-flash
```

Ne place pas la clé dans une variable `VITE_*`, dans le navigateur, dans le dépôt ou dans un fichier de configuration publié. La route utilise `store: false` et ne conserve pas le texte de mission dans IA TOWN. Une demande envoyée au fournisseur peut toutefois être facturée selon le compte Google AI utilisé.

## Routes

- `GET /api/agents/status` retourne si le fournisseur est disponible, sans exposer la clé.
- `POST /api/agents/propose` accepte `{ "agentId": "01", "mission": "..." }` et renvoie une proposition horodatée.
- Les missions sont limitées à 2 000 caractères et à six demandes par minute par connexion serveur.
- La route Gemini `/propose` refuse les profils `TYPE_B_SERVICE`; l’exécution déterministe passe par le registre d’outils local et ses grants explicites.

## File de missions locale

La fiche agent permet d’enregistrer une mission dans une file locale, avec priorité, horodatage, tentatives, événements et résultat. L’ajout en file n’appelle pas Gemini. Un bouton distinct lance explicitement la prochaine tâche de type proposition; l’appel peut être facturé par le compte Google configuré, et son coût n’est pas encore mesuré par IA TOWN.

Les profils disposant d’un outil local sont sélectionnés par ID, nom et type historiques, avec un grant d’exécution dédié. Cinq rôles OPPORTUNITY.LAB possèdent maintenant une fonction déterministe ciblée : `SCOUT.AI` structure des signaux de demande saisis, `NICHE.DRILLER` compare des fiches concurrentielles saisies, `MARGIN.PREDICTOR` calcule une marge, `PROTOTYPE.TRIGGER` prépare un plan de validation et `REVENUE.ENGINE` classe des hypothèses d’opportunité. Ils sont associés comme pilotes aux rôles V6 80 à 84, sans remplacer encore le catalogue historique.

Ces outils ne naviguent pas sur Internet et ne vérifient pas les sources fournies. Les comparaisons signalent des écarts de mention, pas des fonctions réellement absentes. Le plan de validation n’est pas exécuté. Le classement est un indice de priorité selon une formule visible, pas une probabilité de succès. Les projections affichent zéro revenu confirmé. Les autres profils de service B restent sans exécuteur; les profils A/C sans outil local produisent uniquement une proposition textuelle. Marquer un résultat comme relu ne valide ni n’exécute une action externe.

Les missions et propositions sont enregistrées sous `IA_TOWN_AGENT_TASKS_V1` dans le `localStorage` du navigateur, avec une limite de 200 tâches. Ce stockage n’est ni une base de données serveur, ni une sauvegarde cloud, ni une synchronisation multi-appareils. Si une exécution est interrompue par un rechargement, la tâche passe à l’état d’échec avec résultat inconnu et n’est jamais relancée automatiquement. L’utilisateur peut la remettre en file manuellement.

L’interface garde une distinction explicite entre outils/permissions déclarés et capacités connectées/appliquées. Le registre d’exécution normalisé contient 94 profils historiques : cinq exécuteurs locaux ciblés, 36 profils de proposition Gemini conditionnelle et 53 rôles sans exécuteur. Le catalogue n’est pas encore réconcilié avec les 94 noms et répartitions du cahier des charges V6. Les outils non connectés, permissions non appliquées, dépendances non vérifiées, budgets non configurés et tests par rôle sont signalés comme tels.

En développement, Vite monte les routes API. Pour le serveur de production, exécute `npm run build`, puis `npm start` avec les mêmes variables d’environnement.

## Limites de sécurité et d’exploitation

Le dépôt ne contient pas encore de système de comptes ou d’authentification administrateur. L’activation d’une clé serveur sur un site public pourrait permettre à des visiteurs d’utiliser son quota. Garde l’option désactivée sur un déploiement public jusqu’à l’ajout d’une authentification et d’un contrôle de budget adaptés.

La réponse du modèle est une proposition non vérifiée. Elle ne constitue pas une preuve d’exécution, de paiement, de connexion, de conformité ou de résultat externe.
