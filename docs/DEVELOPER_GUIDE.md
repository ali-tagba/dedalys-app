# Guide du Développeur - Dedalys

Bienvenue dans le projet Dedalys ! Ce guide vous aidera à démarrer rapidement et à comprendre les conventions du projet.

## Table des Matières

- [Démarrage Rapide](#démarrage-rapide)
- [Structure du Projet](#structure-du-projet)
- [Conventions de Code](#conventions-de-code)
- [Ajouter un Nouveau Module](#ajouter-un-nouveau-module)
- [Workflow de Développement](#workflow-de-développement)
- [Bonnes Pratiques](#bonnes-pratiques)
- [Debugging](#debugging)
- [FAQ](#faq)

---

## Démarrage Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 14+
- Git

### Installation

```bash
# 1. Cloner le repository
git clone <repository-url>
cd dedalys-app

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos credentials PostgreSQL

# 4. Initialiser la base de données
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## Structure du Projet

```
dedalys-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes (Backend)
│   ├── [module]/             # Pages par module
│   ├── layout.tsx            # Layout racine
│   ├── page.tsx              # Dashboard
│   └── globals.css           # Styles globaux
├── components/               # Composants React
│   ├── ui/                   # Composants UI réutilisables
│   ├── layout/               # Layout components
│   └── [module]/             # Composants par module
├── lib/                      # Utilitaires
│   ├── types/                # Types TypeScript
│   ├── data/                 # Données de démo
│   ├── prisma.ts             # Client Prisma
│   └── utils.ts              # Fonctions utilitaires
├── prisma/                   # Configuration Prisma
│   ├── schema.prisma         # Schéma BDD
│   ├── migrations/           # Migrations SQL
│   └── seed.ts               # Données de test
├── public/                   # Assets statiques
└── docs/                     # Documentation
```

---

## Conventions de Code

### Nommage

**Fichiers** :
- Composants : `PascalCase.tsx` (ex: `ClientTable.tsx`)
- Pages : `page.tsx`, `layout.tsx`
- API Routes : `route.ts`
- Types : `camelCase.ts` (ex: `client.ts`)
- Utilitaires : `camelCase.ts` (ex: `utils.ts`)

**Variables et Fonctions** :
- Variables : `camelCase` (ex: `clientData`)
- Fonctions : `camelCase` (ex: `fetchClients`)
- Composants : `PascalCase` (ex: `ClientTable`)
- Constantes : `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)

**Types TypeScript** :
- Interfaces : `PascalCase` (ex: `ClientFormData`)
- Types : `PascalCase` (ex: `ClientType`)
- Enums : `PascalCase` (ex: `FormeJuridique`)

### Organisation des Imports

```typescript
// 1. Imports externes
import { useState, useEffect } from "react"
import Link from "next/link"

// 2. Imports de composants UI
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// 3. Imports de composants locaux
import { ClientTable } from "@/components/clients/client-table"

// 4. Imports de types
import { Client } from "@/lib/types/client"

// 5. Imports d'utilitaires
import { cn } from "@/lib/utils"
```

### Formatage

- **Indentation** : 2 espaces
- **Quotes** : Double quotes `"`
- **Semicolons** : Oui
- **Trailing commas** : Oui

---

## Ajouter un Nouveau Module

Suivez ces étapes pour ajouter un module (ex: "Documents") :

### 1. Créer le Modèle Prisma

```prisma
// prisma/schema.prisma
model Document {
  id          String   @id @default(cuid())
  titre       String
  categorie   String
  fichierUrl  String?
  clientId    String?
  dossierId   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  client   Client?  @relation(fields: [clientId], references: [id], onDelete: SetNull)
  dossier  Dossier? @relation(fields: [dossierId], references: [id], onDelete: SetNull)

  @@index([clientId])
  @@index([dossierId])
}
```

### 2. Créer la Migration

```bash
npx prisma migrate dev --name add_documents
npx prisma generate
```

### 3. Créer les Types

```typescript
// lib/types/document.ts
export interface Document {
  id: string
  titre: string
  categorie: string
  fichierUrl?: string
  clientId?: string
  dossierId?: string
  createdAt: string
  updatedAt: string
}

export interface DocumentFormData {
  titre: string
  categorie: string
  fichierUrl?: string
  clientId?: string
  dossierId?: string
}
```

### 4. Créer les API Routes

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const documentSchema = z.object({
  titre: z.string().min(1),
  categorie: z.string(),
  fichierUrl: z.string().optional(),
  clientId: z.string().optional(),
  dossierId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const documents = await prisma.document.findMany({
      include: {
        client: true,
        dossier: true,
      },
    })
    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = documentSchema.parse(body)
    
    const document = await prisma.document.create({
      data: validatedData,
    })
    
    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
```

```typescript
// app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        dossier: true,
      },
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const document = await prisma.document.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json(document)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.document.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
```

### 5. Créer les Composants

```typescript
// components/documents/document-form-dialog.tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const documentSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  categorie: z.string().min(1, "La catégorie est requise"),
  fichierUrl: z.string().optional(),
})

type DocumentFormData = z.infer<typeof documentSchema>

interface DocumentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DocumentFormDialog({ open, onOpenChange, onSuccess }: DocumentFormDialogProps) {
  const [loading, setLoading] = useState(false)
  
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  })

  const onSubmit = async (data: DocumentFormData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to create document')
      
      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating document:', error)
      alert('Erreur lors de la création du document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Titre</Label>
            <Input {...form.register("titre")} />
            {form.formState.errors.titre && (
              <p className="text-sm text-red-500">{form.formState.errors.titre.message}</p>
            )}
          </div>
          
          <div>
            <Label>Catégorie</Label>
            <Input {...form.register("categorie")} />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 6. Créer la Page

```typescript
// app/documents/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentFormDialog } from "@/components/documents/document-form-dialog"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const fetchDocuments = async () => {
    const response = await fetch('/api/documents')
    const data = await response.json()
    setDocuments(data)
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Document
        </Button>
      </div>

      {/* Liste des documents */}
      <div className="grid gap-4">
        {documents.map((doc: any) => (
          <div key={doc.id} className="border p-4 rounded-lg">
            <h3 className="font-semibold">{doc.titre}</h3>
            <p className="text-sm text-slate-500">{doc.categorie}</p>
          </div>
        ))}
      </div>

      <DocumentFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchDocuments}
      />
    </div>
  )
}
```

### 7. Ajouter au Menu

```typescript
// components/layout/Sidebar.tsx
const navigation = [
  // ...
  { name: "Documents", href: "/documents", icon: FileText },
]
```

---

## Workflow de Développement

### 1. Créer une Branche

```bash
git checkout -b feature/nom-de-la-feature
```

### 2. Développer

- Écrire le code
- Tester localement
- Commit régulièrement

```bash
git add .
git commit -m "feat: description de la feature"
```

### 3. Push et Pull Request

```bash
git push origin feature/nom-de-la-feature
```

Créer une Pull Request sur GitHub.

---

## Bonnes Pratiques

### TypeScript

- **Toujours typer** les props, states, et retours de fonctions
- **Éviter `any`** : Utiliser `unknown` si nécessaire
- **Utiliser Zod** pour la validation runtime

### React

- **Composants fonctionnels** uniquement
- **Hooks** : Respecter les règles des hooks
- **Memoization** : Utiliser `useMemo` et `useCallback` si nécessaire
- **Client Components** : Marquer avec `"use client"` uniquement si nécessaire

### Prisma

- **Toujours inclure** les relations nécessaires
- **Utiliser les transactions** pour les opérations multiples
- **Indexes** : Ajouter des indexes sur les clés étrangères

### Performance

- **Pagination** : Limiter les résultats des requêtes
- **Lazy Loading** : Charger les composants lourds dynamiquement
- **Images** : Utiliser `next/image` pour l'optimisation

---

## Debugging

### Logs

```typescript
console.log('Debug:', data)
console.error('Error:', error)
```

### Prisma Studio

Visualiser la base de données :

```bash
npx prisma studio
```

### Next.js DevTools

- Ouvrir les DevTools du navigateur
- Onglet "Network" pour les requêtes API
- Onglet "Console" pour les logs

### Debugging API Routes

```typescript
export async function GET(request: NextRequest) {
  console.log('Request URL:', request.url)
  console.log('Headers:', request.headers)
  
  try {
    // ...
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## FAQ

### Comment ajouter une nouvelle colonne à une table ?

1. Modifier `prisma/schema.prisma`
2. Créer la migration : `npx prisma migrate dev --name add_column`
3. Mettre à jour les types TypeScript

### Comment gérer les erreurs de validation ?

Utiliser Zod pour valider les données :

```typescript
const schema = z.object({
  email: z.string().email("Email invalide"),
  age: z.number().min(18, "Vous devez avoir 18 ans minimum"),
})

try {
  const validatedData = schema.parse(data)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors)
  }
}
```

### Comment uploader des fichiers ?

Utiliser une solution de stockage cloud (S3, Cloudinary) et stocker l'URL dans la base de données.

### Comment tester l'application ?

```bash
# Lancer les tests (à configurer)
npm run test

# Lancer en mode production localement
npm run build
npm run start
```

---

## Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

**Bon développement ! 🚀**
