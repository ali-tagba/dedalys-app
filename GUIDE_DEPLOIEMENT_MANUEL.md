# Guide de Déploiement Manuel - Dedalys sur Vercel

## ✅ Partie 1 : Git & GitHub (DÉJÀ FAIT)

Votre code est **prêt et poussé sur GitHub** :
- **Dépôt** : `https://github.com/ali-tagba/dedalys-app.git`
- **Branche** : `force-deploy-fix`
- **Dernier commit** : "Add manual Vercel deployment guide"

Tout est prêt côté Git ! 🎉

---

## 📋 Partie 2 : Déploiement sur Vercel (À FAIRE MANUELLEMENT)

### Étape 1 : Créer le Projet Vercel (5 minutes)

1. **Ouvrir Vercel**
   - Allez sur : **https://vercel.com**
   - Connectez-vous avec votre compte GitHub

2. **Importer le Projet**
   - Cliquez sur le bouton **"Add New..."** (en haut à droite)
   - Sélectionnez **"Project"**
   - Cherchez et sélectionnez le dépôt **`ali-tagba/dedalys-app`**

3. **Configurer le Projet**
   - **Project Name** : Laissez `dedalys-app` (ou changez si vous voulez)
   - **Framework Preset** : Vercel détecte automatiquement **Next.js** ✅
   - **Root Directory** : Laissez `./` (racine)
   - **Build Command** : Changez pour :
     ```
     npx prisma generate && next build
     ```
   - **Output Directory** : Laissez `.next`
   - **Install Command** : Laissez `npm install`

4. **NE PAS DÉPLOYER ENCORE !**
   - **Ne cliquez PAS sur "Deploy"** pour l'instant
   - On doit d'abord créer la base de données

---

### Étape 2 : Créer la Base de Données PostgreSQL (3 minutes)

1. **Aller dans Storage**
   - Dans votre projet Vercel (même si pas encore déployé)
   - Cliquez sur l'onglet **"Storage"** (dans le menu du haut)

