# Dedalys Frontend - Documentation technique

Documentation destinee au developpeur backend pour comprendre l'architecture, les API appelees et les formats de donnees attendus.

---

## 1. Architecture

L'application frontend Dedalys est une application Next.js 16 qui communique directement avec Supabase via des routes API Next.js. Aucun backend externe (Hugging Face ou autre) n'est requis pour le fonctionnement en production.

```
Frontend (Next.js)  -->  Routes API Next.js (/api/v1/*)  -->  Supabase (Auth, DB, Storage)
```

- **Authentification** : Supabase Auth (email/mot de passe). Le JWT est envoye dans le header `Authorization: Bearer <token>` sur chaque requete API.
- **Base de donnees** : Supabase PostgreSQL. Les politiques RLS (Row Level Security) restreignent l'acces aux donnees par `espace_id`.
- **Stockage** : Bucket Supabase `fichiers` pour le GED (Gestion Electronique des Documents).

---

## 2. Structure du projet

```
dedalys-app/
├── app/
│   ├── api/                    # Routes API Next.js
│   │   └── v1/                 # Prefixe /api/v1
│   │       ├── audiences/
│   │       ├── clients/
│   │       ├── contacts/
│   │       ├── dossiers/
│   │       ├── fichiers/
│   │       ├── flash-cr/
│   │       ├── paiements/
│   │       ├── utilisateurs/
│   │       └── dashboard/
│   ├── auth/                   # Page connexion/inscription
│   ├── clients/                # Pages clients
│   ├── dossiers/               # Pages dossiers
│   ├── audiences/              # Page audiences
│   ├── flash-cr/               # Page Flash CR
│   ├── facturation/            # Page paiements
│   ├── finance/                # Page dashboard finance
│   └── layout.tsx
├── components/
│   ├── audiences/
│   ├── clients/
│   ├── dossiers/
│   ├── facturation/
│   ├── flash-cr/
│   └── layout/
├── lib/
│   ├── api.ts                  # Client axios (baseURL, interceptor JWT)
│   ├── auth-context.tsx        # Contexte auth React
│   ├── supabase.ts             # Client Supabase (cote client)
│   ├── supabase-server.ts      # Client Supabase (cote serveur, routes API)
│   └── types/
└── public/
```

---

## 3. Authentification

### Flux de connexion

1. L'utilisateur saisit email et mot de passe sur `/auth`
2. Appel a `supabase.auth.signInWithPassword({ email, password })`
3. Supabase retourne une session avec JWT (`access_token`)
4. Le JWT est stocke par le client Supabase et transmis automatiquement via l'interceptor axios (voir `lib/api.ts`)

### Envoi du token aux API

Le fichier `lib/api.ts` configure axios pour ajouter le header `Authorization: Bearer <access_token>` a chaque requete. Le token provient de `supabase.auth.getSession()`.

### Table utilisateurs

L'utilisateur Supabase Auth doit avoir un enregistrement correspondant dans la table `utilisateurs` avec au minimum : `id` (uuid, cle liee a auth.users), `espace_id`, `nom`, `prenom`, `role_cabinet`. Les routes API recuperent `espace_id` via cette table pour scoper les donnees.

---

## 4. API - Endpoints et formats

Tous les endpoints sont prefixes par `/api/v1`. Les reponses d'erreur ont la forme `{ error: string }` avec un code HTTP approprie (401, 403, 404, 500).

### 4.1 Clients

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/clients | Liste tous les clients de l'espace |
| GET | /api/v1/clients/[id] | Detail d'un client |
| POST | /api/v1/clients | Creer un client |
| PATCH | /api/v1/clients/[id] | Modifier un client |
| DELETE | /api/v1/clients/[id] | Supprimer un client (soft delete via is_archived) |

**GET /api/v1/clients**

Reponse : `{ data: Client[] }`

