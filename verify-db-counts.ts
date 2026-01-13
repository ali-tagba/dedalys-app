import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const clients = await prisma.client.count()
    const dossiers = await prisma.dossier.count()
    const audiences = await prisma.audience.count()
    const flashCRs = await prisma.flashCR.count()
    const invoices = await prisma.invoice.count()
    const files = await prisma.dossierFile.count()

    console.log('--- DB COUNTS ---')
    console.log(`Clients: ${clients}`)
    console.log(`Dossiers: ${dossiers}`)
    console.log(`Audiences: ${audiences}`)
    console.log(`FlashCRs: ${flashCRs}`)
    console.log(`Invoices: ${invoices}`)
    console.log(`Files: ${files}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
