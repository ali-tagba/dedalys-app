"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

export default function DossiersPage() {
    const router = useRouter()
    const [dossiers, setDossiers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [typeFilter, setTypeFilter] = useState("ALL")
    const [domaineFilter, setDomaineFilter] = useState("ALL")
    const [juridictionFilter, setJuridictionFilter] = useState("ALL")

    // Dropdown state for Action menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Edit Modal state
    const [editDossierId, setEditDossierId] = useState<string | null>(null)
    const [editFormData, setEditFormData] = useState({ titre: "", type: "", statut: "", juridiction: "", domaine: "" })
    const [isSavingEdit, setIsSavingEdit] = useState(false)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const fetchDossiers = async () => {
        try {
            setLoading(true)
            const res = await api.get('/api/v1/dossiers')
            setDossiers(res.data.data || [])
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }
    useEffect(() => { fetchDossiers() }, [])

    const handleSaveEdit = async () => {
        if (!editDossierId) return
        setIsSavingEdit(true)
        try {
            await api.patch(`/api/v1/dossiers/${editDossierId}`, editFormData)
            setEditDossierId(null)
            fetchDossiers()
        } catch (e: any) {
            alert("Erreur lors de la modification : " + (e?.response?.data?.error || e.message))
        } finally {
            setIsSavingEdit(false)
        }
    }

    const filtered = dossiers.filter(d => {
        if (statusFilter !== "ALL" && d.statut !== statusFilter) return false
        if (typeFilter !== "ALL" && d.type !== typeFilter) return false
        if (domaineFilter !== "ALL" && d.domaine !== domaineFilter) return false
        if (juridictionFilter !== "ALL" && d.juridiction !== juridictionFilter) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            return d.titre?.toLowerCase().includes(q) || d.reference?.toLowerCase().includes(q) ||
                d.clients?.nom?.toLowerCase().includes(q) || d.clients?.raison_sociale?.toLowerCase().includes(q)
        }
        return true
    })

    const clientName = (d: any) => {
        if (!d.clients) return "—"
        return d.clients.statut === 'PP' ? `${d.clients.nom || ''} ${d.clients.prenom || ''}`.trim() : (d.clients.raison_sociale || "—")
    }
    const typeColor = (t: string) => ({ contentieux: 'bg-blue-50 text-blue-700 border-blue-100', conseil: 'bg-amber-50 text-amber-700 border-amber-100', penal: 'bg-red-50 text-red-700 border-red-100', transactionnel: 'bg-purple-50 text-purple-700 border-purple-100' }[t as string] || 'bg-slate-100 text-slate-700 border-slate-200')
    const typeLabel = (t: string) => ({ contentieux: 'Contentieux', conseil: 'Conseil', penal: 'Pénal', transactionnel: 'Transactionnel', autre: 'Autre' }[t as string] || t || '—')
    const statutColor = (s: string) => ({ en_cours: 'color:#059669', ouvert: 'color:#059669', en_instance: 'color:#64748b', en_attente: 'color:#64748b', cloture: 'color:#94A3B8', urgent: 'color:#dc2626', suspendu: 'color:#64748b' }[s as string] || 'color:#64748b')
    const statutLabel = (s: string) => ({ en_cours: 'En cours', ouvert: 'En cours', en_instance: 'En attente', en_attente: 'En attente', cloture: 'Clôturé', suspendu: 'Suspendu', urgent: 'Urgent' }[s as string] || s || '—')

    const getNextAudience = (d: any) => {
        if (d.prochaine_audience) return d.prochaine_audience;
        if (!d.audiences || d.audiences.length === 0) return null;

        const valid = d.audiences.filter((a: any) => a.date);
        if (valid.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const future = valid.filter((a: any) => new Date(a.date) >= today)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return future.length > 0 ? future[0].date : null;
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#F8F9FA' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E2E8F0', borderTop: '3px solid #2563EB', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F8F9FA' }}>

            {/* ── HEADER ── */}
            <div style={{ height: 64, flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 10 }}>
                <div style={{ flex: 1, maxWidth: 520 }}>
                    <div style={{ position: 'relative' }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 18, pointerEvents: 'none' }}>search</span>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un dossier, client, référence..."
                            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid #E2E8F0', borderRadius: 3, fontSize: 13, background: '#F8F9FA', outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 20 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', position: 'relative', display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
                        <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, background: '#F59E0B', borderRadius: '50%', border: '2px solid #fff' }} />
                    </button>
                    <div style={{ width: 1, height: 22, background: '#E2E8F0' }} />
                    <button onClick={() => router.push('/dossiers/nouveau')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2563EB', color: '#fff', border: 'none', borderRadius: 3, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add</span>
                        Nouveau Dossier
                    </button>
                </div>
            </div>

            {/* ── TITLE + FILTERS ── */}
            <div style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '16px 24px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 21, fontWeight: 700, color: '#0F172A', margin: 0 }}>Index des Dossiers</h2>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94A3B8' }}>{dossiers.length} ENREGISTREMENTS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, paddingBottom: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {[
                        { label: 'Juridiction', value: juridictionFilter, set: setJuridictionFilter, opts: [...new Set(dossiers.map(d => d.juridiction).filter(Boolean))] },
                        { label: 'Domaine', value: domaineFilter, set: setDomaineFilter, opts: [...new Set(dossiers.map(d => d.domaine).filter(Boolean))] },
                        { label: 'Statut', value: statusFilter, set: setStatusFilter, opts: ['en_cours', 'ouvert', 'en_instance', 'cloture', 'urgent', 'suspendu'] },
                        { label: "Type d'affaire", value: typeFilter, set: setTypeFilter, opts: ['contentieux', 'conseil', 'penal', 'transactionnel', 'autre'] },
                    ].map((f, i) => (
                        <span key={f.label} style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                            {i > 0 && <span style={{ display: 'inline-block', width: 1, height: 14, background: '#E2E8F0', margin: '0 6px' }} />}
                            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                                <select value={f.value} onChange={e => f.set(e.target.value)}
                                    style={{ appearance: 'none', background: 'none', border: 'none', padding: '7px 22px 7px 8px', fontSize: 13, fontWeight: 500, color: '#334155', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
                                    <option value="ALL">{f.label}</option>
                                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <span className="material-symbols-outlined" style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#94A3B8', pointerEvents: 'none' }}>expand_more</span>
                            </span>
                        </span>
                    ))}
                    <span style={{ flex: 1 }} />
                    <button onClick={fetchDossiers} title="Actualiser" style={{ display: 'flex', padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', borderRadius: 3 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 19 }}>refresh</span>
                    </button>
                    <button title="Exporter" style={{ display: 'flex', padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', borderRadius: 3 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 19 }}>download</span>
                    </button>
                </div>
            </div>

            {/* ── SCROLL ZONE ── */}
            <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <div
                    style={{ position: 'absolute', inset: 0, overflow: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 #F1F5F9' }}
                    className="dossier-scroll"
                >
                    <style>{`
                        .dossier-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                        .dossier-scroll::-webkit-scrollbar-track { background: #F1F5F9; }
                        .dossier-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
                        .dossier-scroll::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
                        .dossier-scroll::-webkit-scrollbar-corner { background: #F1F5F9; }
                        .dos-row:hover { background: #F8F9FA !important; }
                        .dos-btn:hover { opacity: 1 !important; }
                        .action-menu-item:hover { background: #F1F5F9; color: #2563EB; }
                        .action-menu-delete:hover { background: #FEF2F2; color: #EF4444; }
                    `}</style>

                    <table style={{ width: '100%', minWidth: 1400, borderCollapse: 'collapse', background: '#fff', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#F8F9FA', position: 'sticky', top: 0, zIndex: 4 }}>
                                {/* Increased left padding on the first column to prevent sidebar overlap */}
                                {[
                                    { label: 'ID Dossier', w: 140, padLeft: 24 },
                                    { label: 'Client', w: 180 },
                                    { label: 'Nom du dossier', w: 220 },
                                    { label: 'Type', w: 130 },
                                    { label: 'Domaine', w: 160 },
                                    { label: 'Avocats', w: 90 },
                                    { label: 'Juridiction', w: 170 },
                                    { label: 'Audience', w: 130 },
                                    { label: 'Statut', w: 100 },
                                    { label: 'Actions', w: 90, right: true },
                                ].map(col => (
                                    <th key={col.label}
                                        style={{ width: col.w, minWidth: col.w, padding: `8px 12px`, paddingLeft: col.padLeft || 12, borderBottom: '1px solid #E2E8F0', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94A3B8', textAlign: col.right ? 'right' : 'left', whiteSpace: 'nowrap', userSelect: 'none' }}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => (
                                <tr key={d.id} className="dos-row" onClick={() => router.push(`/dossiers/${d.id}`)}
                                    style={{ borderBottom: '1px solid #F1F5F9', height: 44, cursor: 'pointer', background: '#fff', transition: 'background 0.1s' }}>
                                    <td style={{ padding: '0 12px 0 24px', whiteSpace: 'nowrap' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{d.reference || 'DOS-000'}</span>
                                    </td>
                                    <td style={{ padding: '0 12px', maxWidth: 180 }}>
                                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1E293B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientName(d)}</span>
                                    </td>
                                    <td style={{ padding: '0 12px', maxWidth: 220 }}>
                                        <span title={d.titre} style={{ fontSize: 13, color: '#334155', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.titre || 'Sans titre'}</span>
                                    </td>
                                    <td style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 2, fontSize: 10, fontWeight: 600, border: '1px solid' }} className={typeColor(d.type)}>{typeLabel(d.type)}</span>
                                    </td>
                                    <td style={{ padding: '0 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 13 }}>{d.domaine || '—'}</td>
                                    <td style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', marginLeft: 0 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E2E8F0', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#475569' }}>JD</div>
                                            {d.type === 'contentieux' && <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#CBD5E1', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#334155', marginLeft: -8 }}>MK</div>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0 12px', whiteSpace: 'nowrap', color: '#475569', fontSize: 13 }}>{d.juridiction || '—'}</td>
                                    <td style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                                        {getNextAudience(d) ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 2, padding: '2px 7px' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>gavel</span>
                                                {new Date(getNextAudience(d)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </span>
                                        ) : <span style={{ color: '#CBD5E1', fontSize: 12 }}>—</span>}
                                    </td>
                                    <td style={{ padding: '0 12px', whiteSpace: 'nowrap' }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, ...Object.fromEntries(statutColor(d.statut).split(';').map(s => s.trim().split(':'))) }}>{statutLabel(d.statut)}</span>
                                    </td>
                                    <td style={{ padding: '0 12px', whiteSpace: 'nowrap', textAlign: 'right', position: 'relative' }} onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === d.id ? null : d.id) }}
                                            style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, border: '1px solid transparent', background: openMenuId === d.id ? '#F1F5F9' : 'transparent', cursor: 'pointer', color: '#64748B', transition: 'all 0.15s' }}
                                            className="hover:bg-slate-100 hover:border-slate-200"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>more_horiz</span>
                                        </button>

                                        {openMenuId === d.id && (
                                            <div ref={menuRef} style={{ position: 'absolute', right: 30, top: 35, width: 180, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', zIndex: 50, padding: 4, textAlign: 'left' }}>
                                                <button onClick={() => router.push(`/dossiers/${d.id}`)} className="action-menu-item" style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#334155', borderRadius: 4, transition: 'background 0.1s' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                                                    Entrez dans le dossier
                                                </button>
                                                <button onClick={() => {
                                                    setOpenMenuId(null)
                                                    setEditFormData({
                                                        titre: d.titre || "",
                                                        type: d.type || "conseil",
                                                        statut: d.statut || "en_cours",
                                                        juridiction: d.juridiction || "",
                                                        domaine: d.domaine || ""
                                                    })
                                                    setEditDossierId(d.id)
                                                }} className="action-menu-item" style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#334155', borderRadius: 4, transition: 'background 0.1s' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                                                    Modifier
                                                </button>
                                                <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
                                                <button onClick={() => { if (confirm('Supprimer ce dossier définitivement ?')) api.delete(`/api/v1/dossiers/${d.id}`).then(fetchDossiers) }} className="action-menu-delete" style={{ width: '100%', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#EF4444', borderRadius: 4, transition: 'background 0.1s' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                                                    Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={10} style={{ padding: '48px 12px', textAlign: 'center', fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>Aucun dossier correspondant à vos critères.</td></tr>
                            )}
                            <tr style={{ height: 40 }}><td colSpan={10} /></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── FOOTER PAGINATION ── */}
            <div style={{ height: 48, flexShrink: 0, borderTop: '1px solid #E2E8F0', background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                    Affichage <strong style={{ color: '#1E293B' }}>1–{filtered.length}</strong> de <strong style={{ color: '#1E293B' }}>{dossiers.length}</strong>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                        Lignes par page:
                        <select style={{ border: 'none', fontSize: 12, fontWeight: 600, color: '#1E293B', background: 'none', outline: 'none', cursor: 'pointer' }}>
                            <option>50</option><option>100</option><option>200</option>
                        </select>
                    </label>
                    <div style={{ display: 'flex', gap: 14 }}>
                        <button disabled style={{ fontSize: 12, fontWeight: 600, color: '#CBD5E1', background: 'none', border: 'none', cursor: 'not-allowed' }}>Précédent</button>
                        <button style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>Suivant</button>
                    </div>
                </div>
            </div>

            {/* ── MODAL DE MODIFICATION ── */}
            {editDossierId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: 8, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Modifier le dossier</h3>
                            <button onClick={() => setEditDossierId(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span></button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Titre du dossier</label>
                                <input type="text" value={editFormData.titre} onChange={e => setEditFormData({ ...editFormData, titre: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 13, outline: 'none', color: '#0F172A' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Type</label>
                                    <select value={editFormData.type} onChange={e => setEditFormData({ ...editFormData, type: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 13, outline: 'none', color: '#0F172A', background: '#fff' }}>
                                        <option value="contentieux">Contentieux</option>
                                        <option value="conseil">Conseil</option>
                                        <option value="penal">Pénal</option>
                                        <option value="transactionnel">Transactionnel</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Statut</label>
                                    <select value={editFormData.statut} onChange={e => setEditFormData({ ...editFormData, statut: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 13, outline: 'none', color: '#0F172A', background: '#fff' }}>
                                        <option value="en_cours">En cours</option>
                                        <option value="en_instance">En attente</option>
                                        <option value="cloture">Clôturé</option>
                                        <option value="suspendu">Suspendu</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Domaine du droit</label>
                                    <input type="text" value={editFormData.domaine} onChange={e => setEditFormData({ ...editFormData, domaine: e.target.value })} placeholder="ex: Droit commercial" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 13, outline: 'none', color: '#0F172A' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Juridiction</label>
                                    <input type="text" value={editFormData.juridiction} onChange={e => setEditFormData({ ...editFormData, juridiction: e.target.value })} placeholder="ex: TPI Abidjan" style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 13, outline: 'none', color: '#0F172A' }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', background: '#F8F9FA', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button onClick={() => setEditDossierId(null)} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 13, fontWeight: 500, color: '#475569', cursor: 'pointer' }}>Annuler</button>
                            <button onClick={handleSaveEdit} disabled={isSavingEdit} style={{ padding: '8px 16px', background: '#2563EB', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: isSavingEdit ? 0.7 : 1 }}>
                                {isSavingEdit && <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>progress_activity</span>}
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

