"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { api } from "@/lib/api"

interface Note {
    id: string
    contenu: string
    created_at: string
    auteur_id?: string
}

interface MentionItem {
    id: string
    label: string
    type: 'folder' | 'file'
    url?: string
    icon: string
    color: string
}

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

function formatTime(s: string) {
    const d = new Date(s)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 1000
    if (diff < 60) return "À l'instant"
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Single Note Card ──────────────────────────────────────────────────────────
function NoteCard({
    note, dossierId, gedItems, onDeleted, onUpdated
}: {
    note: Note; dossierId: string; gedItems: MentionItem[];
    onDeleted: (id: string) => void;
    onUpdated: (id: string, contenu: string) => void;
}) {
    const [editing, setEditing] = useState(false)
    const [text, setText] = useState(note.contenu)
    const [saving, setSaving] = useState(false)
    const [showMention, setShowMention] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [cursorPos, setCursorPos] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const debouncedText = useDebounce(text, 2000)

    const filteredMentions = gedItems.filter(i =>
        mentionQuery === '' || i.label.toLowerCase().includes(mentionQuery.toLowerCase())
    ).slice(0, 8)

    const saveNote = useCallback(async (content: string) => {
        setSaving(true)
        try {
            await api.patch(`/api/v1/dossiers/${dossierId}/notes/${note.id}`, { contenu: content })
            onUpdated(note.id, content)
        } catch (e) {
            console.error('Save note error:', e)
        } finally {
            setSaving(false)
        }
    }, [dossierId, note.id, onUpdated])

    const deleteNote = async () => {
        if (!confirm('Supprimer cette note ?')) return
        try {
            await api.delete(`/api/v1/dossiers/${dossierId}/notes/${note.id}`)
            onDeleted(note.id)
        } catch (e) {
            alert('Erreur lors de la suppression')
        }
    }

    // Auto-save on debounce when editing
    const isFirst = useRef(true)
    useEffect(() => {
        if (isFirst.current) { isFirst.current = false; return }
        if (editing) saveNote(debouncedText)
    }, [debouncedText])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value
        const pos = e.target.selectionStart ?? val.length
        setText(val)
        setCursorPos(pos)
        const textBefore = val.slice(0, pos)
        const slashMatch = textBefore.match(/\/([^/\n]*)$/)
        if (slashMatch) {
            setMentionQuery(slashMatch[1])
            setShowMention(true)
            setSelectedIdx(0)
        } else {
            setShowMention(false)
        }
    }

    const insertMention = (item: MentionItem) => {
        const textBefore = text.slice(0, cursorPos)
        const textAfter = text.slice(cursorPos)
        const slashIdx = textBefore.lastIndexOf('/')
        const tag = item.url ? `[📎 ${item.label}](${item.url})` : `[📁 ${item.label}]`
        const newText = textBefore.slice(0, slashIdx) + tag + ' ' + textAfter
        setText(newText)
        setShowMention(false)
        setTimeout(() => {
            if (textareaRef.current) {
                const newPos = slashIdx + tag.length + 1
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(newPos, newPos)
            }
        }, 0)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showMention) return
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filteredMentions.length - 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
        if (e.key === 'Enter' && filteredMentions[selectedIdx]) { e.preventDefault(); insertMention(filteredMentions[selectedIdx]) }
        if (e.key === 'Escape') setShowMention(false)
    }

    // Render tags in view mode
    const renderContent = (txt: string) => {
        const parts = txt.split(/(\[(?:📎|📁) [^\]]+\]\([^)]*\)|\[(?:📎|📁) [^\]]+\])/g)
        return parts.map((p, i) => {
            const lm = p.match(/\[(📎|📁) ([^\]]+)\]\(([^)]+)\)/)
            const pm = p.match(/\[(📎|📁) ([^\]]+)\]/)
            if (lm) return (
                <a key={i} href={lm[3]} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors mx-0.5">
                    {lm[1]} {lm[2]}
                </a>
            )
            if (pm) return (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 mx-0.5">
                    {pm[1]} {pm[2]}
                </span>
            )
            return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{p}</span>
        })
    }

    return (
        <div className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-400">{formatTime(note.created_at)}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {saving && <span className="text-[10px] text-slate-400 mr-1">Sauvegarde...</span>}
                    <button
                        onClick={() => { setEditing(e => !e); if (editing) saveNote(text) }}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-all"
                        title={editing ? 'Fermer' : 'Modifier'}
                    >
                        <span className="material-symbols-outlined text-[13px]">{editing ? 'check' : 'edit'}</span>
                    </button>
                    <button
                        onClick={deleteNote}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                        title="Supprimer"
                    >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                    </button>
                </div>
            </div>
            <div className="relative px-4 py-3">
                {editing ? (
                    <>
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className="w-full min-h-[80px] text-sm text-slate-800 bg-white resize-none focus:outline-none leading-relaxed"
                            autoFocus
                        />
                        {showMention && filteredMentions.length > 0 && (
                            <div className="absolute left-4 bottom-full mb-1 z-50 w-64 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                    GED — Taper pour filtrer
                                </div>
                                <ul className="max-h-44 overflow-auto py-1">
                                    {filteredMentions.map((item, idx) => (
                                        <li key={item.id}>
                                            <button
                                                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm ${idx === selectedIdx ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                                onClick={() => insertMention(item)}
                                            >
                                                <span className={`material-symbols-outlined text-[16px] ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                                <span className="truncate">{item.label}</span>
                                                <span className="ml-auto text-[10px] text-slate-400 shrink-0">{item.type === 'folder' ? 'Dossier' : 'Fichier'}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="px-3 py-1 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50">↑↓ Naviguer · ↵ Sélectionner · Esc Fermer</div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {renderContent(text)}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Notes Editor (multi-note) ─────────────────────────────────────────────────
export function NotesEditor({ dossierId }: { dossierId: string }) {
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [newText, setNewText] = useState('')
    const [adding, setAdding] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [gedItems, setGedItems] = useState<MentionItem[]>([])

    // Slash state for new note input
    const [showMention, setShowMention] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const [selectedIdx, setSelectedIdx] = useState(0)
    const [cursorPos, setCursorPos] = useState(0)
    const newTextareaRef = useRef<HTMLTextAreaElement>(null)

    const filteredMentions = gedItems.filter(i =>
        mentionQuery === '' || i.label.toLowerCase().includes(mentionQuery.toLowerCase())
    ).slice(0, 8)

    const fetchNotes = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get(`/api/v1/dossiers/${dossierId}/notes`)
            setNotes(res.data.data || [])
        } catch (e) {
            console.error('fetchNotes error:', e)
        } finally {
            setLoading(false)
        }
    }, [dossierId])

    const loadGedItems = useCallback(async () => {
        try {
            const res = await api.get(`/api/v1/fichiers/dossier/${dossierId}`)
            const all: any[] = res.data.data || []
            setGedItems(all.map(f => ({
                id: f.id, label: f.nom,
                type: f.is_folder ? 'folder' : 'file',
                url: f.url,
                icon: f.is_folder ? 'folder' : 'insert_drive_file',
                color: f.is_folder ? 'text-blue-400' : 'text-slate-500',
            })))
        } catch (e) { setGedItems([]) }
    }, [dossierId])

    useEffect(() => { fetchNotes(); loadGedItems() }, [fetchNotes, loadGedItems])

    const handleNewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value
        const pos = e.target.selectionStart ?? val.length
        setNewText(val)
        setCursorPos(pos)
        const textBefore = val.slice(0, pos)
        const slashMatch = textBefore.match(/\/([^/\n]*)$/)
        if (slashMatch) { setMentionQuery(slashMatch[1]); setShowMention(true); setSelectedIdx(0) }
        else { setShowMention(false) }
    }

    const insertMentionInNew = (item: MentionItem) => {
        const textBefore = newText.slice(0, cursorPos)
        const textAfter = newText.slice(cursorPos)
        const slashIdx = textBefore.lastIndexOf('/')
        const tag = item.url ? `[📎 ${item.label}](${item.url})` : `[📁 ${item.label}]`
        const nText = textBefore.slice(0, slashIdx) + tag + ' ' + textAfter
        setNewText(nText)
        setShowMention(false)
        setTimeout(() => {
            if (newTextareaRef.current) {
                const np = slashIdx + tag.length + 1
                newTextareaRef.current.focus()
                newTextareaRef.current.setSelectionRange(np, np)
            }
        }, 0)
    }

    const handleNewKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showMention) return
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filteredMentions.length - 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
        if (e.key === 'Enter' && filteredMentions[selectedIdx]) { e.preventDefault(); insertMentionInNew(filteredMentions[selectedIdx]) }
        if (e.key === 'Escape') setShowMention(false)
    }

    const addNote = async () => {
        if (!newText.trim()) return
        setAdding(true)
        try {
            const res = await api.post(`/api/v1/dossiers/${dossierId}/notes`, { contenu: newText.trim() })
            setNotes(prev => [res.data.data, ...prev])
            setNewText('')
            setShowNew(false)
        } catch (e: any) {
            alert(e.response?.data?.error || 'Erreur lors de l\'ajout de la note')
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">note_alt</span>
                        <h3 className="font-serif text-lg text-slate-900 font-medium">Notes du Dossier</h3>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 rounded px-2 py-0.5">{notes.length}</span>
                    </div>
                    <button
                        onClick={() => { setShowNew(s => !s); setTimeout(() => newTextareaRef.current?.focus(), 50) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        Nouvelle note
                    </button>
                </div>

                {/* Help */}
                <div className="px-6 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-blue-400">info</span>
                    <p className="text-xs text-blue-700">
                        Chaque note est indépendante. Tapez <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 rounded text-[11px] font-mono">/</kbd> pour taguer un fichier ou dossier du GED.
                    </p>
                </div>

                {/* New Note Input */}
                {showNew && (
                    <div className="p-4 border-b border-slate-200 bg-slate-50/30 relative">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nouvelle note</label>
                        <textarea
                            ref={newTextareaRef}
                            value={newText}
                            onChange={handleNewChange}
                            onKeyDown={handleNewKeyDown}
                            placeholder="Rédigez votre note ici... Tapez / pour insérer un lien vers le GED"
                            className="w-full min-h-[100px] p-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed placeholder-slate-300"
                        />
                        {showMention && filteredMentions.length > 0 && (
                            <div className="absolute left-4 z-50 w-64 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden" style={{ bottom: 'calc(100% - 120px)' }}>
                                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                                    Insérer un lien GED
                                </div>
                                <ul className="max-h-44 overflow-auto py-1">
                                    {filteredMentions.map((item, idx) => (
                                        <li key={item.id}>
                                            <button
                                                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-sm ${idx === selectedIdx ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                                onClick={() => insertMentionInNew(item)}
                                            >
                                                <span className={`material-symbols-outlined text-[16px] ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                                <span className="truncate">{item.label}</span>
                                                <span className="ml-auto text-[10px] text-slate-400 shrink-0">{item.type === 'folder' ? 'Dossier' : 'Fichier'}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="px-3 py-1 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50">↑↓ Naviguer · ↵ Sélectionner · Esc Fermer</div>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => { setShowNew(false); setNewText('') }} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition-colors">Annuler</button>
                            <button
                                onClick={addNote}
                                disabled={!newText.trim() || adding}
                                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {adding ? 'Enregistrement...' : 'Enregistrer la note'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Notes List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                    <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">note_alt</span>
                    <p className="text-slate-500 font-medium mb-1">Aucune note pour ce dossier</p>
                    <p className="text-sm text-slate-400 mb-5">Créez votre première note privée.</p>
                    <button onClick={() => { setShowNew(true); setTimeout(() => newTextareaRef.current?.focus(), 50) }} className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                        <span className="material-symbols-outlined text-[15px] align-middle mr-1">add</span>
                        Nouvelle note
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {notes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            dossierId={dossierId}
                            gedItems={gedItems}
                            onDeleted={id => setNotes(prev => prev.filter(n => n.id !== id))}
                            onUpdated={(id, contenu) => setNotes(prev => prev.map(n => n.id === id ? { ...n, contenu } : n))}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
