# Documentation Base de Données - Dedalys

Cette documentation détaille le **schéma de base de données PostgreSQL** de Dedalys géré par Prisma ORM.

## Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Schéma Prisma](#schéma-prisma)
- [Diagramme ERD](#diagramme-erd)
- [Tables](#tables)
- [Relations](#relations)
- [Indexes](#indexes)
- [Migrations](#migrations)

---

## Vue d'ensemble

La base de données Dedalys utilise **PostgreSQL** avec **Prisma ORM** pour la gestion des données.

### Statistiques
- **8 tables** principales
- **7 relations** entre tables
- **12 indexes** pour optimisation
- **Cascade delete** sur relations critiques

---

## Schéma Prisma

Le schéma complet se trouve dans `prisma/schema.prisma`.

### Configuration

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Diagramme ERD

```mermaid
erDiagram
    Client ||--o{ Contact : "a"
    Client ||--o{ Dossier : "a"
    Client ||--o{ Audience : "a"
    Client ||--o{ Invoice : "a"
    Client ||--o{ FlashCR : "a"
    
    Dossier ||--o{ DossierFile : "contient"
    Dossier ||--o{ Audience : "a"
    Dossier ||--o{ Invoice : "facture"
    Dossier ||--o{ FlashCR : "a"
    
    Audience ||--|| FlashCR : "génère"
    Audience ||--o{ Invoice : "facture"
    
    DossierFile ||--o{ DossierFile : "parent/enfant"
    
    Client {
        string id PK
        string type
        string raisonSociale
        string formeJuridique
        string numeroRCCM
        string siegeSocial
        string representantLegal
        string nom
        string prenom
        string profession
        string pieceIdentite
        string email
        string telephone
        string adresse
        string ville
        string pays
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    Contact {
        string id PK
        string clientId FK
        string nom
        string prenom
        string fonction
        string email
        string telephone
        datetime createdAt
        datetime updatedAt
    }
    
    Dossier {
        string id PK
        string numero UK
        string clientId FK
        string type
        string typeDossier
        string domaineDroit
        string statut
        string juridiction
        string avocatAssigne
        datetime dateOuverture
        datetime dateCloture
        string description
        datetime createdAt
        datetime updatedAt
    }
    
    DossierFile {
        string id PK
        string dossierId FK
        string parentId FK
        string name
        string type
        string url
        string mimeType
        int size
        datetime createdAt
        datetime updatedAt
    }
    
    Audience {
        string id PK
        string clientId FK
        string dossierId FK
        datetime date
        string heure
        string duree
        string juridiction
        string salleAudience
        string titre
        string avocat
        string statut
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    FlashCR {
        string id PK
        string audienceId FK UK
        string clientId FK
        string dossierId FK
        string contenu
        string destinataires
        string statut
        datetime createdAt
        datetime updatedAt
    }
    
    Invoice {
        string id PK
        string numero UK
        datetime date
        datetime dateEcheance
        string clientId FK
        string dossierId FK
        string audienceId FK
        float montantHT
        float montantTVA
        float montantTTC
        float montantPaye
        string statut
        string methodePaiement
        datetime datePaiement
        string attachmentUrl
        string notes
        datetime createdAt
        datetime updatedAt
    }
```

---

## Tables

### User
Table des utilisateurs (avocats, assistants, admins)

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| email | String | UNIQUE | Email de connexion |
| name | String | - | Nom complet |
| role | String | - | AVOCAT, ASSISTANT, ADMIN |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

### Client
Table des clients (personnes physiques et morales)

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| type | String | - | PERSONNE_PHYSIQUE ou PERSONNE_MORALE |
| **Personne Morale** ||||
| raisonSociale | String | NULLABLE | Nom de l'entreprise |
| formeJuridique | String | NULLABLE | SA, SARL, SAS, etc. |
| numeroRCCM | String | NULLABLE | Numéro RCCM |
| siegeSocial | String | NULLABLE | Adresse du siège |
| representantLegal | String | NULLABLE | Nom du représentant |
| **Personne Physique** ||||
| nom | String | NULLABLE | Nom de famille |
| prenom | String | NULLABLE | Prénom |
| profession | String | NULLABLE | Profession |
| pieceIdentite | String | NULLABLE | Numéro CNI/Passeport |
| **Commun** ||||
| email | String | NULLABLE | Email |
| telephone | String | NULLABLE | Téléphone |
| adresse | String | NULLABLE | Adresse postale |
| ville | String | NULLABLE | Ville |
| pays | String | DEFAULT "Côte d'Ivoire" | Pays |
| notes | String | NULLABLE | Notes libres |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

### Contact
Table des contacts associés aux clients

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| clientId | String | FK → Client | Client associé |
| nom | String | - | Nom du contact |
| prenom | String | NULLABLE | Prénom |
| fonction | String | - | Fonction (DG, Responsable, etc.) |
| email | String | NULLABLE | Email |
| telephone | String | NULLABLE | Téléphone |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

**Index** : `clientId`

### Dossier
Table des dossiers juridiques

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| numero | String | UNIQUE | Numéro du dossier (DOS-YYYY-XXXX) |
| clientId | String | FK → Client | Client associé |
| type | String | - | CIVIL, COMMERCIAL, PENAL, ADMINISTRATIF |
| typeDossier | String | NULLABLE | CONTENTIEUX, PRE_CONTENTIEUX, etc. |
| domaineDroit | String | NULLABLE | TRAVAIL, CIVIL, IMMOBILIER, etc. |
| statut | String | DEFAULT "EN_COURS" | EN_COURS, TERMINE, EN_ATTENTE, CLOSTURE |
| juridiction | String | NULLABLE | Tribunal compétent |
| avocatAssigne | String | NULLABLE | Avocat responsable |
| dateOuverture | DateTime | DEFAULT now() | Date d'ouverture |
| dateCloture | DateTime | NULLABLE | Date de clôture |
| description | String | NULLABLE | Description du dossier |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

**Index** : `clientId`

### DossierFile
Table des fichiers et dossiers (arborescence)

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| dossierId | String | FK → Dossier | Dossier parent |
| parentId | String | FK → DossierFile, NULLABLE | Dossier parent (hiérarchie) |
| name | String | - | Nom du fichier/dossier |
| type | String | - | FOLDER ou FILE |
| url | String | NULLABLE | URL du fichier (si FILE) |
| mimeType | String | NULLABLE | Type MIME (si FILE) |
| size | Int | NULLABLE | Taille en octets (si FILE) |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

**Index** : `dossierId`, `parentId`

### Audience
Table des audiences

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| clientId | String | FK → Client | Client concerné |
| dossierId | String | FK → Dossier | Dossier concerné |
| date | DateTime | - | Date et heure de l'audience |
| heure | String | NULLABLE | Heure (format texte) |
| duree | String | NULLABLE | Durée estimée (ex: "2h") |
| juridiction | String | NULLABLE | Tribunal/Cour |
| salleAudience | String | NULLABLE | Salle d'audience |
| titre | String | NULLABLE | Titre de l'audience |
| avocat | String | NULLABLE | Avocat en charge |
| statut | String | DEFAULT "A_VENIR" | A_VENIR, TERMINEE, REPORTEE, ANNULEE |
| notes | String | NULLABLE | Notes libres |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

**Index** : `clientId`, `dossierId`, `date`

### FlashCR
Table des comptes-rendus rapides

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| audienceId | String | FK → Audience, UNIQUE | Audience associée |
| clientId | String | FK → Client | Client concerné |
| dossierId | String | FK → Dossier | Dossier concerné |
| contenu | String | - | Contenu du CR |
| destinataires | String | - | Emails des destinataires (CSV ou JSON) |
| statut | String | DEFAULT "BROUILLON" | BROUILLON, ENVOYE, ARCHIVE |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

**Index** : `audienceId`, `clientId`, `dossierId`

### Invoice
Table des factures

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Identifiant unique |
| numero | String | UNIQUE | Numéro de facture (FACT-YYYY-XXXX) |
| date | DateTime | - | Date d'émission |
| dateEcheance | DateTime | NULLABLE | Date d'échéance |
| clientId | String | FK → Client | Client facturé |
| dossierId | String | FK → Dossier, NULLABLE | Dossier associé |
| audienceId | String | FK → Audience, NULLABLE | Audience associée |
| montantHT | Float | - | Montant hors taxes |
| montantTVA | Float | DEFAULT 0 | Montant de la TVA |
| montantTTC | Float | - | Montant toutes taxes comprises |
| montantPaye | Float | DEFAULT 0 | Montant déjà payé |
| statut | String | DEFAULT "IMPAYEE" | PAYEE, IMPAYEE, PARTIELLE |
| methodePaiement | String | NULLABLE | Méthode de paiement |
| datePaiement | DateTime | NULLABLE | Date du paiement |
| attachmentUrl | String | NULLABLE | URL du PDF de facture |
| notes | String | NULLABLE | Notes libres |
| createdAt | DateTime | DEFAULT now() | Date de création |
| updatedAt | DateTime | AUTO | Date de modification |

**Index** : `clientId`, `dossierId`, `audienceId`, `date`

---

## Relations

### Client → Contact (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE (suppression du client → suppression des contacts)

### Client → Dossier (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE

### Client → Audience (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE

### Client → Invoice (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE

### Client → FlashCR (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE

### Dossier → DossierFile (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE

### Dossier → Audience (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE

### Dossier → Invoice (1:N)
- **Type** : One-to-Many
- **Cascade** : SET NULL (facture conservée même si dossier supprimé)

### Dossier → FlashCR (1:N)
- **Type** : One-to-Many
- **Cascade** : DELETE

### Audience → FlashCR (1:1)
- **Type** : One-to-One
- **Cascade** : DELETE

### Audience → Invoice (1:N)
- **Type** : One-to-Many
- **Cascade** : SET NULL

### DossierFile → DossierFile (1:N)
- **Type** : Self-referencing (hiérarchie)
- **Cascade** : DELETE (suppression du parent → suppression des enfants)

---

## Indexes

Les indexes optimisent les requêtes fréquentes :

| Table | Champ(s) | Type | Raison |
|-------|----------|------|--------|
| Contact | clientId | Index | Recherche des contacts par client |
| Dossier | clientId | Index | Recherche des dossiers par client |
| DossierFile | dossierId | Index | Recherche des fichiers par dossier |
| DossierFile | parentId | Index | Navigation hiérarchique |
| Audience | clientId | Index | Recherche des audiences par client |
| Audience | dossierId | Index | Recherche des audiences par dossier |
| Audience | date | Index | Tri chronologique |
| FlashCR | audienceId | Index | Recherche du CR par audience |
| FlashCR | clientId | Index | Recherche des CR par client |
| FlashCR | dossierId | Index | Recherche des CR par dossier |
| Invoice | clientId | Index | Recherche des factures par client |
| Invoice | dossierId | Index | Recherche des factures par dossier |
| Invoice | audienceId | Index | Recherche des factures par audience |
| Invoice | date | Index | Tri chronologique |

---

## Migrations

### Créer une migration

```bash
npx prisma migrate dev --name nom_de_la_migration
```

### Appliquer les migrations en production

```bash
npx prisma migrate deploy
```

### Réinitialiser la base de données (DEV ONLY)

```bash
npx prisma migrate reset
```

### Générer le client Prisma

```bash
npx prisma generate
```

### Visualiser la base de données

```bash
npx prisma studio
```

---

## Seed Data

Le fichier `prisma/seed.ts` contient des données de démonstration.

### Exécuter le seed

```bash
npx prisma db seed
```

### Données générées
- 8 clients (4 entreprises + 4 particuliers)
- 18 dossiers juridiques
- 25 audiences
- 15 factures
- Juridictions du Niger

---

Pour plus de détails sur les modules, consultez [MODULES.md](MODULES.md).
Pour l'architecture, consultez [ARCHITECTURE.md](ARCHITECTURE.md).
