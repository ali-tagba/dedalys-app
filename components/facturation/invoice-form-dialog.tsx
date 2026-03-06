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

const invoiceSchema = z.object({
    clientId: z.string().min(1, "Client requis"),
    dossierId: z.string().min(1, "Dossier requis"),
    dateReception: z.string().min(1, "Date requise"),
    montant: z.string().min(1, "Montant requis"),
    type: z.enum(["honoraires", "frais"]),
    description: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    invoice?: any
}

export function InvoiceFormDialog({
    open,
    onOpenChange,
    onSuccess,
    invoice,
}: InvoiceFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [dossiers, setDossiers] = useState<any[]>([])
    const isEdit = !!invoice

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: invoice ? {
            clientId: invoice.client_id,
            dossierId: invoice.dossier_id,
            dateReception: invoice.date_reception,
            montant: invoice.montant?.toString(),
            type: invoice.type,
            description: invoice.description
        } : {
            type: "honoraires",
            dateReception: new Date().toISOString().split('T')[0],
        },
    })

    const selectedClientId = watch("clientId")
    const selectedDossierId = watch("dossierId")

    useEffect(() => {
        if (open) {
            Promise.all([
                api.get('/api/v1/clients').then(res => res.data.data || res.data || []),
                api.get('/api/v1/dossiers').then(res => res.data.data || res.data || [])
            ])
                .then(([clientsData, dossiersData]) => {
                    setClients(clientsData)
                    setDossiers(dossiersData)
                })
                .catch(err => console.error('Error fetching data:', err))
        }
    }, [open])

    const filteredDossiers = selectedClientId
        ? dossiers.filter(d => (d.client_id || d.clientId) === selectedClientId)
        : []

    const onSubmit = async (data: InvoiceFormData) => {
        setLoading(true)
        try {
            const payload = {
                client_id: data.clientId,
                dossier_id: data.dossierId,
                montant: parseFloat(data.montant),
                date_reception: data.dateReception,
                type: data.type,
                description: data.description || null
            }

            if (isEdit) {
                await api.patch(`/api/v1/paiements/${invoice.id}`, payload)
            } else {
                await api.post("/api/v1/paiements/", payload)
            }

            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error("Error saving payment:", error?.response?.data || error)
            alert("Erreur lors de l'enregistrement du paiement: " + (error?.response?.data?.detail || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier le paiement" : "Enregistrer un paiement"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Client *</Label>
                        <Select
                            value={watch("clientId")}
                            onValueChange={(value) => {
                                setValue("clientId", value)
                                setValue("dossierId", "")
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.type === "PERSONNE_PHYSIQUE"
                                            ? `${client.nom} ${client.prenom}`
                                            : client.raison_sociale || client.raisonSociale}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.clientId && (
                            <p className="text-sm text-red-600">{errors.clientId.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Dossier *</Label>
                            <Select
                                value={watch("dossierId")}
                                onValueChange={(value) => {
                                    setValue("dossierId", value)
                                }}
                                disabled={!selectedClientId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredDossiers.map((dossier) => (
                                        <SelectItem key={dossier.id} value={dossier.id}>
                                            {dossier.reference || dossier.numero}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.dossierId && (
                                <p className="text-sm text-red-600">{errors.dossierId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Date de réception *</Label>
                            <Input type="date" {...register("dateReception")} />
                            {errors.dateReception && (
                                <p className="text-sm text-red-600">{errors.dateReception.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Montant reçu (FCFA) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("montant")}
                                placeholder="0.00"
                            />
                            {errors.montant && (
                                <p className="text-sm text-red-600">{errors.montant.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                                value={watch("type")}
                                onValueChange={(value: "honoraires" | "frais") => setValue("type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="honoraires">Honoraires</SelectItem>
                                    <SelectItem value="frais">Frais de procédure</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm text-red-600">{errors.type.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description précise</Label>
                        <Input {...register("description")} placeholder="Moyen de paiement, chèque N°..." />
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
