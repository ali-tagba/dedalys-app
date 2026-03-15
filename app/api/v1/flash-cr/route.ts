import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(request.headers.get('authorization'))
        const url = new URL(request.url)
        const audienceId = url.searchParams.get('audience_id')

        let query = supabase
            .from('flash_cr')
            .select(`*, audiences(id, date, heure, juridiction, dossier_id, dossiers(id, reference, titre))`)
            .eq('is_archived', false)
            .order('created_at', { ascending: false })

        if (audienceId) query = query.eq('audience_id', audienceId)

        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        console.error('GET /api/v1/flash-cr error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        let espaceId: string | null = null
        const { data: profData } = await supabase.from('utilisateurs').select('espace_id').eq('id', user.id).single()
        espaceId = profData?.espace_id || null

        if (!espaceId) {
            const { data: espaceRows } = await supabase.from('espaces').select('id').limit(1)
            espaceId = espaceRows?.[0]?.id || null
            if (!espaceId) {
                const { data: newEspace } = await supabase.from('espaces').insert({ nom: 'Mon Cabinet' }).select('id').single()
                espaceId = newEspace?.id || null
                if (espaceId) await supabase.from('utilisateurs').upsert({ id: user.id, espace_id: espaceId, role: 'ADMIN' })
            }
        }

        if (!espaceId) return NextResponse.json({ error: 'No espace found for user' }, { status: 403 })

        const row = {
            espace_id: espaceId,
            audience_id: body.audience_id,
            type_decision: body.type_decision,
            prochaine_date: body.prochaine_date || null,
            notes_rapides: body.notes_rapides || '',
            envoyer_email: body.envoyer_email ?? false,
        }

        const { data, error } = await supabase
            .from('flash_cr')
            .insert(row)
            .select(`*, audiences(id, date, heure, juridiction)`)
            .single()

        if (error) throw error
        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        console.error('POST /api/v1/flash-cr error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
