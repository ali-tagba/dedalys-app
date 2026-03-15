"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  FolderOpen,
  Calendar,
  TrendingUp,
  Plus,
  ArrowRight,
  FileText,
  AlertCircle,
  Briefcase,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ClientsGrowthChart } from "@/components/dashboard/clients-growth-chart"
import { DossierActivityChart } from "@/components/dashboard/dossier-activity-chart"

interface DashboardStats {
  totalClients: number
  activeDossiers: number
  weekAudiences: number
  totalRevenue: string
  upcomingAudiences: Array<{
    date: string
    month: string
    title: string
    case: string
    court: string
    urgent: boolean
  }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeDossiers: 0,
    weekAudiences: 0,
    totalRevenue: "0M",
    upcomingAudiences: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(res => {
        setStats(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err)
        setLoading(false)
      })
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 h-full overflow-y-auto custom-scrollbar p-[var(--container-padding)]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Tableau de Bord
          </h1>
          <p className="text-slate-500 mt-1">
            Bienvenue, Maître. Voici votre situation aujourd'hui.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dossiers">
            <Button size="lg" className="rounded-xl shadow-lg shadow-blue-600/20 min-w-[160px]">
              <Plus className="mr-2 h-4 w-4" /> Nouveau Dossier
            </Button>
          </Link>
          <Link href="/audiences">
            <Button variant="outline" size="lg" className="rounded-xl min-w-[120px]">
              <Calendar className="mr-2 h-4 w-4" /> Agenda
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Clients"
          value={loading ? "..." : (stats?.totalClients || 0).toString()}
          subtitle="Total actifs"
          icon={Users}
          trend="up"
          colorScheme="blue"
          delay={0.1}
          className="col-span-1"
        />
        <KpiCard
          title="Dossiers Actifs"
          value={loading ? "..." : (stats?.activeDossiers || 0).toString()}
          subtitle="En cours"
          icon={FolderOpen}
          colorScheme="purple"
          delay={0.2}
          className="col-span-1"
        />
        <KpiCard
          title="Audiences"
          value={loading ? "..." : (stats?.weekAudiences || 0).toString()}
          subtitle="Cette semaine"
          icon={Calendar}
          colorScheme="orange"
          delay={0.3}
          className="col-span-1"
        />
        <KpiCard
          title="Facturation"
          value={loading ? "..." : (stats?.totalRevenue || "0M").replace('M', ' M FCFA').replace('k', ' k FCFA')} // Simple formatting fix
          subtitle="Encaissements"
          icon={TrendingUp}
          trend="up"
          colorScheme="emerald"
          delay={0.4}
          className="col-span-1"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientsGrowthChart />
        <DossierActivityChart />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Rapides */}
        <Card className="border-slate-200 shadow-sm col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/clients">
              <Button variant="outline" className="w-full justify-start hover:bg-slate-50 h-12 text-base">
                <Users className="h-5 w-5 mr-3 text-blue-600" /> Nouveau Client
              </Button>
            </Link>
            <Link href="/audiences">
              <Button variant="outline" className="w-full justify-start hover:bg-slate-50 h-12 text-base">
                <Calendar className="h-5 w-5 mr-3 text-orange-600" /> Nouvelle Audience
              </Button>
            </Link>
            <Link href="/facturation">
              <Button variant="outline" className="w-full justify-start hover:bg-slate-50 h-12 text-base">
                <CreditCard className="h-5 w-5 mr-3 text-emerald-600" /> Nouvelle Facture
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* We can add another widget here or leave it empty, or span the charts */}
        <div className="col-span-1 lg:col-span-2">
          {/* Optional: Recent Audiences List (Simplified) if needed, or just leave blank for now as user asked to remove "Audiences à venir" big block? 
                   Actually, "Audiences à venir" is useful. User asked to remove "la partie 'Généré', la section 'Compte-rendu en un clic'". 
                   I will preserve a smaller version of "Audiences à venir" here.
               */}
          <Card className="h-full border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-semibold">Prochaines Audiences</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Chargement...</div>
              ) : stats?.upcomingAudiences?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {(stats?.upcomingAudiences || []).slice(0, 3).map((audience, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold uppercase">{audience.month}</span>
                          <span className="text-sm font-bold">{audience.date}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{audience.title}</p>
                          <p className="text-xs text-slate-500 truncate">{audience.court}</p>
                        </div>
                      </div>
                      {audience.urgent && <Badge variant="destructive" className="ml-2">Urgent</Badge>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Aucune audience.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </motion.div>
  )
}
