import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/lib/api';

export async function GET(request: NextRequest) {
    try {
        // Obtenir l'access_token depuis les headers de la requête entrante
        const authHeader = request.headers.get('authorization');

        // Relayer la requête à FastAPI avec le header d'authentification
        const response = await api.get('/clients', {
            headers: authHeader ? { Authorization: authHeader } : {}
        });

        // L'API FastAPI renvoie { data: [...], total: X, ... }
        // Le frontend (components) attend directement un tableau.
        const clients = response.data.data || [];

        // Mocker les _count attendus par les composants si FastAPI ne les fournit pas encore
        const formattedClients = clients.map((client: any) => ({
            ...client,
            _count: { dossiers: 0, invoices: 0 } // À adapter si FastAPI renvoie déjà ces champs
        }));

        return NextResponse.json(formattedClients);
    } catch (error: any) {
        console.error('Error fetching clients from API:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: error.response?.status || 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');

        // Construire le payload tel qu'attendu par FastAPI (Pydantic models)
        // FastAPI attend : email_principal, telephone, raison_sociale, etc.
        const clientData: any = {
            statut: body.type === 'PERSONNE_MORALE' ? 'PM' : 'PP',
            email_principal: body.email,
            telephone: body.telephone,
            adresse_complete: body.adresse || null,
        };

        if (body.type === 'PERSONNE_PHYSIQUE') {
            clientData.nom = body.nom;
            clientData.prenom = body.prenom;
            clientData.secteur_activite = body.profession || null; // Mapper profession
        } else if (body.type === 'PERSONNE_MORALE') {
            clientData.raison_sociale = body.raisonSociale;
            clientData.forme_juridique = body.formeJuridique || 'SA'; // requis backend
            clientData.representant_legal = body.representantLegal || 'Inconnu'; // requis backend
            clientData.rccm = body.numeroRCCM || null;
        }

        const response = await api.post('/clients', clientData, {
            headers: authHeader ? { Authorization: authHeader } : {}
        });

        // Formater le retour pour le frontend (le frontend Next.js attend certains noms de variables)
        const createdClient = {
            ...response.data,
            id: response.data.id,
            type: response.data.statut === 'PM' ? 'PERSONNE_MORALE' : 'PERSONNE_PHYSIQUE',
            email: response.data.email_principal,
            nom: response.data.nom,
            prenom: response.data.prenom,
            raisonSociale: response.data.raison_sociale,
            _count: { dossiers: 0, invoices: 0 }
        };

        return NextResponse.json(createdClient, { status: 201 });
    } catch (error: any) {
        console.error('Error creating client via API:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to create client', details: error.response?.data || error.message },
            { status: error.response?.status || 500 }
        );
    }
}
