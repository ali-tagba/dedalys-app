# Architecture Technique - Dedalys

## Vue d'ensemble

Dedalys est construit sur une architecture moderne **Next.js 16** avec **App Router**, offrant une séparation claire entre le frontend et le backend tout en bénéficiant du rendu côté serveur (SSR) et de la génération statique (SSG).

## Architecture Globale

```mermaid
graph TB
    subgraph "Client Browser"
        UI[Interface Utilisateur React]
        State[État Local Zustand]
    end
    
    subgraph "Next.js Application"
        Pages[Pages App Router]
        Components[Composants React]
        API[API Routes]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end
    
    UI --> Pages
    UI --> Components
    Pages --> API
    Components --> API
    State --> Components
    API --> Prisma
    Prisma --> DB
    
    style UI fill:#3b82f6
    style API fill:#8b5cf6
    style DB fill:#10b981
```

## Stack Technologique

### Frontend
| Technologie | Version | Rôle |
|------------|---------|------|
| Next.js | 16.1.1 | Framework React avec SSR/SSG |
| React | 19.2.3 | Bibliothèque UI |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Framework CSS utilitaire |
| shadcn/ui | Latest | Composants UI (Radix UI) |
| React Hook Form | 7.71.0 | Gestion des formulaires |
| Zod | 4.3.5 | Validation de schémas |
| Zustand | 5.0.10 | Gestion d'état légère |
| Lucide React | 0.562.0 | Bibliothèque d'icônes |

### Backend
| Technologie | Version | Rôle |
|------------|---------|------|
| Next.js API Routes | 16.1.1 | API RESTful |
| Prisma | 5.22.0 | ORM pour PostgreSQL |
| PostgreSQL | 14+ | Base de données relationnelle |

## Architecture des Modules

Dedalys est organisé en **5 modules principaux**, chacun suivant le même pattern architectural :

```mermaid
graph LR
    subgraph "Module Pattern"
        Page[Page tsx] --> Table[Table Component]
        Page --> Form[Form Dialog]
        Page --> Filters[Filters Component]
        Table --> API_GET[GET /api/module]
        Form --> API_POST[POST /api/module]
        Form --> API_PUT[PUT /api/module/:id]
        Table --> API_DELETE[DELETE /api/module/:id]
        API_GET --> Prisma_Client[Prisma Client]
        API_POST --> Prisma_Client
        API_PUT --> Prisma_Client
        API_DELETE --> Prisma_Client
        Prisma_Client --> DB[(Database)]
    end
    
    style Page fill:#3b82f6
    style API_GET fill:#8b5cf6
    style DB fill:#10b981
```

### Les 5 Modules

1. **Clients** (`/clients`)
2. **Dossiers** (`/dossiers`)
3. **Audiences** (`/audiences`)
4. **Flash CR** (`/flash-cr`)
5. **Facturation** (`/facturation`)

## Flux de Données

### Création d'une Entité

```mermaid
sequenceDiagram
    participant User
    participant Page
    participant FormDialog
    participant API
    participant Prisma
    participant DB
    
    User->>Page: Clique "Nouveau"
    Page->>FormDialog: Ouvre le dialog
    User->>FormDialog: Remplit le formulaire
    FormDialog->>FormDialog: Validation Zod
    FormDialog->>API: POST /api/module
    API->>API: Validation serveur
    API->>Prisma: create()
    Prisma->>DB: INSERT
    DB-->>Prisma: Données créées
    Prisma-->>API: Entité créée
    API-->>FormDialog: 200 OK
    FormDialog->>Page: Ferme dialog
    Page->>Page: Rafraîchit la liste
```

### Lecture et Affichage

```mermaid
sequenceDiagram
    participant User
    participant Page
    participant Table
    participant API
    participant Prisma
    participant DB
    
    User->>Page: Accède à la page
    Page->>Table: Monte le composant
    Table->>API: GET /api/module
    API->>Prisma: findMany()
    Prisma->>DB: SELECT
    DB-->>Prisma: Résultats
    Prisma-->>API: Liste d'entités
    API-->>Table: 200 OK + données
    Table->>Table: Affiche les données
    Table-->>User: Liste visible
```

## Structure des Dossiers

```
dedalys-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── clients/
│   │   │   ├── route.ts          # GET /api/clients, POST /api/clients
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET/PUT/DELETE /api/clients/:id
│   │   ├── dossiers/
│   │   ├── audiences/
│   │   ├── flash-cr/
│   │   ├── facturation/
│   │   └── dashboard/
│   │       └── stats/
│   │           └── route.ts      # GET /api/dashboard/stats
│   ├── clients/                  # Pages Frontend
│   │   ├── page.tsx              # Liste des clients
│   │   └── [id]/
│   │       └── page.tsx          # Détail d'un client
│   ├── dossiers/
│   ├── audiences/
│   ├── flash-cr/
│   ├── facturation/
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Dashboard
│   └── globals.css               # Styles globaux
├── components/                   # Composants React
│   ├── ui/                       # Composants UI réutilisables
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── ...
│   ├── layout/                   # Composants de layout
│   │   ├── AppLayout.tsx         # Layout principal avec sidebar
│   │   ├── Sidebar.tsx           # Navigation latérale
│   │   └── MobileNav.tsx         # Navigation mobile
│   ├── clients/                  # Composants module Clients
│   │   ├── client-table.tsx
│   │   ├── client-form-dialog.tsx
│   │   ├── client-filters.tsx
│   │   └── contact-form-dialog.tsx
│   ├── dossiers/                 # Composants module Dossiers
│   │   ├── dossier-form-dialog.tsx
│   │   └── file-explorer.tsx
│   ├── audiences/                # Composants module Audiences
│   │   ├── audience-calendar.tsx
│   │   ├── audience-list.tsx
│   │   └── audience-form-dialog.tsx
│   ├── flash-cr/                 # Composants module Flash CR
│   │   └── flash-cr-form-dialog.tsx
│   └── facturation/              # Composants module Facturation
│       ├── invoice-form-dialog.tsx
│       └── invoice-upload-dialog.tsx
├── lib/                          # Utilitaires et configurations
│   ├── types/                    # Définitions TypeScript
│   │   ├── client.ts
│   │   ├── dossier.ts
│   │   ├── audience.ts
│   │   └── invoice.ts
│   ├── data/                     # Données de démonstration
│   │   ├── demoClients.ts
│   │   └── demoDossiers.ts
│   ├── prisma.ts                 # Client Prisma singleton
│   └── utils.ts                  # Fonctions utilitaires (cn, etc.)
├── prisma/                       # Configuration Prisma
│   ├── schema.prisma             # Schéma de base de données
│   ├── migrations/               # Migrations SQL
│   └── seed.ts                   # Script de peuplement
└── public/                       # Assets statiques
```

