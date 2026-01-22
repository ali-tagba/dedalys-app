# Documentation API - Dedalys

Cette documentation détaille toutes les **routes API** de Dedalys.

## Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [API Clients](#api-clients)
- [API Dossiers](#api-dossiers)
- [API Audiences](#api-audiences)
- [API Flash CR](#api-flash-cr)
- [API Facturation](#api-facturation)
- [API Dashboard](#api-dashboard)
- [Gestion des Erreurs](#gestion-des-erreurs)

---

## Vue d'ensemble

Toutes les API routes suivent le pattern RESTful et retournent du JSON.

**Base URL** : `/api`

### Format de Réponse

**Succès** :
```json
{
  "data": { ... },
  "message": "Success"
}
```

**Erreur** :
```json
{
  "error": "Error message",
  "details": { ... }
}
```

### Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | OK - Succès |
| 201 | Created - Ressource créée |
| 400 | Bad Request - Données invalides |
| 404 | Not Found - Ressource introuvable |
| 500 | Internal Server Error - Erreur serveur |

---

## API Clients

### `GET /api/clients`
Liste tous les clients

**Réponse** :
```json
[
  {
    "id": "clx123...",
    "type": "PERSONNE_MORALE",
    "raisonSociale": "SONITEL",
    "formeJuridique": "SA",
    "numeroRCCM": "NE-NIA-2023-A-12345",
    "email": "contact@sonitel.ne",
    "telephone": "+227 20 73 45 67",
    "adresse": "Avenue de la République",
    "ville": "Niamey",
    "pays": "Niger",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### `POST /api/clients`
Crée un nouveau client

**Body** :
```json
{
  "type": "PERSONNE_PHYSIQUE",
  "nom": "Diallo",
  "prenom": "Amadou",
  "profession": "Commerçant",
  "pieceIdentite": "CNI-123456",
  "email": "amadou.diallo@example.com",
  "telephone": "+227 90 12 34 56",
  "adresse": "Quartier Plateau",
  "ville": "Niamey"
}
```

**Réponse** : `201 Created` + Client créé

### `GET /api/clients/[id]`
Récupère un client par ID

**Paramètres** :
- `id` : ID du client

**Réponse** : Client avec relations (contacts, dossiers, audiences)

### `PUT /api/clients/[id]`
Met à jour un client

**Body** : Mêmes champs que POST

**Réponse** : `200 OK` + Client mis à jour

### `DELETE /api/clients/[id]`
Supprime un client

**Réponse** : `200 OK`

---

## API Dossiers

### `GET /api/dossiers`
Liste tous les dossiers

**Query Parameters** :
- `clientId` (optionnel) : Filtrer par client
- `statut` (optionnel) : Filtrer par statut

**Réponse** :
```json
[
  {
    "id": "clx456...",
    "numero": "DOS-2024-0001",
    "clientId": "clx123...",
    "type": "COMMERCIAL",
    "typeDossier": "CONTENTIEUX",
    "domaineDroit": "COMMERCIAL",
    "statut": "EN_COURS",
    "juridiction": "Tribunal de Commerce de Niamey",
    "avocatAssigne": "Maître Ibrahim",
    "dateOuverture": "2024-01-20T00:00:00Z",
    "description": "Litige commercial...",
    "client": { ... }
  }
]
```

### `POST /api/dossiers`
Crée un nouveau dossier

**Body** :
```json
{
  "clientId": "clx123...",
  "type": "CIVIL",
  "typeDossier": "CONSEIL",
  "domaineDroit": "IMMOBILIER",
  "juridiction": "Tribunal de Grande Instance",
  "avocatAssigne": "Maître Fatima",
  "description": "Conseil en droit immobilier"
}
```

**Réponse** : `201 Created` + Dossier créé (numéro auto-généré)

### `GET /api/dossiers/[id]`
Récupère un dossier par ID

**Réponse** : Dossier avec relations (client, fichiers, audiences)

### `PUT /api/dossiers/[id]`
Met à jour un dossier

### `DELETE /api/dossiers/[id]`
Supprime un dossier

### `GET /api/dossiers/[id]/files`
Liste les fichiers d'un dossier

**Réponse** :
```json
[
  {
    "id": "clx789...",
    "dossierId": "clx456...",
    "parentId": null,
    "name": "Contrats",
    "type": "FOLDER",
    "createdAt": "2024-01-21T10:00:00Z"
  },
  {
    "id": "clx790...",
    "dossierId": "clx456...",
    "parentId": "clx789...",
    "name": "Contrat_Location.pdf",
    "type": "FILE",
    "url": "https://...",
    "mimeType": "application/pdf",
    "size": 245760,
    "createdAt": "2024-01-21T11:00:00Z"
  }
]
```

### `POST /api/dossiers/[id]/files`
Upload un fichier ou crée un dossier

**Body** :
```json
{
  "name": "Nouveau Dossier",
  "type": "FOLDER",
  "parentId": null
}
```

---

## API Audiences

### `GET /api/audiences`
Liste toutes les audiences

**Query Parameters** :
- `clientId` (optionnel)
- `dossierId` (optionnel)
- `statut` (optionnel)
- `from` (optionnel) : Date de début (ISO 8601)
- `to` (optionnel) : Date de fin

**Réponse** :
```json
[
  {
    "id": "clx999...",
    "clientId": "clx123...",
    "dossierId": "clx456...",
    "date": "2024-02-15T14:30:00Z",
    "heure": "14:30",
    "duree": "2h",
    "juridiction": "Cour d'Appel de Niamey",
    "salleAudience": "Salle 3",
    "titre": "Audience de plaidoirie",
    "avocat": "Maître Ibrahim",
    "statut": "A_VENIR",
    "notes": "Préparer les pièces...",
    "client": { ... },
    "dossier": { ... }
  }
]
```

### `POST /api/audiences`
Crée une nouvelle audience

**Body** :
```json
{
  "clientId": "clx123...",
  "dossierId": "clx456...",
  "date": "2024-02-15T14:30:00Z",
  "heure": "14:30",
  "duree": "2h",
  "juridiction": "Cour d'Appel",
  "salleAudience": "Salle 3",
  "titre": "Audience de plaidoirie",
  "avocat": "Maître Ibrahim",
  "statut": "A_VENIR",
  "notes": "..."
}
```

### `GET /api/audiences/[id]`
Récupère une audience par ID

### `PUT /api/audiences/[id]`
Met à jour une audience

### `DELETE /api/audiences/[id]`
Supprime une audience

---

## API Flash CR

### `GET /api/flash-cr`
Liste tous les Flash CR

**Query Parameters** :
- `audienceId` (optionnel)
- `statut` (optionnel)

**Réponse** :
```json
[
  {
    "id": "clx888...",
    "audienceId": "clx999...",
    "clientId": "clx123...",
    "dossierId": "clx456...",
    "contenu": "L'audience s'est tenue le...",
    "destinataires": "client@example.com,avocat@example.com",
    "statut": "ENVOYE",
    "createdAt": "2024-02-15T16:00:00Z",
    "audience": { ... }
  }
]
```

### `POST /api/flash-cr`
Crée un nouveau Flash CR

**Body** :
```json
{
  "audienceId": "clx999...",
  "contenu": "Compte-rendu de l'audience...",
  "destinataires": "client@example.com,avocat@example.com",
  "statut": "BROUILLON"
}
```

### `GET /api/flash-cr/[id]`
Récupère un Flash CR par ID

### `PUT /api/flash-cr/[id]`
Met à jour un Flash CR

### `DELETE /api/flash-cr/[id]`
Supprime un Flash CR

### `POST /api/flash-cr/[id]/send`
Envoie le Flash CR par email

**Réponse** : `200 OK` + Confirmation d'envoi

---

## API Facturation

### `GET /api/invoices`
Liste toutes les factures

**Query Parameters** :
- `clientId` (optionnel)
- `statut` (optionnel)

**Réponse** :
```json
[
  {
    "id": "clx777...",
    "numero": "FACT-2024-0001",
    "date": "2024-01-30T00:00:00Z",
    "dateEcheance": "2024-02-29T00:00:00Z",
    "clientId": "clx123...",
    "dossierId": "clx456...",
    "montantHT": 500000,
    "montantTVA": 95000,
    "montantTTC": 595000,
    "montantPaye": 595000,
    "statut": "PAYEE",
    "methodePaiement": "VIREMENT",
    "datePaiement": "2024-02-10T00:00:00Z",
    "client": { ... }
  }
]
```

### `POST /api/invoices`
Crée une nouvelle facture

**Body** :
```json
{
  "clientId": "clx123...",
  "dossierId": "clx456...",
  "date": "2024-01-30T00:00:00Z",
  "dateEcheance": "2024-02-29T00:00:00Z",
  "montantHT": 500000,
  "montantTVA": 95000,
  "montantTTC": 595000,
  "statut": "IMPAYEE",
  "notes": "Honoraires pour..."
}
```

**Réponse** : `201 Created` + Facture créée (numéro auto-généré)

### `GET /api/invoices/[id]`
Récupère une facture par ID

### `PUT /api/invoices/[id]`
Met à jour une facture

### `DELETE /api/invoices/[id]`
Supprime une facture

### `GET /api/invoices/stats`
Statistiques de facturation

**Réponse** :
```json
{
  "totalFacture": 5000000,
  "totalEncaisse": 3500000,
  "totalImpaye": 1500000,
  "tauxRecouvrement": 70,
  "facturesEnRetard": 5
}
```

---

## API Dashboard

### `GET /api/dashboard/stats`
Statistiques du dashboard

**Réponse** :
```json
{
  "totalClients": 45,
  "activeDossiers": 23,
  "weekAudiences": 8,
  "totalRevenue": "3.5M",
  "upcomingAudiences": [
    {
      "date": "15",
      "month": "FÉV",
      "title": "Audience de plaidoirie",
      "case": "DOS-2024-0001",
      "court": "Cour d'Appel",
      "urgent": true
    }
  ]
}
```

---

## Gestion des Erreurs

### Validation Zod

Toutes les API routes utilisent Zod pour valider les données entrantes.

**Exemple d'erreur de validation** :
```json
{
  "error": "Validation failed",
  "details": {
    "nom": "Le nom est requis",
    "email": "Email invalide"
  }
}
```

### Erreurs Prisma

**Contrainte unique violée** :
```json
{
  "error": "Un client avec cet email existe déjà"
}
```

**Ressource introuvable** :
```json
{
  "error": "Client not found"
}
```

### Exemple de Route API

```typescript
// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const clientSchema = z.object({
  type: z.enum(['PERSONNE_PHYSIQUE', 'PERSONNE_MORALE']),
  nom: z.string().min(1).optional(),
  email: z.string().email(),
  // ...
})

export async function GET(request: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      include: {
        contacts: true,
        dossiers: true,
      },
    })
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = clientSchema.parse(body)
    
    const client = await prisma.client.create({
      data: validatedData,
    })
    
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
```

---

Pour plus de détails sur les modules, consultez [MODULES.md](MODULES.md).
Pour l'architecture, consultez [ARCHITECTURE.md](ARCHITECTURE.md).
