import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(request.headers.get('authorization'))
        const url = new URL(request.url)
        const dossierId = url.searchParams.get('dossier_id')
        const statut = url.searchParams.get('statut')

        let query = supabase
            .from('audiences')
            .select(`*, dossiers(id, reference, titre, client_id, clients(*))`)
            .eq('is_archived', false)
            .order('date', { ascending: true })
            .limit(1000)

        if (dossierId) query = query.eq('dossier_id', dossierId)
        if (statut && statut !== 'ALL') {
            if (statut === 'UPCOMING') query = query.in('statut', ['A_VENIR', 'REPORTEE'])
            else if (statut === 'COMPLETED') query = query.eq('statut', 'TERMINEE')
            else if (statut === 'ARCHIVED') query = query.eq('statut', 'ANNULEE')
            else query = query.eq('statut', statut)
        }

        const { data, error } = await query
        if (error) throw error

        let list = data || []

        if (list.length > 0) {
            const { data: flashData } = await supabase
                .from('flash_cr')
                .select('audience_id')
                .in('audience_id', list.map((a: any) => a.id))
            const hasFlash = new Set((flashData || []).map((f: any) => f.audience_id))
            list = list.map((a: any) => ({
                ...a,
                flashCR: hasFlash.has(a.id) ? { id: a.id } : null,
                client: a.dossiers?.clients ?? a.dossier?.clients ?? null,
                clientId: a.dossiers?.client_id ?? a.dossier?.client_id ?? a.client_id,
            }))
        }

        return NextResponse.json({ data: list })
    } catch (error: any) {
        console.error('GET /api/v1/audiences error:', error.message)
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
        const { data: profData } = await supabase
            .from('utilisateurs')
            .select('espace_id')
            .eq('id', user.id)
            .single()
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

        const row: Record<string, any> = {
            espace_id: espaceId,
            dossier_id: body.dossier_id || null,
            avocat_assigne_id: body.avocat_assigne_id || user.id,
            date: body.date,
            heure: body.heure || '09:00:00',
            type: body.type || 'audience',
            juridiction: body.juridiction || null,
            notes: body.notes || null,
            titre: body.titre || null,
            statut: body.statut || 'A_VENIR',
            resultat: body.resultat || null,
            salle_audience: body.salle_audience || null,
            duree: body.duree || null,
        }
        if (!row.dossier_id) delete row.dossier_id

        const { data, error } = await supabase
            .from('audiences')
            .insert(row)
            .select(`*, dossiers(id, reference, titre, clients(*))`)
            .single()

        if (error) throw error
        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        console.error('POST /api/v1/audiences error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
