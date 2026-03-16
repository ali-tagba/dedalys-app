import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(request.headers.get('authorization'))
        const url = new URL(request.url)
        const clientId = url.searchParams.get('client_id')

        let query = supabase
            .from('dossiers')
            .select(`*, clients(*), audiences(date, statut)`)
            .eq('is_archived', false)
            .order('created_at', { ascending: false })
            .limit(1000)

        if (clientId) query = query.eq('client_id', clientId)

        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        console.error('GET /api/v1/dossiers error:', error.message)
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
        const { data: profile } = await supabase
            .from('utilisateurs')
            .select('espace_id')
            .eq('id', user.id)
            .single()
        espaceId = profile?.espace_id || null

        if (!espaceId) {
            // Try to read any accessible espace with the user's token
            const { data: espaceRows } = await supabase.from('espaces').select('id').limit(1)
            espaceId = espaceRows?.[0]?.id || null

            if (!espaceId) {
                // Create a new espace for this user
                const { data: newEspace } = await supabase
                    .from('espaces').insert({ nom: 'Mon Cabinet' }).select('id').single()
                espaceId = newEspace?.id || null
                if (espaceId) {
                    await supabase.from('utilisateurs').upsert({ id: user.id, espace_id: espaceId, role: 'ADMIN' })
                }
            }
        }

        if (!espaceId) return NextResponse.json({ error: 'No espace found for user' }, { status: 403 })

        const row = {
            espace_id: espaceId,
            client_id: body.client_id,
            reference: body.reference || `DOS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
            titre: body.titre || null,
            type: body.type || 'conseil',
            statut: body.statut || 'ouvert',
            description: body.description || '',
            partie_adverse: body.partie_adverse || null,
            preference_facturation: body.preference_facturation || 'forfait',
            revenu_attendu: body.revenu_attendu || null,
            juridiction: body.juridiction || null,
            domaine: body.domaine || null,
        }

        const { data, error } = await supabase
            .from('dossiers')
            .insert(row)
            .select(`*, clients(*)`)
            .single()

        if (error) throw error

        // Map selected audiences to this new dossier
        if (body.audiencesIds && Array.isArray(body.audiencesIds) && body.audiencesIds.length > 0) {
            await supabase
                .from('audiences')
                .update({ dossier_id: data.id })
                .in('id', body.audiencesIds)
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        console.error('POST /api/v1/dossiers error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
