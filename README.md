# Documentation Technique - Dedalys App

Cette documentation est destinée au développeur backend pour comprendre l'architecture de l'application Next.js, se connecter à Supabase, et interagir avec l'API existante.

## 1. Architecture Générale
L'application frontend (Dedalys) utilise **Next.js 15 (App Router)**.
Elle communique avec la base de données **Supabase** via des **Routes API internes** (situées dans `app/api/v1/...`).

Le flux de données standard est :
`Frontend (Composants React) -> Routes API Next.js (/api/v1/*) -> Supabase (PostgreSQL / Auth / Storage)`

---

## 2. Connexion à Supabase

Supabase est utilisé comme base de données principale et gestionnaire d'authentification.

### Fichiers clients Supabase
Il existe deux types de clients Supabase préconfigurés :

1. **Client Navigateur (Frontend - respecte les RLS) :**
   - Fichier : `lib/supabase.ts`
   - Utilisation : Uniquement dans les composants React côté client.
   - Utilise la clé anonyme publique.

2. **Client Serveur (Backend Next.js - contourne les RLS si en mode Admin) :**
   - Fichier : `lib/supabase-server.ts`
   - Utilisation : Obligatoire dans les routes API (`app/api/v1/...`).
   - S'appuie sur le token de l'utilisateur connecté passé en Header HTTP.

### Variables d'environnement nécessaires (`.env`)
Pour connecter votre code (Python ou autre backend) directement à Supabase, vous aurez besoin de ces identifiants :
```env
# L'URL du projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<votre-id-projet>.supabase.co

# Clé anonyme (utilisée côté client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre_cle_anon>

# Clé Service / Admin (pour un accès direct backend sans barrière de sécurité - à cacher du frontend)
SUPABASE_SERVICE_ROLE_KEY=<votre_cle_service>
```

---

## 3. Communication depuis l'API Python (FastAPI)

Le dossier `dedalys-api` contient le vrai backend Python. Ce backend doit, idéalement, attaquer **directement la base de données Supabase** en utilisant :
- Soit le client officiel `supabase-py`.
- Soit en se connectant en SQL direct via `psycopg2` / `asyncpg` / `SQLAlchemy` avec l'URL de connexion PostgreSQL fournie par Supabase.

Il n'est d'ordinaire **pas nécessaire** que l'API Python appelle les routes Next.js (`/api/v1/...`), car le Python peut requêter Supabase directement de son côté avec la `SUPABASE_SERVICE_ROLE_KEY` ou la `DATABASE_URL` SQL.

---

## 4. Gestion de la page AHT (Authentification)

L'authentification actuelle est gérée via le dossier `app/(auth)` ou `app/auth` et s'appuie sur Supabase Auth.

### Comment modifier la page AHT (Login / Register) ?
La page de connexion se trouve généralement dans :
`app/auth/page.tsx` ou `app/(auth)/login/page.tsx` (ou le dossier d'authentification spécifique selon l'arborescence Next.js, cherchez `login/page.tsx`).

Vous pouvez y modifier :
- Le design (HTML/Tailwind).
- La redirection après le succès de la connexion (modifiez vers quel route le `router.push()` renvoie après validation de l'email/mot de passe).

### Comment supprimer ou désactiver la page AHT ?
Si vous ne voulez plus d'authentification ou si l'API Python gère l'auth différemment :

1. **Supprimer les pages web d'authentification** :
   Supprimez totalement le dossier `app/auth` (ou le dossier `app/(auth)`). 
   Cela supprimera les routes web `/auth/login` et `/auth/register`.

2. **Désactiver la redirection forcée (Middleware)** :
   Next.js utilise un intercepteur pour forcer les visiteurs à se connecter.
   - Ouvrez le fichier `middleware.ts` (à la racine de `dedalys-app`).
   - Supprimez-le complètement, **OU** commentez son contenu pour qu'il n'intercepte plus et ne redirige plus vers la page de login quand l'utilisateur n'est pas connecté.

3. **Désactiver les vérifications dans l'API Next.js** :
   Dans les fichiers `app/api/v1/.../route.ts`, repérez et supprimez les blocs de code qui contrôlent si l'utilisateur est connecté.
   Exemple typique de code à supprimer :
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
   ```

---

## 5. Structure de l'API Interne Next.js (Dossier `/api/v1/`)

L'application expose des routes API internes qui sont appelées par le frontend. Si votre backend a besoin d'interagir avec ces routes HTTP (plutôt qu'en base de données SQL direct) :

- Toutes les requêtes attendent un Content-Type `application/json`.
- Si le `middleware.ts` est actif, vous devez passer le token JWT de Supabase dans le header :
  `Authorization: Bearer <votre_token_jwt>`
- Format de réponse standard : `{ "data": ... }` en cas de succès, `{ "error": "Message" }` en cas d'échec.

**Principales routes existantes :**
- `/api/v1/clients` : CRUD Clients
- `/api/v1/dossiers` : CRUD Dossiers (demande des affaires juridiques)
- `/api/v1/audiences` : CRUD Audiences
- `/api/v1/paiements` : Gestion de la facturation
- `/api/v1/flash-cr` : Comptes-rendus express d'audiences
- `/api/v1/fichiers/dossier/[id]` : Gestion documentaire (GED) liée au stockage Supabase.
