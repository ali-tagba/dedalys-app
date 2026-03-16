import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const allowed = ['type_decision', 'prochaine_date', 'notes_rapides', 'envoyer_email', 'audience_id']
        const row: any = {}
        allowed.forEach(k => { if (body[k] !== undefined) row[k] = body[k] })

        const { data, error } = await supabase
            .from('flash_cr')
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
        const { error } = await supabase.from('flash_cr').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
