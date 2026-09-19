# Stone Car Prestige — Plateforme web premium

Plateforme de car care / detailing haut de gamme : **site public** (à venir, Étape D) +
**back-office métier** conçu tablette-d'abord. _L'exigence à chaque détail._

Ce dépôt correspond au **jalon « Étape A — Fondations »** : le socle technique,
le design system, la navigation admin, le modèle de données complet et l'écran
opérationnel « Aujourd'hui ». Il tourne **immédiatement en mode démo, sans base de données.**

---

## 🚀 Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrir **http://localhost:3000** → redirection automatique vers le back-office `/app`.

> Le back-office fonctionne avec des **données de démonstration en mémoire**
> (`src/lib/demo-data.ts`). Aucune base de données n'est requise pour explorer l'interface.

### Activer la base de données (optionnel à ce stade)

```bash
cp .env.example .env         # renseigner DATABASE_URL (Neon / Supabase / Postgres local)
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

---

## 🎨 Design system

Extrait de la banderole Stone Car Prestige : **noir profond**, **or métallisé** (signature),
blanc cassé, rouge d'urgence. Tokens dans `tailwind.config.ts`, typographies
**Oswald** (display) + **Inter** (corps).

| Rôle | Couleur |
|------|---------|
| Fond | `#0C0C0E` |
| Or signature | `#C9A227` (dégradé `#E9CE7B → #9C7B1E`) |
| Texte | `#F4F2EC` |
| Urgence / succès / info | `#C0392B` / `#3FB27F` / `#4A90D9` |

Composants réutilisables : `Button`, `Card`, `StatusPill`, `StatTile` (compteur animé),
`Input`, `VehicleCard`. Toutes les animations respectent `prefers-reduced-motion`.

---

## 🗂️ Structure

```
src/
├─ app/
│  ├─ layout.tsx            Racine (fonts, PWA)
│  ├─ page.tsx              Redirige vers /app
│  └─ app/                  BACK-OFFICE
│     ├─ layout.tsx         Sidebar + BottomBar (tablette)
│     ├─ page.tsx           ★ Écran « Aujourd'hui »
│     ├─ clients/           CRM (données démo)
│     ├─ vehicules/         Véhicules (données démo)
│     └─ planning · checkin · prestations · ventes · galerie · stats · parametres
├─ components/
│  ├─ ui/                   Button, Card, StatusPill, StatTile, Input
│  ├─ layout/               Sidebar, BottomBar, TopBar, Logo
│  ├─ today/                AppointmentRow
│  └─ vehicle/              VehicleCard
└─ lib/                     utils, status, nav, demo-data
prisma/
├─ schema.prisma           Modèle de données complet (toutes les entités)
└─ seed.ts                 Données de démonstration
```

---

## ✅ Fait dans ce jalon (Étape A)

- Scaffold Next.js 15 (App Router) + TypeScript strict + Tailwind
- Design system Stone Car Prestige (tokens, composants, statuts, animations)
- Coque de navigation admin (barre latérale + barre inférieure tablette)
- Écran **« Aujourd'hui »** fonctionnel : KPIs animés, timeline du jour,
  « à l'atelier », « prêts à encaisser », principe **Next Best Action**
- Pages Clients & Véhicules avec données réalistes ; autres modules en empty states premium
- **Modèle de données Prisma complet** (clients, véhicules, prestations, réservations,
  ordres de travail, inspections, photos, signatures, devis, factures, paiements, etc.)
- Seed de démonstration + PWA manifest

## 🔜 Prochaine étape (Étape B — la verticale complète)

Client → Véhicule → **Réservation → Check-in → Intervention → Check-out → Facture**,
fonctionnant de bout en bout sur tablette (workflow guidé, état des lieux tactile,
photos, signature, ordre de travail, contrôle qualité).

Voir le **dossier de conception** (roadmap MVP / V1.5 / V2 / V3) pour la suite.

---

## 🧱 Stack

