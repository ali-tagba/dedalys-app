"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, MoreHorizontal, CalendarClock } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

interface Espace {
    id: string
    nom: string
    created_at: string
    type_abonnement?: string
    date_expiration_abonnement?: string
}

export default function EspacesPage() {
    const [espaces, setEspaces] = useState<Espace[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEspaces = async () => {
            try {
                // Endpoint superadmin sur le backend FastAPI
                const baseUrl = 'https://dedalys-civ-dedalys-api.hf.space/api/v1'
                const response = await api.get(`${baseUrl}/espaces/`)
                // Gérer le format potentiellement paginé { data: [...] }
                if (response.data?.data) {
                    setEspaces(response.data.data)
                } else if (Array.isArray(response.data)) {
                    setEspaces(response.data)
                }
            } catch (error) {
                console.error("Erreur gérée SILENCIEUSEMENT POUR DEMO : impossible de charger les espaces :", error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchEspaces()
    }, [])

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestion des Espaces (Cabinets)</h1>
                    <p className="text-sm text-slate-500 mt-1">Gérez tous les cabinets inscrits sur la plateforme.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Créer un Espace
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-700">Liste des cabinets</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-600" />
                        </div>
                    ) : espaces.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Aucun espace trouvé</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                Il n'y a actuellement aucun cabinet enregistré, ou vous n'avez pas les droits nécessaires.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-y border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nom du Cabinet</th>
                                        <th className="px-4 py-3 font-semibold">Date de création</th>
                                        <th className="px-4 py-3 font-semibold">Abonnement</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {espaces.map((espace) => (
                                        <tr key={espace.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                        {espace.nom.substring(0, 1).toUpperCase()}
                                                    </div>
                                                    {espace.nom}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-500">
                                                {new Date(espace.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 w-fit">
                                                        {espace.type_abonnement || 'Standard'}
                                                    </span>
                                                    {espace.date_expiration_abonnement && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                                            <CalendarClock className="h-3 w-3" />
                                                            Expire le {new Date(espace.date_expiration_abonnement).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
