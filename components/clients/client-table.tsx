"use client"

import { useRouter } from "next/navigation"
import { Client } from "@/lib/types/client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ClientTableProps {
    clients: Client[]
    getDossiersCount: (clientId: string) => number
    onEdit?: (client: Client) => void
    onDelete?: (id: string, e?: React.MouseEvent) => void
}

export function ClientTable({ clients, getDossiersCount, onEdit, onDelete }: ClientTableProps) {
    const router = useRouter()

    return (
        <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 sticky top-0 z-10 ring-1 ring-slate-200/50">
                <tr>
                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[80px] border-b border-slate-200 text-center">Type</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[150px] border-b border-slate-200">Nom / Raison Sociale</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px] border-b border-slate-200">Email</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[140px] border-b border-slate-200">Téléphone</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[120px] border-b border-slate-200">Ville/Pays</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[100px] border-b border-slate-200">Dossiers</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[120px] border-b border-slate-200">Facturation</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[80px] border-b border-slate-200 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {clients.map((client) => {
                    const activeCaseCount = getDossiersCount(client.id)
                    const statutFact = (client as any).statut_facturation || "NON_REGLE"
                    const isRegle = statutFact === "REGLE"
                    const isPartiel = statutFact === "PARTIELLEMENT_REGLE"

                    const statusColor = isRegle ? "bg-emerald-600" : isPartiel ? "bg-amber-500" : "bg-red-600"
                    const statusTextColor = isRegle ? "text-emerald-600" : isPartiel ? "text-amber-600" : "text-red-600"
                    const statusText = isRegle ? "Réglé" : isPartiel ? "Partiel" : "Non réglé"
                    const statusBgColor = isRegle ? "bg-emerald-50" : isPartiel ? "bg-amber-50" : "bg-red-50"

                    const navigateToClient = () => {
                        router.push(`/clients/${client.id}`)
                    }

                    return (
                        <tr
                            key={client.id}
                            onClick={navigateToClient}
                            className="group hover:bg-slate-50 transition-colors cursor-pointer h-12"
                        >
                            <td className="py-3 px-6 text-center">
                                <div className="flex shrink-0 mx-auto h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                                    {(client as any).logo_url && client.type === 'PERSONNE_MORALE' ? (
                                        <img src={(client as any).logo_url} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (client as any).avatar_url && client.type === 'PERSONNE_PHYSIQUE' ? (
                                        <img src={(client as any).avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-500 text-[18px]">
                                            {client.type === 'PERSONNE_MORALE' ? 'business_center' : 'person'}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-900">
                                <div className="flex flex-col">
                                    <span>{client.type === "PERSONNE_PHYSIQUE" ? `${client.nom} ${client.prenom}` : client.raisonSociale}</span>
                                    {client.type === "PERSONNE_PHYSIQUE" && client.profession && (
                                        <span className="text-xs text-slate-500 font-normal">{client.profession}</span>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-900">
                                {client.email}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500">
                                {client.telephone}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500">
                                {client.ville || "-"}
                            </td>
                            <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                    {activeCaseCount} Actif{activeCaseCount !== 1 ? 's' : ''}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <div className={`size-2 rounded-full ${statusColor}`}></div>
                                    <span className={`text-sm font-medium ${statusTextColor} px-2 py-0.5 rounded-full ${statusBgColor}`}>{statusText}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors ml-auto mr-[-8px]">
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
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
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}
