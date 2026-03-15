# Dedalys — Guide Développeur Backend

> Documentation technique destinée au développeur backend souhaitant connecter ses APIs et logiques métier à l'application Next.js Dedalys via Supabase.

---

## Sommaire

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Configuration Supabase et variables d'environnement](#2-configuration-supabase-et-variables-denvironnement)
3. [Authentification et système d'auth](#3-authentification-et-système-dauth)
4. [Module Clients](#4-module-clients)
5. [Module Dossiers](#5-module-dossiers)
6. [Module Audiences](#6-module-audiences)
7. [Module Factures (Paiements)](#7-module-factures-paiements)
8. [Schéma de base de données Supabase](#8-schéma-de-base-de-données-supabase)
9. [Conventions API communes](#9-conventions-api-communes)
10. [Checklist de connexion backend](#10-checklist-de-connexion-backend)

---

## 1. Vue d'ensemble de l'architecture

```
dedalys-app/
├── app/
│   ├── api/v1/               # Routes API serverless (Next.js Route Handlers)
│   │   ├── clients/          # Endpoints CRUD clients
│   │   ├── dossiers/         # Endpoints CRUD dossiers
│   │   ├── audiences/        # Endpoints CRUD audiences
│   │   └── paiements/        # Endpoints CRUD paiements (factures)
│   ├── (auth)/               # Pages d'authentification (login, register)
│   ├── clients/              # UI pages clients
│   ├── dossiers/             # UI pages dossiers
│   ├── audiences/            # UI pages audiences
│   └── facturation/          # UI page factures
├── components/
│   ├── clients/              # Composants UI clients (liste, détail particulier, détail entreprise)
│   ├── dossiers/             # Composants dossiers
│   ├── audiences/            # Composants audiences
│   ├── facturation/          # Composants facturation (stats, formulaire)
│   └── finance/              # Tableau des factures
└── lib/
    ├── supabase/             # Clients Supabase (server et browser)
    └── api.ts                # Instance Axios pour les appels internes API
```

**Technologie principale :** Next.js 15+ (App Router), TypeScript, Tailwind CSS  
**Backend/DB :** Supabase (PostgreSQL + Auth + Storage)  
**Appels HTTP internes :** Axios via `lib/api.ts` sur les routes `/api/v1/*`

---

## 2. Configuration Supabase et variables d'environnement

### Fichier `.env`

```env
# URL publique du projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xgytxckiatphdxkifctb.supabase.co

# Clé anonyme (publique) — utilisée côté client navigateur
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# Clé de service (secrète) — uniquement côté serveur (routes API)
# Ne jamais exposer cette clé côté client
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### Clients Supabase disponibles

**`lib/supabase/server.ts`** — Client serveur (utilise la clé de service, contourne RLS)

```ts
import { createClient } from "@/lib/supabase/server"
const supabase = createClient()
// Accès complet, sans restriction RLS
const { data, error } = await supabase.from("clients").select("*")
```

**`lib/supabase/client.ts`** — Client navigateur (respecte RLS, clé anonyme)

```ts
import { createBrowserClient } from "@/lib/supabase/client"
const supabase = createBrowserClient()
// Limité par les politiques RLS de l'utilisateur connecté
```

> **Règle absolue :** Dans les routes `app/api/v1/`, utilisez toujours le client serveur (`createClient()`). Le client navigateur est réservé aux composants React côté client.

---

## 3. Authentification et système d'auth

### Fonctionnement actuel

L'authentification est gérée par **Supabase Auth**. Les pages de connexion se trouvent dans `app/(auth)/`.

### Pages et routes d'auth

| Chemin | Description |
|--------|-------------|
| `/login` | Page de connexion (email + mot de passe) |
| `/register` | Page d'inscription |

### Middleware de protection des routes

Le fichier `middleware.ts` (à la racine) intercepte toutes les requêtes et redirige vers `/login` si aucune session Supabase valide n'est trouvée.

Pour modifier la page de login ou le système d'auth :

1. **Changer le design du login :** modifier `app/(auth)/login/page.tsx`
2. **Changer la stratégie d'auth (OAuth, Magic Link, SSO) :**
   - Configurer les providers dans le dashboard Supabase > Authentication > Providers
   - Adapter `app/(auth)/login/page.tsx` pour appeler `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. **Changer la page de redirection après login :** modifier `middleware.ts`

### Récupération de la session dans une route API

```ts
// app/api/v1/exemple/route.ts
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  // Suite de la logique...
}
```

---

## 4. Module Clients

### Structure de la table `clients` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `type` | text | `PERSONNE_PHYSIQUE` ou `PERSONNE_MORALE` |
| `nom` | text | Nom de famille (particulier) |
| `prenom` | text | Prénom (particulier) |
| `raison_sociale` | text | Raison sociale (entreprise) |
| `email` | text | Email principal |
| `telephone` | text | Téléphone principal |
| `adresse` | text | Adresse |
| `statut` | text | `PP` (Personne Physique) ou `PM` (Personne Morale) |
| `avatar_url` | text | URL avatar (Supabase Storage, bucket `avatars`) |
| `logo_url` | text | URL logo (Supabase Storage, bucket `logos`) |
| `created_at` | timestamp | Date de création |

### Routes API clients

#### `GET /api/v1/clients`

Retourne tous les clients.

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "PERSONNE_PHYSIQUE",
      "nom": "Koné",
      "prenom": "Aminata",
      "email": "aminata@example.com",
      "statut": "PP"
    }
  ]
}
```

#### `POST /api/v1/clients`

Crée un nouveau client.

**Corps de la requête :**

```json
{
  "type": "PERSONNE_PHYSIQUE",
  "nom": "Koné",
  "prenom": "Aminata",
  "email": "aminata@example.com",
  "telephone": "+225 07 00 00 00",
  "adresse": "Abidjan, Plateau"
}
```

#### `GET /api/v1/clients/[id]`

Retourne un client avec ses dossiers et audiences liées.

#### `PATCH /api/v1/clients/[id]`

Met à jour un client.

#### `DELETE /api/v1/clients/[id]`

Supprime un client.

### Composants UI associés

| Composant | Emplacement | Rôle |
|-----------|-------------|------|
| `ClientList` | `components/clients/client-list.tsx` | Liste de tous les clients (grille + liste) |
| `IndividualClientDetail` | `components/clients/individual-client-detail.tsx` | Fiche détail particulier |
| `CompanyClientDetail` | `components/clients/company-client-detail.tsx` | Fiche détail entreprise |

---

## 5. Module Dossiers

### Structure de la table `dossiers` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `reference` | text | Référence auto-générée (ex: `DOS-2025-042`) |
| `titre` | text | Titre ou intitulé du dossier |
| `client_id` | uuid | FK -> `clients.id` |
| `type` | text | `contentieux`, `transactionnel`, `conseil`, etc. |
| `statut` | text | `ouvert`, `en_instance`, `cloture` |
| `juridiction` | text | Tribunal compétent |
| `domaine` | text | Domaine du droit |
| `description` | text | Description libre |
| `notes` | text | Notes internes |
| `created_at` | timestamp | Date de création |

### Relation Dossiers <-> Audiences

La table `dossier_audiences` (table de liaison) relie les dossiers aux audiences :

```
dossier_audiences {
  dossier_id: uuid (FK -> dossiers.id)
  audience_id: uuid (FK -> audiences.id)
}
```

Lors de la création d'un dossier, le frontend envoie un tableau `audiencesIds` que l'API traite pour insérer dans `dossier_audiences`.

### Routes API dossiers

#### `GET /api/v1/dossiers`

Retourne tous les dossiers avec leurs audiences et informations client.

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "reference": "DOS-2025-042",
      "titre": "Affaire SIB c/ Kouamé",
      "statut": "ouvert",
      "client_id": "uuid-client",
      "audiences": [
        { "id": "uuid-audience", "date": "2025-04-12", "statut": "A_VENIR" }
      ]
    }
  ]
}
```

#### `POST /api/v1/dossiers`

Crée un dossier et lie les audiences.

**Corps de la requête :**

```json
{
  "client_id": "uuid-client",
  "reference": "DOS-2025-042",
  "titre": "Affaire SIB c/ Kouamé",
  "type": "contentieux",
  "statut": "ouvert",
  "juridiction": "TPI d'Abidjan-Plateau",
  "domaine": "COMMERCIAL",
  "description": "...",
  "audiencesIds": ["uuid-audience-1", "uuid-audience-2"]
}
```

#### `GET /api/v1/dossiers/[id]`

Retourne un dossier avec ses audiences et son client.

#### `PATCH /api/v1/dossiers/[id]`

Met à jour un dossier (statut, titre, juridiction, etc.).

#### `DELETE /api/v1/dossiers/[id]`

Supprime un dossier.

### Composants UI associés

| Composant | Emplacement | Rôle |
|-----------|-------------|------|
| Page liste dossiers | `app/dossiers/page.tsx` | Index des dossiers avec filtres |
| Page nouveau dossier | `app/dossiers/nouveau/page.tsx` | Formulaire de création |
| Page détail dossier | `app/dossiers/[id]/page.tsx` | Onglets: Info, Notes, GED, Audiences |

---

## 6. Module Audiences

### Structure de la table `audiences` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `titre` | text | Titre ou type d'audience (ex: "Audience de fond") |
| `date` | date | Date de l'audience |
| `heure` | time | Heure de l'audience |
| `statut` | text | `A_VENIR`, `TERMINEE`, `ANNULEE`, `REPORTEE` |
| `resultat` | text | `GAGNE`, `PERDU`, `REPORTE` (si TERMINEE) |
| `juridiction` | text | Tribunal où se tient l'audience |
| `salle_audience` | text | Salle ou numéro de salle |
| `duree` | text | Durée estimée |
| `notes` | text | Notes libres |
| `client_id` | uuid | FK -> `clients.id` |
| `dossier_id` | uuid | FK -> `dossiers.id` (dossier principal) |
| `created_at` | timestamp | Date de création |

### Routes API audiences

#### `GET /api/v1/audiences`

Retourne toutes les audiences avec leur client et dossier liés.

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "titre": "Audience de fond",
      "date": "2025-05-28",
      "statut": "A_VENIR",
      "client_id": "uuid-client",
      "dossier_id": "uuid-dossier",
      "dossier": { "id": "uuid", "reference": "DOS-2025-042", "titre": "..." },
      "client": { "id": "uuid", "nom": "Kouamé", "type": "PERSONNE_PHYSIQUE" }
    }
  ]
}
```

#### `POST /api/v1/audiences`

Crée une nouvelle audience.

**Corps de la requête :**

```json
{
  "titre": "Audience de fond",
  "date": "2025-05-28",
  "heure": "09:00",
  "statut": "A_VENIR",
  "juridiction": "TPI d'Abidjan-Plateau",
  "client_id": "uuid-client",
  "dossier_id": "uuid-dossier"
}
```

#### `PATCH /api/v1/audiences/[id]`

Met à jour une audience (statut, résultat, notes, etc.).

**Corps de la requête (mise à jour du statut) :**

```json
{
  "statut": "TERMINEE",
  "resultat": "GAGNE",
  "notes": "Jugement rendu en notre faveur."
}
```

#### `DELETE /api/v1/audiences/[id]`

Supprime une audience.

### Composants UI associés

| Composant | Emplacement | Rôle |
|-----------|-------------|------|
| `AudienceList` | `components/audiences/audience-list.tsx` | Liste des audiences avec filtres et badges de statut |
| Page audiences | `app/audiences/page.tsx` | Page principale (vue liste + calendrier) |

### Affichage dans les modules liés

- **Fiche client** (`IndividualClientDetail`, `CompanyClientDetail`) : affiche les audiences liées via `client_id`
- **Index dossiers** (`app/dossiers/page.tsx`) : calcule et affiche la prochaine audience via la fonction `getNextAudience()`
- **Nouveau dossier** (`app/dossiers/nouveau/page.tsx`) : multi-select des audiences existantes (affiche le `titre` uniquement)

---

## 7. Module Factures (Paiements)

> La table s'appelle `paiements` dans Supabase. Le frontend utilise le terme "factures" dans l'UI.

### Structure de la table `paiements` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique |
| `client_id` | uuid | FK -> `clients.id` |
| `dossier_id` | uuid | FK -> `dossiers.id` |
| `montant` | numeric | Montant encaissé (= montant payé) |
| `montant_ht` | numeric | Montant hors taxes (optionnel) |
| `montant_ttc` | numeric | Montant TTC (optionnel, calculé si absent) |
| `tva` | numeric | Taux de TVA en % (ex: 18 pour 18%) |
| `date_reception` | date | Date du paiement |
| `date_echeance` | date | Date d'échéance (optionnel) |
| `type` | text | `honoraires` ou `frais` |
| `description` | text | Description / référence du paiement |
| `attachment_url` | text | URL pièce jointe (Supabase Storage) |
| `created_at` | timestamp | Date de création |

### Logique de calcul automatique (frontend)

Le tableau des factures calcule automatiquement deux colonnes :

- **TTC** = `montant_ht * (1 + tva / 100)` si `montant_ttc` est absent
- **Reste à payer** = `TTC - montant_paye` (zéro si soldé)

Pour que ces calcules soient précis, fournir dans vos réponses API les champs `montant_ht` et `tva` distingués.

### Routes API paiements

#### `GET /api/v1/paiements`

Retourne tous les paiements.

**Réponse :**

```json
{
  "data": [
    {
      "id": "uuid",
      "client_id": "uuid-client",
      "dossier_id": "uuid-dossier",
      "montant": 500000,
      "montant_ht": 423729,
      "tva": 18,
      "montant_ttc": 500000,
      "date_reception": "2025-03-15",
      "type": "honoraires",
      "description": "Honoraires - Dossier SIB"
    }
  ]
}
```

#### `POST /api/v1/paiements/`

Enregistre un nouveau paiement.

**Corps de la requête :**

```json
{
  "client_id": "uuid-client",
  "dossier_id": "uuid-dossier",
  "montant": 500000,
  "montant_ht": 423729,
  "tva": 18,
  "date_reception": "2025-03-15",
  "date_echeance": "2025-04-15",
  "type": "honoraires",
  "description": "Honoraires - Dossier SIB"
}
```

#### `PATCH /api/v1/paiements/[id]`

Met à jour un paiement.

#### `DELETE /api/v1/paiements/[id]`

Supprime un paiement.

### Composants UI associés

| Composant | Emplacement | Rôle |
|-----------|-------------|------|
| `InvoiceTable` | `components/finance/transaction-table.tsx` | Tableau complet avec 13 colonnes et scrollbars |
| `FinancialStatsView` | `components/facturation/financial-stats-view.tsx` | Dashboard KPI + graphique + factures récentes |
| `InvoiceFormDialog` | `components/facturation/invoice-form-dialog.tsx` | Formulaire de saisie d'un paiement |
| Page facturation | `app/facturation/page.tsx` | Page principale (vue liste / vue stats) |

### KPIs calculés dans `FinancialStatsView`

Tous basés sur les données réelles passées via la prop `invoices` :

| KPI | Calcul |
|-----|--------|
| Chiffre d'affaires | Somme de tous les `montantPaye` |
| Objectif mensuel | Saisi par l'utilisateur, stocké en état local React |
| Taux de recouvrement | `(totalPaye / totalTTC) * 100` |
| Factures en attente | Somme des `TTC - paye` pour les statuts `IMPAYEE` et `PARTIELLE` |

---

## 8. Schéma de base de données Supabase

Le fichier `supabase_updates.sql` à la racine du projet contient les scripts SQL pour :
- Créer ou migrer les tables
- Configurer les politiques RLS (Row Level Security)
- Créer les buckets Storage (`avatars`, `logos`, `fichiers`)

### Relations principales

```
clients (id)
  |-- dossiers (client_id -> clients.id)
  |     |-- dossier_audiences (dossier_id -> dossiers.id)
  |           |-- audiences (id) via dossier_audiences.audience_id
  |-- audiences (client_id -> clients.id)
  |-- paiements (client_id -> clients.id)

dossiers (id)
  |-- paiements (dossier_id -> dossiers.id)
  |-- fichiers (dossier_id -> dossiers.id)
  |-- dossier_audiences (dossier_id -> dossiers.id)
```

### Politiques RLS recommandées

Pour chaque table, activer RLS et créer une politique qui autorise toutes les opérations aux utilisateurs authentifiés :

```sql
-- Exemple pour la table clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs authentifiés : accès complet"
ON clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## 9. Conventions API communes

### Format de réponse

Toutes les routes API renvoient :

```json
// Succès (liste)
{ "data": [...] }

// Succès (élément unique)
{ "id": "uuid", ...champs }

// Erreur
{ "error": "Message d'erreur lisible" }
```

### Codes de statut HTTP

| Code | Usage |
|------|-------|
| 200 | Succès (GET, PATCH) |
| 201 | Ressource créée (POST) |
| 400 | Données invalides |
| 401 | Non authentifié |
| 404 | Ressource introuvable |
| 500 | Erreur serveur |

### Authentification des requêtes API

Le frontend utilise `lib/api.ts` (instance Axios) qui transmet automatiquement le cookie de session Supabase. Les routes API valident la session via `supabase.auth.getUser()`.

Pour les appels depuis un backend externe (sans cookie navigateur), transmettre le JWT dans le header :

```
Authorization: Bearer <supabase_jwt_token>
```

---

## 10. Checklist de connexion backend

Utiliser cette liste pour valider que chaque module est correctement connecté.

### Module Clients

- [ ] `GET /api/v1/clients` retourne `{ data: [...] }` avec tous les clients
- [ ] `GET /api/v1/clients/[id]` retourne le client avec ses dossiers et audiences
- [ ] `POST /api/v1/clients` accepte `type`, `nom`/`prenom` ou `raison_sociale`, `email`, `telephone`
- [ ] `PATCH /api/v1/clients/[id]` met à jour les champs fournis
- [ ] `DELETE /api/v1/clients/[id]` supprime le client

### Module Dossiers

- [ ] `GET /api/v1/dossiers` inclut la liste des audiences de chaque dossier
- [ ] `POST /api/v1/dossiers` traite `audiencesIds` et insère dans `dossier_audiences`
- [ ] `GET /api/v1/dossiers/[id]` retourne le dossier avec son client et ses audiences
- [ ] `PATCH /api/v1/dossiers/[id]` accepte les mises à jour de statut, titre, juridiction
- [ ] `DELETE /api/v1/dossiers/[id]` supprime le dossier et ses entrées dans `dossier_audiences`

### Module Audiences

- [ ] `GET /api/v1/audiences` retourne les audiences avec `dossier` et `client` liés (jointures)
- [ ] `POST /api/v1/audiences` crée une audience et la lie au dossier via `dossier_id`
- [ ] `PATCH /api/v1/audiences/[id]` met à jour `statut` et `resultat`
- [ ] `DELETE /api/v1/audiences/[id]` supprime l'audience et ses entrées dans `dossier_audiences`

### Module Factures

- [ ] `GET /api/v1/paiements` retourne les paiements (le frontend joint clients et dossiers lui-même)
- [ ] Les champs `montant_ht`, `tva`, `montant_ttc`, `date_echeance` sont présents dans les réponses
- [ ] `POST /api/v1/paiements/` accepte tous les champs du formulaire
- [ ] `PATCH /api/v1/paiements/[id]` permet la mise à jour
- [ ] `DELETE /api/v1/paiements/[id]` supprime le paiement

### Authentification

- [ ] Le middleware redirige les utilisateurs non authentifiés vers `/login`
- [ ] Toutes les routes API vérifient la session (`supabase.auth.getUser()`)
- [ ] Les politiques RLS sont actives sur toutes les tables

---

*Ce guide est à maintenir synchronisé avec les évolutions du schéma Supabase et les nouvelles routes API. Toute modification du schéma doit être répercutée dans `supabase_updates.sql`.*