Next.js · React 19 · TypeScript · Tailwind CSS · Framer Motion · Prisma · PostgreSQL ·
lucide-react. Hébergement cible : Vercel + Neon/Supabase + stockage objet S3-compatible.

---

## 💳 Abonnements / cartes de lavages prépayées

Cartes virtuelles à tampons numériques : l'administrateur définit des formules
(Essential, Premium, Prestige…), attribue une carte à un client, et le client
retrouve sa carte dans son espace personnel.

### Écrans

| Rôle | Écran | Chemin |
| --- | --- | --- |
| Admin | Tableau de bord, recherche, statistiques | `/app/abonnements` |
| Admin | Formules d'abonnement (création, tarifs, apparence) | `/app/abonnements/plans` |
| Admin | Attribution d'une carte à un client | `/app/abonnements/nouveau` |
| Admin + Employé | Fiche carte, bouton **Utiliser 1 lavage**, historique | `/app/abonnements/[id]` |
| Admin + Employé | Scanner une carte (caméra ou recherche manuelle) | `/app/abonnements/scan` |
| Admin + Employé | Résolution d'un QR code (jeton → fiche) | `/app/carte/[token]` |
| Client | Mes abonnements (carte virtuelle, QR, historique) | `/compte/abonnements` |

### Modèle de données

Quatre collections dans la table `documents` :

- `subscription_plans` — définition commerciale (nom, prix, nombre de lavages,
  prestations concernées, validité, apparence, conditions) ;
- `subscription_cards` — carte attribuée, avec un **instantané** des conditions
  commerciales : modifier une formule ne réécrit pas les cartes déjà vendues ;
- `subscription_usages` — registre des consommations ;
- `subscription_adjustments` — registre des corrections administratives.

**Le solde n'est jamais stocké dans un compteur.** Il est recalculé :

```
solde = crédits initiaux + Σ(ajustements) − consommations non annulées
```

Rien n'est jamais supprimé des registres : annuler un tampon marque la
consommation comme annulée et écrit une opération d'annulation (date,
administrateur, raison, consommation concernée).

### Règles métier garanties côté serveur

- contrôle du solde, de la date d'expiration et du statut à chaque utilisation ;
- **transaction + verrou consultatif PostgreSQL** sur la carte : deux validations
  simultanées ne peuvent pas décompter deux lavages ;
- **clé d'idempotence** : double-clic, rafraîchissement ou retour arrière ne
  décomptent qu'un seul lavage ;
- un client ne peut jamais ajouter ni retirer un tampon : toutes les écritures
  passent par des Server Actions protégées par rôle.

### Statuts

`brouillon` · `active` · `épuisée` · `expirée` · `suspendue` · `annulée`.
Les deux statuts *épuisée* et *expirée* sont déduits automatiquement du solde et
de la date ; les autres sont décidés par l'administrateur.

### QR code

Le QR encode `https://…/app/carte/<jeton>` — un jeton aléatoire, **jamais
l'identifiant de la carte**. La page se trouve derrière l'authentification du
personnel : scanner ouvre la fiche, la consommation reste toujours validée par
un employé. Le jeton est régénérable depuis la fiche.

Le générateur de QR code est intégré au projet (`src/lib/qrcode.ts`, rendu SVG,
aucune dépendance ajoutée).

### Tests

```bash
DATABASE_URL=postgres://… npm run test:abonnements
```

63 scénarios critiques sur une vraie base PostgreSQL : double-clic, concurrence
(12 appels simultanés sur 3 lavages restants), carte épuisée / expirée /
suspendue / annulée, annulation d'un tampon, corrections de crédits, recalcul
auditable du solde, prestations couvertes, QR code, recherche, statistiques.

`npm run seed:abonnements` crée un jeu de démonstration.

### Variables d'environnement

Voir `.env.example` : `NEXT_PUBLIC_SITE_URL` (contenu des QR codes),
`STAFF_EMAIL` / `STAFF_PASSWORD` (compte employé), `RESEND_API_KEY` /
`MAIL_FROM` (emails de notification), `CRON_SECRET` (relances automatiques via
`GET /api/abonnements/relances`).
