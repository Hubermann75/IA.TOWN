# IA TOWN — Runtime des agents

Le registre de 94 profils reste un catalogue historique. Le runtime propose des appels Gemini à la demande pour les profils `TYPE_A_IA` et `TYPE_C_HYBRID`, sept outils déterministes locaux ciblés et un connecteur public distant en lecture seule pour le pilote PROSPECTOR. Ces composants limités ne font pas des 94 profils des agents autonomes ni un catalogue V6 complet. Aucun exécuteur ici ne lance de commande système ou ne touche aux paiements, aux appareils ou aux comptes.

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
- `POST /api/agents/prospect` accepte uniquement le profil historique `MINER.PRIME` (ID `39`) et une mission `{ "keywords": "développement application web" }`; il renvoie des avis publics BOAMP en lecture seule.
- Les missions sont limitées à 2 000 caractères et à six demandes par minute par connexion serveur.
- La route Gemini `/propose` refuse les profils `TYPE_B_SERVICE`; les exécutions déterministes locales et le connecteur BOAMP distant passent par le registre d’outils et des grants explicites. La route de prospection a une limite distincte de 12 recherches/minute/adresse IP.

## File de missions locale

La fiche agent permet d’enregistrer une mission dans une file locale, avec priorité, horodatage, tentatives, événements et résultat. L’ajout en file n’appelle pas Gemini. Un bouton distinct lance explicitement la prochaine tâche de type proposition; l’appel peut être facturé par le compte Google configuré, et son coût n’est pas encore mesuré par IA TOWN.

Les profils disposant d’un outil connecté sont sélectionnés par ID, nom et type historiques, avec un grant d’exécution dédié. Cinq rôles OPPORTUNITY.LAB possèdent une fonction déterministe ciblée : `SCOUT.AI` structure des signaux de demande saisis, `NICHE.DRILLER` compare des fiches concurrentielles saisies, `MARGIN.PREDICTOR` calcule une marge, `PROTOTYPE.TRIGGER` prépare un plan de validation et `REVENUE.ENGINE` classe des hypothèses d’opportunité. Ils sont associés comme pilotes aux rôles V6 80 à 84. `MINE.GUARD` (ID historique 38) dispose d’un filtre local de risques associé au rôle cible V6 16. `MINER.PRIME` (ID historique 39) a un connecteur de recherche BOAMP distant, associé comme pilote au rôle V6 14 `PROSPECTOR`. `ORE.REFINER` (ID historique 41) exécute un calcul déterministe d’économie de contrat, associé au rôle V6 15 `GOLD ANALYST`; les montants doivent être saisis manuellement et l’avis n’est pas revérifié. Ces associations ne réconcilient pas le catalogue historique aux rôles V6.

Les outils locaux d’OPPORTUNITY.LAB, MINE.GUARD et GOLD ANALYST n’effectuent pas de recherche Internet. Les comparaisons signalent des écarts de mention, pas des fonctions réellement absentes. Le plan de validation n’est pas exécuté. Le classement est un indice de priorité selon une formule visible, pas une probabilité de succès. GOLD ANALYST traite chaque montant comme une hypothèse fournie par l’utilisateur et fixe le revenu confirmé à zéro; son lien source n’est pas une vérification de l’avis. Les projections des autres outils affichent aussi zéro revenu confirmé. MINE.GUARD signale certains risques déclarés et les informations à vérifier; même un résultat sans signal bloquant n’est ni un avis juridique ni une autorisation d’exploiter l’offre. Aucun outil n’interagit avec une plateforme ou un compte financier. Les autres profils de service B restent sans exécuteur; les profils A/C sans outil local produisent uniquement une proposition textuelle. Marquer un résultat comme relu ne valide ni n’exécute une action externe.

### Périmètre PROSPECTOR / BOAMP

Le connecteur utilise exclusivement l’API Explore officielle du BOAMP, en lecture seule. La mission n’accepte que des mots-clés; les caractères de contrôle SQL, URL et champs supplémentaires sont refusés. La recherche est limitée au champ `objet`, aux annonces `APPEL_OFFRE` et aux champs `idweb,objet,dateparution,datelimitereponse,nature,type_marche_facette`. Jusqu’à 30 lignes sont examinées, et 10 au maximum sont affichées. Les avis sans titre/identifiant ou dont l’échéance n’est pas une date ISO avec fuseau (ou une date ISO seule), non interprétable, ou déjà passée sont écartés.

L’API renvoie le résultat au moteur de mission; le front-end valide de nouveau le profil, l’outil, les dates et les liens officiels avant de le conserver dans l’historique. Les URLs de notices sont reconstruites sur `boamp.fr` depuis l’identifiant d’avis. Le connecteur n’ouvre pas de session de navigation, n’envoie aucun formulaire et ne contacte aucun acheteur. Les données publiques peuvent être retardées, et le champ `objet` peut contenir des renseignements personnels. L’API est annoncée gratuite par BOAMP; le coût serveur, réseau et stockage reste non mesuré par IA TOWN.

Le [BOAMP indique que l’API est en version bêta et que les données sont mises à jour chaque semaine](https://www.boamp.fr/pages/api-boamp/); l’accès à l’API est annoncé gratuit. Chaque collecte a un horodatage, mais cet horodatage n’est pas l’horodatage de mise à jour de l’avis. Chaque piste nécessite une vérification humaine sur la [source officielle des avis BOAMP](https://www.boamp.fr/explore/dataset/boamp/); aucune opportunité n’est assimilée à un contrat gagné ou à un revenu.

Les missions et propositions sont enregistrées sous `IA_TOWN_AGENT_TASKS_V1` dans le `localStorage` du navigateur, avec une limite de 200 tâches. Ce stockage n’est ni une base de données serveur, ni une sauvegarde cloud, ni une synchronisation multi-appareils. Si une exécution est interrompue par un rechargement, la tâche passe à l’état d’échec avec résultat inconnu et n’est jamais relancée automatiquement. L’utilisateur peut la remettre en file manuellement.

L’interface garde une distinction explicite entre outils/permissions déclarés et capacités connectées/appliquées. Le registre d’exécution normalisé contient 94 profils historiques : sept exécuteurs déterministes locaux ciblés, un pilote distant public en lecture seule, 35 profils de proposition Gemini conditionnelle et 51 rôles sans exécuteur. Ces huit profils outillés ne sont pas huit agents V6 complets : le catalogue n’est pas réconcilié avec les 94 noms et répartitions du cahier des charges, les communications entre agents sont absentes et le circuit économique externe n’est pas réalisé. Les outils non connectés, permissions non appliquées, dépendances non vérifiées, budgets non configurés et tests par rôle sont signalés comme tels.

En développement, Vite monte les routes API. Pour le serveur de production, exécute `npm run build`, puis `npm start` avec les mêmes variables d’environnement.

## Limites de sécurité et d’exploitation

Le dépôt ne contient pas encore de système de comptes ou d’authentification administrateur. L’activation d’une clé serveur sur un site public pourrait permettre à des visiteurs d’utiliser son quota. Garde l’option désactivée sur un déploiement public jusqu’à l’ajout d’une authentification et d’un contrôle de budget adaptés.

La réponse du modèle est une proposition non vérifiée. Elle ne constitue pas une preuve d’exécution, de paiement, de connexion, de conformité ou de résultat externe.
