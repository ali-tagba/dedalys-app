"use client"

import { useEffect, useState } from "react"
import { FinanceKPI } from "@/components/finance/finance-kpi"
import { RevenueChart } from "@/components/finance/revenue-chart"
import { TransactionTable } from "@/components/finance/transaction-table"
import { Separator } from "@/components/ui/separator"
import { DollarSign, TrendingUp, CreditCard, Wallet, Activity, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FinancePage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/finance/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching finance stats:', err)
                setLoading(false)
            })
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-200 border-t-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-8 p-6 lg:p-10 h-full overflow-y-auto bg-slate-50/50 custom-scrollbar">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Finance Globale</h2>
                    <p className="text-slate-500 mt-1">Vue d'ensemble de la santé financière du cabinet.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/facturation">
                        <Button variant="outline" className="border-slate-200">
                            Voir le détail des factures
                        </Button>
                    </Link>
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                        <ArrowUpRight className="mr-2 h-4 w-4" /> Export Comptable
                    </Button>
                </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FinanceKPI
                    title="Total Facturé"
                    value={formatCurrency(stats.totalBilled)}
                    trend={{ value: 12.5, label: "vs mois dernier", positive: true }}
                    icon={<DollarSign className="h-4 w-4 text-blue-600" />}
                    className="border-slate-200 shadow-sm"
                />
                <FinanceKPI
                    title="Total Encaissé"
                    value={formatCurrency(stats.totalPaid)}
                    trend={{ value: 8.2, label: "tendance haussière", positive: true }}
                    icon={<Wallet className="h-4 w-4 text-emerald-600" />}
                    className="border-slate-200 shadow-sm"
                />
                <FinanceKPI
                    title="Reste à percevoir"
                    value={formatCurrency(stats.totalPending)}
                    trend={{ value: 2.1, label: "critique", positive: false }}
                    icon={<CreditCard className="h-4 w-4 text-orange-600" />}
                    className="border-slate-200 shadow-sm"
                />
                <FinanceKPI
                    title="Taux de Recouvrement"
                    value={`${stats.recoveryRate.toFixed(1)}%`}
                    trend={{ value: 5.4, label: "efficacité", positive: true }}
                    icon={<Activity className="h-4 w-4 text-purple-600" />}
                    className="border-slate-200 shadow-sm"
                />
            </div>

            {/* Charts & Details */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <RevenueChart data={stats.chartData} />
                </div>

                {/* Future: Add Predictions or more specific breakdowns here */}
                <div className="col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Indicateurs Clés</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600">Objectif Mensuel</span>
                                <span className="font-bold text-slate-900">75%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-3/4 rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600">Factures Payées (Volume)</span>
                                <span className="font-bold text-slate-900">92%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[92%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                <span className="font-semibold text-slate-900">Analyse:</span> Le taux de recouvrement est excellent ce trimestre. Attention toutefois aux 3 plus grosses factures en attente qui représentent 40% du reste à percevoir.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