Champ Client attendu cote frontend :
- id, type (PERSONNE_PHYSIQUE | PERSONNE_MORALE), nom, prenom, raisonSociale
- email (email_principal), telephone, adresse, ville, pays
- formeJuridique, numeroRCCM (rccm), representantLegal
- dateNaissance, lieuNaissance, nationalite, situationFamiliale
- statut_facturation, avatar_url, logo_url
- _count: { dossiers, invoices }

**POST /api/v1/clients**

Body (Personne Physique) : statut: "PP", nom, prenom, email_principal, telephone, adresse_complete?, ville?, pays?, nationalite?, situation_familiale?, notes?

Body (Personne Morale) : statut: "PM", raison_sociale, forme_juridique, representant_legal, email_principal, telephone, adresse_complete?, rccm?, siege_social?

### 4.2 Dossiers

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/dossiers | Liste des dossiers. Query: client_id? |
| GET | /api/v1/dossiers/[id] | Detail dossier avec clients, audiences |
| POST | /api/v1/dossiers | Creer un dossier |
| PATCH | /api/v1/dossiers/[id] | Modifier un dossier |
| DELETE | /api/v1/dossiers/[id] | Supprimer un dossier |

**GET /api/v1/dossiers**

Reponse : `{ data: Dossier[] }`

Champs : id, reference, titre, type, statut, domaine, juridiction, client_id, clients (embedded), prochaine_audience, etc.

**POST /api/v1/dossiers**

Body : client_id, titre?, type?, statut?, description?, juridiction?, domaine?, partie_adverse?, preference_facturation?, revenu_attendu?

### 4.3 Audiences

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/audiences | Liste des audiences. Query: dossier_id? |
| GET | /api/v1/audiences/[id] | Detail audience |
| POST | /api/v1/audiences | Creer une audience |
| PATCH | /api/v1/audiences/[id] | Modifier une audience |
| DELETE | /api/v1/audiences/[id] | Supprimer une audience |

**GET /api/v1/audiences**

Reponse : `{ data: Audience[] }`

Champs Audience : id, titre, date, heure, juridiction, statut (A_VENIR, TERMINEE, REPORTEE, ANNULEE), resultat? (GAGNE, PERDU, MIXTE), salle_audience, duree, dossier_id, clientId, client, dossier, utilisateurs (avocat), flashCR

**POST /api/v1/audiences**

Body : dossier_id, date, titre?, heure?, juridiction?, salle_audience?, duree?, avocat_assigne_id?, statut?, resultat? (si statut=TERMINEE), notes?

### 4.4 Flash CR

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/flash-cr | Liste Flash CR. Query: audience_id? |
| GET | /api/v1/flash-cr/[id] | Detail Flash CR |
| POST | /api/v1/flash-cr | Creer un Flash CR |
| PATCH | /api/v1/flash-cr/[id] | Modifier |
| DELETE | /api/v1/flash-cr/[id] | Supprimer |

**POST /api/v1/flash-cr**

Body : audience_id, type_decision (decision_rendue | mise_en_delibere | renvoi | autre), notes_rapides, prochaine_date?, envoyer_email?

### 4.5 Paiements (Facturation)

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/paiements | Liste. Query: client_id?, dossier_id? |
| POST | /api/v1/paiements | Creer un paiement |
| PATCH | /api/v1/paiements/[id] | Modifier |
| DELETE | /api/v1/paiements/[id] | Supprimer |

**POST /api/v1/paiements**

Body : client_id, dossier_id, montant, date_reception, type? (honoraires|frais), description?

### 4.6 Fichiers (GED)

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/fichiers/dossier/[dossierId] | Liste fichiers et dossiers |
| POST | /api/v1/fichiers/dossier/[dossierId] | Upload fichier (multipart/form-data, champ "file") |
| POST | /api/v1/fichiers/dossier/[dossierId]/folder | Creer un sous-dossier |
| PATCH | /api/v1/fichiers/[id] | Renommer |
| DELETE | /api/v1/fichiers/[id] | Supprimer |

### 4.7 Notes dossier

