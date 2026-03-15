import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

function mapClient(c: any) {
    return {
        id: c.id,
        type: c.type || (c.statut === 'PM' ? 'PERSONNE_MORALE' : 'PERSONNE_PHYSIQUE'),
        nom: c.nom || '',
        prenom: c.prenom || '',
        raisonSociale: c.raison_sociale || '',
        email: c.email_principal || '',
        telephone: c.telephone || '',
        adresse: c.adresse_complete || '',
        ville: c.ville || '',
        pays: c.pays || "Côte d'Ivoire",
        formeJuridique: c.forme_juridique || null,
        numeroRCCM: c.rccm || null,
        representantLegal: c.representant_legal || null,
        dateNaissance: c.date_naissance || null,
        lieuNaissance: c.lieu_naissance || null,
        nationalite: c.nationalite || 'Ivoirienne',
        situationFamiliale: c.situation_familiale || null,
        notes: c.notes || '',
        espace_id: c.espace_id,
        created_at: c.created_at,
        _count: { dossiers: c.dossiers?.length || 0, invoices: c.paiements?.length || 0 },
        dossiers: c.dossiers || [],
        contacts: (c.points_de_contact || []).map((contact: any) => ({
            ...contact,
            avatar_url: contact.avatar_url || null
        })),
        notesPrivees: c.notes_privees || [],
        invoices: c.paiements || [],
        statut_facturation: c.statut_facturation || "NON_REGLE",
        avatar_url: c.avatar_url || null,
        logo_url: c.logo_url || null,
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const { data, error } = await supabase
            .from('clients')
            .select(`
                *,
                dossiers(*, audiences(*)),
                points_de_contact(*),
                paiements(*)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ data: mapClient(data) })
    } catch (error: any) {
        console.error('GET /api/v1/clients/[id] error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const row: any = {}
        if (body.statut !== undefined) row.statut = body.statut
        if (body.email_principal !== undefined) row.email_principal = body.email_principal
        if (body.telephone !== undefined) row.telephone = body.telephone
        if (body.adresse_complete !== undefined) row.adresse_complete = body.adresse_complete
        if (body.ville !== undefined) row.ville = body.ville
        if (body.pays !== undefined) row.pays = body.pays
        if (body.nom !== undefined) row.nom = body.nom
        if (body.prenom !== undefined) row.prenom = body.prenom
        if (body.raison_sociale !== undefined) row.raison_sociale = body.raison_sociale
        if (body.forme_juridique !== undefined) row.forme_juridique = body.forme_juridique
        if (body.representant_legal !== undefined) row.representant_legal = body.representant_legal
        if (body.rccm !== undefined) row.rccm = body.rccm
        if (body.secteur_activite !== undefined) row.secteur_activite = body.secteur_activite
        if (body.statut_facturation !== undefined) row.statut_facturation = body.statut_facturation
        if (body.logo_url !== undefined) row.logo_url = body.logo_url
        if (body.avatar_url !== undefined) row.avatar_url = body.avatar_url
        if (body.date_naissance !== undefined) row.date_naissance = body.date_naissance
        if (body.lieu_naissance !== undefined) row.lieu_naissance = body.lieu_naissance
        if (body.nationalite !== undefined) row.nationalite = body.nationalite
        if (body.situation_familiale !== undefined) row.situation_familiale = body.situation_familiale
        if (body.notes !== undefined) row.notes = body.notes

        const { data, error } = await supabase
            .from('clients')
            .update(row)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data: mapClient(data) })
    } catch (error: any) {
        console.error('PATCH /api/v1/clients/[id] error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const { error } = await supabase.from('clients').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('DELETE /api/v1/clients/[id] error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
