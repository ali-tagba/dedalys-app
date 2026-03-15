"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"

const JURIDICTIONS_CI = [
    "Tribunal de Première Instance (TPI) d'Abidjan-Plateau",
    "TPI d'Abobo",
    "TPI d'Adjamé",
    "TPI d'Anyama",
    "TPI de Yopougon",
    "TPI de Koumassi",
    "TPI de Marcory",
    "TPI de Port-Bouët",
    "TPI de Bouaké",
    "TPI de Daloa",
    "TPI de Korhogo",
    "TPI de San-Pédro",
    "TPI de Man",
    "TPI de Gagnoa",
    "TPI de Yamoussoukro",
    "Tribunal de Commerce d'Abidjan",
    "Cour d'Appel d'Abidjan",
    "Cour d'Appel de Bouaké",
    "Cour d'Appel de Daloa",
    "Cour Suprême",
    "CCJA (OHADA)",
    "Inspection du Travail",
    "Arbitrage CCI",
    "Autre"
]

const generateReference = () => {
    const year = new Date().getFullYear()
    const num = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')
    return `DOS-${year}-${num}`
}

export default function NouveauDossierPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedClientId = searchParams.get('clientId')

    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [audiences, setAudiences] = useState<any[]>([])
    const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
    const [reference] = useState(generateReference())

    const [formData, setFormData] = useState({
        clientId: preselectedClientId || "",
        titre: "",
        typeAffaire: "CIVIL",
        typeDossier: "CONTENTIEUX",
        typeDossierAutre: "",
        domaineDroit: "CIVIL",
        domaineDroitAutre: "",
        avocatAssigne: "",
        juridiction: "",
        juridictionAutre: "",
        statut: "EN_COURS",
        description: "",
    })

    useEffect(() => {
        Promise.all([
            api.get('/api/v1/clients'),
            api.get('/api/v1/audiences')
        ])
            .then(([clientsRes, audiencesRes]) => {
                setClients(clientsRes.data.data || [])
                setAudiences(audiencesRes.data.data || [])
            })
            .catch(console.error)
    }, [])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.clientId) { alert("Veuillez sélectionner un client."); return }

        setLoading(true)
        try {
            const statusMap: Record<string, string> = {
                EN_COURS: 'ouvert', EN_ATTENTE: 'en_instance', CLOTURE: 'cloture'
            }
            // Merge typeAffaire and typeDossier: send typeDossier as the DB 'type' column
            const typeMap: Record<string, string> = {
                CONTENTIEUX: 'contentieux', PRE_CONTENTIEUX: 'pre_contentieux',
                TRANSACTIONNEL: 'transactionnel', CONSEIL: 'conseil', AUTRE: 'autre'
            }

            const finalTypeDossier = formData.typeDossier === 'AUTRE'
                ? (formData.typeDossierAutre || 'contentieux')
                : (typeMap[formData.typeDossier] || 'contentieux')
            const finalDomaine = formData.domaineDroit === 'AUTRE'
                ? formData.domaineDroitAutre
                : formData.domaineDroit
            const finalJuridiction = formData.juridiction === 'Autre'
                ? formData.juridictionAutre
                : formData.juridiction

            const payload = {
                client_id: formData.clientId,
                reference,
                titre: formData.titre || null,
                type: finalTypeDossier,
                statut: statusMap[formData.statut] || 'en_cours',
                description: formData.description || null,
                juridiction: finalJuridiction || null,
                domaine: finalDomaine || null,
                audiencesIds: selectedAudiences,
            }

            const res = await api.post('/api/v1/dossiers', payload)
            const createdId = res.data?.id || res.data?.data?.id
            if (createdId) {
                router.push(`/dossiers/${createdId}`)
            } else {
                router.push('/dossiers')
            }
        } catch (error: any) {
            console.error("Error creating dossier:", error)
            alert("Erreur lors de la création du dossier: " + (error?.response?.data?.error || error.message))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
            {/* Header */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center px-8 shrink-0 z-10">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/dossiers" className="hover:text-blue-600 transition-colors">Index des Dossiers</Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 font-medium">Nouveau Dossier</span>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto py-8 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="font-serif text-3xl font-bold text-slate-900 mb-1">Nouveau Dossier</h1>
                        <p className="text-sm text-slate-500">Remplissez les informations ci-dessous pour créer un nouveau dossier juridique.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Reference + client in same row */}
                        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
                            <h2 className="font-serif text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">Identification</h2>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Reference */}
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Référence Dossier</label>
                                    <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 border border-slate-200 rounded text-sm font-mono text-slate-900">
                                        <span className="material-symbols-outlined text-slate-400 text-[16px]">lock</span>
                                        <span>{reference}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Générée automatiquement, non modifiable.</p>
                                </div>

                                {/* Statut */}
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Statut Inicial</label>
                                    <select
                                        value={formData.statut}
                                        onChange={e => handleChange('statut', e.target.value)}
                                        className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="EN_COURS">En cours</option>
                                        <option value="EN_ATTENTE">En attente</option>
                                        <option value="CLOTURE">Clôturé</option>
                                    </select>
                                </div>
                            </div>

                            {/* Client */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Client *</label>
                                <select
                                    value={formData.clientId}
                                    onChange={e => handleChange('clientId', e.target.value)}
                                    required
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">— Sélectionner un client —</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.type === 'PERSONNE_PHYSIQUE' ? `${c.nom} ${c.prenom}` : c.raisonSociale}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Titre */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Nom / Titre du Dossier</label>
                                <input
                                    type="text"
                                    value={formData.titre}
                                    onChange={e => handleChange('titre', e.target.value)}
                                    placeholder="Ex: Affaire SIB c/ Kouamé — Recouvrement de créances"
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="bg-white border border-slate-200 rounded p-6 space-y-6">
                            <h2 className="font-serif text-lg font-semibold text-slate-900 border-b border-slate-100 pb-3">Classification</h2>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Type d'affaire */}
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Type d'Affaire</label>
                                    <select
                                        value={formData.typeAffaire}
                                        onChange={e => handleChange('typeAffaire', e.target.value)}
                                        className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="CIVIL">Civil</option>
                                        <option value="COMMERCIAL">Commercial</option>
                                        <option value="PENAL">Pénal</option>
                                        <option value="ADMINISTRATIF">Administratif</option>
                                    </select>
                                </div>

                                {/* Type de dossier */}
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Type de Dossier</label>
                                    <select
                                        value={formData.typeDossier}
                                        onChange={e => handleChange('typeDossier', e.target.value)}
                                        className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="CONTENTIEUX">Contentieux</option>
                                        <option value="PRE_CONTENTIEUX">Pré-contentieux</option>
                                        <option value="TRANSACTIONNEL">Transactionnel</option>
                                        <option value="CONSEIL">Conseil</option>
                                        <option value="AUTRE">Autre (préciser)</option>
                                    </select>
                                    {formData.typeDossier === 'AUTRE' && (
                                        <input
                                            type="text"
                                            value={formData.typeDossierAutre}
                                            onChange={e => handleChange('typeDossierAutre', e.target.value)}
                                            placeholder="Précisez le type de dossier"
                                            className="mt-2 w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    )}
                                </div>

                                {/* Domaine du Droit */}
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Domaine du Droit</label>
                                    <select
                                        value={formData.domaineDroit}
                                        onChange={e => handleChange('domaineDroit', e.target.value)}
                                        className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="TRAVAIL">Droit du travail</option>
                                        <option value="CIVIL">Droit civil</option>
                                        <option value="IMMOBILIER">Droit immobilier</option>
                                        <option value="COMMERCIAL">Droit commercial</option>
                                        <option value="BANCAIRE">Droit bancaire</option>
                                        <option value="FISCAL">Droit fiscal</option>
                                        <option value="PENAL">Droit pénal</option>
                                        <option value="FAMILLE">Droit de la famille</option>
                                        <option value="PI">Propriété Intellectuelle</option>
                                        <option value="AUTRE">Autre (préciser)</option>
                                    </select>
                                    {formData.domaineDroit === 'AUTRE' && (
                                        <input
                                            type="text"
                                            value={formData.domaineDroitAutre}
                                            onChange={e => handleChange('domaineDroitAutre', e.target.value)}
                                            placeholder="Ex: Droit aérien, Droit maritime..."
                                            className="mt-2 w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                    )}
                                </div>

                                {/* Avocat assigné */}
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Avocat Assigné</label>
                                    <input
                                        type="text"
                                        value={formData.avocatAssigne}
                                        onChange={e => handleChange('avocatAssigne', e.target.value)}
                                        placeholder="Ex: Maître Kouamé, Maître Touré..."
                                        className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Audiences Liées */}
                                <div>
                                    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Audiences liées (Sélection Multiple)</label>
                                    <div className="border border-slate-200 rounded-md p-2 space-y-2 max-h-[82px] overflow-y-auto bg-white">
                                        {audiences.length === 0 ? (
                                            <p className="text-sm text-slate-500">Aucune audience disponible.</p>
                                        ) : (
                                            audiences.map(a => (
                                                <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        checked={selectedAudiences.includes(a.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedAudiences([...selectedAudiences, a.id])
                                                            else setSelectedAudiences(selectedAudiences.filter(id => id !== a.id))
                                                        }}
                                                    />
                                                    {a.titre || "Audience sans titre"}
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Juridiction */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Juridiction (Côte d'Ivoire)</label>
                                <select
                                    value={formData.juridiction}
                                    onChange={e => handleChange('juridiction', e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">— Sélectionner une juridiction —</option>
                                    {JURIDICTIONS_CI.map(j => (
                                        <option key={j} value={j}>{j}</option>
                                    ))}
                                </select>
                                {formData.juridiction === 'Autre' && (
                                    <input
                                        type="text"
                                        value={formData.juridictionAutre}
                                        onChange={e => handleChange('juridictionAutre', e.target.value)}
                                        placeholder="Précisez la juridiction"
                                        className="mt-2 w-full h-10 px-3 text-sm border border-slate-200 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Objet & Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    placeholder="Décrivez brièvement l'objet du dossier, les faits principaux et les enjeux..."
                                    rows={4}
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 pb-8">
                            <Link href="/dossiers" className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-8 py-2.5 rounded shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                            >
                                {loading ? (
                                    <><span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span> Création...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[16px]">add_circle</span> Créer le Dossier</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
