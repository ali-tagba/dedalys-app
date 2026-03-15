import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// DELETE a file or folder
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = createServerClient(request.headers.get('authorization'))

        // Get the file first to get storage path and dossierId
        const { data: fichier, error: fetchError } = await supabase
            .from('fichiers')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError) throw fetchError
        if (!fichier) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // If it's a file (not a folder), delete from storage too
        if (!fichier.is_folder && fichier.chemin_stockage) {
            await supabase.storage.from('fichiers').remove([fichier.chemin_stockage])
        }

        // Delete from DB (also cascades to children if folders)
        const { error } = await supabase.from('fichiers').delete().eq('id', id)
        if (error) throw error

        // Log activity
        if (fichier.dossier_id) {
            await supabase.from('activite_dossier').insert({
                dossier_id: fichier.dossier_id,
                type: fichier.is_folder ? 'sous_dossier_cree' : 'fichier_supprime',
                description: `${fichier.is_folder ? 'Dossier' : 'Fichier'} supprimé : ${fichier.nom}`,
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('DELETE fichier error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH rename a file or folder
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const supabase = createServerClient(request.headers.get('authorization'))

        const updateData: any = {}
        if (body.nom !== undefined) updateData.nom = body.nom
        if (body.couleur !== undefined) updateData.couleur = body.couleur
        if (body.parent_id !== undefined) updateData.parent_id = body.parent_id

        const { data, error } = await supabase
            .from('fichiers')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
