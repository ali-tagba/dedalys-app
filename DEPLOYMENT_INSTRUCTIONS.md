# 🚀 Déploiement KadriLex - Instructions Complètes

## ✅ État Actuel

Le projet KadriLex est **100% prêt** avec :
- ✅ Code complet et testé
- ✅ Branding KadriLex appliqué
- ✅ Données Niger/Niamey localisées
- ✅ Module Bibliothèque ajouté
- ✅ Git initialisé avec 2 commits
- ✅ Prisma client généré

---

## 📋 Étape 1 : Créer le Repository GitHub

### Option A : Via l'interface web GitHub

1. Aller sur https://github.com/new
2. **Repository name** : `kadrilex`
3. **Description** : "KadriLex - Solution de gestion pour cabinets juridiques au Niger"
4. **Visibility** : Private (recommandé) ou Public
5. ⚠️ **NE PAS** cocher "Initialize with README"
6. Cliquer sur "Create repository"

### Option B : Via GitHub CLI (si installé)

```bash
gh repo create kadrilex --private --source=. --remote=origin --push
```

---

## 📋 Étape 2 : Pousser le Code sur GitHub

Une fois le repository créé sur GitHub, exécuter ces commandes :

```bash
# Se positionner dans le projet
cd "C:\Users\USER\Downloads\Dedalys (1).1-4515678458973055887\kadrilex"

# Ajouter le remote GitHub (remplacer YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/kadrilex.git

# Vérifier que le remote est bien ajouté
git remote -v

# Pousser le code
git branch -M main
git push -u origin main
```

---

## 📋 Étape 3 : Créer la Base de Données PostgreSQL

### Option Recommandée : Vercel Postgres

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur "Storage" dans le menu
3. Cliquer sur "Create Database"
4. Sélectionner "Postgres"
5. Choisir un nom : `kadrilex-db`
6. Région : Choisir la plus proche (Europe West recommandé pour le Niger)
7. Cliquer sur "Create"
8. Une fois créé, copier le `DATABASE_URL` (format : `postgres://...`)

### Alternative : Neon.tech (Gratuit)

1. Aller sur https://neon.tech
2. Créer un compte
3. Créer un nouveau projet : "KadriLex"
4. Copier la "Connection String"

---

## 📋 Étape 4 : Déployer sur Vercel

### Via l'interface web Vercel

1. Aller sur https://vercel.com/new
2. Cliquer sur "Import Git Repository"
3. Sélectionner le repository `kadrilex`
4. **Framework Preset** : Next.js (détecté automatiquement)
5. **Root Directory** : `.` (laisser par défaut)
6. Cliquer sur "Environment Variables"
7. Ajouter :
   - **Name** : `DATABASE_URL`
   - **Value** : Coller l'URL de la base de données
8. Cliquer sur "Deploy"

### Via Vercel CLI

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter la variable d'environnement
vercel env add DATABASE_URL

# Déployer en production
vercel --prod
```

---

## 📋 Étape 5 : Initialiser la Base de Données

Une fois le déploiement terminé, vous devez créer les tables et insérer les données.

### Option A : Via Vercel CLI (Recommandé)

```bash
# Se connecter au projet Vercel
vercel link

# Exécuter les migrations
vercel env pull .env.local
npx prisma migrate deploy

# Peupler la base de données
npx prisma db seed
```

### Option B : Manuellement

1. Aller dans les paramètres du projet Vercel
2. Onglet "Deployments"
3. Cliquer sur les "..." du dernier déploiement
4. Sélectionner "View Function Logs"
5. Dans un terminal local avec `.env.local` configuré :

```bash
# Créer .env.local avec DATABASE_URL
echo "DATABASE_URL=votre_url_postgres" > .env.local

# Exécuter les migrations
npx prisma migrate deploy

# Peupler la base
npx prisma db seed
```

---

## 📋 Étape 6 : Vérification Post-Déploiement

### Checklist de Vérification

Ouvrir l'URL Vercel de votre application et vérifier :

- [ ] ✅ L'application charge correctement
- [ ] ✅ Le titre affiche "KadriLex" (pas "Dedalys")
- [ ] ✅ Le logo affiche "K" (pas "D")
- [ ] ✅ Le menu contient "Bibliothèque"
- [ ] ✅ La page Clients affiche des données Niger
- [ ] ✅ Les numéros de téléphone commencent par +227
- [ ] ✅ Les adresses mentionnent Niamey
- [ ] ✅ Les juridictions sont nigériennes
- [ ] ✅ La page Bibliothèque affiche 20 documents
- [ ] ✅ Tous les modules sont accessibles

### Test des Fonctionnalités

1. **Clients** : Créer un nouveau client
2. **Dossiers** : Créer un nouveau dossier
3. **Audiences** : Créer une nouvelle audience
4. **Bibliothèque** : Créer un nouveau document
5. **Facturation** : Créer une nouvelle facture

---

## 🎯 Résumé des URLs

Après déploiement, vous aurez :

- **Application** : `https://kadrilex.vercel.app` (ou votre domaine personnalisé)
- **GitHub** : `https://github.com/YOUR-USERNAME/kadrilex`
- **Vercel Dashboard** : `https://vercel.com/your-username/kadrilex`

---

## 📊 Données de Démonstration Incluses

L'application sera pré-remplie avec :

- **1 utilisateur** : Maître Abdoulaye Kadri (maitre.kadri@kadrilex.ne)
- **8 clients** :
  - 4 entreprises : SONITEL, Banque Islamique du Niger, SONICHAR, Niger Lait
  - 4 particuliers : Aïssata Maïga, Moussa Hamidou, Fati Oumarou, Ibrahim Mahamane
- **18 dossiers** juridiques
- **25 audiences** (10 passées, 15 futures)
- **15 factures** (mix payées/impayées)
- **10 Flash CR** (comptes-rendus)
- **20 documents** (bibliothèque) :
  - 4 jurisprudences
  - 2 décisions de justice
  - 2 articles de doctrine
  - 4 modèles
  - 3 documents internes
  - 5 autres (codes, lois)

---

## 🔧 Commandes Utiles

### Développement Local

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name nom_migration

# Peupler la base
npx prisma db seed

# Ouvrir Prisma Studio (interface DB)
npx prisma studio
```

### Production

```bash
# Build de production
npm run build

# Lancer en production
npm start

# Déployer sur Vercel
vercel --prod
```

---

## 🆘 Dépannage

### Erreur : "Can't reach database server"

**Solution** : Vérifier que `DATABASE_URL` est bien configuré dans Vercel et contient `?sslmode=require`

### Erreur : "Prisma Client not found"

**Solution** :
```bash
npx prisma generate
vercel --prod
```

### Les données ne s'affichent pas

**Solution** : Exécuter le seed
```bash
npx prisma db seed
```

### Erreur de migration

**Solution** : Reset et re-seed
```bash
npx prisma migrate reset
npx prisma db seed
```

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs Vercel
2. Vérifier les logs de la base de données
3. Consulter la documentation Prisma : https://www.prisma.io/docs
4. Consulter la documentation Vercel : https://vercel.com/docs

---

## ✅ Checklist Finale

Avant de présenter au client :

- [ ] Application déployée et accessible
- [ ] Base de données peuplée avec données Niger
- [ ] Tous les modules testés et fonctionnels
- [ ] Branding KadriLex vérifié partout
- [ ] Données de démonstration vérifiées
- [ ] Performance de l'application vérifiée
- [ ] Responsive design vérifié (mobile/tablet/desktop)

---

**Le projet KadriLex est prêt pour présentation client ! 🎉**
