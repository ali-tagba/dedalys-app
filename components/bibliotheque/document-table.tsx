"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Eye, Pencil, Trash2, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

interface Document {
    id: string
    titre: string
    categorie: string
    type: string | null
    juridiction: string | null
    reference: string | null
    dateDocument: Date | null
    description: string | null
    tags: string | null
    fileName: string | null
    fileSize: number | null
    statut: string
    createdAt: Date
}

interface DocumentTableProps {
    searchQuery: string
    selectedCategorie: string
    selectedType: string
}

const CATEGORIE_COLORS: Record<string, string> = {
    JURISPRUDENCE: "bg-blue-100 text-blue-700 border-blue-200",
    DECISION_JUSTICE: "bg-purple-100 text-purple-700 border-purple-200",
    DOCTRINE: "bg-green-100 text-green-700 border-green-200",
    MODELE: "bg-yellow-100 text-yellow-700 border-yellow-200",
    INTERNE: "bg-orange-100 text-orange-700 border-orange-200",
    AUTRE: "bg-slate-100 text-slate-700 border-slate-200",
}

const CATEGORIE_LABELS: Record<string, string> = {
    JURISPRUDENCE: "Jurisprudence",
    DECISION_JUSTICE: "Décision de Justice",
    DOCTRINE: "Doctrine",
    MODELE: "Modèle",
    INTERNE: "Document Interne",
    AUTRE: "Autre",
}

export function DocumentTable({ searchQuery, selectedCategorie, selectedType }: DocumentTableProps) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/documents')
            if (response.ok) {
                const data = await response.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = searchQuery === "" ||
            doc.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.tags?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategorie = selectedCategorie === "ALL" || doc.categorie === selectedCategorie
        const matchesType = selectedType === "ALL" || doc.type === selectedType

        return matchesSearch && matchesCategorie && matchesType
    })

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return "-"
        const kb = bytes / 1024
        if (kb < 1024) return `${kb.toFixed(1)} KB`
        return `${(kb / 1024).toFixed(1)} MB`
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "-"
        return new Date(date).toLocaleDateString('fr-FR')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-slate-500">Chargement des documents...</p>
                </div>
            </div>
        )
    }

    if (filteredDocuments.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="Aucun document trouvé"
                description={searchQuery || selectedCategorie !== "ALL" || selectedType !== "ALL"
                    ? "Aucun document ne correspond à vos critères de recherche"
                    : "Commencez par ajouter votre premier document à la bibliothèque"}
                actionLabel="Nouveau Document"
                onAction={() => window.location.reload()}
            />
        )
    }

    return (
        <div className="bg-white">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Document
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Catégorie
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Type
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Juridiction
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Date
                        </th>
                        <th className="text-left py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Tags
                        </th>
                        <th className="text-right py-3 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-slate-900 truncate">{doc.titre}</p>
                                        {doc.reference && (
                                            <p className="text-xs text-slate-500 mt-0.5">Réf: {doc.reference}</p>
                                        )}
                                        {doc.fileName && (
                                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {doc.fileName} ({formatFileSize(doc.fileSize)})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <Badge className={CATEGORIE_COLORS[doc.categorie] || CATEGORIE_COLORS.AUTRE}>
                                    {CATEGORIE_LABELS[doc.categorie] || doc.categorie}
                                </Badge>
                            </td>
                            <td className="py-4 px-6">
                                <span className="text-sm text-slate-600">{doc.type || "-"}</span>
                            </td>
                            <td className="py-4 px-6">
                                <span className="text-sm text-slate-600">{doc.juridiction || "-"}</span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    {formatDate(doc.dateDocument)}
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                {doc.tags ? (
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <Tag className="h-3 w-3 text-slate-400" />
                                        {doc.tags.split(',').slice(0, 2).map((tag, i) => (
                                            <span key={i} className="text-xs text-slate-500">
                                                {tag.trim()}
                                                {i < Math.min(doc.tags!.split(',').length - 1, 1) && ','}
                                            </span>
                                        ))}
                                        {doc.tags.split(',').length > 2 && (
                                            <span className="text-xs text-slate-400">+{doc.tags.split(',').length - 2}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm text-slate-400">-</span>
                                )}
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {doc.fileName && (
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