2. **Créer une Base PostgreSQL**
   - Cliquez sur **"Create Database"**
   - Sélectionnez **"Postgres"**
   - **Database Name** : Laissez le nom par défaut ou mettez `dedalys-db`
   - **Region** : Choisissez la région la plus proche (ex: `Frankfurt` pour l'Europe, `Washington D.C.` pour l'Afrique de l'Ouest)
   - Cliquez sur **"Create"**

3. **Connecter au Projet**
   - Vercel va demander : "Connect to project?"
   - Sélectionnez votre projet **`dedalys-app`**
   - Cliquez sur **"Connect"**

4. **Variables d'Environnement Automatiques**
   - Vercel va automatiquement créer ces variables :
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

5. **Ajouter DATABASE_URL**
   - Allez dans **Settings** → **Environment Variables**
   - Cliquez sur **"Add New"**
   - **Key** : `DATABASE_URL`
   - **Value** : Copiez la valeur de `POSTGRES_PRISMA_URL` (cliquez sur l'icône œil pour voir)
   - **Environments** : Cochez **Production**, **Preview**, et **Development**
   - Cliquez sur **"Save"**

---

### Étape 3 : Premier Déploiement (2 minutes)

1. **Lancer le Déploiement**
   - Allez dans l'onglet **"Deployments"**
   - Cliquez sur **"Deploy"** (ou retournez à l'écran d'import et cliquez sur "Deploy")

2. **Attendre la Fin du Build**
   - Le build va prendre environ 1-2 minutes
   - Vous verrez les logs en temps réel
   - Attendez le message **"Deployment completed"** ✅

3. **Récupérer l'URL**
   - Une fois terminé, vous aurez une URL du type :
     ```
     https://dedalys-app-xxx.vercel.app
     ```
   - **⚠️ NE L'OUVREZ PAS ENCORE** - la base de données est vide !

---

### Étape 4 : Remplir la Base de Données (5 minutes)

**Sur votre ordinateur :**

1. **Récupérer l'URL de la Base de Données**
   - Dans Vercel, allez dans **Settings** → **Environment Variables**
   - Trouvez `POSTGRES_PRISMA_URL`
   - Cliquez sur l'icône œil pour voir la valeur
   - **Copiez** cette valeur complète (elle commence par `postgres://...`)

2. **Créer un Fichier .env.production**
   - Ouvrez un éditeur de texte (Notepad, VS Code, etc.)
   - Collez exactement ceci (en remplaçant par votre URL) :
     ```
     DATABASE_URL="postgres://default:VOTRE_URL_COMPLETE_ICI"
     ```
   - Sauvegardez ce fichier dans le dossier `dedalys-app` avec le nom **`.env.production`**
   - **⚠️ IMPORTANT** : Le fichier doit commencer par un point : `.env.production`

3. **Installer dotenv-cli** (si pas déjà fait)
   - Ouvrez un terminal dans le dossier `dedalys-app`
   - Exécutez :
     ```bash
     npm install -g dotenv-cli
     ```

4. **Créer les Tables dans la Base**
   - Dans le terminal, exécutez :
     ```bash
     npx dotenv -e .env.production -- npx prisma db push
     ```
   - Attendez le message : **"Your database is now in sync with your schema."** ✅

5. **Insérer les Données Fictives**
   - Dans le terminal, exécutez :
     ```bash
     npx dotenv -e .env.production -- npx prisma db seed
     ```
   - Vous verrez :
     ```
     🌱 Seeding database...
     🗑️  Clearing existing data...
     ✅ Created user: Maître Konan
     ✅ Created 8 clients (4 companies, 4 individuals)
     ✅ Created 18 dossiers
     📁 Creating file hierarchies...
     ✅ Created 100+ files and folders
     ✅ Created 25 audiences
     ✅ Created 15 Flash CRs
     ✅ Created 20 invoices
     🎉 Seeding completed!
     ```

---

### Étape 5 : Vérification (3 minutes)

1. **Ouvrir l'Application**
   - Ouvrez votre URL Vercel dans un navigateur
   - Exemple : `https://dedalys-app-xxx.vercel.app`

2. **Vérifier le Dashboard**
   - Vous devriez voir des statistiques :
     - 8 Clients
     - 18 Dossiers
     - 25 Audiences
     - Etc.

3. **Tester les Modules**
   - **Clients** : Cliquez sur "Clients" → Vous devriez voir 8 clients
   - **Dossiers** : Cliquez sur "Dossiers" → Vous devriez voir 18 dossiers
   - **Audiences** : Cliquez sur "Audiences" → Vous devriez voir le calendrier avec 25 audiences
   - **Facturation** : Cliquez sur "Facturation" → Vous devriez voir les factures

4. **Tester la Création**
   - Essayez de créer un nouveau client
   - Vérifiez qu'il apparaît dans la liste
   - Rafraîchissez la page (F5) pour confirmer que les données persistent

---

## 🎉 C'est Terminé !

Votre application Dedalys est maintenant :
- ✅ Déployée sur Vercel
- ✅ Connectée à une base PostgreSQL cloud
- ✅ Remplie avec des données fictives complètes
- ✅ Accessible 24/7 via une URL publique

### URL de votre Application
Vous pouvez maintenant partager cette URL avec vos testeurs :
```
https://dedalys-app-xxx.vercel.app
```

---

## 🔄 Déploiements Futurs

**Important** : Vercel est configuré pour déployer automatiquement à chaque push sur GitHub.

Si vous voulez **désactiver les déploiements automatiques** :
1. Allez dans **Settings** → **Git**
2. Désactivez **"Auto-deploy"**

Pour déployer manuellement ensuite :
1. Allez dans **Deployments**
2. Cliquez sur **"Redeploy"** sur le dernier déploiement

---

## ⚠️ Sécurité

**NE COMMITEZ JAMAIS** le fichier `.env.production` dans Git !

Pour vérifier :
```bash
git status
```

Si vous voyez `.env.production`, **NE LE COMMITEZ PAS** !

---

## 🆘 Problèmes Courants

### "Prisma Client not found"
- Vérifiez que le Build Command est bien : `npx prisma generate && next build`

### "Database connection error"
- Vérifiez que `DATABASE_URL` est bien configuré dans Vercel
- Vérifiez que la valeur correspond à `POSTGRES_PRISMA_URL`

### "Les données n'apparaissent pas"
- Vérifiez que le seed s'est bien exécuté (voir les ✅ dans le terminal)
- Rafraîchissez la page (Ctrl+Shift+R pour vider le cache)
- Vérifiez les logs dans Vercel → Functions

### "Page 404"
- Attendez 2-3 minutes que le déploiement se termine complètement
- Vérifiez que le build s'est terminé sans erreur

---

## 📊 Limites du Plan Gratuit Vercel

- **256 MB** de stockage base de données
- **60 heures** de compute par mois
- **100 GB** de bande passante
- Parfait pour un prototype avec 4-5 utilisateurs

---

**Bon déploiement ! 🚀**

