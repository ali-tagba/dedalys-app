import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string; fileId: string }> }
) {
    try {
        const { id: dossierId, fileId } = await context.params
        const body = await request.json()
        const { name, color } = body

        // Validate input
        if (!name && !color) {
            return NextResponse.json(
                { error: 'Au moins un champ (name ou color) doit être fourni' },
                { status: 400 }
            )
        }

        // Check if file exists and belongs to the dossier
        const existingFile = await prisma.dossierFile.findFirst({
            where: {
                id: fileId,
                dossierId: dossierId
            }
        })

        if (!existingFile) {
            return NextResponse.json(
                { error: 'Fichier ou dossier non trouvé' },
                { status: 404 }
            )
        }

        // Only allow color for folders
        if (color && existingFile.type !== 'FOLDER') {
            return NextResponse.json(
                { error: 'La couleur ne peut être définie que pour les dossiers' },
                { status: 400 }
            )
        }

        // Validate color if provided
        const validColors = ['blue', 'red', 'green', 'orange', 'purple', 'yellow', 'pink', 'gray']
        if (color && !validColors.includes(color)) {
            return NextResponse.json(
                { error: 'Couleur invalide' },
                { status: 400 }
            )
        }

        // Update the file/folder
        const updateData: any = {}
        if (name) updateData.name = name.trim()
        if (color) updateData.color = color

        const updatedFile = await prisma.dossierFile.update({
            where: { id: fileId },
            data: updateData
        })

        return NextResponse.json(updatedFile)
    } catch (error) {
        console.error('Error updating file:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour' },
            { status: 500 }
        )
    }
}
