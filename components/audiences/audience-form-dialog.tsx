"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"

const JURIDICTIONS = [
    "Tribunal de première instance d'Abidjan Plateau",
    "Tribunal de première instance de Yopougon",
    "Première section du tribunal de Yopougon",
    "Section du tribunal d'Abobo",
    "Section du tribunal Marcory",
    "Section du tribunal de Cocody",
    "Section du tribunal de Koumassi",
    "Cour d'appel d'Abidjan",
    "Cour d'appel de Bouaké",
    "Cour suprême"
]

const audienceSchema = z.object({
    titre: z.string().optional(),
    date: z.string().optional(),
    heure: z.string().optional(),
    duree: z.string().optional(),
    juridiction: z.string().optional(),
    salleAudience: z.string().optional(),
    clientId: z.string().optional(),
    dossierId: z.string().optional(),
    avocat: z.string().optional(),
    statut: z.string().optional(),
    resultat: z.string().optional(),
    notes: z.string().optional(),
})

type AudienceFormData = z.infer<typeof audienceSchema>

interface AudienceFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    audience?: any
    prefillDossierId?: string
    prefillClientId?: string
}

function getClientLabel(c: any) {
    if (!c) return "—"
    if (c.statut === "PP" || c.type === "PERSONNE_PHYSIQUE")
        return `${c.nom || ""} ${c.prenom || ""}`.trim()
    return c.raison_sociale || c.raisonSociale || "—"
}

