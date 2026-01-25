# Guide Rapide : Déployer Dedalys sur Vercel 🚀

## Résumé en 3 Étapes

Votre application est **PRÊTE** à être déployée ! Voici ce qu'il faut faire :

### ✅ Ce qui est déjà fait
- Code sur GitHub : https://github.com/ali-tagba/dedalys-app.git
- Schéma PostgreSQL configuré
- Données fictives prêtes (8 clients, 18 dossiers, 25 audiences, etc.)

### 📋 Ce qu'il reste à faire

#### **Étape 1 : Créer le projet sur Vercel** (5 minutes)

1. Allez sur **[vercel.com](https://vercel.com)** et connectez-vous avec GitHub
2. Cliquez sur **"Add New..."** → **"Project"**
3. Sélectionnez le dépôt **`ali-tagba/dedalys-app`**
4. **NE CHANGEZ RIEN** dans les paramètres
5. Cliquez sur **"Deploy"**

⚠️ Le premier déploiement va **ÉCHOUER** ou afficher une page vide - c'est normal ! La base de données n'existe pas encore.

---

#### **Étape 2 : Ajouter la base de données PostgreSQL** (3 minutes)

1. Dans votre projet Vercel, allez dans l'onglet **"Storage"**
2. Cliquez sur **"Create Database"** → **"Postgres"**
3. Sélectionnez la région la plus proche (ex: Frankfurt pour l'Europe)
4. Cliquez sur **"Create"**

Vercel va automatiquement :
- Créer une base PostgreSQL gratuite
- Ajouter toutes les variables d'environnement nécessaires
- Redéployer l'application

Attendez 2-3 minutes que le déploiement se termine.

---

#### **Étape 3 : Remplir la base avec les données fictives** (5 minutes)

**Option A : Via Vercel Dashboard (Plus simple)**

1. Dans Vercel, allez dans **Settings** → **Environment Variables**
2. Copiez la valeur de **`POSTGRES_PRISMA_URL`** (cliquez sur l'icône œil puis copiez)
3. Sur votre ordinateur, ouvrez un terminal dans le dossier `dedalys-app`
4. Créez un fichier `.env.production` et collez :
   ```
   DATABASE_URL="<COLLEZ_ICI_LA_VALEUR_DE_POSTGRES_PRISMA_URL>"
   ```
5. Exécutez ces commandes :
   ```bash
   # Créer les tables
   npx dotenv -e .env.production -- npx prisma db push
   
   # Remplir avec les données fictives
   npx dotenv -e .env.production -- npx prisma db seed
   ```

**Option B : Via Vercel CLI (Plus rapide si vous avez déjà Vercel CLI)**

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
cd dedalys-app
vercel link

# Récupérer les variables d'environnement
vercel env pull .env.vercel

# Créer les tables et insérer les données
npx dotenv -e .env.vercel -- npx prisma db push
npx dotenv -e .env.vercel -- npx prisma db seed
```

---

## ✨ C'est terminé !

Votre application est maintenant déployée sur une URL du type :
**`https://dedalys-app-xxx.vercel.app`**

### Que faire ensuite ?

1. **Testez l'application** : Ouvrez l'URL Vercel dans votre navigateur
2. **Vérifiez les données** :
   - Allez dans "Clients" → Vous devriez voir 8 clients
   - Allez dans "Dossiers" → Vous devriez voir 18 dossiers
   - Allez dans "Audiences" → Vous devriez voir 25 audiences
3. **Partagez l'URL** avec vos 4-5 testeurs

### Déploiement automatique

À partir de maintenant, **chaque fois que vous pushez du code sur GitHub**, Vercel va automatiquement redéployer l'application ! 🎉

---

## ⚠️ Notes Importantes

- **Ne commitez JAMAIS** le fichier `.env.production` dans Git
- La base de données gratuite de Vercel a 256 MB de stockage (largement suffisant pour un prototype)
- Les données sont partagées entre tous les utilisateurs
- L'application est accessible 24/7, même si votre ordinateur est éteint

---

## 🆘 Besoin d'aide ?

Si vous rencontrez un problème, consultez le fichier `implementation_plan.md` pour plus de détails.

**Problèmes courants** :

- **"Prisma Client not found"** → Allez dans Vercel Settings → General → Build Command et changez pour : `npx prisma generate && next build`
- **"Database connection error"** → Vérifiez que la base PostgreSQL est bien créée dans l'onglet Storage
- **"Page 404"** → Attendez 2-3 minutes que le déploiement se termine

