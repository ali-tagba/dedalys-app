"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface CompanyClientDetailProps {
    client: any
    onEdit: () => void
    onDelete: () => void
    onAddContact: () => void
    onEditContact: (contact: any) => void
    activeDossiers: number
    totalBilled: number
    paidAmount: number
    unpaidAmount: number
}

export function CompanyClientDetail({
    client,
    onEdit,
    onDelete,
    onAddContact,
    onEditContact,
    activeDossiers,
    totalBilled,
    paidAmount,
    unpaidAmount
}: CompanyClientDetailProps) {
    const router = useRouter()
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [uploadingContactId, setUploadingContactId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('dossiers')
    const [noteText, setNoteText] = useState("")
    const [isSavingNote, setIsSavingNote] = useState(false)

    const handleAddNote = async () => {
        if (!noteText.trim()) return
        setIsSavingNote(true)
        try {
            const newNote = `[${new Date().toLocaleDateString('fr-FR')}] Utilisateur: ${noteText}`
            const updatedNotes = client.notes ? `${client.notes}\n\n${newNote}` : newNote

            const res = await fetch(`/api/v1/clients/${client.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: updatedNotes }),
            })
            if (!res.ok) throw new Error("Erreur res")
            router.refresh()
            setNoteText("")
        } catch (e) {
            alert("Erreur")
        } finally {
            setIsSavingNote(false)
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null)
    const contactAvatarInputRef = useRef<HTMLInputElement>(null)
    const [activeContactIdForUpload, setActiveContactIdForUpload] = useState<string | null>(null)

    const retainer = client.dossiers?.reduce((acc: number, d: any) => acc + (d.provision || 0), 0) || 50000

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingLogo(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${client.id}-logo-${Date.now()}.${fileExt}`
            const filePath = `logos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            const publicURL = publicUrlData.publicUrl

            const res = await fetch(`/api/v1/clients/${client.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logo_url: publicURL }),
            })

            if (!res.ok) throw new Error("Erreur de sauvegarde base de données")
            router.refresh()
        } catch (error) {
            console.error("Erreur l'upload du logo:", error)
        } finally {
            setIsUploadingLogo(false)
        }
    }

    const triggerContactAvatarUpload = (contactId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setActiveContactIdForUpload(contactId)
        contactAvatarInputRef.current?.click()
    }

    const handleContactAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const contactId = activeContactIdForUpload
        if (!file || !contactId) return

        setUploadingContactId(contactId)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `contact-${contactId}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            const publicURL = publicUrlData.publicUrl

            const res = await fetch(`/api/v1/clients/${client.id}/contacts`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: contactId, avatar_url: publicURL }),
            })

            if (!res.ok) throw new Error("Erreur de sauvegarde base de données")
            router.refresh()
        } catch (error) {
            console.error("Erreur l'upload de l'avatar:", error)
        } finally {
            setUploadingContactId(null)
            setActiveContactIdForUpload(null)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative text-slate-900 font-sans antialiased">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 z-10 shrink-0">
                {/* Top Bar */}
                <div className="h-16 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/clients" className="text-slate-500 hover:text-blue-600 transition-colors">Clients</Link>
                        <span className="text-slate-200">/</span>
                        <Link href="/clients?type=entreprises" className="text-slate-500 hover:text-blue-600 transition-colors">Entreprises</Link>
                        <span className="text-slate-200">/</span>
                        <span className="font-medium text-slate-900">{client.raisonSociale}</span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button onClick={onEdit} className="flex items-center gap-2 h-8 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded text-sm font-medium transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            <span>Modifier</span>
                        </button>
                        <button onClick={onDelete} className="flex items-center gap-2 h-8 px-3 bg-white border border-slate-200 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Supprimer</span>
                        </button>
                    </div>
                </div>

                {/* Client Identity Header */}
                <div className="px-8 pb-0 pt-2">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
                        <div className="flex items-start gap-6">
                            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                            <div
                                className={`size-20 rounded bg-white border border-slate-200 p-1 shadow-sm shrink-0 flex items-center justify-center cursor-pointer group relative overflow-hidden ${isUploadingLogo ? 'opacity-50' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploadingLogo ? (
                                    <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
                                ) : client.logo_url ? (
                                    <img src={client.logo_url} alt="Logo" className="object-cover w-full h-full rounded-sm" />
                                ) : (
                                    <span className="text-3xl font-bold text-slate-300 uppercase font-serif">{client.raisonSociale?.charAt(0) || "E"}</span>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white text-[18px]">photo_camera</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="font-serif text-3xl text-slate-900 font-semibold tracking-tight">{client.raisonSociale}</h2>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">Client Actif</span>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-slate-500 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        <span>{client.ville || 'Localisation non définie'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">domain</span>
                                        <span>{client.formeJuridique || 'Entreprise'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        <span>Client depuis {new Date(client.created_at || Date.now()).getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Bar */}
                        <div className="flex items-center divide-x divide-slate-200 border border-slate-200 rounded bg-slate-50">
                            <div className="px-6 py-3 flex flex-col items-center min-w-[120px]">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Total Facturé</span>
                                <span className="font-mono text-slate-900 font-medium">{formatCurrency(totalBilled).replace(',00', '')}</span>
                            </div>
                            <div className="px-6 py-3 flex flex-col items-center min-w-[120px]">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Dossiers</span>
                                <span className="font-mono text-slate-900 font-medium">{activeDossiers} Actifs</span>
                            </div>
                            <div className="px-6 py-3 flex flex-col items-center min-w-[120px]">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Taux Succès</span>
                                <span className="font-mono text-emerald-600 font-medium">--%</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-8 mt-2">
                        {['dossiers', 'factures', 'documents', 'audiences'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                    ? "text-blue-600 border-blue-600"
                                    : "text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Split Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar (Static Info) */}
                <aside className="w-[320px] bg-slate-50/50 border-r border-slate-200 overflow-y-auto p-6 flex flex-col gap-8 shrink-0">

                    {/* Contact Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif text-base font-semibold text-slate-900">Contacts Principaux</h3>
                            <button onClick={onAddContact} className="text-slate-500 hover:text-blue-600 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                            </button>
                        </div>
                        <input type="file" ref={contactAvatarInputRef} onChange={handleContactAvatarUpload} className="hidden" accept="image/*" />
                        <div className="space-y-3">
                            {client.contacts?.map((contact: any) => (
                                <div key={contact.id} className="bg-white p-4 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => onEditContact(contact)}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="size-10 rounded-full bg-slate-100 flex items-center justify-center relative group overflow-hidden shrink-0 border border-slate-200"
                                            onClick={(e) => triggerContactAvatarUpload(contact.id, e)}
                                        >
                                            {uploadingContactId === contact.id ? (
                                                <span className="material-symbols-outlined animate-spin text-blue-500 text-[14px]">progress_activity</span>
                                            ) : contact.avatar_url ? (
                                                <img src={contact.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[12px] font-bold text-slate-400 uppercase">{contact.prenom?.charAt(0)}{contact.nom?.charAt(0)}</span>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-white text-[12px]">edit</span>
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{contact.prenom} {contact.nom}</p>
                                            <p className="text-xs text-slate-500 truncate">{contact.fonction || "Collaborateur"}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-slate-900 hover:text-blue-600 group" onClick={e => e.stopPropagation()}>
                                            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600 transition-colors">mail</span>
                                            <span className="truncate">{contact.email}</span>
                                        </a>
                                        <a href={`tel:${contact.telephone}`} className="flex items-center gap-2 text-sm text-slate-900 hover:text-blue-600 group" onClick={e => e.stopPropagation()}>
                                            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-blue-600 transition-colors">call</span>
                                            <span>{contact.telephone || "-"}</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                            {(!client.contacts || client.contacts.length === 0) && (
                                <p className="text-sm text-slate-400 italic bg-white p-4 rounded border border-slate-200 text-center shadow-sm">Aucun contact enregistré</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Notes */}
                    <div className="flex flex-col gap-3 flex-1 mb-8">
                        <h3 className="font-serif text-base font-semibold text-slate-900">Notes Privées</h3>
                        <div className="bg-amber-50/50 p-4 rounded border border-amber-200/60 text-sm leading-relaxed text-slate-900 max-h-[250px] overflow-y-auto custom-scrollbar flex-1">
                            {client.notes ? (
                                <p className="whitespace-pre-wrap text-xs">{client.notes}</p>
                            ) : (
                                <p className="text-slate-400 text-xs italic">Aucune note privée.</p>
                            )}
                        </div>
                        <div className="space-y-2 mt-auto">
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Ajouter une note..."
                                className="w-full text-xs border border-slate-200 rounded p-2 focus:border-blue-500 outline-none resize-none bg-white"
                                rows={3}
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={isSavingNote || !noteText.trim()}
                                className="w-full py-2 bg-slate-900 text-white text-xs rounded font-medium disabled:opacity-50 hover:bg-slate-800 transition-colors"
                            >
                                {isSavingNote ? 'Ajout...' : 'Ajouter Note'}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Tab Content Area */}
                <div className="flex-1 bg-white p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'dossiers' && (
                        <>
                            {/* Filters & Actions */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-serif text-xl font-semibold text-slate-900">Dossiers Actifs</h2>
                                <div className="flex items-center gap-3">
                                    <Link href={`/dossiers/nouveau?clientId=${client.id}`} className="flex items-center gap-2 h-9 px-4 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        <span>Nouveau Dossier</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Matters Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {client.dossiers?.filter((d: any) => d.statut !== 'CLOTURE').map((dossier: any, idx: number) => {
                                    const colors = [
                                        { bg: 'bg-blue-600', text: 'text-blue-700', badgeBg: 'bg-slate-100', badgeText: 'text-slate-500', badgeBorder: 'border-slate-200' },
                                        { bg: 'bg-red-600', text: 'text-red-700', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200' },
                                        { bg: 'bg-emerald-600', text: 'text-emerald-700', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200' },
                                        { bg: 'bg-indigo-600', text: 'text-indigo-700', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700', badgeBorder: 'border-indigo-200' }
                                    ]
                                    const color = colors[idx % colors.length]
                                    return (
                                        <Link key={dossier.id} href={`/dossiers/${dossier.id}`} className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded overflow-hidden hover:shadow-md transition-all duration-200">
                                            {/* Color coded strip */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color.bg}`}></div>
                                            <div className="p-5 pl-7">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold ${color.text} tracking-wide uppercase mb-1`}>{dossier.type?.replace('_', ' ') || "Affaire Civile"}</span>
                                                        <h3 className="font-serif text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{dossier.titre || dossier.numero}</h3>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded ${color.badgeBg} ${color.badgeText} text-xs font-medium border ${color.badgeBorder}`}>{dossier.statut || "EN COURS"}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{dossier.description || "Dossier en cours de traitement et de révision."}</p>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 border-dashed">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-white overflow-hidden">
                                                            <span className="material-symbols-outlined text-[14px] text-slate-500">assignment</span>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-700">{dossier.dernier_acte || "Non défini"}</span>
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-500">{dossier.numero}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}

                                {(!client.dossiers || client.dossiers.length === 0) && (
                                    <div className="col-span-1 xl:col-span-2 p-12 text-center border border-dashed border-slate-200 rounded text-slate-400 bg-slate-50">
                                        Aucun dossier actif pour ce client entreprise.
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'factures' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-serif text-xl font-bold text-slate-900">Historique de facturation</h2>
                                <Link href={`/factures/nouveau?clientId=${client.id}`} className="flex items-center gap-2 h-9 px-4 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    <span>Nouvelle Facture</span>
                                </Link>
                            </div>
                            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Numéro</th>
                                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dossier</th>
                                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                                            <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {client.invoices?.length > 0 ? (
                                            client.invoices.map((inv: any) => (
                                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 text-sm text-slate-600">{new Date(inv.date).toLocaleDateString('fr-FR')}</td>
                                                    <td className="p-4 text-sm font-medium text-slate-900">{inv.numero}</td>
                                                    <td className="p-4 text-sm text-slate-500">{inv.dossier}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight border rounded ${inv.statut === 'REGLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            inv.statut === 'PARTIEL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                'bg-red-50 text-red-700 border-red-200'
                                                            }`}>
                                                            {inv.statut}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-slate-900 text-right">{formatCurrency(inv.montant).replace(',00', '')}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-sm text-slate-400 italic">Aucune facture enregistrée</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audiences' && (
                        <div className="space-y-6">
                            <h2 className="font-serif text-xl font-bold text-slate-900">Audiences Entreprise</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {client.audiences?.length > 0 ? (
                                    client.audiences.map((aud: any) => (
                                        <div key={aud.id} className="bg-white border border-slate-200 rounded p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                                            <div className="flex gap-4">
                                                <div className="shrink-0 w-12 h-12 bg-slate-50 border border-slate-200 flex flex-col items-center justify-center rounded">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(aud.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                                                    <span className="text-lg font-serif font-bold text-slate-900">{new Date(aud.date).getDate()}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900">{aud.titre}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{aud.juridiction}</p>
                                                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                        {new Date(aud.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded ${aud.statut === 'A_VENIR' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        aud.statut === 'TERMINEE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            aud.statut === 'REPORTEE' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                                'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                    {aud.statut === 'A_VENIR' ? 'À venir' : aud.statut}
                                                </span>
                                                {aud.statut === 'TERMINEE' && aud.resultat && (
                                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded ${aud.resultat === 'GAGNE' ? 'bg-green-100 text-green-800 border-green-200' :
                                                            aud.resultat === 'PERDU' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                        }`}>
                                                        {aud.resultat === 'MIXTE' ? 'Mixte / Partiel' : aud.resultat}
                                                    </span>
                                                )}
                                                <Link href={`/audiences`} className="text-blue-600 font-medium text-sm hover:underline ml-2">
                                                    Voir Détails
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center border border-dashed border-slate-200 rounded text-slate-400 bg-slate-50">
                                        Aucune audience programmée pour cette entreprise.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded h-full min-h-[400px]">
                            <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl text-slate-400">folder_open</span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">Gestion Documentaire (GED)</h3>
                            <p className="text-sm text-slate-500 max-w-sm text-center px-4 leading-relaxed">
                                Centralisez tous les documents du client ici. Cette fonctionnalité est en cours de déploiement.
                            </p>
                            <button className="mt-8 px-6 py-2 bg-white border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded disabled:cursor-not-allowed shadow-sm">
                                Bientôt disponible
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
