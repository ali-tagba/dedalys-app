"use client"

import { useState } from "react"
import { Plus, Search, Filter, FileText, Scale, BookOpen, FileCheck, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DocumentTable } from "@/components/bibliotheque/document-table"
import { DocumentFormDialog } from "@/components/bibliotheque/document-form-dialog"
import { DocumentFilters } from "@/components/bibliotheque/document-filters"

export default function BibliothequePage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [selectedCategorie, setSelectedCategorie] = useState<string>("ALL")
    const [selectedType, setSelectedType] = useState<string>("ALL")

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-none border-b border-slate-200 bg-white px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Bibliothèque Documentaire</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Gestion de la jurisprudence, décisions de justice et documents internes
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Document
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Scale className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-blue-600">Jurisprudence</p>
                                <p className="text-2xl font-bold text-blue-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                                <FileCheck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-purple-600">Décisions</p>
                                <p className="text-2xl font-bold text-purple-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-green-600">Doctrine</p>
                                <p className="text-2xl font-bold text-green-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                                <Folder className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-orange-600">Documents Internes</p>
                                <p className="text-2xl font-bold text-orange-900">0</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-3 mt-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher par titre, référence, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? "bg-blue-50 border-blue-200" : ""}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtres
                    </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <DocumentFilters
                        selectedCategorie={selectedCategorie}
                        selectedType={selectedType}
                        onCategorieChange={setSelectedCategorie}
                        onTypeChange={setSelectedType}
                    />
                )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <DocumentTable
                    searchQuery={searchQuery}
                    selectedCategorie={selectedCategorie}
                    selectedType={selectedType}
                />
            </div>

            {/* Create Dialog */}
            <DocumentFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    )
}
