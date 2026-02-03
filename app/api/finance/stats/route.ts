import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany();

        const totalBilled = invoices.reduce((sum, inv) => sum + (inv.montantTTC || 0), 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + (inv.montantPaye || 0), 0);
        const totalPending = totalBilled - totalPaid;
        const recoveryRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0;
        const totalTaxes = invoices.reduce((sum, inv) => sum + (inv.montantTVA || 0), 0);

        // Monthly data for chart (last 12 months)
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const currentMonthIndex = new Date().getMonth();

        // Initialize chart data with 0
        const chartData = months.map(name => ({ name, total: 0 }));

        invoices.forEach(inv => {
            const date = new Date(inv.date);
            const monthIndex = date.getMonth();
            // Simple aggregation by month (ignoring year for this prototype, or filtering for current year)
            // For a real app, we'd filter by year. Let's assume current year for simplicity or aggregate all.
            // Let's filter for current year to be cleaner.
            if (date.getFullYear() === new Date().getFullYear()) {
                chartData[monthIndex].total += inv.montantTTC;
            }
        });

        return NextResponse.json({
            totalBilled,
            totalPaid,
            totalPending,
            recoveryRate,
            totalTaxes,
            chartData
        });
    } catch (error) {
        console.error('Error fetching finance stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
