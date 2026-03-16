import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerClient(request.headers.get('authorization'))

        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 7)

        // Run all KPI queries in parallel
        const [
            { count: totalClients },
            { count: activeDossiers },
            { count: weekAudiences },
            { data: paiementsData },
            { data: upcomingAudiences },
        ] = await Promise.all([
            supabase.from('clients').select('*', { count: 'exact', head: true }).eq('is_archived', false),
            supabase.from('dossiers').select('*', { count: 'exact', head: true }).eq('statut', 'EN_COURS').eq('is_archived', false),
            supabase.from('audiences').select('*', { count: 'exact', head: true })
                .gte('date_audience', startOfWeek.toISOString())
                .lt('date_audience', endOfWeek.toISOString()),
            supabase.from('paiements').select('montant_paye').eq('is_archived', false),
            supabase.from('audiences')
                .select('id, date_audience, titre, juridiction, dossiers(numero, clients(raison_sociale, nom, prenom, statut))')
                .gte('date_audience', now.toISOString())
                .eq('statut', 'A_VENIR')
                .eq('is_archived', false)
                .order('date_audience', { ascending: true })
                .limit(3)
        ])

        // Sum revenue
        const totalRevenueRaw = (paiementsData || []).reduce((sum: number, p: any) => sum + (p.montant_paye || 0), 0)
        const totalRevenue = (totalRevenueRaw / 1000000).toFixed(1) + 'M'

        // Format upcoming audiences
        const formattedAudiences = (upcomingAudiences || []).map((a: any) => {
            const audienceDate = new Date(a.date_audience)
            const dossier = a.dossiers || {}
            const client = dossier.clients || {}
            const clientName = client.statut === 'PM'
                ? (client.raison_sociale || 'Client')
                : `${client.prenom || ''} ${client.nom || ''}`.trim() || 'Client'

            const daysUntil = Math.ceil((audienceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            return {
                date: audienceDate.getDate().toString(),
                month: audienceDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
                title: a.titre || 'Audience',
                case: `${clientName} — ${dossier.numero || 'DOS-???'}`,
                court: a.juridiction || 'Non spécifié',
                urgent: daysUntil <= 3,
            }
        })

        return NextResponse.json({
            totalClients: totalClients || 0,
            activeDossiers: activeDossiers || 0,
            weekAudiences: weekAudiences || 0,
            totalRevenue,
            upcomingAudiences: formattedAudiences,
        })
    } catch (error: any) {
        console.error('SERVER ERROR in /api/dashboard/stats:', error)
        return NextResponse.json({ error: 'Failed to fetch dashboard stats', details: String(error) }, { status: 500 })
    }
}
