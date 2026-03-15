import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// GET all files and folders for a dossier
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ dossierId: string }> }
) {
    try {
        const { dossierId } = await params
        const supabase = createServerClient(request.headers.get('authorization'))

        const { data, error } = await supabase
            .from('fichiers')
            .select('*')
            .eq('dossier_id', dossierId)
            .order('is_folder', { ascending: false })
            .order('nom', { ascending: true })

        if (error) throw error
        return NextResponse.json({ data: data || [] })
    } catch (error: any) {
        console.error('GET fichiers error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST upload a file for a dossier
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

        const contentType = request.headers.get('content-type') || ''

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData()
            const file = formData.get('file') as File | null
            const parentId = formData.get('parent_id') as string | null

            if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

            // Upload to Supabase Storage
            const ext = file.name.split('.').pop() || 'bin'
            // Sanitize file name: remove accents, replace spaces/special chars with underscores
            const sanitizedName = file.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9.\-]/g, "_")

            const storagePath = `${profile.espace_id}/${dossierId}/${Date.now()}_${sanitizedName}`

            const arrayBuffer = await file.arrayBuffer()
            const { error: uploadError } = await supabase
                .storage
                .from('fichiers')
                .upload(storagePath, arrayBuffer, {
                    contentType: file.type || 'application/octet-stream',
                    upsert: false
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage.from('fichiers').getPublicUrl(storagePath)

            // Save metadata in fichiers table
            const { data, error } = await supabase
                .from('fichiers')
                .insert({
                    espace_id: profile.espace_id,
                    dossier_id: dossierId,
                    nom: file.name,
                    taille: file.size,
                    type_fichier: file.type || ext,
                    chemin_stockage: storagePath,
                    parent_id: parentId || null,
                    is_folder: false,
                    url: publicUrl,
                })
                .select()
                .single()

            if (error) throw error

            // Log activity
            await supabase.from('activite_dossier').insert({
                dossier_id: dossierId,
                type: 'fichier_upload',
                description: `Fichier ajouté : ${file.name}`,
            })

            return NextResponse.json({ data }, { status: 201 })
        }

        return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    } catch (error: any) {
        console.error('POST fichiers error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
