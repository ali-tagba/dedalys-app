"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Activity, BarChart3, ExternalLink } from "lucide-react"

export default function SuperadminDashboard() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vue Globale Superadmin</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 uppercase tracking-wider">
                        Strictement réservé
                    </span>
                </div>
                <p className="text-slate-500 mt-2">Bienvenue dans l'espace d'administration global de Dedalys.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Espaces (Cabinets) Actifs
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">12</div>
                        <p className="text-xs text-slate-500 mt-1">
                            +2 ce mois-ci
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Utilisateurs Totaux
                        </CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">84</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Abonnements actifs
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Santé du Système
                        </CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">100%</div>
                        <p className="text-xs text-slate-500 mt-1">
                            API & Base de données
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 tracking-tight">Statistiques d'Utilisation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-900">
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                                PostHog Product Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                Les statistiques détaillées (temps passé sur l'app, utilisation des fonctionnalités, session replay) sont suivies en temps réel via <strong>PostHog</strong>. 
                                Vous pouvez consulter les dashboards en direct pour comprendre le comportement des utilisateurs.
                            </p>
                            <a 
                                href="https://app.posthog.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                            >
                                Ouvrir PostHog
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
