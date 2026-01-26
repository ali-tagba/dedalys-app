# Documentation des Composants Clés

Ce document détaille l'utilisation et les spécificités techniques des composants critiques de l'application.

## 📂 ModernFolderIcon
`components/ui/modern-folder-icon.tsx`

Composant utilisé pour afficher les icônes de dossiers avec des gradients dynamiques.

### Props
| Prop | Type | Description |
|------|------|-------------|
| `color` | string | Couleur du dossier (blue, red, green, orange, purple, yellow, pink, gray) |
| `size` | number | Taille en pixels (défaut: 24) |
| `className` | string | Classes CSS additionnelles |

### ⚠️ Note Technique Importante (Fix Couleurs)
Ce composant utilise des **gradients SVG**. Pour éviter que plusieurs instances du même composant n'entrent en conflit (ce qui rendait les icônes noires), nous utilisons `React.useId()` pour générer un ID unique pour chaque gradient.

```tsx
// Implémentation interne
const gradientId = React.useId()
// ...
<linearGradient id={gradientId} ... />
<path fill={`url(#${gradientId})`} ... />
```

**Ne revenez pas à des IDs statiques** comme `id="gradient-blue"`, cela casserait le rendu des couleurs multiples.

---

## 📊 ClientTable (et autres Data Tables)
`components/clients/client-table.tsx`

Tableau affichant la liste des clients avec colonnes fixes et défilement.

### ⚠️ Note Technique Importante (Fix Scroll)
Contrairement aux tables Shadcn standard, ce composant utilise une structure spécifique pour gérer le défilement bidirectionnel (horizontal + vertical) de manière ergonomique.

**Structure Requise :**
```tsx
<div className="h-full w-full overflow-auto relative custom-scrollbar">
    {/* Utilisation de table natif, PAS le composant <Table> de Shadcn */}
    <table className="min-w-[1400px] w-full caption-bottom text-sm">
        <thead className="sticky top-0 z-20">...</thead>
        <tbody>...</tbody>
    </table>
</div>
```

**Pourquoi ?**
Le composant `<Table>` de Shadcn introduit son propre wrapper `div` avec `overflow-auto`. Cela force le scrollbar horizontal à n'apparaître qu'au bas de la liste complète des éléments, ce qui est mauvais pour l'UX sur les longues listes. La structure native ci-dessus permet au conteneur parent de gérer tout le scroll.

---

## ⋮ Menu Contextuel (Dossiers)
`components/ui/dropdown-menu`

Utilisé pour les actions sur les dossiers (Renommer, Changer couleur, Supprimer).

### UX Pattern
Pour les éléments cliquables qui ont *aussi* un menu contextuel :
1. **Clic Principal (Card/Row)** : Ouvre l'élément / Navigue.
2. **Bouton Menu (⋮)** : Ouvre le Dropdown.

Il est impératif de séparer ces deux zones de clic pour ne pas frustrer l'utilisateur.

```tsx
// Exemple structure Dossier
<div onClick={openFolder}> {/* Zone principale */}
  <Icon />
  <Name />
</div>

<DropdownMenu>
  <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}> {/* Stop propagation ! */}
    <MoreVertical />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    ...
  </DropdownMenuContent>
</DropdownMenu>
```
