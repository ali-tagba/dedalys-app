"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Download, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SauvegardesPage() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestion des Sauvegardes</h1>
                    <p className="text-slate-500 mt-2">Gérez et téléchargez les backups complets de la base de données de Dedalys.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Database className="h-4 w-4" />
                    Nouvelle Sauvegarde (pg_dump)
                </Button>
            </div>

            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-indigo-600" />
                        Sauvegardes Automatiques
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Nom du fichier</th>
                                    <th className="px-4 py-3 font-semibold">Taille</th>
                                    <th className="px-4 py-3 font-semibold">Date de création</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Mock data for now since backend backup endpoints aren't specified */}
                                <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-slate-900">backup_dedalys_2026-03-20.sql</td>
                                    <td className="px-4 py-4 text-slate-500">14.2 MB</td>
                                    <td className="px-4 py-4 text-slate-500">Aujourd'hui, 02:00</td>
                                    <td className="px-4 py-4 text-right">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Télécharger
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p>Les sauvegardes datant de plus de 30 jours sont automatiquement supprimées du backend pour économiser de l'espace.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
