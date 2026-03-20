"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, ExternalLink, Key } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ParametresPage() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres API & Système</h1>
                <p className="text-slate-500 mt-2">Configuration globale de l'API FastAPI et gestions des clés de services tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-indigo-600" />
                            Configuration FastAPI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL de l'API</label>
                            <p className="font-mono text-sm bg-slate-50 p-2 rounded border border-slate-100 break-all">
                                https://dedalys-civ-dedalys-api.hf.space/api/v1
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Environnement</label>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                Production
                            </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            Ouvrir Swagger UI (Documentation API)
                            <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Key className="h-4 w-4 text-indigo-600" />
                            Clés d'API & Services Tiers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supabase URL</label>
                            <p className="font-mono text-xs text-slate-400">https://xgytxckiatphdxkifctb.supabase.co</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PostHog Analytics</label>
                            <p className="font-mono text-xs text-slate-400">phc_7oFEgdEVOSmYB1p0DPL8LVexfw2wDYQ4zPkq4Q5v1Yf</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
