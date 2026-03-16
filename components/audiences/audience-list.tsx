"use client"

import { Audience } from "@/lib/types/audience"
import { format, isToday, isTomorrow, isYesterday, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, User, FileText, Gavel, Clock, CheckCircle2, Edit2, Trash2 } from "lucide-react"

interface AudienceListProps {
    audiences: Audience[]
    onEdit?: (audience: Audience) => void
    onDelete?: (audienceId: string) => void
}

const getStatusBadge = (status: string, date: string) => {
    const isLate = new Date(date) < new Date() && status === "A_VENIR"

    if (isLate) {
        return <Badge className="bg-red-50 text-red-700 border-red-200 uppercase tracking-widest text-[10px] font-bold">En retard</Badge>
    }

    switch (status) {
        case "A_VENIR":
            return <Badge className="bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-widest text-[10px] font-bold">À venir</Badge>
        case "TERMINEE":
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-widest text-[10px] font-bold">Terminée</Badge>
        case "REPORTEE":
            return <Badge className="bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-widest text-[10px] font-bold">Reportée</Badge>
        case "ANNULEE":
            return <Badge className="bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-widest text-[10px] font-bold">Annulée</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getResultatBadge = (resultat?: string | null) => {
    switch (resultat) {
        case "GAGNE":
            return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 shadow-none">Gagné</Badge>
        case "PERDU":
            return <Badge className="bg-red-100 text-red-800 border-red-200 shadow-none">Perdu</Badge>
        case "MIXTE":
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200 shadow-none">Mixte</Badge>
        default:
            return null
    }
}

function getClientName(client: any, clientId?: string): string {
    if (!client) return clientId || "Non assigné"
    if (client.statut === "PP" || client.type === "PERSONNE_PHYSIQUE") {
        return `${client.nom || ""} ${client.prenom || ""}`.trim()
    }
    return client.raison_sociale || client.raisonSociale || clientId || "Non assigné"
}

/** Texte Flash CR selon état : si audience passée et pas de CR → message explicite, pas "Urgent : Signature requise" */
function getFlashCRLabel(audience: Audience): { text: string; urgent: boolean } {
    const hasCR = !!audience.flashCR
    const datePassed = new Date(audience.date) < new Date()

    if (hasCR) {
        return { text: "Prêt à signer", urgent: false }
    }

    if (datePassed) {
        return {
            text: "Compte rendu non rédigé — à faire en urgence",
            urgent: true,
        }
    }

    return { text: "Non rédigé", urgent: false }
}

function getDateGroupLabel(date: Date): string {
    if (isToday(date)) return "Aujourd'hui"
    if (isTomorrow(date)) return "Demain"
    if (isYesterday(date)) return "Hier"
    return format(date, "EEEE d MMMM", { locale: fr })
}

export function AudienceList({ audiences, onEdit, onDelete }: AudienceListProps) {
    const sorted = [...audiences].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const byDate = sorted.reduce<Record<string, Audience[]>>((acc, a) => {
        const d = startOfDay(new Date(a.date)).toISOString()
        if (!acc[d]) acc[d] = []
        acc[d].push(a)
        return acc
    }, {})

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Gavel className="w-8 h-8 opacity-40 text-slate-600" />
                </div>
                <p className="text-lg font-medium text-slate-600 mb-1">Aucune audience programmée</p>
                <p className="text-sm">Modifiez vos filtres ou planifiez une nouvelle audience.</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            {Object.entries(byDate).map(([dateKey, dayAudiences]) => {
                const dateObj = new Date(dateKey)
                const isTodayGroup = isToday(dateObj)

                return (
                    <section key={dateKey} className={isTodayGroup ? "" : "opacity-95"}>
                        {/* Sticky date header */}
                        <div className="sticky top-0 z-10 bg-white px-6 md:px-8 py-4 flex items-baseline justify-between border-b border-slate-200 shadow-sm">
                            <h2 className="font-serif text-xl font-semibold text-slate-900">
                                {getDateGroupLabel(dateObj)}
                            </h2>
                            {isTodayGroup && (
                                <span className="font-mono text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                    DOCKET DU JOUR
                                </span>
                            )}
                        </div>

                        <div className="px-4 md:px-8 flex flex-col gap-2 pt-4 pb-6">
                            {dayAudiences.map((audience) => {
                                const isLate =
                                    new Date(audience.date) < new Date() && audience.statut === "A_VENIR"
                                const dateObj = new Date(audience.date)

                                const audAny = audience as any;
                                const client = audience.client ?? audience.dossier?.clients ?? audAny.dossiers?.clients
                                const clientName =
                                    client != null ? getClientName(client, audience.clientId) : audience.clientId || "Non assigné"
                                const dossier = audience.dossier ?? audAny.dossiers
                                const dossierRef =
                                    dossier?.reference || dossier?.titre || audience.dossierId || "—"
                                const salleDuree = [audience.salleAudience || audience.salle_audience, audience.duree]
                                    .filter(Boolean)
                                    .join(" • ") || "—"

                                const flashCR = getFlashCRLabel(audience)

                                return (
                                    <Card
                                        key={audience.id}
                                        className={`overflow-hidden border shadow-sm transition-all ${isLate
                                                ? "border-l-4 border-l-red-500 bg-red-50/20"
                                                : "border-slate-200 hover:border-blue-200"
                                            }`}
                                    >
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row">
                                                {/* Date & Heure */}
                                                <div
                                                    className={`w-full md:w-32 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r ${isLate ? "bg-red-50/30 border-red-100" : "bg-slate-50 border-slate-200"
                                                        }`}
                                                >
                                                    <span
                                                        className={`text-3xl font-serif font-bold ${isLate ? "text-red-600" : "text-slate-900"
                                                            }`}
                                                    >
                                                        {format(dateObj, "d")}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-2">
                                                        {format(dateObj, "MMM yyyy", { locale: fr })}
                                                    </span>
                                                    <div
                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isLate ? "bg-white border-red-200" : "bg-white border-slate-200"
                                                            }`}
                                                    >
                                                        <Clock className="w-3 h-3 text-blue-500" />
                                                        <span
                                                            className={`text-[10px] font-mono font-bold ${isLate ? "text-red-600" : "text-slate-800"
                                                                }`}
                                                        >
                                                            {audience.heure || format(dateObj, "HH:mm")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Contenu */}
                                                <div className="flex-1 p-5">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="font-serif text-lg font-bold text-slate-900 uppercase tracking-tight">
                                                                {audience.titre || "Audience sans titre"}
                                                            </h3>
                                                            {audience.juridiction && (
                                                                <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                                                    <span className="material-symbols-outlined text-sm">
                                                                        account_balance
                                                                    </span>
                                                                    <span className="text-xs font-medium uppercase tracking-wide">
                                                                        {audience.juridiction}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {getStatusBadge(audience.statut, audience.date)}
                                                            {audience.statut === "TERMINEE" &&
                                                                getResultatBadge(audience.resultat || "")}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                        <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    Dossier & Client
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                                {dossierRef} • {clientName}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    Avocat
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                                {typeof audience.avocat === "string"
                                                                    ? audience.avocat
                                                                    : audience.utilisateurs
                                                                        ? `${audience.utilisateurs.prenom || ""} ${audience.utilisateurs.nom || ""}`.trim()
                                                                        : "Non assigné"}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <span className="material-symbols-outlined text-sm text-slate-400">
                                                                    meeting_room
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    Salle & Durée
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                                {salleDuree}
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-2.5 rounded border border-slate-100">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <span className="material-symbols-outlined text-sm text-slate-400">
                                                                    description
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                    Flash CR
                                                                </span>
                                                            </div>
                                                            <p
                                                                className={`text-[10px] truncate ${flashCR.urgent
                                                                        ? "italic font-bold text-red-600"
                                                                        : "italic text-slate-500"
                                                                    }`}
                                                            >
                                                                {flashCR.text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="w-full md:w-48 p-5 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50/30">
                                                    {audience.dossierId && (
                                                        <Link href={`/dossiers/${audience.dossierId}`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-[11px] font-bold uppercase tracking-wider border-slate-200"
                                                            >
                                                                Voir Dossier
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {audience.flashCR ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full justify-start text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 text-[11px] font-bold"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                                                            Lire le CR Flash
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className={`w-full justify-start text-[11px] font-bold uppercase tracking-wider ${flashCR.urgent
                                                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                                                    : "bg-slate-900 hover:bg-blue-600 text-white"
                                                                }`}
                                                        >
                                                            <FileText className="w-4 h-4 mr-2 opacity-70" />
                                                            {flashCR.urgent ? "Rédiger CR en urgence" : "Créer CR"}
                                                        </Button>
                                                    )}

                                                    {(onEdit || onDelete) && (
                                                        <div className="flex gap-2 mt-2">
                                                            {onEdit && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        onEdit(audience)
                                                                    }}
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            {onDelete && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        onDelete(audience.id)
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                )
            })}

            <div className="py-8 flex justify-center">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                    Fin du docket
                </span>
            </div>
        </div>
    )
}
