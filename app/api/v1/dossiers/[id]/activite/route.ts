import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const { data, error } = await supabase
            .from('activite_dossier')
            .select('*')
            .eq('dossier_id', id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error
        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const { data, error } = await supabase
            .from('activite_dossier')
            .insert({
                dossier_id: id,
                type: body.type || 'consultation',
                description: body.description,
                created_by: body.created_by || null
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
