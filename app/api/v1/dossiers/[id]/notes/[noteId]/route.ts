import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// PATCH update a note
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; noteId: string }> }
) {
    try {
        const { id, noteId } = await params
        const supabase = createServerClient(request.headers.get('authorization'))
        const body = await request.json()
        const { contenu } = body

        if (!contenu?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

        const { data, error } = await supabase
            .from('notes_dossier')
            .update({ contenu: contenu.trim(), updated_at: new Date().toISOString() })
            .eq('id', noteId)
            .eq('dossier_id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('PATCH note error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE a note
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; noteId: string }> }
) {
    try {
        const { id, noteId } = await params
        const supabase = createServerClient(request.headers.get('authorization'))

        const { error } = await supabase
            .from('notes_dossier')
            .delete()
            .eq('id', noteId)
            .eq('dossier_id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('DELETE note error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
