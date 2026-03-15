import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const { data, error } = await supabase
            .from('dossiers')
            .select(`*, clients(*), audiences(id, titre, date, heure, statut, resultat, juridiction, salle_audience, duree)`)
            .eq('id', id)
            .single()

        if (error) throw error
        if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('GET /api/v1/dossiers/[id] error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const allowed = [
            'reference', 'titre', 'type', 'statut', 'description', 'partie_adverse',
            'preference_facturation', 'revenu_attendu', 'juridiction', 'domaine', 'chambre',
            'partie_adverse_nom', 'partie_adverse_email', 'partie_adverse_telephone',
            'conseil_adverse_nom', 'conseil_adverse_email', 'conseil_adverse_telephone',
            'date_ouverture', 'date_prescription', 'client_id', 'prochaine_audience'
        ]
        const row: any = {}
        allowed.forEach(k => { if (body[k] !== undefined) row[k] = body[k] })

        const { data, error } = await supabase
            .from('dossiers')
            .update(row)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // Handle audience multi-select
        if (body.audiencesIds !== undefined) {
            // First release all audiences currently linked to this dossier
            await supabase
                .from('audiences')
                .update({ dossier_id: null })
                .eq('dossier_id', id)

            // Then assign the new ones
            if (Array.isArray(body.audiencesIds) && body.audiencesIds.length > 0) {
                await supabase
                    .from('audiences')
                    .update({ dossier_id: id })
                    .in('id', body.audiencesIds)
            }
        }

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('PATCH /api/v1/dossiers/[id] error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const { error } = await supabase.from('dossiers').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('DELETE /api/v1/dossiers/[id] error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
