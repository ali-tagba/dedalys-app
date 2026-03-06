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

const flashCrSchema = z.object({
    audienceId: z.string().min(1, "Audience requise"),
    typeDecision: z.string().min(1, "Type de décision requis"),
    prochaineDate: z.string().optional(),
    contenu: z.string().min(1, "Contenu requis"),
    notesRapides: z.string().optional(),
    envoyerEmail: z.boolean().default(false),
})

type FlashCrFormData = z.infer<typeof flashCrSchema>

interface FlashCrFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    flashCr?: any
    prefilledAudienceId?: string
}

export function FlashCrFormDialog({
    open,
    onOpenChange,
    onSuccess,
    flashCr,
    prefilledAudienceId,
}: FlashCrFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [audiences, setAudiences] = useState<any[]>([])
    const isEdit = !!flashCr

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FlashCrFormData>({
        resolver: zodResolver(flashCrSchema),
        defaultValues: flashCr ? {
            audienceId: flashCr.audience_id || "",
            typeDecision: flashCr.type_decision || "plaidoirie",
            prochaineDate: flashCr.prochaine_date || "",
            contenu: flashCr.contenu || "",
            notesRapides: flashCr.notes_rapides || "",
            envoyerEmail: flashCr.email_envoye || false,
        } : {
            audienceId: prefilledAudienceId || "",
            typeDecision: "plaidoirie",
            envoyerEmail: false,
        },
    })

    useEffect(() => {
        if (open) {
            api.get('/api/v1/audiences')
                .then(res => setAudiences(res.data.data || res.data || []))
                .catch(err => console.error('Error fetching audiences:', err))
        }
    }, [open])

    const onSubmit = async (data: FlashCrFormData) => {
        setLoading(true)
        try {
            const payload = {
                audience_id: data.audienceId,
                type_decision: data.typeDecision,
                prochaine_date: data.prochaineDate || null,
                contenu: data.contenu,
                notes_rapides: data.notesRapides || null,
                envoyer_email: data.envoyerEmail,
            }

            if (isEdit) {
                await api.patch(`/api/v1/flash-cr/${flashCr.id}`, payload)
            } else {
                await api.post("/api/v1/flash-cr/", payload)
            }

            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error("Error saving FlashCR:", error?.response?.data || error)
            alert("Erreur lors de l'enregistrement du Flash CR: " + (error?.response?.data?.detail || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier le Flash CR" : "Rédiger un Flash CR"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Audience *</Label>
                        <Select
                            value={watch("audienceId")}
                            onValueChange={(value) => setValue("audienceId", value)}
                            disabled={!!prefilledAudienceId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une audience" />
                            </SelectTrigger>
                            <SelectContent>
                                {audiences.map((audience) => (
                                    <SelectItem key={audience.id} value={audience.id}>
                                        {audience.titre} - {new Date(audience.date).toLocaleDateString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.audienceId && (
                            <p className="text-sm text-red-600">{errors.audienceId.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type de décision *</Label>
                            <Select
                                value={watch("typeDecision")}
                                onValueChange={(value) => setValue("typeDecision", value)}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mise_en_delibere">Mise en délibéré</SelectItem>
                                    <SelectItem value="renvoi">Renvoi</SelectItem>
                                    <SelectItem value="plaidoirie">Plaidoirie</SelectItem>
                                    <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.typeDecision && (
                                <p className="text-sm text-red-600">{errors.typeDecision.message}</p>
                            )}
                        </div>

                        {(watch("typeDecision") === "mise_en_delibere" || watch("typeDecision") === "renvoi") && (
                            <div className="space-y-2">
                                <Label>Prochaine date *</Label>
                                <Input type="date" {...register("prochaineDate")} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Déroulé / Contenu du compte-rendu *</Label>
                        <textarea
                            {...register("contenu")}
                            className="w-full min-h-[150px] p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Rédigez le compte-rendu de l'audience..."
                        />
                        {errors.contenu && (
                            <p className="text-sm text-red-600">{errors.contenu.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Notes rapides (Optionnel)</Label>
                        <Input {...register("notesRapides")} placeholder="Instructions internes, To-Do..." />
                    </div>

                    <div className="flex items-center space-x-2 pt-2 pb-2">
                        <input type="checkbox" id="envoyerEmail" {...register("envoyerEmail")} className="rounded border-slate-300 w-4 h-4 cursor-pointer" />
                        <Label htmlFor="envoyerEmail" className="font-normal cursor-pointer select-none">
                            Envoyer automatiquement le Flash CR par email au client
                        </Label>
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
