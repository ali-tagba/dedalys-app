# Guide du Développeur Frontend - Dedalys

Ce guide est destiné aux développeurs frontend travaillant sur le projet Dedalys. Il détaille l'architecture, les conventions, et les bonnes pratiques spécifiques au projet.

## 🏗️ Architecture du Projet

Le projet utilise **Next.js 16 (App Router)** avec une structure modulaire.

```
app/
├── (routes)/            # Routes publiques/privées
├── api/                 # Routes API Backend
├── components/          # Composants React
│   ├── ui/              # Composants de base (Shadcn/UI)
│   ├── [module]/        # Composants spécifiques aux modules (clients, dossiers...)
├── lib/
│   ├── types/           # Interfaces TypeScript
│   └── utils.ts         # Utilitaires globaux
└── prisma/              # Schema et seeds base de données
```

### Modules Principaux
L'application est divisée en "domaines" métier :
- **Clients** : Gestion CRM (`app/clients`, `components/clients`)
- **Dossiers** : Gestion des affaires (`app/dossiers`, `components/dossiers`)
- **Audiences** : Calendrier (`app/audiences`, `components/audiences`)
- **Facturation** : Finances (`app/facturation`, `components/facturation`)

## 🎨 Style et UI

### Tailwind CSS
Nous utilisons **Tailwind CSS v4** pour tout le styling.
- **Convention** : Utilisez les classes utilitaires autant que possible.
- **Couleurs** : Palette `slate` pour les gris, `blue` pour l'action principale.
- **Dossiers** : Les couleurs des dossiers utilisent des classes CSS spécifiques (voir section Components).

### Shadcn UI
Les composants de base (boutons, inputs, dialogs) proviennent de **Shadcn UI**.
📍 Ils sont situés dans `components/ui`.
⚠️ **Ne modifiez pas ces fichiers directement** sauf nécessité absolue. Surchargez les styles via `className` lors de l'utilisation.

### Scrollbars
Une classe utilitaire globale `.custom-scrollbar` est définie dans `globals.css` pour uniformiser l'apparence des barres de défilement sur tous les navigateurs.
Utilisation recommandée :
```tsx
<div className="overflow-auto custom-scrollbar">...</div>
```

## 📐 Système de Design Fluide (Sprint 3)

Pour garantir une expérience parfaite sur tous les écrans (Mobile -> Grand 4K), nous utilisons des techniques CSS modernes inspirées d'outils comme Notion.

### Variables Fluides (`clamp()`)
Ne hardcodez plus les tailles de police ou les paddings fixes. Utilisez les variables CSS définies dans `globals.css` :

- **Polices** :
    - `text-[length:var(--font-size-base)]` : Taille de police standard qui s'adapte (14px -> 16px).
    - `text-[length:var(--font-size-lg)]` : Pour les titres de section.
- **Espacements** :
    - `p-[var(--container-padding)]` : Padding de conteneur (1rem mobile -> 2.5rem desktop).
    - `gap-[var(--spacing-4)]` : Espacement standard fluide.
- **Boutons** :
    - `h-[var(--btn-height-default)]` : Hauteur fluide (36px -> 44px).
    - Tous les boutons doivent avoir une `min-height` de **44px** pour le tactile si utilisée via la classe `default`.

### Bonnes Pratiques Responsive
1. **Conteneurs** : Utilisez toujours `p-[var(--container-padding)]` pour les pages principales.
2. **Tableaux** : Pour éviter l'écrasement des données sur laptop, forcez une largeur min : `<table className="min-w-[1000px]">`.
3. **Touch Targets** : Aucun élément interactif ne doit faire moins de 44px de hauteur sur mobile.

## 🛠️ État et Données

### Récupération de Données (Fetching)
- Privilégiez **Server Components** pour le rendu initial des pages.
- Pour les composants interactifs (tableaux, filtres), utilisez `useEffect` avec `fetch` ou des Server Actions dans `client components`.
- **API Routes** : Les données sont servies via `/api/[resource]`.

### Gestion d'État
- **URL State** : Pour les filtres, tris et pagination, privilégiez les paramètres d'URL (`useSearchParams`).
- **Local State** : `useState` pour les interactions UI locales (ouverture modale, formulaire).
- **Global State** : (Si nécessaire) Zustand.

## ⚠️ Points d'Attention Critiques

### 1. Tableaux et Scroll
Pour les grands tableaux de donées (Clients, Factures) :
- N'utilisez **PAS** le composant `<Table>` wrapper de Shadcn pour le conteneur principal si vous avez besoin d'un scroll complet.
- Utilisez une balise native `<table>` à l'intérieur d'un conteneur `div` avec `overflow-auto flex-1 custom-scrollbar`.
- Cela garantit que les barres de défilement horizontale et verticale sont toujours visibles simultanément.

### 2. Identifiants Uniques (SVG)
Pour les composants utilisant des SVG avec définitions (Gradients, ClipPaths), comme `ModernFolderIcon` :
- Utilisez toujours `React.useId()` pour générer les IDs des gradients.
- **Pourquoi ?** Si vous hardcodez l'ID (`id="gradient-blue"`), avoir plusieurs icônes la même page causera des conflits et des rendus de couleur incorrects (noir).

## 📝 Conventions de Nommage

- **Fichiers** : `kebab-case.tsx` (ex: `client-table.tsx`)
- **Composants** : `PascalCase` (ex: `ClientTable`)
- **Fonctions** : `camelCase` (ex: `fetchClients`)
- **Types** : `PascalCase` (ex: `Client`, `Dossier`)
