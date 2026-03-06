# Dedalys - Gestion de Cabinet Juridique

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

**Dedalys** est une solution complète de gestion pour cabinets juridiques en Afrique francophone. L'application offre une interface moderne et intuitive pour gérer l'ensemble des activités d'un cabinet d'avocats.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Documentation](#documentation)
  - [Guide Frontend](docs/FRONTEND_GUIDE.md)
  - [Composants](docs/COMPONENTS.md)
- [Stack Technologique](#stack-technologique)
- [Structure du Projet](#structure-du-projet)

## 🎯 Vue d'ensemble

Dedalys est conçu pour simplifier et optimiser la gestion quotidienne d'un cabinet juridique. L'application couvre 5 modules principaux :

1. **Clients/CRM** - Gestion complète des clients (personnes physiques et morales)
2. **Dossiers** - Gestion centralisée des dossiers juridiques avec explorateur de fichiers
3. **Audiences** - Calendrier des audiences avec rappels automatiques
4. **Flash CR** - Génération rapide de comptes-rendus d'audiences
5. **Facturation** - Suivi de la facturation et des paiements

## ✨ Fonctionnalités

### 📊 Tableau de Bord (Dashboard)
- Vue d'ensemble des KPIs (clients, dossiers actifs, audiences, facturation)
- **UI Fluide & Responsive** : S'adapte parfaitement du mobile au grand écran (Inspiré de Notion/Airtable).
- Liste des audiences à venir avec indicateurs d'urgence
- Actions rapides pour créer clients, audiences et factures
- Statistiques en temps réel

### 👥 Module Clients
- Gestion des personnes physiques et morales
- Support des différentes formes juridiques (SA, SARL, SAS, etc.)
- Gestion des contacts multiples par client
- Numéro RCCM et pièces d'identité
- Historique complet des dossiers et audiences

### 📁 Module Dossiers
- Création et suivi de dossiers juridiques
- Classification par type (Civil, Commercial, Pénal, Administratif)
- Domaines du droit (Travail, Immobilier, Commercial, etc.)
- Explorateur de fichiers intégré (type Google Drive)
- Assignation d'avocats aux dossiers
- Statuts de dossiers (En cours, Terminé, En attente, Clôturé)

### 📅 Module Audiences
- Calendrier visuel des audiences
- Informations détaillées (juridiction, salle, durée estimée)
- Statuts d'audiences (À venir, Terminée, Reportée, Annulée)
- Lien avec les dossiers et clients
- Rappels automatiques

### ⚡ Module Flash CR
- Génération rapide de comptes-rendus post-audience
- Envoi automatique aux destinataires
- Statuts (Brouillon, Envoyé, Archivé)
- Lien avec audiences et dossiers

### 💰 Module Facturation
- Création et suivi des factures
- Calcul automatique HT/TTC avec TVA
- Suivi des paiements (Payée, Impayée, Partielle)
- Méthodes de paiement multiples
- Dates d'échéance et rappels

## 🏗️ Architecture

Dedalys est construit sur une architecture moderne Next.js 16 avec App Router et un **Design System Fluide**.

```
┌─────────────────────────────────────────────────┐
│              Frontend (React 19)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Pages   │  │Components│  │   UI     │      │
│  │ (App Dir)│  │ (Modules)│  │(shadcn/ui)│     │
│  └────┬─────┘  └────┬─────┘  └──────────┘      │
│       │             │                            │
│       └─────────────┴──────────┐                │
│                                 │                │
│  ┌──────────────────────────────▼──────────┐   │
│  │         API Routes (Next.js)             │   │
│  │  /api/clients  /api/dossiers  /api/...  │   │
│  └──────────────────┬───────────────────────┘   │
└─────────────────────┼───────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │   Prisma ORM            │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │   PostgreSQL Database   │
         └─────────────────────────┘
```

Pour plus de détails, consultez [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🚀 Installation

### Prérequis

- **Node.js** 20.x ou supérieur
- **PostgreSQL** 14.x ou supérieur
- **npm** ou **yarn**

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd dedalys-app
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dedalys"
```

4. **Initialiser la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# Peupler la base de données (optionnel)
npx prisma db seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🌐 Déploiement sur Vercel

Le projet est configuré pour être déployé facilement sur Vercel :
1. Poussez votre code sur la branche `main` via `git push`.
2. Connectez le dépôt GitHub à Vercel.
3. N'oubliez pas de provisionner une base de données PostgreSQL (via l'onglet Storage de Vercel) et de définir la variable `DATABASE_URL`.
> 💡 *Un guide détaillé étape par étape est disponible dans le fichier [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md).*

## 📚 Documentation

La documentation complète est organisée dans le dossier `docs/` :

### Guides Frontend
- **[FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md)** : **(Nouveau)** Guide complet pour les développeurs frontend (architecture, conventions, style).
- **[COMPONENTS.md](docs/COMPONENTS.md)** : **(Nouveau)** Documentation technique des composants critiques et des "hacks" spécifiques (Scroll, SVG Colors).

### Architecture Globale
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture technique et flux de données
- **[MODULES.md](docs/MODULES.md)** - Description détaillée des 5 modules
- **[API.md](docs/API.md)** - Documentation des routes API
- **[DATABASE.md](docs/DATABASE.md)** - Schéma de base de données et relations
- **[DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Guide général (backend/fullstack)

## 🛠️ Stack Technologique

### Frontend
- **Framework** : Next.js 16.1.1 (App Router)
- **UI Library** : React 19.2.3
- **Language** : TypeScript 5.x
- **Styling** : Tailwind CSS 4.x
- **UI Components** : shadcn/ui (Radix UI)
- **Forms** : React Hook Form + Zod
- **State Management** : Zustand 5.x
- **Icons** : Lucide React

### Backend
- **API** : Next.js API Routes
- **ORM** : Prisma 5.22.0
- **Database** : PostgreSQL
- **Validation** : Zod 4.3.5

### Development Tools
- **Linter** : ESLint 9.x
- **Package Manager** : npm
- **Build Tool** : Next.js built-in

## 📁 Structure du Projet

```
dedalys-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── clients/          # API Clients
│   │   ├── dossiers/         # API Dossiers
│   │   ├── audiences/        # API Audiences
│   │   ├── flash-cr/         # API Flash CR
│   │   └── facturation/      # API Facturation
│   ├── clients/              # Pages Clients
│   ├── dossiers/             # Pages Dossiers
│   ├── audiences/            # Pages Audiences
│   ├── flash-cr/             # Pages Flash CR
│   ├── facturation/          # Pages Facturation
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Dashboard
├── components/               # Composants React
│   ├── ui/                   # Composants UI réutilisables
│   ├── layout/               # Composants de layout
│   ├── clients/              # Composants module Clients
│   ├── dossiers/             # Composants module Dossiers
│   ├── audiences/            # Composants module Audiences
│   ├── flash-cr/             # Composants module Flash CR
│   └── facturation/          # Composants module Facturation
├── lib/                      # Utilitaires et configurations
│   ├── types/                # Définitions TypeScript
│   ├── data/                 # Données de démonstration
│   ├── prisma.ts             # Client Prisma
│   └── utils.ts              # Fonctions utilitaires
├── prisma/                   # Configuration Prisma
│   ├── schema.prisma         # Schéma de base de données
│   ├── migrations/           # Migrations
│   └── seed.ts               # Script de peuplement
├── public/                   # Assets statiques
├── docs/                     # Documentation
└── package.json              # Dépendances
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Lancer le serveur de développement

# Production
npm run build        # Construire l'application
npm run start        # Lancer l'application en production

# Base de données
npx prisma generate  # Générer le client Prisma
npx prisma migrate dev  # Exécuter les migrations
npx prisma db seed   # Peupler la base de données
npx prisma studio    # Interface graphique de la BDD

# Qualité du code
npm run lint         # Linter le code
```

## 👨‍💻 Pour les Développeurs

Si vous êtes un nouveau développeur sur le projet, consultez le [Guide du Développeur](docs/DEVELOPER_GUIDE.md) pour :

- Comprendre l'architecture et les conventions de code
- Apprendre à ajouter un nouveau module
- Découvrir les bonnes pratiques du projet
- Configurer votre environnement de développement

## 📄 Licence

Ce projet est privé et propriétaire. Tous droits réservés.

## 📞 Contact

Pour toute question concernant ce projet, veuillez contacter l'équipe de développement.

---

**Développé avec ❤️ pour les cabinets juridiques d'Afrique francophone**

