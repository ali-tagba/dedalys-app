"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

const clientSchema = z.object({
    type: z.enum(["PERSONNE_PHYSIQUE", "PERSONNE_MORALE"]),
    // Personne Morale fields
    raisonSociale: z.string().optional(),
    formeJuridique: z.string().optional(),
    numeroRCCM: z.string().optional(),
    siegeSocial: z.string().optional(),
    representantLegal: z.string().optional(),
    // Personne Physique fields
    nom: z.string().optional(),
    prenom: z.string().optional(),
    profession: z.string().optional(),
    pieceIdentite: z.string().optional(),
    // Common fields
    email: z.string().email().optional().or(z.literal("")),
    telephone: z.string().optional(),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    pays: z.string(),
    notes: z.string().optional(),
    // Facturation
    statutFacturation: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    client?: any
}

export function ClientFormDialog({
    open,
    onOpenChange,
    onSuccess,
    client,
}: ClientFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const isEdit = !!client

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: client ? {
            ...client,
            statutFacturation: client.statut_facturation || "NON_REGLE",
        } : {
            type: "PERSONNE_MORALE",
            pays: "Côte d'Ivoire",
            statutFacturation: "NON_REGLE",
        },
    })

    const clientType = watch("type")

    const onSubmit = async (data: ClientFormData) => {
        setLoading(true)
        try {
            const isPM = data.type === 'PERSONNE_MORALE';

            // Map frontend camelCase form → snake_case Supabase API fields
            const payload: any = {
                statut: isPM ? 'PM' : 'PP',
                email_principal: data.email || null,
                telephone: data.telephone || null,
                adresse_complete: data.adresse || null,
                ville: data.ville || null,
                pays: data.pays || "Côte d'Ivoire",
                statut_facturation: data.statutFacturation || "NON_REGLE",
                notes: data.notes || null,
            };

            if (isPM) {
                payload.raison_sociale = data.raisonSociale || null;
                payload.forme_juridique = data.formeJuridique || 'SA';
                payload.representant_legal = data.representantLegal || null;
                payload.rccm = data.numeroRCCM || null;
                payload.siege_social = data.siegeSocial || null;
            } else {
                payload.nom = data.nom;
                payload.prenom = data.prenom;
                payload.secteur_activite = data.profession || null;
            }

            if (isEdit) {
                await api.patch(`/api/v1/clients/${client.id}`, payload);
            } else {
                await api.post('/api/v1/clients', payload);
            }

            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error("Error saving client:", error?.response?.data || error)
            alert("Erreur lors de l'enregistrement du client: " + (error?.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier le client" : "Nouveau client"}
                    </DialogTitle>
                    <DialogDescription>
                        Remplissez les informations du client
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Type de client</Label>
                        <Select
                            value={clientType}
                            onValueChange={(value) =>
                                setValue("type", value as any)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PERSONNE_MORALE">
                                    Personne Morale (Entreprise)
                                </SelectItem>
                                <SelectItem value="PERSONNE_PHYSIQUE">
                                    Personne Physique (Individu)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {clientType === "PERSONNE_MORALE" ? (
                        <>
                            <div className="space-y-2">
                                <Label>Raison Sociale *</Label>
                                <Input {...register("raisonSociale")} placeholder="Ex: SOTRA SA" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Forme Juridique</Label>
                                    <Select
                                        value={watch("formeJuridique") || ""}
                                        onValueChange={(value) => setValue("formeJuridique", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SARL">SARL</SelectItem>
                                            <SelectItem value="SA">SA</SelectItem>
                                            <SelectItem value="SAU">SAU</SelectItem>
                                            <SelectItem value="SNC">SNC</SelectItem>
                                            <SelectItem value="SAS">SAS</SelectItem>
                                            <SelectItem value="Autres">Autres</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Numéro RCCM</Label>
                                    <Input {...register("numeroRCCM")} placeholder="Ex: CI-ABJ-2015-B-12345" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Siège Social</Label>
                                <Input {...register("siegeSocial")} placeholder="Adresse du siège social" />
                            </div>

                            <div className="space-y-2">
                                <Label>Représentant Légal</Label>
                                <Input {...register("representantLegal")} placeholder="Nom du représentant légal" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nom *</Label>
                                    <Input {...register("nom")} placeholder="Nom de famille" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Prénom *</Label>
                                    <Input {...register("prenom")} placeholder="Prénom" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Profession</Label>
                                    <Input {...register("profession")} placeholder="Ex: Commerçant" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pièce d'Identité</Label>
                                    <Input {...register("pieceIdentite")} placeholder="Numéro CNI ou Passeport" />
                                </div>
                            </div>


                        </>
                    )}

                    <div className="space-y-2 border-t border-slate-100 pt-4 mt-4">
                        <Label>Statut Facturation</Label>
                        <Select
                            value={watch("statutFacturation") || "NON_REGLE"}
                            onValueChange={(value) => setValue("statutFacturation", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="REGLE">Réglé</SelectItem>
                                <SelectItem value="PARTIELLEMENT_REGLE">Partiellement réglé</SelectItem>
                                <SelectItem value="NON_REGLE">Non réglé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" {...register("email")} />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input {...register("telephone")} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Input {...register("adresse")} placeholder="Domicile ou adresse" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Ville</Label>
                            <Input {...register("ville")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Pays</Label>
                            <Input {...register("pays")} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <textarea
                            {...register("notes")}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Notes sur le client..."
                        />
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
