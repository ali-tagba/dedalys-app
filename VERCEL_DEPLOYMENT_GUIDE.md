# Guide de deploiement Vercel (Supabase)

Ce guide decrit le deploiement de Dedalys sur Vercel avec Supabase comme backend. L'application utilise les routes API Next.js integrees qui communiquent directement avec Supabase. Aucune base PostgreSQL Vercel ni Prisma n'est necessaire.

Voir DEPLOIEMENT_VERCEL.md pour la procedure complete.

Resume des etapes :

1. Importer le projet sur Vercel (depot Git ou upload)
2. Configurer les variables : NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Configurer Supabase : URL de redirection auth, bucket fichiers
4. Deployer

Le fichier vercel.json contient la commande de build. Si Prisma est present dans le projet mais non utilise pour les API v1, la commande `prisma generate` peut etre ignoree (2>/dev/null) pour eviter les erreurs de build.
