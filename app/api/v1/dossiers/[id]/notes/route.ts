import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET all notes for a dossier
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))

        const { data, error } = await supabase
            .from('notes_dossier')
            .select('*')
            .eq('dossier_id', id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        console.error('GET notes error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST create a new note for a dossier
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const body = await request.json()
        const { contenu } = body

        if (!contenu?.trim()) return NextResponse.json({ error: 'Note content required' }, { status: 400 })

        const { data, error } = await supabase
            .from('notes_dossier')
            .insert({
                dossier_id: id,
                auteur_id: user.id,
                contenu: contenu.trim(),
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
    } catch (error: any) {
        console.error('POST note error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
