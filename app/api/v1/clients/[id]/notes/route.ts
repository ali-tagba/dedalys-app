import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: clientId } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        // Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!body.contenu) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
        }

        const payload = {
            client_id: clientId,
            auteur_id: user.id,
            contenu: body.contenu,
        }

        const { data, error } = await supabase
            .from('notes_privees')
            .insert(payload)
            .select(`
                *,
                auteur:utilisateurs!auteur_id(prenom, nom)
            `)
            .single()

        if (error) throw error

        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('POST /api/v1/clients/[id]/notes error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
