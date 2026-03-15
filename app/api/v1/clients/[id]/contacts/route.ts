import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: clientId } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        // Verify if client exists and user has access (RLS will handle access, but we need espace_id)
        const { data: client, error: clientErr } = await supabase
            .from('clients')
            .select('espace_id')
            .eq('id', clientId)
            .single()

        if (clientErr || !client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        const payload = {
            client_id: clientId,
            espace_id: client.espace_id,
            nom_complet: `${body.prenom ? body.prenom + ' ' : ''}${body.nom}`,
            email: body.email || null,
            telephone: body.telephone || null,
            fonction: body.fonction || null,
        }

        const { data, error } = await supabase
            .from('points_de_contact')
            .insert(payload)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('POST /api/v1/clients/[id]/contacts error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: clientId } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        if (!body.id) {
            return NextResponse.json({ error: 'Contact ID rests obligatory' }, { status: 400 })
        }

        const payload: any = {}
        if (body.avatar_url !== undefined) payload.avatar_url = body.avatar_url
        if (body.prenom !== undefined || body.nom !== undefined) {
            payload.nom_complet = `${body.prenom ? body.prenom + ' ' : ''}${body.nom || ''}`
        }
        if (body.email !== undefined) payload.email = body.email
        if (body.telephone !== undefined) payload.telephone = body.telephone
        if (body.fonction !== undefined) payload.fonction = body.fonction

        const { data, error } = await supabase
            .from('points_de_contact')
            .update(payload)
            .eq('id', body.id)
            .eq('client_id', clientId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('PATCH /api/v1/clients/[id]/contacts error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
