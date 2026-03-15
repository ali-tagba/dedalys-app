import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// POST create a folder for a dossier
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ dossierId: string }> }
) {
    try {
        const { dossierId } = await params
        const supabase = createServerClient(request.headers.get('authorization'))

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

        const { data: profile } = await supabase
            .from('utilisateurs')
            .select('espace_id')
            .eq('id', user.id)
            .single()

        if (!profile?.espace_id) return NextResponse.json({ error: 'No espace' }, { status: 403 })

        const body = await request.json()
        const { nom, parent_id, couleur } = body

        if (!nom?.trim()) return NextResponse.json({ error: 'Folder name required' }, { status: 400 })

        const { data, error } = await supabase
            .from('fichiers')
            .insert({
                espace_id: profile.espace_id,
                dossier_id: dossierId,
                nom: nom.trim(),
                taille: 0,
                type_fichier: 'folder',
                chemin_stockage: '',
                parent_id: parent_id || null,
                is_folder: true,
                url: null,
                couleur: couleur || 'blue',
            })
            .select()
            .single()

        if (error) throw error

        // Log activity
        await supabase.from('activite_dossier').insert({
            dossier_id: dossierId,
            type: 'sous_dossier_cree',
            description: `Dossier créé : ${nom.trim()}`,
        })

        return NextResponse.json({ data }, { status: 201 })
    } catch (error: any) {
        console.error('POST folder error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
