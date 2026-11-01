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
- Les profils `TYPE_B_SERVICE` sont refusés tant qu’un exécuteur déterministe dédié n’est pas implémenté.

La fiche d’agent garde les cinq dernières propositions de chaque profil en mémoire dans la page courante, avec la mission correspondante. Cet historique n’est pas écrit dans `localStorage` ni enregistré côté serveur; il disparaît à la fermeture ou au rechargement de la page et peut être effacé pour un profil.

En développement, Vite monte les routes API. Pour le serveur de production, exécute `npm run build`, puis `npm start` avec les mêmes variables d’environnement.

## Limites de sécurité et d’exploitation

Le dépôt ne contient pas encore de système de comptes ou d’authentification administrateur. L’activation d’une clé serveur sur un site public pourrait permettre à des visiteurs d’utiliser son quota. Garde l’option désactivée sur un déploiement public jusqu’à l’ajout d’une authentification et d’un contrôle de budget adaptés.

La réponse du modèle est une proposition non vérifiée. Elle ne constitue pas une preuve d’exécution, de paiement, de connexion, de conformité ou de résultat externe.
