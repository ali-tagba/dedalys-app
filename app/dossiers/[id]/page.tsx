"use client"

import { useEffect, useState, use, useRef } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { FileExplorer } from "@/components/dossiers/file-explorer"
import { NotesEditor } from "@/components/dossiers/notes-editor"
import { AudienceList } from "@/components/audiences/audience-list"
import { AudienceFormDialog } from "@/components/audiences/audience-form-dialog"

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
    en_cours: { label: "En cours", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    ouvert: { label: "En cours", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    en_instance: { label: "En attente", color: "bg-amber-50 text-amber-700 border-amber-200" },
    urgent: { label: "Urgent", color: "bg-red-50 text-red-700 border-red-200" },
    cloture: { label: "Clôturé", color: "bg-slate-50 text-slate-700 border-slate-200" },
    suspendu: { label: "Suspendu", color: "bg-slate-50 text-slate-500 border-slate-200" },
}

const DOMAINE_LABELS: Record<string, string> = {
    TRAVAIL: "Droit du travail", CIVIL: "Droit civil", IMMOBILIER: "Droit immobilier",
    COMMERCIAL: "Droit commercial", BANCAIRE: "Droit bancaire", FISCAL: "Droit fiscal",
    PENAL: "Droit pénal", FAMILLE: "Droit de la famille", PI: "Propriété Intellectuelle",
}

const ACTIVITE_ICONS: Record<string, string> = {
    fichier_upload: "upload_file", fichier_supprime: "delete", sous_dossier_cree: "create_new_folder",
    consultation: "visibility", note_ajoutee: "note_add", audience_cree: "gavel", default: "radio_button_unchecked"
}

function formatDate(s?: string | null): string {
    if (!s) return "—"
    return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTimeAgo(s: string): string {
    const diff = Date.now() - new Date(s).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "à l'instant"
    if (mins < 60) return `il y a ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `il y a ${hours}h`
    return formatDate(s)
}

function getClientName(client: any): string {
    if (!client) return "—"
    if (client.statut === 'PP' || client.type === 'PERSONNE_PHYSIQUE') {
        return `${client.nom || ''} ${client.prenom || ''}`.trim()
    }
    return client.raison_sociale || client.raisonSociale || "—"
}



interface EditablePartyProps {
    label: string
    accentLeft?: boolean
    nom: string
    email: string
    telephone: string
    onSave: (nom: string, email: string, telephone: string) => Promise<void>
}

function EditableParty({ label, accentLeft, nom, email, telephone, onSave }: EditablePartyProps) {
    const [editing, setEditing] = useState(false)
    const [localNom, setLocalNom] = useState(nom)
    const [localEmail, setLocalEmail] = useState(email)
    const [localTel, setLocalTel] = useState(telephone)
    const [saving, setSaving] = useState(false)

    useEffect(() => { setLocalNom(nom); setLocalEmail(email); setLocalTel(telephone) }, [nom, email, telephone])

    const handleSave = async () => {
        setSaving(true)
        await onSave(localNom, localEmail, localTel)
        setSaving(false)
        setEditing(false)
    }

    return (
        <div className={`p-5 flex flex-col gap-3 relative group ${accentLeft ? '' : 'bg-slate-50/30'}`}>
            {accentLeft && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600"></div>}
            <div className="flex justify-between items-start">
                <label className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${accentLeft ? 'text-blue-600' : 'text-slate-400'}`}>{label}</label>
                <button onClick={() => setEditing(e => !e)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">{editing ? 'close' : 'edit'}</span>
                </button>
            </div>

            {editing ? (
                <div className="space-y-2">
                    <input value={localNom} onChange={e => setLocalNom(e.target.value)} placeholder="Nom complet" className="w-full h-8 px-2 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <input value={localEmail} onChange={e => setLocalEmail(e.target.value)} placeholder="Email" type="email" className="w-full h-8 px-2 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <input value={localTel} onChange={e => setLocalTel(e.target.value)} placeholder="Téléphone" className="w-full h-8 px-2 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <button onClick={handleSave} disabled={saving} className="w-full py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-bold text-slate-900">{localNom || <span className="text-slate-400 italic font-normal">Non renseigné — cliquer sur modifier</span>}</h4>
                    {localEmail && <div className="flex items-center gap-2 mt-1"><a href={`mailto:${localEmail}`} className="text-xs text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">mail</span>{localEmail}</a></div>}
                    {localTel && <div className="flex items-center gap-2"><a href={`tel:${localTel}`} className="text-xs text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span>{localTel}</a></div>}
                </div>
            )}
        </div>
    )
}

export default function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [dossier, setDossier] = useState<any>(null)
    const [activites, setActivites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("informations")
    const [editing, setEditing] = useState(false)
    const [editData, setEditData] = useState<any>({})
    const [savingEdit, setSavingEdit] = useState(false)
    const [audienceDialogOpen, setAudienceDialogOpen] = useState(false)
    const [prefillDossierId, setPrefillDossierId] = useState<string | undefined>()
    const [prefillClientId, setPrefillClientId] = useState<string | undefined>()
    const [selectedAudience, setSelectedAudience] = useState<any>(null)

    const fetchDossier = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/api/v1/dossiers/${resolvedParams.id}`)
            const data = res.data.data || res.data

            // Fetch client if linked
            let client = data.clients || null
            if (!client && data.client_id) {
                try {
                    const cRes = await api.get(`/api/v1/clients/${data.client_id}`)
                    client = cRes.data.data || cRes.data
                } catch (e) { /* not fatal */ }
            }

            setDossier({ ...data, client })

            // Also fetch activites
            try {
                const aRes = await api.get(`/api/v1/dossiers/${resolvedParams.id}/activite`)
                setActivites(aRes.data.data || [])
            } catch (e) { /* not fatal */ }
        } catch (error: any) {
            console.error('Error fetching dossier:', error)
            if (error.response?.status === 404) return notFound()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchDossier() }, [resolvedParams.id])

    const handleDelete = async () => {
        if (!confirm('Supprimer ce dossier ? Cette action est irréversible.')) return
        try {
            await api.delete(`/api/v1/dossiers/${resolvedParams.id}`)
            router.push('/dossiers')
        } catch (e) { alert('Erreur lors de la suppression') }
    }

    const startEdit = () => {
        setEditData({
            titre: dossier.titre || '',
            statut: dossier.statut || 'en_cours',
            type: dossier.type || '',
            domaine: dossier.domaine || '',
            juridiction: dossier.juridiction || '',
            chambre: dossier.chambre || '',
            description: dossier.description || '',
            date_prescription: dossier.date_prescription || '',
        })
        setEditing(true)
    }

    const saveEdit = async () => {
        setSavingEdit(true)
        try {
            await api.patch(`/api/v1/dossiers/${resolvedParams.id}`, editData)
            await fetchDossier()
            setEditing(false)
        } catch (e) { alert('Erreur lors de la sauvegarde') } finally {
            setSavingEdit(false)
        }
    }

    const saveParteAdverse = async (nom: string, email: string, telephone: string) => {
        await api.patch(`/api/v1/dossiers/${resolvedParams.id}`, {
            partie_adverse_nom: nom,
            partie_adverse_email: email,
            partie_adverse_telephone: telephone,
        })
        setDossier((d: any) => ({ ...d, partie_adverse_nom: nom, partie_adverse_email: email, partie_adverse_telephone: telephone }))
    }

    const saveConseilAdverse = async (nom: string, email: string, telephone: string) => {
        await api.patch(`/api/v1/dossiers/${resolvedParams.id}`, {
            conseil_adverse_nom: nom,
            conseil_adverse_email: email,
            conseil_adverse_telephone: telephone,
        })
        setDossier((d: any) => ({ ...d, conseil_adverse_nom: nom, conseil_adverse_email: email, conseil_adverse_telephone: telephone }))
    }

    const handleEditAudience = (audience: any) => {
        setSelectedAudience(audience)
        setPrefillDossierId(undefined)
        setPrefillClientId(undefined)
        setAudienceDialogOpen(true)
    }

    const handleDeleteAudience = async (id: string) => {
        if (!confirm("Supprimer cette audience ?")) return
        try {
            await api.delete(`/api/v1/audiences/${id}`)
            await fetchDossier()
        } catch (e) {
            alert("Erreur lors de la suppression.")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-200 border-t-blue-600"></div>
            </div>
        )
    }

    if (!dossier) return notFound()

    const statutKey = dossier.statut || 'ouvert'
    const statutInfo = STATUT_CONFIG[statutKey] || STATUT_CONFIG['en_cours']
    const domaineLabel = DOMAINE_LABELS[dossier.domaine] || dossier.domaine || "—"
    const clientName = getClientName(dossier.client)

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">

            {/* Sticky Header */}
            <header className="bg-white border-b border-slate-200 z-10 flex flex-col shrink-0">

                {/* Top Bar */}
                <div className="px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Link href="/dossiers" className="hover:text-blue-600 transition-colors">Index des Dossiers</Link>
                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        <span className="font-mono text-slate-900">{dossier.reference || 'Dossier'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors" title="Imprimer">
                            <span className="material-symbols-outlined text-[16px]">print</span> Imprimer
                        </button>
                        <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">edit</span> Modifier
                        </button>
                        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs font-medium hover:bg-red-50 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                    </div>
                </div>

                {/* Title Area */}
                <div className="px-8 pb-4 flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {dossier.reference}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${statutInfo.color}`}>
                                {statutInfo.label}
                            </span>
                        </div>
                        <h1 className="font-serif text-2xl font-semibold text-slate-900">
                            {dossier.titre || "Dossier sans titre"}
                        </h1>
                    </div>
                    <div className="mb-1">
                        {/* Stepper removed */}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="px-8 flex items-center gap-6 border-t border-slate-200">
                    {[
                        { key: 'informations', label: 'Informations' },
                        { key: 'documents', label: 'GED / Documents' },
                        { key: 'audiences', label: 'Audiences' },
                        { key: 'notes', label: 'Notes' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {/* INFORMATIONS TAB */}
                {activeTab === 'informations' && (
                    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">

                        {/* Left Main (8/12) */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

                            {/* Détails de l'affaire */}
                            <section className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="font-serif text-lg text-slate-900 font-medium">Détails de l'affaire</h3>
                                    <button onClick={startEdit} className="text-slate-400 hover:text-blue-600 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">edit_square</span>
                                    </button>
                                </div>

                                {editing ? (
                                    <div className="p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Titre</label>
                                                <input value={editData.titre} onChange={e => setEditData((d: any) => ({ ...d, titre: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Statut</label>
                                                <select value={editData.statut} onChange={e => setEditData((d: any) => ({ ...d, statut: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                    <option value="en_cours">En cours</option>
                                                    <option value="en_instance">En attente</option>
                                                    <option value="urgent">Urgent</option>
                                                    <option value="cloture">Clôturé</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Juridiction</label>
                                                <input value={editData.juridiction} onChange={e => setEditData((d: any) => ({ ...d, juridiction: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Chambre</label>
                                                <input value={editData.chambre} onChange={e => setEditData((d: any) => ({ ...d, chambre: e.target.value }))} placeholder="Ex: Chambre Sociale 2" className="w-full h-9 px-3 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Domaine de Droit</label>
                                                <input value={editData.domaine} onChange={e => setEditData((d: any) => ({ ...d, domaine: e.target.value }))} placeholder="Ex: Droit du travail" className="w-full h-9 px-3 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Date de Prescription</label>
                                                <input type="date" value={editData.date_prescription} onChange={e => setEditData((d: any) => ({ ...d, date_prescription: e.target.value }))} className="w-full h-9 px-3 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                                            <textarea value={editData.description} onChange={e => setEditData((d: any) => ({ ...d, description: e.target.value }))} rows={4} className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded hover:bg-slate-50 transition-colors">Annuler</button>
                                            <button onClick={saveEdit} disabled={savingEdit} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
                                                {savingEdit ? 'Sauvegarde...' : 'Sauvegarder'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Juridiction</label>
                                                <div className="text-sm text-slate-900 font-medium flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px] text-blue-500">account_balance</span>
                                                    {dossier.juridiction || "—"}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Chambre</label>
                                                <div className="text-sm text-slate-900 font-medium">{dossier.chambre || "—"}</div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Type de procédure</label>
                                                <div className="inline-flex">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium">
                                                        {dossier.type || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Domaine de droit</label>
                                                <div className="text-sm text-slate-900 font-medium">{domaineLabel}</div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Date d'ouverture</label>
                                                <div className="text-sm text-slate-900 font-mono">{formatDate(dossier.date_ouverture || dossier.created_at)}</div>
                                            </div>
                                            {dossier.date_prescription && (
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Prescription</label>
                                                    <div className="text-sm text-red-600 font-mono flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                                        {formatDate(dossier.date_prescription)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {dossier.description && (
                                            <>
                                                <div className="h-px bg-slate-200 my-6"></div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Objet & Description</label>
                                                    <p className="text-sm text-slate-700 leading-relaxed">{dossier.description}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Activité Récente */}
                            <section className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="font-serif text-lg text-slate-900 font-medium">Activité Récente</h3>
                                    <button onClick={() => setActiveTab('documents')} className="text-xs text-blue-600 font-medium hover:underline">Voir GED</button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {activites.length === 0 ? (
                                        <div className="px-6 py-6 text-center text-sm text-slate-400 italic">
                                            Aucune activité enregistrée sur ce dossier.
                                        </div>
                                    ) : activites.map((a: any) => (
                                        <div key={a.id} className="px-6 py-3 flex gap-4 items-start hover:bg-slate-50 transition-colors">
                                            <div className="mt-1 min-w-[12px]">
                                                <span className="material-symbols-outlined text-[14px] text-slate-300">
                                                    {ACTIVITE_ICONS[a.type] || ACTIVITE_ICONS.default}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{a.description}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(a.created_at)}{a.created_by ? ` • Par ${a.created_by}` : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Column (4/12) */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

                            {/* Parties & Conseils */}
                            <section className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                                    <h3 className="font-serif text-lg text-slate-900 font-medium">Parties & Conseils</h3>
                                </div>
                                <div className="flex flex-col divide-y divide-slate-200">
                                    {/* Notre Client */}
                                    <div className="p-5 flex flex-col gap-3 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-600"></div>
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-0.5">
                                                <label className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mb-1">Notre Client</label>
                                                <h4 className="text-sm font-bold text-slate-900">{clientName}</h4>
                                                {dossier.client?.representantLegal && (
                                                    <p className="text-xs text-slate-400">Rep: {dossier.client.representantLegal}</p>
                                                )}
                                            </div>
                                            <Link href={`/clients/${dossier.client_id}`} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                            </Link>
                                        </div>
                                        {dossier.client?.email && (
                                            <div className="flex gap-2">
                                                <a href={`mailto:${dossier.client.email}`} className="flex items-center justify-center w-8 h-8 rounded border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                                </a>
                                                {dossier.client?.telephone && (
                                                    <a href={`tel:${dossier.client.telephone}`} className="flex items-center justify-center w-8 h-8 rounded border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Partie Adverse */}
                                    <EditableParty
                                        label="Partie Adverse"
                                        nom={dossier.partie_adverse_nom || ''}
                                        email={dossier.partie_adverse_email || ''}
                                        telephone={dossier.partie_adverse_telephone || ''}
                                        onSave={saveParteAdverse}
                                    />

                                    {/* Conseil Adverse */}
                                    <EditableParty
                                        label="Conseil Adverse"
                                        nom={dossier.conseil_adverse_nom || ''}
                                        email={dossier.conseil_adverse_email || ''}
                                        telephone={dossier.conseil_adverse_telephone || ''}
                                        onSave={saveConseilAdverse}
                                    />
                                </div>
                            </section>

                        </div>
                    </div>
                )}

                {/* GED / DOCUMENTS TAB */}
                {activeTab === 'documents' && (
                    <div className="max-w-6xl mx-auto">
                        <FileExplorer dossierId={resolvedParams.id} />
                    </div>
                )}

                {/* AUDIENCES TAB */}
                {activeTab === 'audiences' && (
                    <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded shadow-sm">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-serif text-lg text-slate-900 font-medium">Audiences du dossier</h3>
                            <button
                                onClick={() => {
                                    setAudienceDialogOpen(true)
                                    setPrefillDossierId(resolvedParams.id)
                                    setPrefillClientId(dossier.client_id ?? dossier.client?.id)
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Nouvelle audience
                            </button>
                        </div>
                        <AudienceList audiences={dossier.audiences || []} onEdit={handleEditAudience} onDelete={handleDeleteAudience} />
                    </div>
                )}


                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                    <div className="max-w-6xl mx-auto">
                        <NotesEditor dossierId={resolvedParams.id} />
                    </div>
                )}
            </div>

            <AudienceFormDialog
                open={audienceDialogOpen}
                onOpenChange={(open) => {
                    setAudienceDialogOpen(open)
                    if (!open) {
                        setSelectedAudience(null)
                        setPrefillDossierId(undefined)
                        setPrefillClientId(undefined)
                    }
                }}
                onSuccess={fetchDossier}
                audience={selectedAudience}
                prefillDossierId={prefillDossierId}
                prefillClientId={prefillClientId}
            />
        </div>
    )
}
