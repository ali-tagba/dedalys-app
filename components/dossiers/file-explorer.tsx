"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Folder, File, Plus, Upload, MoreVertical, Trash2, Edit2, FolderPlus } from "lucide-react"

import { api } from "@/lib/api"
import { formatBytes } from "@/lib/utils" // Assumes formatBytes utility or we can just keep the calculation

interface FileExplorerProps {
    dossierId: string
}

export function FileExplorer({ dossierId }: FileExplorerProps) {
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [newItemType, setNewItemType] = useState<"folder" | "file">("folder")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Navigation state
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | null, name: string }>>([
        { id: null, name: "Racine" }
    ])

    const fetchFiles = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/api/v1/fichiers/dossier/${dossierId}`)
            setFiles(response.data.data || response.data || [])
        } catch (error) {
            console.error('Error fetching files:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFiles()
    }, [dossierId])

    const createFolder = async () => {
        try {
            await api.post(`/api/v1/fichiers/dossier/${dossierId}/folder`, {
                nom: newItemName,
                parent_id: currentFolderId
            })
            setCreateDialogOpen(false)
            setNewItemName("")
            fetchFiles()
        } catch (error) {
            console.error('Error creating folder:', error)
            alert('Erreur lors de la création du dossier')
        }
    }

    const uploadFile = async () => {
        if (!selectedFile) return

        try {
            const formData = new FormData()
            formData.append("file", selectedFile)
            if (currentFolderId) {
                formData.append("parent_id", currentFolderId)
            }

            await api.post(`/api/v1/fichiers/dossier/${dossierId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            setCreateDialogOpen(false)
            setSelectedFile(null)
            fetchFiles()
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Erreur lors du téléversement')
        }
    }

    const deleteItem = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return
        try {
            await api.delete(`/api/v1/fichiers/${id}`)
            fetchFiles()
        } catch (error) {
            console.error('Error deleting item:', error)
            alert('Erreur lors de la suppression')
        }
    }

    // Filter files to only show those in the current folder
    const currentFiles = files.filter(f => f.parent_id === currentFolderId)

    const navigateTo = (folder: any) => {
        setCurrentFolderId(folder.id)
        setBreadcrumb(prev => [...prev, { id: folder.id, name: folder.nom }])
    }

    const navigateToBreadcrumb = (index: number) => {
        const newBreadcrumb = breadcrumb.slice(0, index + 1)
        setBreadcrumb(newBreadcrumb)
        setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 font-medium">
                    {breadcrumb.map((crumb, index) => (
                        <div key={crumb.id || 'root'} className="flex items-center">
                            <span
                                className={`cursor-pointer hover:text-blue-600 transition-colors ${index === breadcrumb.length - 1 ? 'text-slate-900 font-semibold cursor-default hover:text-slate-900' : ''}`}
                                onClick={() => index !== breadcrumb.length - 1 && navigateToBreadcrumb(index)}
                            >
                                {crumb.name}
                            </span>
                            {index < breadcrumb.length - 1 && <span className="mx-2 text-slate-400">/</span>}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setNewItemType("folder")
                            setCreateDialogOpen(true)
                        }}
                    >
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Nouveau dossier
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            setNewItemType("file")
                            setCreateDialogOpen(true)
                        }}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Téléverser
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : currentFiles.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                    <Folder className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-500">Aucun document dans ce dossier</p>
                    <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                            setNewItemType("folder")
                            setCreateDialogOpen(true)
                        }}
                    >
                        Créer un dossier ici
                    </Button>
                </div>
            ) : (
                <div className="border rounded-lg divide-y">
                    {currentFiles.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {item.is_folder ? (
                                    <div
                                        className="flex items-center gap-3 cursor-pointer hover:underline"
                                        onClick={() => navigateTo(item)}
                                    >
                                        <Folder className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium text-sm">{item.nom}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <File className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-medium text-sm text-blue-600 hover:underline"
                                            >
                                                {item.nom}
                                            </a>
                                            <p className="text-xs text-slate-500">
                                                {(item.taille / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {newItemType === "folder" ? "Nouveau dossier" : "Téléverser un fichier"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {newItemType === "folder" ? (
                            <div>
                                <label className="text-sm font-medium">Nom du dossier</label>
                                <Input
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Nouveau dossier"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Sélectionner un document (PDF, DOCX, Img...)</label>
                                <Input
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setSelectedFile(e.target.files[0])
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={newItemType === "folder" ? createFolder : uploadFile}
                            disabled={newItemType === "folder" ? !newItemName : !selectedFile}
                        >
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
