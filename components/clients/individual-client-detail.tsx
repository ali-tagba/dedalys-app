"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface IndividualClientDetailProps {
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

export function IndividualClientDetail({
    client,
    onEdit,
    onDelete,
    onAddContact,
    onEditContact,
    activeDossiers,
    totalBilled,
    paidAmount,
    unpaidAmount
}: IndividualClientDetailProps) {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeTab, setActiveTab] = useState<string>('infos')

    const [isEditingEtatCivil, setIsEditingEtatCivil] = useState(false)
    const [etatCivil, setEtatCivil] = useState({
        dateNaissance: client.dateNaissance ? String(client.dateNaissance).substring(0, 10) : "",
        lieuNaissance: client.lieuNaissance || "",
        nationalite: client.nationalite || "Ivoirienne",
        situationFamiliale: client.situationFamiliale || ""
    })
    const [isSavingEtatCivil, setIsSavingEtatCivil] = useState(false)

    const [noteText, setNoteText] = useState("")
    const [isSavingNote, setIsSavingNote] = useState(false)

    const handleSaveEtatCivil = async () => {
        setIsSavingEtatCivil(true)
        try {
            const res = await fetch(`/api/v1/clients/${client.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date_naissance: etatCivil.dateNaissance || null,
                    lieu_naissance: etatCivil.lieuNaissance || null,
                    nationalite: etatCivil.nationalite || null,
                    situation_familiale: etatCivil.situationFamiliale || null
                }),
            })
            if (!res.ok) throw new Error("Erreur res")
            router.refresh()
            setIsEditingEtatCivil(false)
        } catch (e) {
            console.error(e)
            alert("Erreur lors de la sauvegarde")
        } finally {
            setIsSavingEtatCivil(false)
        }
    }

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

    // Summary stats derived
    const retainer = client.dossiers?.reduce((acc: number, d: any) => acc + (d.provision || 0), 0) || 4500
    const lastAction = "Dépôt de pièces - 12/05" // Mock for now or derived from history

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${client.id}-avatar-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

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
                body: JSON.stringify({ avatar_url: publicURL }),
            })

            if (!res.ok) throw new Error("Erreur de sauvegarde base de données")
            router.refresh()
        } catch (error) {
            console.error("Erreur l'upload de l'avatar:", error)
            alert("Erreur lors de l'upload du fichier.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex h-full overflow-hidden bg-slate-50">
            {/* Sidebar: Client Identity */}
            <aside className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                <div className="p-8 border-b border-slate-100">
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                    <div
                        className={`aspect-square w-24 h-24 mb-6 bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group relative ${isUploading ? 'opacity-50' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
                        ) : client.avatar_url ? (
                            <img src={client.avatar_url} alt="Client" className="object-cover w-full h-full" />
                        ) : (
                            <span className="text-2xl font-bold text-slate-300 uppercase">{client.nom?.charAt(0)}{client.prenom?.charAt(0)}</span>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white">photo_camera</span>
                        </div>
                    </div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900 mb-1">{client.nom} {client.prenom}</h1>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Client Particulier</p>
                    <p className="text-[11px] text-slate-400 mt-1">Ref: {client.id?.split('-')[0].toUpperCase()} • Actif</p>
                </div>

                <div className="flex-1 p-8 space-y-8">
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">État Civil</h3>
                            <button onClick={() => setIsEditingEtatCivil(!isEditingEtatCivil)} className="text-slate-400 hover:text-blue-600 transition-colors">
                                <span className="material-symbols-outlined text-[16px]">{isEditingEtatCivil ? 'close' : 'edit'}</span>
                            </button>
                        </div>
                        {isEditingEtatCivil ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase">Date de naissance</label>
                                    <input value={etatCivil.dateNaissance} onChange={e => setEtatCivil({ ...etatCivil, dateNaissance: e.target.value })} type="date" className="w-full text-sm border-slate-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase">Lieu de naissance</label>
                                    <input value={etatCivil.lieuNaissance} onChange={e => setEtatCivil({ ...etatCivil, lieuNaissance: e.target.value })} placeholder="Lieu de naissance" className="w-full text-sm border-slate-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase">Nationalité</label>
                                    <input value={etatCivil.nationalite} onChange={e => setEtatCivil({ ...etatCivil, nationalite: e.target.value })} placeholder="Nationalité" className="w-full text-sm border-slate-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-slate-500 uppercase">Situation Familiale</label>
                                    <select value={etatCivil.situationFamiliale} onChange={e => setEtatCivil({ ...etatCivil, situationFamiliale: e.target.value })} className="w-full text-sm border-slate-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none">
                                        <option value="">Sélectionner</option>
                                        <option value="Célibataire">Célibataire</option>
                                        <option value="Marié(e)">Marié(e)</option>
                                        <option value="Divorcé(e)">Divorcé(e)</option>
                                        <option value="Veuf/Veuve">Veuf/Veuve</option>
                                    </select>
                                </div>
                                <button onClick={handleSaveEtatCivil} disabled={isSavingEtatCivil} className="w-full py-1.5 bg-blue-600 text-white text-[11px] rounded font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-blue-700 transition-colors">
                                    {isSavingEtatCivil ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-0.5">Date de naissance</p>
                                    <p className="text-sm font-medium text-slate-900">{client.dateNaissance ? new Date(client.dateNaissance).toLocaleDateString('fr-FR') : "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-0.5">Lieu de naissance</p>
                                    <p className="text-sm font-medium text-slate-900">{client.lieuNaissance || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-0.5">Nationalité</p>
                                    <p className="text-sm font-medium text-slate-900">{client.nationalite || "Ivoirienne"}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-0.5">Situation Familiale</p>
                                    <p className="text-sm font-medium text-slate-900">{client.situationFamiliale || "-"}</p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section>
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Coordonnées Personnelles</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-0.5">Email</p>
                                    <p className="text-sm font-medium text-slate-900 underline decoration-slate-200">{client.email || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-slate-400 text-lg">call</span>
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-0.5">Mobile</p>
                                    <p className="text-sm font-medium text-slate-900 font-mono">{client.telephone || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                                <div>
                                    <p className="text-[11px] text-slate-400 mb-0.5">Adresse</p>
                                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                                        {client.adresse || "Non renseignée"}<br />
                                        <span className="text-slate-500 font-normal">{client.ville || ""} {client.pays || ""}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-slate-100 pt-6">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Notes Privées</h3>
                        <div className="bg-amber-50 rounded border border-amber-200/60 p-4 mb-4 text-sm leading-relaxed text-slate-900 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {client.notes ? (
                                <p className="whitespace-pre-wrap text-xs">{client.notes}</p>
                            ) : (
                                <p className="text-slate-400 text-xs italic">Aucune note privée.</p>
                            )}
                        </div>
                        <div className="space-y-2">
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
                    </section>

                    <section className="pt-4 space-y-2">
                        <button onClick={onEdit} className="w-full bg-slate-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                            Modifier la Fiche
                        </button>
                        <button onClick={onDelete} className="w-full border border-slate-200 text-red-600 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors">
                            Supprimer
                        </button>
                    </section>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Header Navbar */}
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/clients" className="text-slate-500 hover:text-[#1354ec] transition-colors">Clients</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-500">Particuliers</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-medium text-slate-900">{client.nom} {client.prenom}</span>
                    </div>
                </header>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 border-b border-slate-200 shrink-0">
                    <div className="p-6 border-r border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dossiers Actifs</p>
                        <p className="text-2xl font-serif font-bold text-slate-900">{String(activeDossiers).padStart(2, '0')}</p>
                    </div>
                    <div className="p-6 border-r border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reste à payer</p>
                        <p className="text-2xl font-serif font-bold text-red-600">{formatCurrency(unpaidAmount).replace(',00', '')}</p>
                    </div>
                    <div className="p-6 border-r border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Facturé</p>
                        <p className="text-2xl font-serif font-bold text-slate-900">{formatCurrency(totalBilled).replace(',00', '')}</p>
                    </div>
                    <div className="p-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dernière Action</p>
                        <p className="text-sm font-medium text-slate-900 mt-2">{lastAction}</p>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="border-b border-slate-200 bg-slate-50/50 shrink-0">
                    <nav className="flex px-8">
                        {['infos', 'factures', 'documents', 'audience'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 border-b-2 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab
                                    ? "border-slate-900 text-slate-900"
                                    : "border-transparent text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {activeTab === 'infos' && (
                        <>


                            {/* Active Cases Section */}
                            <div className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-serif text-xl font-bold text-slate-900">Dossiers en cours</h2>
                                    <Link href={`/dossiers/nouveau?clientId=${client.id}`} className="bg-blue-600 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors">
                                        Nouveau Dossier
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {client.dossiers?.filter((d: any) => d.statut !== 'CLOTURE').map((dossier: any) => (
                                        <Link key={dossier.id} href={`/dossiers/${dossier.id}`} className="border border-slate-200 p-6 hover:border-blue-600 transition-colors group">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dossier.type?.replace('_', ' ') || "Affaire Civile"}</span>
                                                <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">arrow_forward</span>
                                            </div>
                                            <h3 className="font-serif text-lg font-bold text-slate-900 mb-2">{dossier.titre || dossier.numero}</h3>
                                            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{dossier.description || "Aucune description détaillée."}</p>
                                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Réf</p>
                                                    <p className="text-xs font-medium text-slate-900">{dossier.numero}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Dernier Acte</p>
                                                    <p className="text-xs font-medium text-slate-900">{dossier.dernier_acte || "Assignation (12/01)"}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {(!client.dossiers || client.dossiers.length === 0) && (
                                        <div className="col-span-1 md:col-span-2 p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded text-slate-400">
                                            Aucun dossier actif pour ce client.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </>
                    )}

                    {activeTab === 'documents' && (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl text-slate-300">folder_shared</span>
                            </div>
                            <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">Espace Documentaire Personnel</h2>
                            <p className="text-sm text-slate-500 max-w-sm text-center px-4 leading-relaxed">
                                Retrouvez ici tous les documents transmis par le client. Cette zone sécurisée est en cours de configuration.
                            </p>
                            <button className="mt-8 px-6 py-2 border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded disabled:cursor-not-allowed cursor-not-allowed">
                                Accès restreint
                            </button>
                        </div>
                    )}

                    {activeTab === 'factures' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-serif text-xl font-bold text-slate-900">Factures du Client</h2>
                                <Link href={`/factures/nouveau?clientId=${client.id}`} className="bg-blue-600 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors">
                                    Nouvelle Facture
                                </Link>
                            </div>
                            <div className="border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
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
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight border ${inv.statut === 'REGLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
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

                    {activeTab === 'audience' && (
                        <div className="space-y-6">
                            <h2 className="font-serif text-xl font-bold text-slate-900">Audiences Programmées</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {client.audiences?.length > 0 ? (
                                    client.audiences.map((aud: any) => (
                                        <div key={aud.id} className="border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="shrink-0 w-12 h-12 bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(aud.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
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
                                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${aud.statut === 'A_VENIR' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        aud.statut === 'TERMINEE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            aud.statut === 'REPORTEE' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                                'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}>
                                                    {aud.statut === 'A_VENIR' ? 'À venir' : aud.statut}
                                                </span>
                                                {aud.statut === 'TERMINEE' && aud.resultat && (
                                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${aud.resultat === 'GAGNE' ? 'bg-green-100 text-green-800 border-green-200' :
                                                            aud.resultat === 'PERDU' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                        }`}>
                                                        {aud.resultat === 'MIXTE' ? 'Mixte / Partiel' : aud.resultat}
                                                    </span>
                                                )}
                                                <Link href={`/audiences`} className="text-blue-600 font-bold text-[11px] uppercase tracking-widest hover:underline ml-2">
                                                    Voir Détails
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded text-slate-400">
                                        Aucune audience programmée.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