| Methode | Endpoint |
|---------|----------|
| GET | /api/v1/dossiers/[id]/notes |
| POST | /api/v1/dossiers/[id]/notes |
| PATCH | /api/v1/dossiers/[id]/notes/[noteId] |
| DELETE | /api/v1/dossiers/[id]/notes/[noteId] |

### 4.8 Autres

| Methode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/utilisateurs | Liste des utilisateurs (avocats) |
| GET | /api/v1/dossiers/[id]/activite | Activite recente du dossier |
| GET | /api/dashboard/stats | Statistiques dashboard |

### 4.9 Contacts clients

| Methode | Endpoint |
|---------|----------|
| GET | /api/v1/clients/[id]/contacts |
| POST | /api/v1/clients/[id]/contacts |
| PATCH | /api/v1/contacts/[id] |

---

## 5. Tables Supabase utilisees

- auth.users (gestion par Supabase Auth)
- utilisateurs (profil lie a auth.users, espace_id, role_cabinet)
- espaces
- clients (espace_id, statut PP/PM, champs personne physique ou morale)
- points_de_contact (client_id)
- dossiers (espace_id, client_id, reference, titre, type, statut, etc.)
- audiences (espace_id, dossier_id, avocat_assigne_id, date, heure, statut, titre, resultat, salle_audience, duree)
- flash_cr (espace_id, audience_id, type_decision, notes_rapides, prochaine_date)
- paiements (espace_id, client_id, dossier_id, montant, date_reception, type)
- fichiers (espace_id, dossier_id, nom, chemin_stockage, parent_id, is_folder)
- notes_dossier (dossier_id, contenu, auteur_id)
- notes_privees (client_id, contenu, auteur_id)
- activite_dossier (dossier_id, type, description) - pour le fil d'activite
- equipe_dossier (optionnel)

---

## 6. Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Oui | URL du projet Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Oui | Cle anon (publique) Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Non | Pour fallback en dev si pas de token (a ne pas exposer cote client) |
| NEXT_PUBLIC_API_URL | Non | Si definie, le frontend appelle cette URL au lieu des routes Next.js (pour backend externe) |

---

## 7. Conventions de code

- Les appels API passent par l'instance `api` de `lib/api.ts` (axios).
- Les reponses sont souvent encapsulees : `{ data: T }`. Le frontend utilise `res.data.data ?? res.data` pour supporter les deux formats.
- Les dates sont en ISO 8601 (YYYY-MM-DD pour les champs date).
- Les heures sont au format "HH:mm" ou "HH:mm:ss".
- Les identifiants (id) sont des UUID.

---

## 8. Mapping colonnes Supabase / frontend

Le frontend utilise parfois des noms camelCase alors que Supabase stocke en snake_case. Correspondances utiles pour le backend :

| Frontend (camelCase) | Supabase (snake_case) |
|---------------------|------------------------|
| raisonSociale       | raison_sociale         |
| emailPrincipal      | email_principal        |
| adresseComplete     | adresse_complete       |
| formeJuridique      | forme_juridique        |
| representantLegal   | representant_legal     |
| dateNaissance       | date_naissance         |
| lieuNaissance       | lieu_naissance         |
| situationFamiliale  | situation_familiale    |
| statutFacturation   | statut_facturation     |
| avatarUrl           | avatar_url             |
| logoUrl             | logo_url               |
| clientId            | client_id              |
| dossierId           | dossier_id             |
| salleAudience       | salle_audience         |

---

## 9. Composants principaux

- **AppLayout** : Sidebar, navigation, zone de contenu, deconnexion.
- **AudienceList** : Affichage liste des audiences (Jurisdiction Ledger).
- **AudienceFormDialog** : Formulaire creation/edition audience.
- **AudienceCalendar** : Vue calendrier des audiences.
- **FileExplorer** : Arborescence GED par dossier.
- **NotesEditor** : Edition des notes d'un dossier.
- **ClientFormDialog** : Formulaire client (PP/PM).
- **InvoiceFormDialog** : Formulaire paiement/facturation.
- **FlashCRFormDialog** : Formulaire Flash CR.