## Patterns de Conception

### 1. Server Components vs Client Components

Dedalys utilise la distinction Next.js 16 entre Server et Client Components :

- **Server Components** (par défaut) : Pages qui récupèrent des données côté serveur
- **Client Components** (`"use client"`) : Composants avec interactivité (formulaires, états)

```typescript
// app/clients/page.tsx - Server Component
export default function ClientsPage() {
  // Pas de "use client", peut faire des fetch côté serveur
}

// components/clients/client-form-dialog.tsx - Client Component
"use client"
export function ClientFormDialog() {
  // Utilise useState, useEffect, etc.
}
```

### 2. API Routes Pattern

Chaque module suit le pattern RESTful :

```typescript
// app/api/clients/route.ts
export async function GET(request: Request) {
  // Liste tous les clients
}

export async function POST(request: Request) {
  // Crée un nouveau client
}

// app/api/clients/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Récupère un client par ID
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Met à jour un client
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Supprime un client
}
```

### 3. Form Pattern avec React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// 1. Définir le schéma de validation
const clientSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  // ...
})

type ClientFormData = z.infer<typeof clientSchema>

// 2. Utiliser dans le composant
export function ClientFormDialog() {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  const onSubmit = async (data: ClientFormData) => {
    const response = await fetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // ...
  }
}
```

### 4. Prisma Client Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Relations entre Modules

```mermaid
erDiagram
    Client ||--o{ Dossier : "a"
    Client ||--o{ Audience : "a"
    Client ||--o{ Invoice : "a"
    Client ||--o{ FlashCR : "a"
    Client ||--o{ Contact : "a"
    
    Dossier ||--o{ Audience : "a"
    Dossier ||--o{ Invoice : "a"
    Dossier ||--o{ FlashCR : "a"
    Dossier ||--o{ DossierFile : "contient"
    
    Audience ||--|| FlashCR : "génère"
    Audience ||--o{ Invoice : "facture"
    
    DossierFile ||--o{ DossierFile : "parent/enfant"
```

## Gestion d'État

### État Local (useState)
Utilisé pour l'état UI temporaire (dialogs ouverts, filtres, etc.)

### État Global (Zustand)
Actuellement minimal, peut être étendu pour :
- Utilisateur connecté
- Préférences UI
- Cache de données

```typescript
// Exemple de store Zustand (futur)
import { create } from 'zustand'

interface AppState {
  user: User | null
  setUser: (user: User) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
```

## Performance et Optimisation

### 1. Server-Side Rendering (SSR)
Les pages sont rendues côté serveur pour un chargement initial rapide.

### 2. Pagination
Les listes utilisent la pagination pour limiter le nombre d'éléments chargés.

### 3. Lazy Loading
Les composants lourds peuvent être chargés dynamiquement :

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Chargement...</p>,
})
```

### 4. Indexes de Base de Données
Le schéma Prisma définit des indexes sur les clés étrangères et champs fréquemment recherchés.

## Sécurité

### Validation
- **Frontend** : Validation Zod dans les formulaires
- **Backend** : Validation Zod dans les API routes
- **Database** : Contraintes Prisma (unique, required, etc.)

### Sanitization
Les données utilisateur sont toujours validées et nettoyées avant insertion en base.

### CORS
Les API routes Next.js sont protégées par défaut (same-origin).

## Déploiement

### Variables d'Environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:5432/dedalys"

# Next.js
NEXT_PUBLIC_APP_URL="https://dedalys.com"
```

### Build Production

```bash
npm run build
npm run start
```

### Migrations de Base de Données

```bash
# Développement
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

## Évolutions Futures

### Fonctionnalités Planifiées
- [ ] Authentification et autorisation (NextAuth.js)
- [ ] Notifications en temps réel (WebSockets)
- [ ] Export PDF des documents
- [ ] Recherche full-text (Algolia ou PostgreSQL FTS)
- [ ] Gestion des pièces jointes (S3 ou Cloudinary)
- [ ] Calendrier synchronisé (Google Calendar, Outlook)
- [ ] Tableau de bord analytique avancé

### Améliorations Techniques
- [ ] Tests unitaires (Jest, React Testing Library)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Cache Redis pour les requêtes fréquentes

---

Pour plus de détails sur les composants individuels, consultez [COMPONENTS.md](COMPONENTS.md).
Pour la documentation des modules, consultez [MODULES.md](MODULES.md).
