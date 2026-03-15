"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { InvoiceFormDialog } from "@/components/facturation/invoice-form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Plus, Download, Search, ListFilter, LayoutDashboard
} from "lucide-react"
import { FinancialStatsView } from "@/components/facturation/financial-stats-view"
import { InvoiceTable, type InvoiceRow } from "@/components/finance/transaction-table"

export default function FacturationPage() {
    const [invoices, setInvoices] = useState<InvoiceRow[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"list" | "stats">("list")
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

    const handleDelete = async (id: string) => {
        if (!window.confirm("Supprimer ce paiement ? Cette action est irréversible.")) return
        try {
            await api.delete(`/api/v1/paiements/${id}`)
            fetchInvoices()
        } catch (e) {
            console.error(e)
            alert("Erreur lors de la suppression.")
        }
    }

    const fetchInvoices = async () => {
        try {
            setLoading(true)
            const [paiementsRes, clientsRes, dossiersRes] = await Promise.all([
                api.get('/api/v1/paiements'),
                api.get('/api/v1/clients'),
                api.get('/api/v1/dossiers'),
            ])
            const rawPaiements = paiementsRes.data.data || []
            const clients = clientsRes.data.data || clientsRes.data || []
            const dossiers = dossiersRes.data.data || dossiersRes.data || []

            const mapped: InvoiceRow[] = rawPaiements.map((p: any) => {
                const clientObj = clients.find((c: any) => c.id === p.client_id)
                const dossierObj = dossiers.find((d: any) => d.id === p.dossier_id)

                const clientFormatted = clientObj
                    ? {
                        type: clientObj.statut === 'PM' ? 'ENTREPRISE' : 'PARTICULIER',
                        raisonSociale: clientObj.raison_sociale || clientObj.raisonSociale,
                        nom: clientObj.nom,
                        prenom: clientObj.prenom,
                    }
                    : null

                // montant is the raw "montant payé" from the paiements table
                const montantPaye = Number(p.montant) || 0
                // honorer les champs TVA si présents, sinon 0
                const tvaRate = Number(p.tva) || 0
                const montantHT = Number(p.montant_ht) || montantPaye
                const montantTTC = tvaRate > 0
                    ? montantHT * (1 + tvaRate / 100)
                    : (Number(p.montant_ttc) || montantHT)

                return {
                    id: p.id,
                    numero: `FAC-${p.id.substring(0, 6).toUpperCase()}`,
                    date: p.date_reception,
                    dateEcheance: p.date_echeance || null,
                    client: clientFormatted,
                    dossier: dossierObj
                        ? { reference: dossierObj.reference, numero: dossierObj.reference }
                        : null,
                    montantHT,
                    tva: tvaRate,
                    montantTTC,
                    montantPaye,
                    statut: "PAYEE", // paiements existants = payé
                    attachmentUrl: p.attachment_url || null,
                }
            })
            setInvoices(mapped)
        } catch (error) {
            console.error('Error fetching paiements:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices()
    }, [])

    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = statusFilter === "ALL" || (inv.statut || '').toUpperCase() === statusFilter
        const clientName = typeof inv.client === 'string'
            ? inv.client
            : inv.client?.raisonSociale || `${inv.client?.prenom || ''} ${inv.client?.nom || ''}`.trim()
        const matchesSearch =
            inv.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.dossier?.reference?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-200 border-t-blue-600"></div>
                    <p className="text-sm text-slate-500">Chargement des factures...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ====== TOOLBAR ====== */}
            <div className="flex-none border-b border-slate-200 bg-white px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3 z-10">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {viewMode === 'list' && (
                        <>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Rechercher facture, client, dossier..."
                                    className="pl-9 h-9 bg-slate-50 border-slate-200 focus:bg-white text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 text-sm font-medium text-slate-700 border border-slate-200 bg-white rounded-md px-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                                <option value="ALL">Tout statut</option>
                                <option value="PAYEE">Payées</option>
                                <option value="IMPAYEE">Impayées</option>
                                <option value="PARTIELLE">Partielles</option>
                            </select>
                        </>
                    )}
                    {viewMode === 'stats' && (
                        <h2 className="text-lg font-bold text-slate-900">Statistiques Financières</h2>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {/* View toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button
                            variant="ghost" size="sm"
                            className={`h-7 text-xs ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <ListFilter className="w-3.5 h-3.5 mr-1.5" /> Liste
                        </Button>
                        <Button
                            variant="ghost" size="sm"
                            className={`h-7 text-xs ${viewMode === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                            onClick={() => setViewMode('stats')}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Stats
                        </Button>
                    </div>

                    {viewMode === 'list' && (
                        <>
                            <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 text-sm">
                                <Download className="w-4 h-4 mr-2" />
                                Exporter
                            </Button>
                            <Button
                                size="sm"
                                className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm"
                                onClick={() => {
                                    setSelectedInvoice(null)
                                    setDialogOpen(true)
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Enregistrer paiement
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* ====== CONTENT ====== */}
            {viewMode === 'list' ? (
                <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
                    <InvoiceTable
                        invoices={filteredInvoices}
                        onEdit={(id) => {
                            const inv = invoices.find(i => i.id === id)
                            if (inv) { setSelectedInvoice(inv); setDialogOpen(true) }
                        }}
                        onDelete={handleDelete}
                    />
                </div>
            ) : (
                <FinancialStatsView
                    invoices={invoices}
                    onNewInvoice={() => {
                        setViewMode('list')
                        setSelectedInvoice(null)
                        setDialogOpen(true)
                    }}
                />
            )}

            {/* ====== DIALOG ====== */}
            <InvoiceFormDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) setSelectedInvoice(null)
                }}
                onSuccess={fetchInvoices}
                invoice={selectedInvoice}
            />
        </div>
    )
}
