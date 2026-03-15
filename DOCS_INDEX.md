# Dedalys - Index de la documentation

## Documentation principale

| Fichier | Contenu |
|---------|---------|
| DOCUMENTATION_FRONTEND.md | Architecture, endpoints API, formats de donnees, tables Supabase, conventions. Destine au developpeur backend. |
| DEPLOIEMENT_VERCEL.md | Procedure complete de deploiement sur Vercel avec Supabase. |
| VERCEL_DEPLOYMENT_GUIDE.md | Resume et reference rapide du deploiement Vercel. |

## Fichiers de configuration

| Fichier | Role |
|---------|------|
| .env.example | Modele des variables d'environnement. |
| vercel.json | Configuration build Vercel. |
| supabase_updates.sql | Script SQL des colonnes et politiques Supabase (executer dans le SQL Editor). |

## Schema et donnees

La base Supabase doit etre creee via les migrations du projet dedalys-api (supabase/migrations/). Le fichier supabase_updates.sql dans dedalys-app ajoute les colonnes et tables complementaires (notes_privees, notes_dossier, audiences etendues, etc.).
