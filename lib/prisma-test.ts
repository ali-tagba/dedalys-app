// This file forces VS Code to reload TypeScript definitions
// DO NOT DELETE - Required for Prisma client type recognition

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Type test - this should compile without errors
async function testTypes() {
    // All these should work:
    await prisma.user.findMany()
    await prisma.client.findMany()

    await prisma.dossier.findMany()
    await prisma.audience.findMany()
    await prisma.invoice.findMany()
}

export { prisma, testTypes }
