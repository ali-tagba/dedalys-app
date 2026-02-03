"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"

export function FinancialStatsView() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Chiffre d'Affaires"
                    value="12.5 M FCFA"
                    subtitle="+15% ce mois"
                    icon={TrendingUp}
                    trend="up"
                    color="emerald"
                />
                <StatsCard
                    title="Objectif Mensuel"
                    value="15 M FCFA"
                    subtitle="83% atteint"
                    icon={Target}
                    trend="neutral"
                    color="blue"
                />
                <StatsCard
                    title="Factures Émises"
                    value="45"
                    subtitle="Cette année"
                    icon={Wallet}
                    trend="neutral"
                    color="purple"
                />
                <StatsCard
                    title="Taux Recouvrement"
                    value="92%"
                    subtitle="+2% vs m-1"
                    icon={ArrowUpRight}
                    trend="up"
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Area */}
                <Card className="col-span-1 lg:col-span-2 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
                        <CardDescription>Comparatif Annuel (Encaissements vs Émissions)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center bg-slate-50/50 rounded-xl m-4 border border-dashed border-slate-200">
                        <p className="text-slate-400">Graphique Financier en cours de chargement...</p>
                        {/* Placeholder for a Real Chart later */}
                    </CardContent>
                </Card>

                {/* Secondary Stats / Breakdown */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Répartition</CardTitle>
                        <CardDescription>Par type de dossier</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Contentieux</span>
                            <span className="text-sm font-bold">45%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm font-medium">Conseil</span>
                            <span className="text-sm font-bold">30%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm font-medium">Rédaction</span>
                            <span className="text-sm font-bold">25%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, color }: any) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    }
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${(colors as any)[color]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-slate-500">
                    {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />}
                    {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
                    {subtitle}
                </div>
            </CardContent>
        </Card>
    )
}
