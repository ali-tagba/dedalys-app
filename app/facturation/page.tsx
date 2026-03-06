"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { InvoiceFormDialog } from "@/components/facturation/invoice-form-dialog"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Plus, Download, MoreVertical, Search,
    Paperclip, ListFilter, LayoutDashboard
} from "lucide-react"
import { FinancialStatsView } from "@/components/facturation/financial-stats-view"

export default function FacturationPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"list" | "stats">("list")

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

            const mappedInvoices = rawPaiements.map((p: any) => {
                const clientObj = clients.find((c: any) => c.id === p.client_id)
                const dossierObj = dossiers.find((d: any) => d.id === p.dossier_id)
                return {
                    id: p.id,
                    numero: `PAY-${p.id.substring(0, 6).toUpperCase()}`,
                    date: p.date_reception,
                    dateEcheance: p.date_reception,
                    client: clientObj ? { type: clientObj.statut === 'PM' ? 'ENTREPRISE' : 'PARTICULIER', raisonSociale: clientObj.raison_sociale, nom: clientObj.nom, prenom: clientObj.prenom } : null,
                    dossier: dossierObj ? { numero: dossierObj.reference || dossierObj.id } : null,
                    dossierId: p.dossier_id,
                    montantHT: p.montant,
                    montantTTC: p.montant,
                    montantPaye: p.montant,
                    statut: "PAYEE",
                    attachmentUrl: false
                }
            })
            setInvoices(mappedInvoices)
        } catch (error) {
            console.error('Error fetching paiements:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvoices()
    }, [])

    // Summary Metrics
    const totalTTC = invoices.reduce((acc, inv) => acc + (inv.montantTTC || 0), 0)
    const totalPaid = invoices.reduce((acc, inv) => acc + (inv.montantPaye || 0), 0)
    const totalPending = 0 // Tous les paiements enregistrés sont "Payés"

    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = statusFilter === "ALL" || inv.statut === statusFilter
        const matchesSearch =
            inv.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.client?.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesStatus && matchesSearch
    })

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount).replace('F\u202FCFA', 'FCFA')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-200 border-t-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full p-[var(--container-padding)] gap-[var(--spacing-4)]">
            {/* Header / Actions Bar */}
            <div className="flex-none bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">

                    {viewMode === 'list' && (
                        <>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Rechercher facture, client, dossier..."
                                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {/* Filter Status */}
                            <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-sm font-medium text-slate-700 bg-transparent py-2 pl-3 pr-8 focus:outline-none cursor-pointer hover:bg-slate-50 border-r border-slate-200 last:border-0"
                                >
                                    <option value="ALL">Tout statut</option>
                                    <option value="PAYEE">Payées</option>
                                    <option value="IMPAYEE">Impayées</option>
                                    <option value="PARTIELLE">Partielles</option>
                                </select>
                            </div>
                        </>
                    )}

                    {viewMode === 'stats' && (
                        <h2 className="text-xl font-bold text-slate-900">Statistiques Financières</h2>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {viewMode === 'list' && (
                        <div className="hidden md:block text-right mr-4">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Reste à percevoir</p>
                            <p className="text-sm font-bold text-red-600">{formatCurrency(totalPending)}</p>
                        </div>
                    )}

                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}
                            onClick={() => setViewMode('list')}
                        >
                            <ListFilter className="w-4 h-4 mr-2" /> Liste
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={viewMode === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}
                            onClick={() => setViewMode('stats')}
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Stats
                        </Button>
                    </div>

                    {viewMode === 'list' && (
                        <>
                            <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                                <Download className="w-4 h-4 mr-2" />
                                Exporter
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                onClick={() => setDialogOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Enregistrer Paiement
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' ? (
                <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">Référence</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Reçu le</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 min-w-[200px]">Client / Dossier</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Type</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Montant</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center">Statut</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredInvoices.map((inv) => {
                                    const remaining = inv.montantTTC - inv.montantPaye
                                    const isLate = inv.dateEcheance ? (new Date(inv.dateEcheance) < new Date() && inv.statut !== "PAYEE") : false

                                    return (
                                        <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors group text-sm">
                                            <td className="px-4 py-3 font-medium text-slate-700 border-r border-transparent group-hover:border-slate-100 whitespace-nowrap">
                                                <button className="text-blue-600 hover:underline text-left">
                                                    {inv.numero}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 border-r border-transparent group-hover:border-slate-100 whitespace-nowrap">
                                                <span>{format(new Date(inv.date), "dd/MM/yyyy")}</span>
                                            </td>
                                            <td className="px-4 py-3 border-r border-transparent group-hover:border-slate-100">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-slate-800 truncate">
                                                        {inv.client ? (inv.client.type === 'ENTREPRISE' ? inv.client.raisonSociale : `${inv.client.prenom} ${inv.client.nom}`) : 'Client inconnu'}
                                                    </span>
                                                    <div className="flex gap-2 text-xs text-slate-500">
                                                        {inv.dossierId && (
                                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                                                {inv.dossier?.numero || inv.dossierId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 border-r border-transparent group-hover:border-slate-100 whitespace-nowrap capitalize">
                                                {inv.type}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 border-r border-transparent group-hover:border-slate-100 whitespace-nowrap">
                                                {formatCurrency(inv.montantPaye)}
                                            </td>
                                            <td className="px-4 py-3 text-center border-r border-transparent group-hover:border-slate-100">
                                                <StatusBadge status={inv.statut} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <ListFilter className="w-12 h-12 mb-3 opacity-20" />
                                                <p>Aucune facture ne correspond aux critères.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : <FinancialStatsView totalPaid={totalPaid} countPaiements={invoices.length} />
            }

            {/* Invoice Form Dialog */}
            <InvoiceFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={fetchInvoices}
            />
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "PAYEE":
            return <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent shadow-none">Payée</Badge>
        case "IMPAYEE":
            return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-transparent shadow-none">Impayée</Badge>
        case "PARTIELLE":
            return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-transparent shadow-none">Partielle</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}
