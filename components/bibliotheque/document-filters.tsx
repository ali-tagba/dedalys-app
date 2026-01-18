"use client"

import { Select } from "@/components/ui/select"

interface DocumentFiltersProps {
    selectedCategorie: string
    selectedType: string
    onCategorieChange: (value: string) => void
    onTypeChange: (value: string) => void
}

export function DocumentFilters({
    selectedCategorie,
    selectedType,
    onCategorieChange,
    onTypeChange
}: DocumentFiltersProps) {
    return (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Catégorie
                    </label>
                    <select
                        value={selectedCategorie}
                        onChange={(e) => onCategorieChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">Toutes les catégories</option>
                        <option value="JURISPRUDENCE">Jurisprudence</option>
                        <option value="DECISION_JUSTICE">Décision de Justice</option>
                        <option value="DOCTRINE">Doctrine</option>
                        <option value="MODELE">Modèle</option>
                        <option value="INTERNE">Document Interne</option>
                        <option value="AUTRE">Autre</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Type de document
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => onTypeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">Tous les types</option>
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
        </div>
    )
}
