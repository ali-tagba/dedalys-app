"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    ArrowLeft,
    Calendar,
    Folder,
    FileText,
    MoreHorizontal,
    Plus,
    Scale,
    LayoutGrid,
    List as ListIcon,
    ChevronRight,
    Search,
    Download,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Edit2,
    Palette,
    Building2,
    Briefcase,
    User
} from "lucide-react"
import { ModernFolderIcon, FolderColor } from "@/components/ui/modern-folder-icon"
import { RenameFolderDialog } from "@/components/dossiers/rename-folder-dialog"
import { ColorPicker } from "@/components/dossiers/color-picker"
import { Separator } from "@/components/ui/separator"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TimeTracker } from "@/components/dossiers/time-tracker"
import { cn } from "@/lib/utils"

// Status Configuration - matching API values
const statusConfig: any = {
    EN_COURS: { label: "En cours", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    EN_ATTENTE: { label: "En attente", color: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertCircle },
    CLOTURE: { label: "Clôturé", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },

    TERMINE: { label: "Terminé", color: "bg-slate-50 text-slate-700 border-slate-200", icon: CheckCircle2 },
    ARCHIVE: { label: "Archivé", color: "bg-slate-50 text-slate-700 border-slate-200", icon: Folder }
}

export default function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [dossier, setDossier] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState("documents")

    // File Manager State
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Rename/Color State
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const [selectedFolder, setSelectedFolder] = useState<any | null>(null)

    const fetchDossier = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/dossiers/${resolvedParams.id}`)
            if (!response.ok) {
                if (response.status === 404) return notFound()
                throw new Error('Failed to fetch dossier')
            }
            const data = await response.json()
            setDossier(data)
        } catch (error) {
            console.error('Error fetching dossier:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setMounted(true)
        fetchDossier()
    }, [resolvedParams.id])

    if (!mounted) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-200 border-t-blue-600"></div>
            </div>
        )
    }

    if (!dossier) return notFound()

    // Status Handling with fallback
    const statusKey = statusConfig[dossier.statut] ? dossier.statut : 'EN_COURS'
    const StatusConfig = statusConfig[statusKey] || statusConfig['EN_COURS']
    const StatusIcon = StatusConfig.icon

    // File Manager Logic - Mapping from DB flat list to folders/files
    const allFiles = dossier.files || []
    const folders = allFiles.filter((f: any) => f.type === 'FOLDER')
    const documents = allFiles.filter((f: any) => f.type === 'FILE')

    const currentFolders = folders.filter((f: any) => f.parentId === currentFolderId)
    const currentDocs = documents.filter((d: any) => d.parentId === currentFolderId)

    const getCurrentFolder = () => folders.find((f: any) => f.id === currentFolderId)

    const getBreadcrumbs = () => {
        const crumbs = []
        let current = getCurrentFolder()
        while (current) {
            crumbs.unshift(current)
            current = folders.find((f: any) => f.id === current?.parentId)
        }
        return crumbs
    }

    const formatSize = (bytes?: number) => {
        if (!bytes) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
    }

    const handleRenameFolder = async (newName: string) => {
        if (!selectedFolder) return

        try {
            const response = await fetch(`/api/dossiers/${resolvedParams.id}/files/${selectedFolder.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            })

            if (!response.ok) throw new Error('Erreur lors du renommage')

            await fetchDossier()
        } catch (error) {
            console.error('Error renaming folder:', error)
            throw error
        }
    }

    const handleColorChange = async (folderId: string, color: FolderColor) => {
        try {
            const response = await fetch(`/api/dossiers/${resolvedParams.id}/files/${folderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ color })
            })

            if (!response.ok) throw new Error('Erreur lors du changement de couleur')

            await fetchDossier()
        } catch (error) {
            console.error('Error changing color:', error)
        }
    }

    return (
        <div className="space-y-[var(--spacing-6)] h-[calc(100vh-100px)] flex flex-col p-[var(--container-padding)]">
            {/* Header */}
            <div className="flex-none">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dossiers">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">Dossier {dossier.numero}</h1>
                            <Badge variant="outline" className={StatusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {StatusConfig.label}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-mono text-sm mt-1">{dossier.type} • {dossier.juridiction}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Modifier</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                            Actions
                        </Button>
                    </div>
                </div>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent rounded-none p-0 space-x-6">
                        <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-2">
                            GED & Fichiers
                        </TabsTrigger>
                        <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-2">
                            Informations
                        </TabsTrigger>
                        <TabsTrigger value="audiences" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-2">
                            Audiences
                        </TabsTrigger>
                        <TabsTrigger value="facturation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent px-4 py-2">
                            Facturation
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* File Manager View */}
            {activeTab === "documents" && (
                <Card className="flex-1 flex flex-col shadow-sm overflow-hidden border-slate-200">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => setCurrentFolderId(null)}
                            >
                                <Folder className="h-4 w-4 mr-2 text-blue-500" />
                                Racine
                            </Button>
                            {getBreadcrumbs().map((folder) => (
                                <div key={folder.id} className="flex items-center">
                                    <ChevronRight className="h-4 w-4 text-slate-400 mx-1" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2"
                                        onClick={() => setCurrentFolderId(folder.id)}
                                    >
                                        {folder.name}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-white border rounded-lg flex items-center p-1">
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "secondary" : "ghost"}
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setViewMode("list")}
                                >
                                    <ListIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="h-8 w-px bg-slate-200 mx-2" />
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" /> Dossier
                            </Button>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" /> Fichier
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {currentFolders.length === 0 && currentDocs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Folder className="h-8 w-8 text-slate-300" />
                                </div>
                                <p>Dossier vide</p>
                                <p className="text-sm">Déposez des fichiers ici</p>
                            </div>
                        ) : (
                            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-2"}>
                                {/* Folders */}
                                {currentFolders.map((folder: any) => (
                                    <div
                                        key={folder.id}
                                        className={`
                                            group relative cursor-pointer rounded-xl border-2 border-transparent hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-transparent transition-all duration-200 hover:shadow-lg
                                            ${viewMode === "grid" ? "p-4 flex flex-col items-center text-center pb-6" : "p-3 flex items-center gap-3 border-slate-100 bg-white"}
                                        `}
                                    >
                                        {/* Main clickable area to open folder */}
                                        <div
                                            onClick={() => setCurrentFolderId(folder.id)}
                                            className="flex-1 flex flex-col items-center w-full"
                                        >
                                            <div className={viewMode === "grid" ? "mb-3 transform group-hover:scale-110 transition-transform duration-200" : ""}>
                                                <ModernFolderIcon
                                                    color={(folder.color as FolderColor) || 'blue'}
                                                    size={viewMode === "grid" ? "large" : "small"}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left w-full">
                                                <p className="font-semibold text-slate-800 truncate text-sm group-hover:text-blue-700 transition-colors">{folder.name}</p>
                                                {viewMode === "list" && <p className="text-xs text-slate-400">Dossier</p>}
                                            </div>
                                        </div>

                                        {/* Three dots menu button */}
                                        <div className={`absolute ${viewMode === "grid" ? "top-2 right-2" : "right-2"}`}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 rounded-full hover:bg-white/80 backdrop-blur-sm ${viewMode === "grid" ? "opacity-0 group-hover:opacity-100" : "opacity-70 hover:opacity-100"} transition-opacity`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedFolder(folder)
                                                            setRenameDialogOpen(true)
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        <span>Renommer</span>
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger className="cursor-pointer">
                                                            <Palette className="mr-2 h-4 w-4" />
                                                            <span>Changer la couleur</span>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent className="p-0">
                                                            <ColorPicker
                                                                selectedColor={(folder.color as FolderColor) || 'blue'}
                                                                onColorSelect={(color) => handleColorChange(folder.id, color)}
                                                            />
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}

                                {/* Files */}
                                {currentDocs.map((doc: any) => (
                                    <div
                                        key={doc.id}
                                        className={`
                                            group cursor-pointer rounded-xl border border-transparent hover:border-blue-200 hover:bg-slate-50 transition-all
                                            ${viewMode === "grid" ? "p-4 flex flex-col items-center text-center relative" : "p-3 flex items-center gap-3 border-slate-100"}
                                        `}
                                    >
                                        <div className={viewMode === "grid" ? "mb-3" : ""}>
                                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                                <FileText className="text-slate-500 h-6 w-6" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-700 truncate text-sm">{doc.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{doc.mimeType?.split('/')[1]?.toUpperCase() || 'FICHIER'} • {formatSize(doc.size)}</p>
                                        </div>

                                        {viewMode === "list" && (
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4 text-slate-400" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4 text-slate-400" /></Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Rename Dialog */}
            {selectedFolder && (
                <RenameFolderDialog
                    open={renameDialogOpen}
                    onOpenChange={setRenameDialogOpen}
                    currentName={selectedFolder.name}
                    onRename={handleRenameFolder}
                />
            )}

            {/* AUDIENCES TAB */}
            {activeTab === "audiences" && (
                <Card className="flex-1 shadow-sm overflow-hidden border-slate-200 p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Toutes les audiences du client</h3>
                        <p className="text-sm text-slate-500">Liste complète des audiences associées à {dossier.client?.raisonSociale || dossier.client?.nom}</p>
                    </div>
                    {dossier.client?.audiences && dossier.client.audiences.length > 0 ? (
                        <div className="space-y-4">
                            {dossier.client.audiences.map((audience: any) => (
                                <div key={audience.id} className={cn(
                                    "flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors",
                                    audience.dossierId === dossier.id ? "border-blue-200 bg-blue-50/20" : "border-slate-100"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex flex-col items-center justify-center",
                                            audience.dossierId === dossier.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                                        )}>
                                            <span className="text-xs font-bold">{new Date(audience.date).getDate()}</span>
                                            <span className="text-[10px] uppercase">{new Date(audience.date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{audience.titre}</h4>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span>{audience.juridiction || "Tribunal"} • {audience.heure}</span>
                                                {audience.dossierId !== dossier.id && (
                                                    <Badge variant="secondary" className="text-[10px] h-5">Autre dossier</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{audience.statut}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">Aucune audience trouvée pour ce client.</div>
                    )}
                </Card>
            )}

            {/* FACTURATION TAB */}
            {activeTab === "facturation" && (
                <Card className="flex-1 shadow-sm overflow-hidden border-slate-200 p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">Historique de Facturation</h3>
                        <p className="text-sm text-slate-500">Toutes les factures de {dossier.client?.raisonSociale || dossier.client?.nom}</p>
                    </div>
                    {dossier.client?.invoices && dossier.client.invoices.length > 0 ? (
                        <div className="overflow-auto border border-slate-200 rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Numéro</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Montant TTC</th>
                                        <th className="px-4 py-3 text-center">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {dossier.client.invoices.map((inv: any) => (
                                        <tr key={inv.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-700">{inv.numero}</td>
                                            <td className="px-4 py-3 text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-right font-mono">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(inv.montantTTC).replace('F\u202FCFA', 'FCFA')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="outline" className={
                                                    inv.statut === 'PAYEE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        inv.statut === 'IMPAYEE' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-orange-50 text-orange-700 border-orange-200'
                                                }>{inv.statut}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">Aucune facture trouvée pour ce client.</div>
                    )}
                </Card>
            )}

            {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* General Info Card */}
                    <Card className="col-span-2 shadow-sm border-slate-200 h-fit">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-600" /> Détails de la procédure
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Type de Dossier</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="rounded-md">
                                            {dossier.typeDossier === "CONTENTIEUX" ? "Contentieux" :
                                                dossier.typeDossier === "PRE_CONTENTIEUX" ? "Pré-contentieux" :
                                                    dossier.typeDossier === "TRANSACTIONNEL" ? "Transactionnel" :
                                                        dossier.typeDossier === "CONSEIL" ? "Conseil" :
                                                            dossier.typeDossier || "Non spécifié"}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Domaine du Droit</label>
                                    <div className="flex items-center gap-2">
                                        <Scale className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium text-slate-900">
                                            {dossier.domaineDroit === "TRAVAIL" ? "Droit du travail" :
                                                dossier.domaineDroit === "CIVIL" ? "Droit civil" :
                                                    dossier.domaineDroit === "IMMOBILIER" ? "Droit immobilier" :
                                                        dossier.domaineDroit === "COMMERCIAL" ? "Droit commercial" :
                                                            dossier.domaineDroit === "AUTRE" ? "Autres" :
                                                                dossier.domaineDroit || "Non spécifié"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Description / Notes</label>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
                                    {dossier.description || "Aucune description disponible pour ce dossier."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Side Info Column */}
                    <div className="space-y-6">

                        {/* Time Tracker Widget */}
                        <TimeTracker dossierId={dossier.id} />

                        {/* Jurisdiction & Dates */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                                <CardTitle className="text-sm font-semibold text-slate-900">Contexte Juridique</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-medium uppercase mb-1 block">Juridiction</label>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium">{dossier.juridiction || "Non définie"}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <label className="text-xs text-slate-500 font-medium uppercase mb-1 block">Avocat Assigné</label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium">{dossier.avocatAssigne || "Non assigné"}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <label className="text-xs text-slate-500 font-medium uppercase mb-1 block">Date d'ouverture</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <span className="font-mono text-sm">{new Date(dossier.dateOuverture).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Client Card */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                                <CardTitle className="text-sm font-semibold text-slate-900">Client Lié</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                        {dossier.client?.raisonSociale?.[0] || dossier.client?.nom?.[0] || "C"}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <Link href={`/clients/${dossier.clientId}`} className="font-medium text-blue-600 hover:underline truncate block">
                                            {dossier.client?.raisonSociale || `${dossier.client?.nom} ${dossier.client?.prenom}`}
                                        </Link>
                                        <p className="text-xs text-slate-500 truncate">{dossier.client?.email}</p>
                                    </div>
                                </div>
                                <Link href={`/clients/${dossier.clientId}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Voir la fiche client
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
