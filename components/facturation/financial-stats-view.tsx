"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Invoice {
    id: string
    numero?: string
    date?: string
    dateEcheance?: string
    client?: any
    dossier?: any
    montantHT?: number
    tva?: number
    montantTTC?: number
    montantPaye?: number
    statut?: string
    attachmentUrl?: string | boolean | null
}

interface FinancialStatsViewProps {
    invoices?: Invoice[]
    onNewInvoice?: () => void
}

export function FinancialStatsView({ invoices = [], onNewInvoice }: FinancialStatsViewProps) {
    const [monthlyTarget, setMonthlyTarget] = useState<number | null>(null)
    const [isEditingTarget, setIsEditingTarget] = useState(false)
    const [tempTarget, setTempTarget] = useState("")

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
            .format(amount).replace('F\u202FCFA', 'FCFA')

    // ---- Real computed KPIs ----
    const totalCA = invoices.reduce((sum, inv) => sum + (inv.montantPaye || 0), 0)
    const invoicesEnAttente = invoices.filter(inv => (inv.statut || '').toUpperCase() === 'IMPAYEE' || (inv.statut || '').toUpperCase() === 'PARTIELLE')
    const montantEnAttente = invoicesEnAttente.reduce((sum, inv) => sum + ((inv.montantTTC || 0) - (inv.montantPaye || 0)), 0)
    const countEnAttente = invoicesEnAttente.length

    // Objectif mensuel
    const hasTarget = monthlyTarget !== null && monthlyTarget > 0
    const percentage = hasTarget ? Math.min(Math.round((totalCA / monthlyTarget!) * 100), 100) : 0
    const remaining = hasTarget ? Math.max(0, monthlyTarget! - totalCA) : 0

    // Taux de recouvrement: (montant payé / montant total TTC) * 100
    const totalTTC = invoices.reduce((sum, inv) => sum + (inv.montantTTC || inv.montantHT || 0), 0)
    const tauxRecouv = totalTTC > 0 ? Math.min(Math.round((totalCA / totalTTC) * 100), 100) : 0
    const tauxLabel = tauxRecouv >= 90 ? 'Excellent' : tauxRecouv >= 70 ? 'Bon' : tauxRecouv >= 50 ? 'Moyen' : 'À améliorer'

    const saveTarget = () => {
        const val = parseInt(tempTarget.replace(/[^0-9]/g, ''), 10)
        if (!isNaN(val) && val > 0) setMonthlyTarget(val)
        else setMonthlyTarget(null)
        setIsEditingTarget(false)
    }

    const getClientName = (client: any) => {
        if (!client) return '—'
        if (typeof client === 'string') return client
        if (client.type === 'ENTREPRISE') return client.raisonSociale || '—'
        return `${client.prenom || ''} ${client.nom || ''}`.trim() || '—'
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'
    }

    const getStatusChip = (statut: string) => {
        switch ((statut || '').toUpperCase()) {
            case 'PAYEE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">Payé</span>
            case 'IMPAYEE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Impayé</span>
            case 'PARTIELLE':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">Partiel</span>
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{statut}</span>
        }
    }

    const recentInvoices = [...invoices].slice(0, 5)

    return (
        <div
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-[32px] font-bold text-slate-900 leading-tight">Tableau de bord</h1>
                        <p className="text-slate-500 mt-1 text-sm">Aperçu de votre activité financière ce mois-ci.</p>
                    </div>
                    <button
                        onClick={onNewInvoice}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nouvelle Facture
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Chiffre d'affaires */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-500 text-sm font-medium">Chiffre d'affaires</h3>
                            <span className="material-symbols-outlined text-slate-400 text-lg">payments</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalCA)}</div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-[10px]">trending_up</span>
                                    Encaissé
                                </span>
                                <span className="text-xs text-slate-500">ce mois</span>
                            </div>
                        </div>
                    </div>

                    {/* Objectif mensuel */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-500 text-sm font-medium">Objectif mensuel</h3>
                            <span className="material-symbols-outlined text-slate-400 text-lg">track_changes</span>
                        </div>
                        {!hasTarget && !isEditingTarget ? (
                            <div>
                                <p className="text-sm text-slate-400 mb-3">Aucun objectif défini.</p>
                                <button
                                    onClick={() => { setIsEditingTarget(true); setTempTarget("") }}
                                    className="text-xs bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
                                >
                                    + Définir un objectif
                                </button>
                            </div>
                        ) : isEditingTarget ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-500">Montant cible (FCFA)</label>
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tempTarget}
                                        onChange={e => setTempTarget(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && saveTarget()}
                                        placeholder="Ex: 5000000"
                                        className="h-8 px-2 text-sm border border-slate-200 rounded-md w-full focus:outline-none focus:border-blue-500"
                                    />
                                    <button onClick={saveTarget} className="text-xs bg-blue-600 text-white px-3 rounded-md font-medium hover:bg-blue-700">✓</button>
                                    <button onClick={() => setIsEditingTarget(false)} className="text-xs bg-slate-100 text-slate-600 px-2 rounded-md hover:bg-slate-200">✕</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-baseline mb-2">
                                    <div className="text-2xl font-bold text-slate-900">{percentage}% <span className="text-sm font-medium text-slate-500">atteint</span></div>
                                </div>
                                <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden mb-2">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${percentage}%` }}></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-400">
                                        {remaining > 0 ? `Reste ${formatCurrency(remaining)}` : '🎉 Objectif atteint!'}
                                    </p>
                                    <button onClick={() => { setIsEditingTarget(true); setTempTarget(monthlyTarget?.toString() || '') }} className="text-xs text-blue-500 underline">éditer</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Taux de recouvrement */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <h3 className="text-slate-500 text-sm font-medium">Taux de recouvrement</h3>
                            <span className="material-symbols-outlined text-slate-400 text-lg">published_with_changes</span>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative w-16 h-16 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                    <circle className="stroke-blue-50" cx="18" cy="18" fill="none" r="16" strokeWidth="4"></circle>
                                    <circle
                                        className="stroke-blue-600"
                                        cx="18" cy="18" fill="none" r="16"
                                        strokeDasharray={`${tauxRecouv} 100`}
                                        strokeLinecap="round" strokeWidth="4"
                                    ></circle>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">{tauxRecouv}%</div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">{tauxLabel}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{totalTTC === 0 ? 'Aucune facture.' : 'Basé sur les paiements réels.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Factures en attente */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-slate-500 text-sm font-medium">Factures en attente</h3>
                            <span className="material-symbols-outlined text-amber-500 text-lg">pending_actions</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{formatCurrency(montantEnAttente)}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                    {countEnAttente} facture{countEnAttente !== 1 ? 's' : ''}
                                </span>
                                <span className="text-xs text-slate-500">à recouvrer</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Paiements reçus</h2>
                            <p className="text-sm text-slate-500">Évolution des revenus sur les 6 derniers mois</p>
                        </div>
                        <select className="text-sm border border-slate-200 rounded-md bg-white text-slate-700 focus:ring-blue-600 focus:border-blue-600 px-2 py-1">
                            <option>6 derniers mois</option>
                            <option>Cette année</option>
                        </select>
                    </div>
                    <div className="h-64 w-full relative">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200" xmlns="http://www.w3.org/2000/svg">
                            {/* Grid lines */}
                            {[40, 80, 120, 160].map(y => (
                                <line key={y} stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="1000" y1={y} y2={y} className="text-slate-100" />
                            ))}
                            <line stroke="currentColor" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200" className="text-slate-200" />
                            {/* Flat line at zero when no data */}
                            <path d="M0,200 L1000,200" fill="none" stroke="rgb(203,213,225)" strokeLinecap="round" strokeWidth="2" strokeDasharray="6 4" />
                        </svg>
                        {/* Empty state overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-4xl text-slate-200">bar_chart</span>
                            <p className="text-sm text-slate-400">Aucune donnée disponible pour la période sélectionnée.</p>
                            <p className="text-xs text-slate-400">Les statistiques s'afficheront ici dès qu'un paiement sera enregistré.</p>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-300 px-2 font-medium absolute bottom-0 left-0 right-0">
                            <span>Mai</span><span>Juin</span><span>Juil</span><span>Août</span><span>Sept</span><span>Oct</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Factures recentes - full width */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Factures récentes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Facture</th>
                                    <th className="px-6 py-3 font-medium">Client</th>
                                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Date</th>
                                    <th className="px-6 py-3 font-medium">Statut</th>
                                    <th className="px-6 py-3 font-medium text-right">Montant payé</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentInvoices.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">Aucune facture enregistrée.</td></tr>
                                ) : recentInvoices.map(inv => {
                                    const cname = getClientName(inv.client)
                                    const initials = getInitials(cname)
                                    return (
                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{inv.numero || inv.id.slice(0, 8).toUpperCase()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">{initials}</div>
                                                    <span className="font-medium text-slate-800">{cname}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
                                                {inv.date ? format(new Date(inv.date), 'dd MMM yyyy', { locale: fr }) : '—'}
                                            </td>
                                            <td className="px-6 py-4">{getStatusChip(inv.statut || '')}</td>
                                            <td className="px-6 py-4 font-semibold text-right text-slate-900">{formatCurrency(inv.montantPaye || 0)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

