import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'

// Helper to map a DB row to the frontend shape
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
        // Counts must be fetched separately if needed
        _count: { dossiers: 0, invoices: 0 },
        statut_facturation: c.statut_facturation || "NON_REGLE",
        avatar_url: c.avatar_url || null,
        logo_url: c.logo_url || null,
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(request.headers.get('authorization'))
        const { data, error } = await supabase
            .from('clients')
            .select('*, dossiers(id, statut)')
            .eq('is_archived', false)
            .order('created_at', { ascending: false })
            .limit(1000)

        if (error) throw error

        const clients = (data || []).map(c => {
            const mapped = mapClient(c)
            const activeDossiers = (c.dossiers || []).filter((d: any) => d.statut !== 'cloture')
            mapped._count = { dossiers: activeDossiers.length, invoices: 0 }
            return mapped
        })

        return NextResponse.json({ data: clients })
    } catch (error: any) {
        console.error('GET /api/v1/clients error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        // Resolve the user's espace_id from their profile
        const { data: { user } } = await supabase.auth.getUser()

        let espaceId: string | null = null

        if (user) {
            // Try getting espace from profile
            const { data: profile } = await supabase
                .from('utilisateurs')
                .select('espace_id')
                .eq('id', user.id)
                .single()
            espaceId = profile?.espace_id || null

            if (!espaceId) {
                // Try reading any accessible espace (authenticated user might be able to see their own)
                const { data: espaceRows } = await supabase.from('espaces').select('id').limit(1)
                espaceId = espaceRows?.[0]?.id || null

                if (!espaceId) {
                    // Last resort: create a new espace using the user's own token
                    const { data: newEspace } = await supabase
                        .from('espaces')
                        .insert({ nom: 'Mon Espace' })
                        .select('id')
                        .single()
                    espaceId = newEspace?.id || null

                    if (espaceId) {
                        // Link it to the user's profile
                        await supabase.from('utilisateurs').upsert({ id: user.id, espace_id: espaceId, role: 'ADMIN' })
                    }
                }
            }
        }

        if (!espaceId) {
            // Truly no espace found - refuse the request
            return NextResponse.json({ error: 'Aucun espace trouvé. Veuillez contacter l\'administrateur.' }, { status: 401 })
        }

        const isPM = body.statut === 'PM'
        const row: any = {
            espace_id: espaceId,
            statut: body.statut,
            email_principal: body.email_principal || null,
            telephone: body.telephone || null,
            adresse_complete: body.adresse_complete || null,
            ville: body.ville || null,
            pays: body.pays || "Côte d'Ivoire",
            statut_facturation: body.statut_facturation || "NON_REGLE",
        }

        if (isPM) {
            row.raison_sociale = body.raison_sociale
            row.forme_juridique = body.forme_juridique || 'SA'
            row.representant_legal = body.representant_legal || 'Inconnu'
            row.rccm = body.rccm || null
            row.siege_social = body.siege_social || null
        } else {
            row.nom = body.nom
            row.prenom = body.prenom
            row.nationalite = body.nationalite || 'Ivoirienne'
            row.situation_familiale = body.situation_familiale || null
            row.notes = body.notes || null
        }

        const { data, error } = await supabase
            .from('clients')
            .insert(row)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json(mapClient(data), { status: 201 })
    } catch (error: any) {
        console.error('POST /api/v1/clients error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
