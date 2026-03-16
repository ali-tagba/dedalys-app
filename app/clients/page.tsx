"use client"

import { useEffect, useState } from "react"
import { ClientFilters } from "@/components/clients/client-filters"
import { ClientTable } from "@/components/clients/client-table"
import { ClientGallery } from "@/components/clients/client-gallery"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { api } from "@/lib/api"

export default function ClientsPage() {
    const [clients, setClients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"list" | "gallery">("list")
    const [typeFilter, setTypeFilter] = useState<"ALL" | "PERSONNE_MORALE" | "PERSONNE_PHYSIQUE">("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<any>(null)

    // Fetch clients from API
    const fetchClients = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/v1/clients')
            const clientsData = response.data.data || []
            setClients(clientsData)
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
        try {
            await api.delete(`/api/v1/clients/${id}`)
            fetchClients()
        } catch (error) {
            console.error('Error deleting client:', error)
            alert('Erreur lors de la suppression')
        }
    }

    // Filter logic
    const filteredClients = clients.filter(client => {
        // Type filter
        if (typeFilter !== "ALL" && client.type !== typeFilter) return false

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const searchFields = [
                client.email || '',
                client.telephone || '',
                client.type === "PERSONNE_PHYSIQUE"
                    ? `${client.nom} ${client.prenom}`
                    : client.raisonSociale || '',
            ]
            return searchFields.some(field => field.toLowerCase().includes(query))
        }

        return true
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-200 border-t-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-white overflow-hidden">
            {/* Top Header */}
            <header className="h-16 px-8 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white z-10">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-2xl text-slate-900 tracking-tight">Clients</h2>
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    <span className="text-sm text-slate-500 font-medium">{filteredClients.length} Actifs</span>

                    {/* View Toggle */}
                    <div className="flex items-center rounded bg-slate-100 p-0.5 border border-slate-200 ml-4">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex items-center justify-center rounded px-2 py-1 transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
                            title="Vue Liste"
                        >
                            <span className="material-symbols-outlined text-[18px]">table_rows</span>
                        </button>
                        <button
                            onClick={() => setViewMode("gallery")}
                            className={`flex items-center justify-center rounded px-2 py-1 transition-colors ${viewMode === 'gallery' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
                            title="Vue Galerie"
                        >
                            <span className="material-symbols-outlined text-[18px]">grid_view</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center justify-center h-8 w-8 rounded-sm hover:bg-slate-50 text-slate-500 transition-colors border border-transparent hover:border-slate-200">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    </button>
                    <button className="flex items-center justify-center h-8 w-8 rounded-sm hover:bg-slate-50 text-slate-500 transition-colors border border-transparent hover:border-slate-200">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                    <button
                        onClick={() => { setSelectedClient(null); setDialogOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 h-9 rounded-sm flex items-center gap-2 shadow-sm transition-colors ml-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nouveau Client
                    </button>
                </div>
            </header>

            {/* Filters Component */}
            <ClientFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
            />

            {/* Data Table Container */}
            <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
                {filteredClients.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                        <div className="flex flex-col items-center justify-center h-64 opacity-50">
                            <span className="material-symbols-outlined text-4xl text-slate-500 mb-2">search_off</span>
                            <p className="text-lg text-slate-900 font-medium">Aucun client trouvé</p>
                            <button
                                onClick={() => { setSearchQuery(""); setTypeFilter("ALL"); }}
                                className="mt-4 text-sm text-blue-600 underline"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto bg-white relative overflow-x-auto">
                        {viewMode === "list" ? (
                            <ClientTable
                                clients={filteredClients}
                                getDossiersCount={(id) => {
                                    const client = clients.find(c => c.id === id)
                                    return client?._count?.dossiers || 0
                                }}
                                onEdit={(client) => { setSelectedClient(client); setDialogOpen(true); }}
                                onDelete={handleDelete}
                            />
                        ) : (
                            <ClientGallery
                                clients={filteredClients}
                                getDossiersCount={(id) => {
                                    const client = clients.find(c => c.id === id)
                                    return client?._count?.dossiers || 0
                                }}
                                onEdit={(client) => { setSelectedClient(client); setDialogOpen(true); }}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Pagination */}
            <footer className="h-12 border-t border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500">Affichage de 1 à {filteredClients.length} sur {clients.length} clients</span>
                <div className="flex items-center gap-1">
                    <button className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-slate-50 text-slate-500 disabled:opacity-30">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button className="h-8 w-8 flex items-center justify-center rounded-sm bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200">1</button>
                    <button className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-slate-50 text-slate-500 text-xs font-medium">2</button>
                    <button className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-slate-50 text-slate-500 text-xs font-medium">3</button>
                    <span className="px-2 text-slate-500 text-xs">...</span>
                    <button className="h-8 w-8 flex items-center justify-center rounded-sm hover:bg-slate-50 text-slate-500">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                </div>
            </footer>

            {/* Client Form Dialog */}
            <ClientFormDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setSelectedClient(null);
                }}
                client={selectedClient}
                onSuccess={fetchClients}
            />
        </div>
    )
}