export function AudienceFormDialog({
    open,
    onOpenChange,
    onSuccess,
    audience,
    prefillDossierId,
    prefillClientId,
}: AudienceFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [dossiers, setDossiers] = useState<any[]>([])
    const [avocats, setAvocats] = useState<any[]>([])
    const isEdit = !!audience

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<AudienceFormData>({
        resolver: zodResolver(audienceSchema),
        defaultValues: {
            statut: "A_VENIR",
            resultat: "",
            titre: "",
            date: "",
            heure: "09:00",
            duree: "",
            juridiction: "",
            salleAudience: "",
            clientId: "",
            dossierId: "",
            avocat: "",
            notes: "",
        },
    })

    const selectedDossierId = watch("dossierId")
    const selectedClientId = watch("clientId")

    useEffect(() => {
        if (open) {
            Promise.all([
                api.get("/api/v1/clients").then((r) => r.data?.data ?? r.data ?? []),
                api.get("/api/v1/dossiers").then((r) => r.data?.data ?? r.data ?? []),
                api.get("/api/v1/utilisateurs").then((r) => r.data ?? []),
            ])
                .then(([clientsData, dossiersData, avocatsData]) => {
                    setClients(Array.isArray(clientsData) ? clientsData : [])
                    setDossiers(Array.isArray(dossiersData) ? dossiersData : [])
                    setAvocats(Array.isArray(avocatsData) ? avocatsData : [])
                })
                .catch((err) => console.error("Error fetching data:", err))
        }
    }, [open])

    useEffect(() => {
        if (audience) {
            reset({
                titre: audience.titre ?? "",
                date: audience.date?.slice?.(0, 10) ?? "",
                heure: audience.heure?.slice?.(0, 5) ?? "09:00",
                duree: audience.duree ?? "",
                juridiction: audience.juridiction ?? "",
                salleAudience: audience.salle_audience ?? audience.salleAudience ?? "",
                clientId: audience.client_id ?? audience.clientId ?? "",
                dossierId: audience.dossier_id ?? audience.dossierId ?? "",
                avocat: audience.avocat_assigne_id ?? audience.avocat ?? "",
                statut: audience.statut ?? "A_VENIR",
                resultat: audience.resultat ?? "",
                notes: audience.notes ?? "",
            })
        } else if (open && (prefillDossierId || prefillClientId)) {
            if (prefillDossierId) setValue("dossierId", prefillDossierId)
            if (prefillClientId) setValue("clientId", prefillClientId)
        }
    }, [audience, open, prefillDossierId, prefillClientId, reset, setValue])

    useEffect(() => {
        if (selectedDossierId) {
            const d = dossiers.find((x) => x.id === selectedDossierId)
            if (d) {
                const cid = d.client_id ?? d.clientId
                if (cid) setValue("clientId", cid)
            }
        }
    }, [selectedDossierId, dossiers, setValue])

    const onSubmit = async (data: AudienceFormData) => {
        if (!data.date) {
            alert("La date est requise pour créer une audience.")
            return
        }
        if (!data.dossierId) {
            alert("Veuillez sélectionner un dossier pour lier l'audience.")
            return
        }

        setLoading(true)
        try {
            const payload: any = {
                date: data.date,
                heure: data.heure || "09:00",
                juridiction: data.juridiction || null,
                dossier_id: data.dossierId,
                avocat_assigne_id: data.avocat || (avocats[0]?.id ?? null),
                statut: data.statut || "A_VENIR",
                resultat: data.statut === "TERMINEE" ? (data.resultat || null) : null,
                type: "audience",
                notes: data.notes || null,
                titre: data.titre || null,
                salle_audience: data.salleAudience || null,
                duree: data.duree || null,
            }

            if (isEdit) {
                await api.patch(`/api/v1/audiences/${audience.id}`, payload)
            } else {
                const res = await api.post("/api/v1/audiences", payload)
                const created = res.data?.data ?? res.data
                if (created?.id && data.dossierId && data.titre) {
                    try {
                        await api.patch(`/api/v1/dossiers/${data.dossierId}`, {
                            prochaine_audience: data.date,
                        })
                    } catch (_) {
                        /* non bloquant */
                    }
                }
            }

            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            const msg = error?.response?.data?.error || error?.message || "Erreur inconnue"
            alert("Erreur lors de l'enregistrement : " + msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier l'audience" : "Nouvelle audience"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Titre de l'audience</Label>
                        <Input {...register("titre")} placeholder="Ex: Plaidoirie sur le fond" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Dossier (depuis l'index)</Label>
                            <Select
                                value={watch("dossierId") || "none"}
                                onValueChange={(v) => setValue("dossierId", v === "none" ? "" : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un dossier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Aucun —</SelectItem>
                                    {dossiers.map((d) => {
                                        const c = clients.find((x) => x.id === (d.client_id ?? d.clientId))
                                        return (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.reference || d.numero || d.id?.slice(0, 8)} — {getClientLabel(c)}
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Select
                                value={watch("clientId") || "none"}
                                onValueChange={(v) => setValue("clientId", v === "none" ? "" : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un client" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Aucun —</SelectItem>
                                    {clients.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {getClientLabel(c)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" {...register("date")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Heure</Label>
                            <Input type="time" {...register("heure")} placeholder="09:00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Durée estimée</Label>
                            <Input {...register("duree")} placeholder="Ex: 1h 30m" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Juridiction</Label>
                            <Select
                                value={watch("juridiction") || "none"}
                                onValueChange={(v) => setValue("juridiction", v === "none" ? "" : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Aucune —</SelectItem>
                                    {JURIDICTIONS.map((j) => (
                                        <SelectItem key={j} value={j}>
                                            {j}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Salle d'audience</Label>
                            <Input {...register("salleAudience")} placeholder="Ex: Salle 4B" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Avocat assigné</Label>
                            <Select
                                value={watch("avocat") || "none"}
                                onValueChange={(v) => setValue("avocat", v === "none" ? "" : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Aucun —</SelectItem>
                                    {avocats.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.prenom} {a.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Statut</Label>
                            <Select
                                value={watch("statut") ?? "A_VENIR"}
                                onValueChange={(v) => setValue("statut", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A_VENIR">À venir</SelectItem>
                                    <SelectItem value="TERMINEE">Terminée</SelectItem>
                                    <SelectItem value="ANNULEE">Annulée</SelectItem>
                                    <SelectItem value="REPORTEE">Reportée</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {watch("statut") === "TERMINEE" && (
                            <div className="space-y-2">
                                <Label>Résultat</Label>
                                <Select
                                    value={watch("resultat") ?? ""}
                                    onValueChange={(v) => setValue("resultat", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">—</SelectItem>
                                        <SelectItem value="GAGNE">Gagné</SelectItem>
                                        <SelectItem value="PERDU">Perdu</SelectItem>
                                        <SelectItem value="MIXTE">Mixte / Partiel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input {...register("notes")} placeholder="Notes internes" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
