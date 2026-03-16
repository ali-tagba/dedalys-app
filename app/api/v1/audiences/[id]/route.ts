import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const { data, error } = await supabase
            .from('audiences')
            .select(`*, dossiers(id, reference, titre, clients(*))`)
            .eq('id', id)
            .single()

        if (error) throw error
        if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const allowed = ['date', 'heure', 'type', 'juridiction', 'notes', 'avocat_assigne_id', 'dossier_id', 'titre', 'statut', 'resultat', 'salle_audience', 'duree']
        const row: any = {}
        allowed.forEach(k => { if (body[k] !== undefined) row[k] = body[k] })

        const { data, error } = await supabase
            .from('audiences')
            .update(row)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const { error } = await supabase.from('audiences').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
