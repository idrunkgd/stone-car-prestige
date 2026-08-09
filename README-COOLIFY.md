# Déployer Stone Car Prestige sur Coolify

Ce guide t'amène d'un dossier de code à une application en ligne, avec une
base de données PostgreSQL, **démarrée à vide**. Aucune donnée de démo n'est
embarquée : à la première ouverture, tu crées ton compte, tes prestations et
tes réglages directement dans l'app.

L'application est **sans état** : elle n'écrit rien sur le disque du serveur,
tout va dans la base de données. Tu peux donc la redéployer ou la redémarrer
sans jamais perdre de données.

---

## Ce qui a changé (résumé technique)

- Le stockage fichiers (`.data/*.json`) est remplacé par **PostgreSQL**.
- Toutes les données sont rangées dans une seule table `documents`
  (créée automatiquement au premier démarrage — rien à faire à la main).
- Un **Dockerfile** est fourni : Coolify construit une image légère et
  autonome (Next.js « standalone »).
- Une seule variable est nécessaire : **`DATABASE_URL`**.
- Endpoint de santé : **`/api/health`**.

---

## Étape 0 — Mettre le code sur Git (recommandé)

Coolify déploie le plus simplement depuis un dépôt Git (GitHub, GitLab…).

1. Crée un dépôt privé (ex. sur GitHub) : `stone-car-prestige`.
2. Depuis le dossier du projet sur ton Mac :

   ```bash
   git init
   git add .
   git commit -m "Stone Car Prestige — prêt pour Coolify"
   git branch -M main
   git remote add origin https://github.com/TON-COMPTE/stone-car-prestige.git
   git push -u origin main
   ```

> Le fichier `.gitignore` exclut déjà `node_modules`, `.next` et `.data`.

*(Alternative sans Git : Coolify permet aussi un déploiement par upload/local,
mais Git rend les mises à jour bien plus simples — un `git push` redéploie.)*

---

## Étape 1 — Créer la base PostgreSQL dans Coolify

1. Ouvre ton **projet** dans Coolify (ou crée-en un : `Stone Car Prestige`).
2. **+ New** → **Database** → **PostgreSQL**.
3. Laisse les valeurs par défaut (Coolify génère un mot de passe).
4. Clique **Create**, puis **Start** pour démarrer la base.
5. Ouvre la base et repère, dans **Connection details**, l'URL **interne**
   (« Internal / Postgres URL »). Elle ressemble à :

   ```
   postgres://postgres:MOT_DE_PASSE@abcdef123456:5432/postgres
   ```

   👉 Copie cette URL **interne** (le nom d'hôte est le nom du service, pas
   `localhost`). C'est elle qu'on donnera à l'application.

---

## Étape 2 — Créer l'application

1. Dans le même projet : **+ New** → **Application**.
2. Source : **ton dépôt Git** (connecte GitHub si demandé), branche `main`.
3. **Build Pack** : choisis **Dockerfile** (le `Dockerfile` du projet est
   détecté automatiquement).
4. **Port exposé** : `3000`.

---

## Étape 3 — Renseigner la variable de connexion

1. Dans l'application → onglet **Environment Variables**.
2. Ajoute :

   | Nom            | Valeur                                             |
   |----------------|----------------------------------------------------|
   | `DATABASE_URL` | *(colle l'URL interne copiée à l'étape 1)*         |

3. (Optionnel) `DATABASE_SSL = require` **uniquement** si un jour tu utilises
   une base externe qui impose le SSL. Pour le Postgres interne de Coolify,
   ne mets rien.

> Astuce : si Coolify te propose de **lier** la base à l'app (« Connect / Link
> resource »), tu peux l'utiliser, mais vérifie que la variable s'appelle bien
> `DATABASE_URL`. Sinon, colle l'URL à la main comme ci-dessus.

---

## Étape 4 — Réglages de santé et déploiement

1. Onglet **Health Checks** (ou « General ») → **Health Check Path** :
   `/api/health`.
2. Clique **Deploy**.
3. Suis les logs : première build ~2-4 min. Quand c'est vert, ouvre l'URL
   fournie par Coolify.
4. Ajoute ton **domaine** dans l'onglet Domains si tu en as un — Coolify gère
   le HTTPS automatiquement.

La table `documents` est créée toute seule au premier chargement. Rien à
migrer, rien à initialiser.

---

## Étape 5 — Première prise en main (app vierge)

À la première ouverture, la base est vide. Ordre conseillé :

1. **/app/parametres** — règle tes **horaires d'ouverture** (ils pilotent les
   créneaux proposés aux clients).
2. **/app/prestations** — le catalogue affiche des **prestations par défaut**
   pour que l'app soit utilisable tout de suite. Modifie les prix/durées,
   supprime celles que tu ne proposes pas, ajoute les tiennes.
3. Côté client : un visiteur crée son compte, ajoute son véhicule, demande un
   prix → tu reçois la demande dans **/app/demandes** et le flux devis →
   acompte → intervention se déroule comme prévu.

> Les prestations par défaut ne sont **pas** des « données » : c'est un point
> de départ éditable. Dès ta première modification, ta liste personnalisée est
> enregistrée en base.

---

## Accès administrateur (espace pro)

L'espace professionnel **`/app/...`** est protégé par une connexion. Tant que
tu n'es pas identifié, toute visite de `/app` renvoie vers **`/connexion-pro`**.

Identifiants par défaut :

- **Email** : `stone@stone.be`
- **Mot de passe** : `Azerty12`

**Change le mot de passe en production.** Dans Coolify → app →
**Environment Variables**, ajoute :

| Nom              | Valeur                          |
|------------------|---------------------------------|
| `ADMIN_EMAIL`    | ton email d'admin               |
| `ADMIN_PASSWORD` | un mot de passe fort à toi      |

Puis redéploie. Changer le mot de passe déconnecte automatiquement les
sessions existantes. Les comptes **clients** (espace `/compte`) sont
totalement séparés de cet accès admin.

---

## Mettre à jour l'app plus tard

Avec Git : fais tes modifs, `git push`, puis **Deploy** dans Coolify
(ou active le redéploiement automatique sur push). Les données en base ne
sont pas touchées par un redéploiement.

---

## Sauvegardes

Pense à activer les **backups** de la base PostgreSQL dans Coolify
(onglet de la ressource base de données → Backups). C'est là que vivent
toutes tes données clients, devis, interventions et factures.
