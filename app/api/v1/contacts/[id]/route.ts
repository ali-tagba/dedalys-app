import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const payload: any = {}
        if (body.nom || body.prenom) {
            payload.nom_complet = `${body.prenom ? body.prenom + ' ' : ''}${body.nom || ''}`.trim()
        }
        if (body.email !== undefined) payload.email = body.email
        if (body.telephone !== undefined) payload.telephone = body.telephone
        if (body.fonction !== undefined) payload.fonction = body.fonction

        const { data, error } = await supabase
            .from('points_de_contact')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('PATCH /api/v1/contacts/[id] error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
