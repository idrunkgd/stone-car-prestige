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
