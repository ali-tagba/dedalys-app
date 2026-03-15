# Dedalys - Guide de deploiement sur Vercel

L'application fonctionne en mode autonome : frontend Next.js + routes API integrees. Aucun backend externe n'est necessaire. La base de donnees et l'authentification sont gerees par Supabase.

---

## 1. Prerequis

- Compte Vercel (vercel.com)
- Projet Supabase configure (URL, cle anon, tables creees)
- Fichier `supabase_updates.sql` execute sur la base Supabase

---

## 2. Preparation du projet

### Variables d'environnement

Creer un fichier `.env.local` pour le developpement local (ne pas commiter) :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Ne pas definir `NEXT_PUBLIC_API_URL` : le frontend utilisera les routes Next.js integrees.

---

## 3. Deploiement sur Vercel

### Etape 1 : Importer le projet

1. Aller sur vercel.com et se connecter
2. Add New Project
3. Importer le depot Git contenant dedalys-app (ou upload manuel)
4. Si le depot contient plusieurs dossiers, definir le "Root Directory" sur `dedalys-app`

### Etape 2 : Configurer les variables

Dans Settings > Environment Variables, ajouter :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| NEXT_PUBLIC_SUPABASE_URL | URL du projet Supabase | Production, Preview |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Cle anon Supabase | Production, Preview |

### Etape 3 : Build

- Framework Preset : Next.js (detection automatique)
- Build Command : `npx prisma generate 2>/dev/null || true && next build` (si Prisma est present, sinon `next build`)
- Output Directory : `.next` (defaut)
- Install Command : `npm install` (defaut)

### Etape 4 : Deploy

Cliquer sur Deploy. Le build peut echouer si Prisma est configure sans base : dans ce cas, retirer la commande Prisma du Build Command ou configurer une DATABASE_URL si le projet utilise Prisma pour des fonctionnalites specifiques.

---

## 4. Configuration Supabase

### URL de redirection

Dans Supabase Dashboard > Authentication > URL Configuration :

- Site URL : `https://votre-projet.vercel.app`
- Redirect URLs : ajouter `https://votre-projet.vercel.app/**`

### Buckets Storage

S'assurer que le bucket `fichiers` existe et que les politiques RLS permettent l'upload et la lecture (voir `supabase_updates.sql`).

---

## 5. Donnees initiales

Si la base est vide, creer manuellement ou via script :

1. Un espace (table `espaces`)
2. Un utilisateur dans `auth.users` (inscription via l'app ou Supabase Dashboard)
3. Un enregistrement correspondant dans `utilisateurs` avec `espace_id` et `role_cabinet`

---

## 6. Verification post-deploiement

1. Ouvrir l'URL Vercel
2. Aller sur /auth et se connecter ou s'inscrire
3. Verifier l'acces aux pages : Clients, Dossiers, Audiences
4. Tester la creation d'un client et d'un dossier
5. Tester l'upload d'un fichier dans un dossier (GED)

---

## 7. Deploiement automatique

A chaque push sur la branche principale (main ou master), Vercel redeploie automatiquement si le projet est lie a un depot Git.
