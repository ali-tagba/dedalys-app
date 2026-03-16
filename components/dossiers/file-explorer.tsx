"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

interface FileExplorerProps {
    dossierId: string
}

// ─── Color Config (matches original) ───────────────────────────────────────
const FOLDER_COLORS: { key: string; label: string; bg: string; text: string; icon: string }[] = [
    { key: 'blue', label: 'Bleu', bg: 'bg-blue-100', text: 'text-blue-500', icon: 'text-blue-400' },
    { key: 'red', label: 'Rouge', bg: 'bg-red-100', text: 'text-red-500', icon: 'text-red-400' },
    { key: 'green', label: 'Vert', bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-500' },
    { key: 'orange', label: 'Orange', bg: 'bg-orange-100', text: 'text-orange-500', icon: 'text-orange-400' },
    { key: 'purple', label: 'Violet', bg: 'bg-purple-100', text: 'text-purple-500', icon: 'text-purple-400' },
    { key: 'yellow', label: 'Jaune', bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'text-yellow-500' },
    { key: 'pink', label: 'Rose', bg: 'bg-pink-100', text: 'text-pink-500', icon: 'text-pink-400' },
    { key: 'gray', label: 'Gris', bg: 'bg-slate-100', text: 'text-slate-500', icon: 'text-slate-400' },
]

function getFolderColor(key?: string) {
    return FOLDER_COLORS.find(c => c.key === key) || FOLDER_COLORS[0]
}

// ─── File Icons ─────────────────────────────────────────────────────────────
const FILE_ICONS: Record<string, { icon: string; color: string }> = {
    pdf: { icon: 'picture_as_pdf', color: 'text-red-500' },
    doc: { icon: 'description', color: 'text-blue-600' },
    docx: { icon: 'description', color: 'text-blue-600' },
    xls: { icon: 'table_chart', color: 'text-emerald-600' },
    xlsx: { icon: 'table_chart', color: 'text-emerald-600' },
    ppt: { icon: 'present_to_all', color: 'text-orange-500' },
    pptx: { icon: 'present_to_all', color: 'text-orange-500' },
    png: { icon: 'image', color: 'text-purple-500' },
    jpg: { icon: 'image', color: 'text-purple-500' },
    jpeg: { icon: 'image', color: 'text-purple-500' },
    gif: { icon: 'gif', color: 'text-purple-400' },
    mp4: { icon: 'videocam', color: 'text-blue-500' },
    mp3: { icon: 'music_note', color: 'text-pink-500' },
    zip: { icon: 'archive', color: 'text-amber-500' },
    rar: { icon: 'archive', color: 'text-amber-500' },
    txt: { icon: 'text_snippet', color: 'text-slate-500' },
    csv: { icon: 'table_rows', color: 'text-emerald-500' },
    default: { icon: 'insert_drive_file', color: 'text-slate-400' }
}

function getFileIcon(filename: string) {
    const ext = filename?.split('.').pop()?.toLowerCase() || ''
    return FILE_ICONS[ext] || FILE_ICONS.default
}

function formatSize(bytes?: number) {
    if (!bytes) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(s: string) {
    if (!s) return "—"
    return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function FileExplorer({ dossierId }: FileExplorerProps) {
    const [files, setFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newItemType, setNewItemType] = useState<'folder' | 'file'>('folder')
    const [newItemName, setNewItemName] = useState('')
    const [newItemColor, setNewItemColor] = useState('blue')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editItem, setEditItem] = useState<any>(null)
    const [editItemName, setEditItemName] = useState('')
    const [editItemColor, setEditItemColor] = useState('blue')

    // Navigation
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
    const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([
        { id: null, name: 'GED' }
    ])

    // ── Data Fetching ──────────────────────────────────────────────────────
    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get(`/api/v1/fichiers/dossier/${dossierId}`)
            setFiles(response.data.data || response.data || [])
        } catch (err: any) {
            console.error('Error fetching files:', err)
            setError(err.response?.data?.error || 'Erreur lors du chargement des fichiers')
        } finally {
            setLoading(false)
        }
    }, [dossierId])

    useEffect(() => { fetchFiles() }, [fetchFiles])

    // ── Current view ───────────────────────────────────────────────────────
    const currentFiles = files.filter(f => f.parent_id === currentFolderId)
    const folderItems = currentFiles.filter(f => f.is_folder)
    const fileItems = currentFiles.filter(f => !f.is_folder)

    // ── Navigation ──────────────────────────────────────────────────────────
    const navigateTo = (folder: any) => {
        setCurrentFolderId(folder.id)
        setBreadcrumb(prev => [...prev, { id: folder.id, name: folder.nom }])
    }

    const navigateToBreadcrumb = (index: number) => {
        const newCrumb = breadcrumb.slice(0, index + 1)
        setBreadcrumb(newCrumb)
        setCurrentFolderId(newCrumb[newCrumb.length - 1].id)
    }

    const createFolder = async () => {
        if (!newItemName.trim()) return
        try {
            await api.post(`/api/v1/fichiers/dossier/${dossierId}/folder`, {
                nom: newItemName.trim(),
                parent_id: currentFolderId,
                couleur: newItemColor,
                chemin_stockage: ""
            })
            setCreateDialogOpen(false)
            setNewItemName('')
            setNewItemColor('blue')
            fetchFiles()
        } catch (err: any) {
            console.error('Create folder error:', err.response?.data)
            alert(err.response?.data?.error || 'Erreur lors de la création du dossier')
        }
    }

    // ── Upload File ──────────────────────────────────────────────────────────
    const uploadFile = async () => {
        if (!selectedFile) return
        setUploading(true)
        setUploadProgress(10)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            if (currentFolderId) formData.append('parent_id', currentFolderId)
            setUploadProgress(40)
            await api.post(`/api/v1/fichiers/dossier/${dossierId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setUploadProgress(100)
            setCreateDialogOpen(false)
            setSelectedFile(null)
            setUploadProgress(0)
            fetchFiles()
        } catch (err: any) {
            console.error('Upload error:', err.response?.data)
            alert(err.response?.data?.error || 'Erreur lors du téléversement')
        } finally {
            setUploading(false)
        }
    }

    // ── Delete Item ──────────────────────────────────────────────────────────
    const deleteItem = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Supprimer cet élément ? Cette action est irréversible.')) return
        try {
            await api.delete(`/api/v1/fichiers/${id}`)
            setFiles(prev => prev.filter(f => f.id !== id))
        } catch (err: any) {
            alert(err.response?.data?.error || 'Erreur lors de la suppression')
        }
    }

    // ── Open dialog helpers ──────────────────────────────────────────────────
    const openFolderDialog = () => {
        setNewItemType('folder')
        setNewItemName('')
        setNewItemColor('blue')
        setCreateDialogOpen(true)
    }

    const openUploadDialog = () => {
        setNewItemType('file')
        setSelectedFile(null)
        setCreateDialogOpen(true)
    }

    const openEditDialog = (item: any) => {
        setEditItem(item)
        setEditItemName(item.nom)
        setEditItemColor(item.couleur || 'blue')
        setEditDialogOpen(true)
    }

    const saveEdit = async () => {
        if (!editItemName.trim() || !editItem) return
        try {
            await api.patch(`/api/v1/fichiers/${editItem.id}`, {
                nom: editItemName.trim(),
                couleur: editItemColor
            })
            setEditDialogOpen(false)
            setEditItem(null)
            fetchFiles()
        } catch (err: any) {
            console.error('Edit error:', err.response?.data)
            alert(err.response?.data?.error || 'Erreur lors de la modification')
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">

                {/* ── Toolbar ─────────────────────────────────────────── */}
                <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm min-w-0 flex-1 overflow-hidden">
                        {breadcrumb.map((crumb, i) => (
                            <div key={crumb.id || 'root'} className="flex items-center shrink-0">
                                <button
                                    onClick={() => i !== breadcrumb.length - 1 && navigateToBreadcrumb(i)}
                                    className={`transition-colors truncate max-w-[160px] ${i === breadcrumb.length - 1
                                        ? 'font-semibold text-slate-900 cursor-default'
                                        : 'text-blue-600 hover:underline cursor-pointer'}`}
                                >
                                    {i === 0 && <span className="material-symbols-outlined text-[15px] align-middle mr-1 -mt-0.5">drive_folder_upload</span>}
                                    {crumb.name}
                                </button>
                                {i < breadcrumb.length - 1 && (
                                    <span className="material-symbols-outlined text-[16px] text-slate-300 mx-0.5">chevron_right</span>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* View toggle */}
                        <div className="flex items-center bg-slate-100 rounded p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                title="Vue galerie"
                                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                title="Vue liste"
                                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-700'}`}
                            >
                                <span className="material-symbols-outlined text-[16px]">view_list</span>
                            </button>
                        </div>

                        <button
                            onClick={openFolderDialog}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded hover:bg-slate-50 transition-all"
                        >
                            <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
                            Nouveau dossier
                        </button>
                        <button
                            onClick={openUploadDialog}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[16px]">upload_file</span>
                            Téléverser
                        </button>
                    </div>
                </div>

                {/* ── Content ─────────────────────────────────────────── */}
                <div className="p-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-200 border-t-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                            <span className="material-symbols-outlined text-4xl text-red-300 mb-3">error</span>
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                            <button onClick={fetchFiles} className="mt-3 text-sm text-blue-600 hover:underline">Réessayer</button>
                        </div>
                    ) : currentFiles.length === 0 ? (
                        <EmptyState onNewFolder={openFolderDialog} onUpload={openUploadDialog} />
                    ) : viewMode === 'grid' ? (
                        <GridView
                            folderItems={folderItems}
                            fileItems={fileItems}
                            onNavigate={navigateTo}
                            onDelete={deleteItem}
                            onEdit={openEditDialog}
                        />
                    ) : (
                        <ListView
                            folderItems={folderItems}
                            fileItems={fileItems}
                            onNavigate={navigateTo}
                            onDelete={deleteItem}
                            onEdit={openEditDialog}
                        />
                    )}
                </div>
            </div>

            {/* ── Create / Upload Dialog ─────────────────────────────── */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {newItemType === 'folder' ? 'Nouveau sous-dossier' : 'Téléverser un document'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {newItemType === 'folder' ? (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nom du dossier</label>
                                    <Input
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        placeholder="Ex : Pièces produites, Conclusions..."
                                        onKeyDown={e => e.key === 'Enter' && createFolder()}
                                        autoFocus
                                    />
                                </div>
                                {/* Color Picker */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Couleur du dossier</label>
                                    <div className="flex flex-wrap gap-2">
                                        {FOLDER_COLORS.map(c => (
                                            <button
                                                key={c.key}
                                                title={c.label}
                                                onClick={() => setNewItemColor(c.key)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${c.bg} ${newItemColor === c.key ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                                            >
                                                <span className={`material-symbols-outlined text-[16px] ${c.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1.5">
                                        Couleur choisie : <span className="font-medium text-slate-600">{getFolderColor(newItemColor).label}</span>
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Sélectionner un fichier</label>
                                <Input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {uploading && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>Téléversement en cours...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
                        <Button
                            onClick={newItemType === 'folder' ? createFolder : uploadFile}
                            disabled={(newItemType === 'folder' && !newItemName.trim()) || (newItemType === 'file' && !selectedFile) || uploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {uploading ? 'En cours...' : (newItemType === 'folder' ? 'Créer' : 'Téléverser')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Folder Dialog ─────────────────────────────── */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le dossier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nouveau nom du dossier</label>
                            <Input
                                value={editItemName}
                                onChange={(e) => setEditItemName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                autoFocus
                            />
                        </div>
                        {/* Editor Color Picker */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Couleur du dossier</label>
                            <div className="flex flex-wrap gap-2">
                                {FOLDER_COLORS.map(c => (
                                    <button
                                        key={c.key}
                                        onClick={() => setEditItemColor(c.key)}
                                        className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center border-2 transition-all ${editItemColor === c.key ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                                            }`}
                                        title={c.label}
                                    >
                                        {editItemColor === c.key && <span className={`material-symbols-outlined text-[16px] ${c.text}`}>check</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Annuler</Button>
                        <Button
                            onClick={saveEdit}
                            disabled={!editItemName.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onNewFolder, onUpload }: { onNewFolder: () => void; onUpload: () => void }) {
    return (
        <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
            <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4">folder_open</span>
            <p className="text-slate-600 font-medium mb-1">Dossier vide</p>
            <p className="text-sm text-slate-400 mb-6">Ajoutez des documents ou créez un sous-dossier.</p>
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={onNewFolder}
                    className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                    <span className="material-symbols-outlined text-[15px] align-middle mr-1">create_new_folder</span>
                    Nouveau dossier
                </button>
                <button
                    onClick={onUpload}
                    className="text-sm text-white bg-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <span className="material-symbols-outlined text-[15px] align-middle mr-1">upload_file</span>
                    Téléverser un fichier
                </button>
            </div>
        </div>
    )
}

// ─── Grid View (Gallery) ──────────────────────────────────────────────────────
function GridView({
    folderItems, fileItems, onNavigate, onDelete, onEdit
}: {
    folderItems: any[]; fileItems: any[];
    onNavigate: (f: any) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onEdit: (item: any) => void;
}) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {folderItems.map(item => {
                const col = getFolderColor(item.couleur)
                return (
                    <div
                        key={item.id}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-slate-100/50 shadow-sm hover:shadow-md hover:-translate-y-1 relative ${col.bg} hover:opacity-95`}
                        onClick={() => onNavigate(item)}
                        title={item.nom}
                    >
                        {/* OS Style (Windows 11/Mac) Folder Icon */}
                        <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                            className="transition-transform duration-300 group-hover:scale-[1.05] drop-shadow-sm">
                            {/* Back flap */}
                            <path d="M4 14C4 10.6863 6.68629 8 10 8H24C25.6569 8 27.2456 8.65848 28.4175 9.83042L31.5858 13H54C57.3137 13 60 15.6863 60 19V50C60 53.3137 57.3137 56 54 56H10C6.68629 56 4 53.3137 4 50V14Z"
                                fill={col.key === 'blue' ? '#93C5FD' : col.key === 'green' ? '#6EE7B7' : col.key === 'red' ? '#FCA5A5' : col.key === 'orange' ? '#FCD34D' : col.key === 'purple' ? '#C4B5FD' : col.key === 'yellow' ? '#FDE047' : col.key === 'pink' ? '#FBCFE8' : '#CBD5E1'} />
                            {/* Front flap */}
                            <path d="M4 22C4 18.6863 6.68629 16 10 16H54C57.3137 16 60 18.6863 60 22V50C60 53.3137 57.3137 56 54 56H10C6.68629 56 4 53.3137 4 50V22Z"
                                fill={col.key === 'blue' ? '#3B82F6' : col.key === 'green' ? '#10B981' : col.key === 'red' ? '#EF4444' : col.key === 'orange' ? '#F59E0B' : col.key === 'purple' ? '#8B5CF6' : col.key === 'yellow' ? '#FACC15' : col.key === 'pink' ? '#EC4899' : '#94A3B8'} />
                            {/* Inner highlight */}
                            <path d="M4 22C4 18.6863 6.68629 16 10 16H54C57.3137 16 60 18.6863 60 22V26H4V22Z"
                                fill="white" fillOpacity="0.25" />
                        </svg>
                        <span className="text-sm font-semibold text-slate-800 text-center line-clamp-2 leading-snug w-full px-1 hover:text-blue-700 transition-colors" style={{ wordBreak: 'break-word' }}>{item.nom}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-slate-900/10 text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="cursor-pointer gap-2 focus:bg-slate-50">
                                    <span className="material-symbols-outlined text-[15px] text-slate-500">edit</span>
                                    <span>Modifier & couleur</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert("Module en construction"); }} className="cursor-pointer gap-2 focus:bg-slate-50">
                                    <span className="material-symbols-outlined text-[15px] text-slate-500">drive_file_move</span>
                                    <span>Déplacer</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-100" />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(item.id, e); }} className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <span className="material-symbols-outlined text-[15px]">delete</span>
                                    <span>Supprimer</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            })}
            {fileItems.map(item => {
                const { icon, color } = getFileIcon(item.nom)
                return (
                    <div
                        key={item.id}
                        className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white cursor-pointer transition-all duration-300 border border-slate-100/50 shadow-sm hover:shadow-md hover:-translate-y-1 relative bg-slate-50/30"
                        title={item.nom}
                    >
                        <span className={`material-symbols-outlined text-[72px] ${color} transition-transform duration-300 group-hover:scale-[1.03] drop-shadow-sm`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>
                            {icon}
                        </span>
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-slate-800 text-center line-clamp-2 leading-snug hover:text-blue-600 transition-colors px-1 w-full"
                            style={{ wordBreak: 'break-word' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {item.nom}
                        </a>
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-full">{formatSize(item.taille)}</span>
                        <button
                            onClick={(e) => onDelete(item.id, e)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full bg-white/80 text-red-400 hover:text-red-600 hover:bg-white transition-all duration-200 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[13px]">delete</span>
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

// ─── List View (Drive/Dropbox style) ─────────────────────────────────────────
function ListView({
    folderItems, fileItems, onNavigate, onDelete, onEdit
}: {
    folderItems: any[]; fileItems: any[];
    onNavigate: (f: any) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    onEdit: (item: any) => void;
}) {
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_130px_100px_100px] items-center px-4 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
                <div className="w-8"></div>
                <div>Nom</div>
                <div>Modifié</div>
                <div className="text-right">Taille</div>
                <div></div>
            </div>

            {/* Folders */}
            {folderItems.map(item => {
                const col = getFolderColor(item.couleur)
                return (
                    <div
                        key={item.id}
                        className="group grid grid-cols-[auto_1fr_130px_100px_100px] items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                        onClick={() => onNavigate(item)}
                    >
                        <div className="w-8 flex items-center justify-center">
                            <span className={`material-symbols-outlined text-[26px] ${col.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0 pr-4">
                            <span className="text-sm font-medium text-slate-800 truncate">{item.nom}</span>
                        </div>
                        <div className="text-xs text-slate-400 truncate">{formatDate(item.created_at)}</div>
                        <div className="text-xs text-slate-400 text-right">—</div>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="cursor-pointer gap-2 focus:bg-slate-50">
                                        <span className="material-symbols-outlined text-[15px] text-slate-500">edit</span>
                                        <span>Modifier & couleur</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); alert("Module en construction"); }} className="cursor-pointer gap-2 focus:bg-slate-50">
                                        <span className="material-symbols-outlined text-[15px] text-slate-500">drive_file_move</span>
                                        <span>Déplacer</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(item.id, e); }} className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                                        <span className="material-symbols-outlined text-[15px]">delete</span>
                                        <span>Supprimer</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                )
            })}

            {/* Divider between folders and files */}
            {folderItems.length > 0 && fileItems.length > 0 && (
                <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Fichiers</span>
                </div>
            )}

            {/* Files */}
            {fileItems.map(item => {
                const { icon, color } = getFileIcon(item.nom)
                return (
                    <div
                        key={item.id}
                        className="group grid grid-cols-[auto_1fr_130px_100px_100px] items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                    >
                        <div className="w-8 flex items-center justify-center">
                            <span className={`material-symbols-outlined text-[22px] ${color}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>{icon}</span>
                        </div>
                        <div className="flex items-center min-w-0 pr-4">
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-medium text-slate-800 hover:text-blue-600 transition-colors truncate"
                                onClick={e => e.stopPropagation()}
                            >
                                {item.nom}
                            </a>
                        </div>
                        <div className="text-xs text-slate-400 truncate">{formatDate(item.created_at)}</div>
                        <div className="text-xs text-slate-400 text-right">{formatSize(item.taille)}</div>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.url && (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-blue-50 text-slate-300 hover:text-blue-500 transition-all"
                                    title="Ouvrir/Télécharger"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <span className="material-symbols-outlined text-[15px]">download</span>
                                </a>
                            )}
                            <button
                                onClick={(e) => onDelete(item.id, e)}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                                title="Supprimer"
                            >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                        </div>
                    </div>
                )
            })}

            {/* True empty state for list mode */}
            {folderItems.length === 0 && fileItems.length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400 italic">Ce dossier est vide.</div>
            )}
        </div>
    )
}
