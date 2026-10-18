# AI Automation Agency

Site vitrine en français, conçu à partir du business plan fourni : présentation de l’agence, trois familles de services, méthode de travail et contact.

## Démarrage

Node.js 22 ou ultérieur est nécessaire.

```sh
cd /workspace/Ai-Automation
npm ci --cache /tmp/npm-cache
npm run dev
```

Le serveur de développement écoute sur le port 3000 et inclut le formulaire de contact. `PORT` permet de choisir un autre port.

```sh
npm test
npm run build
npm start
```

En production, le même serveur distribue `dist/` et l’API. Une prévisualisation Vite seule ne traite pas le formulaire.

## Demandes de contact

`POST /api/contact` valide les données et le consentement, puis enregistre chaque demande dans `.data/contacts.jsonl`. Ce dossier est exclu de Git. `CONTACT_DATA_DIR` permet de désigner un répertoire persistant privé. Les demandes ne sont pas envoyées par e-mail : aucun destinataire ni service d’envoi n’a été fourni.

Le traitement inclut validation côté serveur, limite de taille, champ antirobot, contrôle d’origine et limitation du nombre de demandes par connexion. Pour un déploiement derrière un proxy, configurer aussi la limitation au niveau du proxy. Ne jamais exposer le dossier de données comme répertoire statique. Prévoir sa sauvegarde et son effacement selon une politique de conservation définie.

## Avant publication publique

- Ajouter les coordonnées réelles de l’entreprise, ses mentions légales et les informations complètes sur le responsable du traitement, la conservation et l’exercice des droits dans la fenêtre de confidentialité.
- Prévoir un volume persistant pour les contacts et un accès réservé à l’équipe. Ajouter un service de notification si souhaité.
- Configurer HTTPS auprès de l’hébergeur.

Les tarifs prévisionnels, objectifs internes, témoignages et résultats non établis du business plan ne sont pas présentés comme des offres ou des preuves publiques.

## Architecture

- `src/main.jsx` : site React, navigation mobile, services dépliables, formulaire et confidentialité.
- `src/styles.css` : identité sombre et vert menthe, vues mobiles et préférences de mouvement réduit.
- `server.mjs` : serveur Node.js, API de contact et distribution de production.
- `tests/contact.test.mjs` : tests du traitement réel des demandes avec stockage temporaire.

Les polices sont distribuées avec le site ; aucun appel à un fournisseur de polices ou à un outil de suivi n’est nécessaire.
