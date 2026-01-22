import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            where: {
                statut: 'ACTIF'
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(documents)
    } catch (error) {
        console.error('Error fetching documents:', error)
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const document = await prisma.document.create({
            data: {
                titre: body.titre,
                categorie: body.categorie,
                type: body.type || null,
                juridiction: body.juridiction || null,
                reference: body.reference || null,
                dateDocument: body.dateDocument ? new Date(body.dateDocument) : null,
                description: body.description || null,
                tags: body.tags || null,
                auteur: body.auteur || null,
                source: body.source || null,
                notes: body.notes || null,
                statut: 'ACTIF',
            }
        })

        return NextResponse.json(document, { status: 201 })
    } catch (error) {
        console.error('Error creating document:', error)
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.id) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
        }

        const document = await prisma.document.update({
            where: { id: body.id },
            data: {
                titre: body.titre,
                categorie: body.categorie,
                type: body.type || null,
                juridiction: body.juridiction || null,
                reference: body.reference || null,
                dateDocument: body.dateDocument ? new Date(body.dateDocument) : null,
                description: body.description || null,
                tags: body.tags || null,
                auteur: body.auteur || null,
                source: body.source || null,
                notes: body.notes || null,
            }
        })

        return NextResponse.json(document)
    } catch (error) {
        console.error('Error updating document:', error)
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
        }

        // Soft delete - just mark as archived
        await prisma.document.update({
            where: { id },
            data: { statut: 'ARCHIVE' }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting document:', error)
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }
}
