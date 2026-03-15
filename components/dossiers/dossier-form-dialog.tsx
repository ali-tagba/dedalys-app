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

// Liste des avocats fictifs
const AVOCATS = [
    "Maître Konan",
    "Maître Touré Aminata",
    "Maître Yao Kouadio",
    "Maître Diallo Mamadou",
    "Maître Bamba Clarisse"
]

const dossierSchema = z.object({
    clientId: z.string().min(1, "Client requis"),
    titre: z.string().optional(),
    type: z.string().min(1, "Type requis"),
    typeDossier: z.string().optional(),
    domaineDroit: z.string().optional(),
    avocatAssigne: z.string().optional(),
    statut: z.string().optional(),
    juridiction: z.string().optional(),
    description: z.string().optional(),
    prochaineAudience: z.string().optional(),
})

type DossierFormData = z.infer<typeof dossierSchema>

interface DossierFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    dossier?: any
}

export function DossierFormDialog({
    open,
    onOpenChange,
    onSuccess,
    dossier,
}: DossierFormDialogProps) {
    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [audiences, setAudiences] = useState<any[]>([])
    const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
    const isEdit = !!dossier

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<DossierFormData>({
        resolver: zodResolver(dossierSchema),
        defaultValues: dossier || {
            type: "CIVIL",
            statut: "EN_COURS",
        },
    })

    useEffect(() => {
        if (open) {
            api.get('/api/v1/clients')
                .then(res => res.data.data || [])
                .then(data => setClients(data))
                .catch(err => console.error('Error fetching clients:', err))

            api.get('/api/v1/audiences')
                .then(res => {
                    const allAudiences = res.data.data || []
                    setAudiences(allAudiences)
                    if (dossier) {
                        // Pre-select audiences already linked to this dossier
                        setSelectedAudiences(allAudiences.filter((a: any) => a.dossier_id === dossier.id).map((a: any) => a.id))
                    } else {
                        setSelectedAudiences([])
                    }
                })
                .catch(err => console.error('Error fetching audiences:', err))
        }
    }, [open, dossier])

    const onSubmit = async (data: DossierFormData) => {
        setLoading(true)
        try {
            // Mapping frontend internal status -> backend expected status
            const statusMap: Record<string, string> = {
                'EN_COURS': 'ouvert',
                'TERMINE': 'cloture',
                'EN_ATTENTE': 'en_instance',
                'CLOTURE': 'cloture'
            };

            // Mapping frontend internal type -> backend expected type
            const typeMap: Record<string, string> = {
                'CONTENTIEUX': 'contentieux',
                'PRE_CONTENTIEUX': 'pre_contentieux',
                'TRANSACTIONNEL': 'transactionnel',
                'CONSEIL': 'conseil'
            };

            const payload: any = {
                client_id: data.clientId,
                titre: data.titre || null,
                type: data.typeDossier ? typeMap[data.typeDossier] || data.typeDossier.toLowerCase() : 'conseil',
                statut: data.statut ? statusMap[data.statut] || 'ouvert' : 'ouvert',
                juridiction: data.juridiction || null,
                description: data.description || null,
                domaine: data.domaineDroit || null,
                audiencesIds: selectedAudiences,
            };

            if (isEdit) {
                await api.patch(`/api/v1/dossiers/${dossier.id}`, payload)
            } else {
                await api.post('/api/v1/dossiers', payload)
            }

            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            console.error("Error saving dossier:", error?.response?.data || error)
            alert("Erreur lors de l'enregistrement du dossier: " + (error?.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier le dossier" : "Nouveau dossier"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Client *</Label>
                        <Select
                            value={watch("clientId")}
                            onValueChange={(value) => setValue("clientId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.type === "PERSONNE_PHYSIQUE"
                                            ? `${client.nom} ${client.prenom}`
                                            : client.raisonSociale}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.clientId && (
                            <p className="text-sm text-red-600">{errors.clientId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Titre du dossier</Label>
                        <Input {...register("titre")} placeholder="Ex: Affaire SIB c/ Kouamé - Recouvrement" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                                value={watch("type")}
                                onValueChange={(value) => setValue("type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CIVIL">Civil</SelectItem>
                                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                                    <SelectItem value="PENAL">Pénal</SelectItem>
                                    <SelectItem value="ADMINISTRATIF">Administratif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type de Dossier</Label>
                            <Select
                                value={watch("typeDossier") || ""}
                                onValueChange={(value) => setValue("typeDossier", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CONTENTIEUX">Contentieux</SelectItem>
                                    <SelectItem value="PRE_CONTENTIEUX">Pré-contentieux</SelectItem>
                                    <SelectItem value="TRANSACTIONNEL">Transactionnel</SelectItem>
                                    <SelectItem value="CONSEIL">Conseil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Domaine du Droit</Label>
                            <Select
                                value={watch("domaineDroit") || ""}
                                onValueChange={(value) => setValue("domaineDroit", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRAVAIL">Droit du travail</SelectItem>
                                    <SelectItem value="CIVIL">Droit civil</SelectItem>
                                    <SelectItem value="IMMOBILIER">Droit immobilier</SelectItem>
                                    <SelectItem value="COMMERCIAL">Droit commercial</SelectItem>
                                    <SelectItem value="AUTRE">Autres</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Audiences Liées (Sélection Multiple)</Label>
                            <div className="border rounded-md p-2 space-y-2 max-h-[82px] overflow-y-auto">
                                {audiences.length === 0 ? (
                                    <p className="text-sm text-slate-500">Aucune audience disponible.</p>
                                ) : (
                                    audiences.map(a => (
                                        <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300"
                                                checked={selectedAudiences.includes(a.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedAudiences([...selectedAudiences, a.id])
                                                    else setSelectedAudiences(selectedAudiences.filter(id => id !== a.id))
                                                }}
                                            />
                                            {a.titre || "Audience"} - {new Date(a.date).toLocaleDateString()}
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                    <SelectItem value="EN_COURS">En cours</SelectItem>
                                    <SelectItem value="TERMINE">Terminé</SelectItem>
                                    <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                                    <SelectItem value="CLOTURE">Clôturé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Avocat Assigné</Label>
                        <Select
                            value={watch("avocatAssigne") || ""}
                            onValueChange={(value) => setValue("avocatAssigne", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un avocat" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVOCATS.map((avocat) => (
                                    <SelectItem key={avocat} value={avocat}>
                                        {avocat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Juridiction</Label>
                        <Input {...register("juridiction")} placeholder="Ex: Tribunal de Commerce d'Abidjan" />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input {...register("description")} placeholder="Description du dossier" />
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
