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

// Liste des juridictions de Côte d'Ivoire
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

// Removed static AVOCATS array, will fetch dynamically

const audienceSchema = z.object({
    titre: z.string().min(1, "Titre requis"),
    date: z.string().min(1, "Date requise"),
    heure: z.string().optional(),
    duree: z.string().optional(),
    juridiction: z.string().min(1, "Juridiction requise"),
    salleAudience: z.string().optional(),
    clientId: z.string().min(1, "Client requis"),
    dossierId: z.string().min(1, "Dossier requis"),
    avocat: z.string().optional(),
    statut: z.string().optional(),
    notes: z.string().optional(),
})

type AudienceFormData = z.infer<typeof audienceSchema>

interface AudienceFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    audience?: any
}

export function AudienceFormDialog({
    open,
    onOpenChange,
    onSuccess,
    audience,
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
        formState: { errors },
    } = useForm<AudienceFormData>({
        resolver: zodResolver(audienceSchema),
        defaultValues: audience ? {
            ...audience,
            avocat: audience.avocat_assigne_id,
            clientId: audience.client_id,
            dossierId: audience.dossier_id,
        } : {
            statut: "A_VENIR",
        },
    })

    const selectedDossierId = watch("dossierId")

    useEffect(() => {
        if (open) {
            // Fetch clients, dossiers and avocats
            Promise.all([
                api.get('/api/v1/clients').then(res => res.data.data || res.data || []),
                api.get('/api/v1/dossiers').then(res => res.data.data || res.data || []),
                api.get('/api/v1/utilisateurs').then(res => res.data || [])
            ])
                .then(([clientsData, dossiersData, avocatsData]) => {
                    setClients(clientsData)
                    setDossiers(dossiersData)
                    setAvocats(avocatsData)
                })
                .catch(err => console.error('Error fetching data:', err))
        }
    }, [open])

    // Auto-select client when dossier is selected
    useEffect(() => {
        if (selectedDossierId) {
            const selectedDossier = dossiers.find(d => d.id === selectedDossierId)
            if (selectedDossier) {
                setValue("clientId", selectedDossier.client_id || selectedDossier.clientId)
            }
        }
    }, [selectedDossierId, dossiers, setValue])

    const onSubmit = async (data: AudienceFormData) => {
        setLoading(true)
        try {
            const payload: any = {
                titre: data.titre,
                date: data.date,
                heure: data.heure || "08:00", // Fix missing time which causes 422
                duree: data.duree || null,
                juridiction: data.juridiction,
                salle_audience: data.salleAudience || null,
                dossier_id: data.dossierId,
                avocat_assigne_id: data.avocat || (avocats.length > 0 ? avocats[0].id : null), // Fallback if missed
                type: 'audience',
                statut: data.statut || "A_VENIR",
                notes: data.notes || null
            }

            if (isEdit) {
                await api.patch(`/api/v1/audiences/${audience.id}`, payload)
            } else {
                await api.post("/api/v1/audiences/", payload)
            }

            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error("Error saving audience:", error?.response?.data || error)
            alert("Erreur lors de l'enregistrement de l'audience: " + (error?.response?.data?.detail || error.message))
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
                        <Label>Titre *</Label>
                        <Input {...register("titre")} placeholder="Ex: Plaidoirie sur le fond" />
                        {errors.titre && (
                            <p className="text-sm text-red-600">{errors.titre.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Dossier *</Label>
                        <Select
                            value={watch("dossierId")}
                            onValueChange={(value) => setValue("dossierId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un dossier" />
                            </SelectTrigger>
                            <SelectContent>
                                {dossiers.map((dossier) => (
                                    <SelectItem key={dossier.id} value={dossier.id}>
                                        {dossier.reference || dossier.numero} - {clients.find(c => c.id === (dossier.client_id || dossier.clientId))?.type === "PERSONNE_PHYSIQUE"
                                            ? `${clients.find(c => c.id === (dossier.client_id || dossier.clientId))?.nom} ${clients.find(c => c.id === (dossier.client_id || dossier.clientId))?.prenom}`
                                            : clients.find(c => c.id === (dossier.client_id || dossier.clientId))?.raison_sociale || clients.find(c => c.id === (dossier.client_id || dossier.clientId))?.raisonSociale}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.dossierId && (
                            <p className="text-sm text-red-600">{errors.dossierId.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Date *</Label>
                            <Input type="date" {...register("date")} />
                            {errors.date && (
                                <p className="text-sm text-red-600">{errors.date.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Heure</Label>
                            <Input type="time" {...register("heure")} placeholder="Ex: 14:30" />
                        </div>
                        <div className="space-y-2">
                            <Label>Durée estimée</Label>
                            <Input {...register("duree")} placeholder="Ex: 2h" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Juridiction *</Label>
                            <Select
                                value={watch("juridiction") || ""}
                                onValueChange={(value) => setValue("juridiction", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {JURIDICTIONS.map((juridiction) => (
                                        <SelectItem key={juridiction} value={juridiction}>
                                            {juridiction}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.juridiction && (
                                <p className="text-sm text-red-600">{errors.juridiction.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Salle d'audience</Label>
                            <Input {...register("salleAudience")} placeholder="Ex: Salle 3" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Avocat assigné</Label>
                            <Select
                                value={watch("avocat") || ""}
                                onValueChange={(value) => setValue("avocat", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un avocat" />
                                </SelectTrigger>
                                <SelectContent>
                                    {avocats.map((avocat) => (
                                        <SelectItem key={avocat.id} value={avocat.id}>
                                            {avocat.prenom} {avocat.nom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Statut</Label>
                            <Select
                                value={watch("statut")}
                                onValueChange={(value) => setValue("statut", value)}
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
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input {...register("notes")} placeholder="Notes internes" />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
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
