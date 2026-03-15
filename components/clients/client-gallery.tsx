"use client"

import { useRouter } from "next/navigation"
import { Client } from "@/lib/types/client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ClientGalleryProps {
    clients: Client[]
    getDossiersCount: (clientId: string) => number
    onEdit?: (client: Client) => void
    onDelete?: (id: string, e?: React.MouseEvent) => void
}

export function ClientGallery({ clients, getDossiersCount, onEdit, onDelete }: ClientGalleryProps) {
    const router = useRouter()

    return (
        <div className="h-full overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {clients.map((client) => {
                    const activeCaseCount = getDossiersCount(client.id)
                    const statutFact = (client as any).statut_facturation || "NON_REGLE"
                    const hasUnpaidInvoices = statutFact !== "REGLE"
                    const initials = client.type === "PERSONNE_PHYSIQUE"
                        ? `${client.nom?.[0] || ''}${client.prenom?.[0] || ''}`.toUpperCase()
                        : client.raisonSociale?.[0]?.toUpperCase() || 'C'

                    const navigateToClient = () => {
                        router.push(`/clients/${client.id}`)
                    }

                    return (
                        <div
                            key={client.id}
                            onClick={navigateToClient}
                            className={`group relative flex flex-col rounded bg-white p-5 shadow-none ring-1 transition-all hover:shadow-sm cursor-pointer ${hasUnpaidInvoices
                                ? 'ring-red-200 hover:ring-red-300 hover:bg-red-50/10'
                                : 'ring-slate-200 hover:ring-blue-600/30'
                                }`}
                        >
                            <div className="mb-4 flex items-start justify-between w-full gap-2 relative z-10 w-full">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex shrink-0 h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-600 font-bold ring-1 ring-slate-200">
                                        {(client as any).logo_url && client.type === 'PERSONNE_MORALE' ? (
                                            <img src={(client as any).logo_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (client as any).avatar_url && client.type === 'PERSONNE_PHYSIQUE' ? (
                                            <img src={(client as any).avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : client.type === 'PERSONNE_MORALE' ? (
                                            <span className="material-symbols-outlined text-[18px]">business_center</span>
                                        ) : (
                                            <span className="text-sm">{initials}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate px-0.5" title={client.type === "PERSONNE_PHYSIQUE" ? `${client.nom} ${client.prenom}` : client.raisonSociale}>
                                            {client.type === "PERSONNE_PHYSIQUE" ? `${client.nom} ${client.prenom}` : client.raisonSociale}
                                        </h3>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5 px-0.5">
                                            {client.type === "PERSONNE_PHYSIQUE" ? client.profession || "Particulier" : "Entreprise"}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 pt-0.5">
                                    {statutFact === "REGLE" ? (
                                        <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-700/10">
                                            Réglé
                                        </div>
                                    ) : statutFact === "PARTIELLEMENT_REGLE" ? (
                                        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-700/10">
                                            Partiel
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700 ring-1 ring-red-700/10">
                                            <span className="h-1 w-1 rounded-full bg-red-600 animate-pulse"></span>
                                            Non réglé
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-y-4 gap-x-2 border-t border-slate-100 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Contact</span>
                                    <span className="text-xs text-slate-700 mt-0.5 truncate">{client.email || "-"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Téléphone</span>
                                    <span className="font-mono text-xs font-medium text-slate-900 mt-0.5">{client.telephone || "-"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Dossiers</span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className={`h-2 w-2 rounded-full ${activeCaseCount > 0 ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                                        <span className="text-xs text-slate-700">{activeCaseCount} Actif{activeCaseCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Ville</span>
                                    <span className="text-xs text-slate-700 mt-0.5 truncate">{client.ville || "-"}</span>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-md border border-slate-200">
                                            ACTION
                                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48">
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigateToClient(); }} className="gap-2 cursor-pointer">
                                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                                            Voir les informations
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onEdit?.(client); }} className="gap-2 cursor-pointer">
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                            Modifier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onDelete?.(client.id, e as any); }} className="text-red-600 focus:bg-red-50 focus:text-red-700 gap-2 cursor-pointer">
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
