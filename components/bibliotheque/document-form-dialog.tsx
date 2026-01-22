"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface DocumentFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    document?: any
}

export function DocumentFormDialog({ open, onOpenChange, document }: DocumentFormDialogProps) {
    const [formData, setFormData] = useState({
        titre: document?.titre || "",
        categorie: document?.categorie || "JURISPRUDENCE",
        type: document?.type || "",
        juridiction: document?.juridiction || "",
        reference: document?.reference || "",
        dateDocument: document?.dateDocument || "",
        description: document?.description || "",
        tags: document?.tags || "",
        auteur: document?.auteur || "",
        source: document?.source || "",
        notes: document?.notes || "",
    })

    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/documents', {
                method: document ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    id: document?.id,
                }),
            })

            if (response.ok) {
                onOpenChange(false)
                window.location.reload()
            }
        } catch (error) {
            console.error('Error saving document:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {document ? "Modifier le document" : "Nouveau document"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Titre */}
                    <div>
                        <Label htmlFor="titre">Titre du document *</Label>
                        <Input
                            id="titre"
                            value={formData.titre}
                            onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                            placeholder="Ex: Arrêt Cour d'Appel de Niamey..."
                            required
                        />
                    </div>

                    {/* Catégorie et Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="categorie">Catégorie *</Label>
                            <select
                                id="categorie"
                                value={formData.categorie}
                                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="JURISPRUDENCE">Jurisprudence</option>
                                <option value="DECISION_JUSTICE">Décision de Justice</option>
                                <option value="DOCTRINE">Doctrine</option>
                                <option value="MODELE">Modèle</option>
                                <option value="INTERNE">Document Interne</option>
                                <option value="AUTRE">Autre</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Sélectionner...</option>
                                <option value="ARRET">Arrêt</option>
                                <option value="JUGEMENT">Jugement</option>
                                <option value="ORDONNANCE">Ordonnance</option>
                                <option value="ARTICLE">Article</option>
                                <option value="MEMOIRE">Mémoire</option>
                                <option value="CONTRAT">Contrat Type</option>
                                <option value="PROCEDURE">Procédure</option>
                                <option value="NOTE">Note</option>
                            </select>
                        </div>
                    </div>

                    {/* Juridiction et Référence */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="juridiction">Juridiction</Label>
                            <Input
                                id="juridiction"
                                value={formData.juridiction}
                                onChange={(e) => setFormData({ ...formData, juridiction: e.target.value })}
                                placeholder="Ex: Cour d'Appel de Niamey"
                            />
                        </div>

                        <div>
                            <Label htmlFor="reference">Référence</Label>
                            <Input
                                id="reference"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder="Ex: Arrêt n°123/2024"
                            />
                        </div>
                    </div>

                    {/* Date du document */}
                    <div>
                        <Label htmlFor="dateDocument">Date du document</Label>
                        <Input
                            id="dateDocument"
                            type="date"
                            value={formData.dateDocument}
                            onChange={(e) => setFormData({ ...formData, dateDocument: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description / Résumé</Label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Résumé du contenu du document..."
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="Ex: droit commercial, contrat, Niger"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Les tags facilitent la recherche et le classement
                        </p>
                    </div>

                    {/* Auteur et Source */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="auteur">Auteur</Label>
                            <Input
                                id="auteur"
                                value={formData.auteur}
                                onChange={(e) => setFormData({ ...formData, auteur: e.target.value })}
                                placeholder="Nom de l'auteur"
                            />
                        </div>

                        <div>
                            <Label htmlFor="source">Source</Label>
                            <Input
                                id="source"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                placeholder="Source du document"
                            />
                        </div>
                    </div>

                    {/* Notes internes */}
                    <div>
                        <Label htmlFor="notes">Notes internes</Label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Notes privées pour usage interne..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Upload de fichier */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-700 mb-1">
                            Glissez un fichier ici ou cliquez pour parcourir
                        </p>
                        <p className="text-xs text-slate-500">
                            PDF, DOCX, DOC (max. 10 MB)
                        </p>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="mt-3 inline-block px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                            Sélectionner un fichier
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Enregistrement..." : document ? "Mettre à jour" : "Créer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
