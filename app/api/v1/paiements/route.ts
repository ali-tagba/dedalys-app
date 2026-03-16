import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(request.headers.get('authorization'))
        const url = new URL(request.url)
        const clientId = url.searchParams.get('client_id')
        const dossierId = url.searchParams.get('dossier_id')

        let query = supabase
            .from('paiements')
            .select(`*, clients(*), dossiers(id, reference, titre)`)
            .eq('is_archived', false)
            .order('date_reception', { ascending: false })

        if (clientId) query = query.eq('client_id', clientId)
        if (dossierId) query = query.eq('dossier_id', dossierId)

        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        console.error('GET /api/v1/paiements error:', error.message)
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
            client_id: body.client_id,
            dossier_id: body.dossier_id,
            montant: body.montant,
            date_reception: body.date_reception,
            type: body.type || 'honoraires',
            description: body.description || null,
        }

        const { data, error } = await supabase
            .from('paiements')
            .insert(row)
            .select(`*, clients(*), dossiers(id, reference, titre)`)
            .single()

        if (error) throw error
        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        console.error('POST /api/v1/paiements error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
