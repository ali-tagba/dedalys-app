"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Edit2, Trash2, Paperclip } from "lucide-react"

export interface InvoiceRow {
    id: string
    numero?: string
    date?: string
    dateEcheance?: string
    client?: any
    dossier?: { numero?: string; reference?: string }
    montantHT?: number
    tva?: number          // e.g. 18 for 18%
    montantTTC?: number   // computed if missing: HT * (1 + tva/100)
    montantPaye?: number
    statut?: string
    attachmentUrl?: string | boolean | null
}

interface InvoiceTableProps {
    invoices?: InvoiceRow[]
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

export function InvoiceTable({ invoices = [], onEdit, onDelete }: InvoiceTableProps) {

    const fcfa = (n: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
            .format(n).replace('F\u202FCFA', 'FCFA')

    const getClientName = (client: any) => {
        if (!client) return '—'
        if (typeof client === 'string') return client
        if (client.type === 'ENTREPRISE') return client.raisonSociale || '—'
        return `${client.prenom || ''} ${client.nom || ''}`.trim() || '—'
    }

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'

    const computeTTC = (row: InvoiceRow) => {
        if (row.montantTTC && row.montantTTC > 0) return row.montantTTC
        const ht = row.montantHT || 0
        const tva = row.tva ?? 0
        return ht * (1 + tva / 100)
    }

    const computeReste = (row: InvoiceRow) => {
        const ttc = computeTTC(row)
        const paye = row.montantPaye || 0
        return Math.max(0, ttc - paye)
    }

    const StatusBadge = ({ statut }: { statut: string }) => {
        switch ((statut || '').toUpperCase()) {
            case 'PAYEE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">Payé</span>
            case 'IMPAYEE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">Impayé</span>
            case 'PARTIELLE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">Partiel</span>
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 whitespace-nowrap">{statut || 'N/A'}</span>
        }
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden flex-1 min-h-0"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* Table Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Factures</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{invoices.length} facture{invoices.length !== 1 ? 's' : ''} enregistrée{invoices.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse" style={{ minWidth: '1200px' }}>
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Référence</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Dossier</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[160px]">Client</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Montant HT</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">TVA %</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">TTC</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Montant payé</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Reste à payer</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Statut</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Pièce jointe</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Date d'échéance</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={13} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl opacity-30">receipt_long</span>
                                        <p className="text-sm">Aucune facture enregistrée.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : invoices.map((inv) => {
                            const cname = getClientName(inv.client)
                            const initials = getInitials(cname)
                            const ht = inv.montantHT || 0
                            const tvaRate = inv.tva ?? 0
                            const ttc = computeTTC(inv)
                            const paye = inv.montantPaye || 0
                            const reste = computeReste(inv)

                            return (
                                <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group text-sm">
                                    {/* Référence */}
                                    <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                                        {inv.numero || inv.id.slice(0, 8).toUpperCase()}
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                                        {inv.date ? format(new Date(inv.date), 'dd/MM/yyyy') : '—'}
                                    </td>

                                    {/* Dossier */}
                                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap font-mono text-xs">
                                        {inv.dossier?.reference || inv.dossier?.numero || '—'}
                                    </td>

                                    {/* Client */}
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 flex-shrink-0">
                                                {initials}
                                            </div>
                                            <span className="font-medium text-slate-800 whitespace-nowrap">{cname}</span>
                                        </div>
                                    </td>

                                    {/* Montant HT */}
                                    <td className="px-4 py-3.5 text-right text-slate-700 font-mono whitespace-nowrap">
                                        {ht > 0 ? fcfa(ht) : '—'}
                                    </td>

                                    {/* TVA % */}
                                    <td className="px-4 py-3.5 text-right text-slate-600 whitespace-nowrap">
                                        {tvaRate > 0 ? `${tvaRate}%` : '—'}
                                    </td>

                                    {/* TTC — auto-computed */}
                                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900 font-mono whitespace-nowrap">
                                        {ttc > 0 ? fcfa(ttc) : '—'}
                                    </td>

                                    {/* Montant Payé */}
                                    <td className="px-4 py-3.5 text-right text-emerald-700 font-mono whitespace-nowrap">
                                        {paye > 0 ? fcfa(paye) : <span className="text-slate-400">—</span>}
                                    </td>

                                    {/* Reste à payer — auto-computed */}
                                    <td className="px-4 py-3.5 text-right font-mono whitespace-nowrap">
                                        {reste > 0
                                            ? <span className="text-red-600 font-semibold">{fcfa(reste)}</span>
                                            : <span className="text-emerald-600 font-semibold">0 FCFA</span>
                                        }
                                    </td>

                                    {/* Statut */}
                                    <td className="px-4 py-3.5 text-center">
                                        <StatusBadge statut={inv.statut || ''} />
                                    </td>

                                    {/* Pièce jointe */}
                                    <td className="px-4 py-3.5 text-center">
                                        {inv.attachmentUrl ? (
                                            <a
                                                href={typeof inv.attachmentUrl === 'string' ? inv.attachmentUrl : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                title="Voir la pièce jointe"
                                            >
                                                <Paperclip className="w-3.5 h-3.5" />
                                            </a>
                                        ) : (
                                            <span className="text-slate-300 text-xs">—</span>
                                        )}
                                    </td>

                                    {/* Date d'échéance */}
                                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                                        {inv.dateEcheance ? format(new Date(inv.dateEcheance), 'dd/MM/yyyy') : '—'}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3.5 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => onEdit?.(inv.id)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete?.(inv.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
