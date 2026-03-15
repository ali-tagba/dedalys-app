"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { api } from "@/lib/api"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { ContactFormDialog } from "@/components/clients/contact-form-dialog"
import { CompanyClientDetail } from "@/components/clients/company-client-detail"
import { IndividualClientDetail } from "@/components/clients/individual-client-detail"

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [client, setClient] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [contactDialogOpen, setContactDialogOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<any>(null)

    const fetchClient = async () => {
        try {
            setLoading(true)

            const clientRes = await api.get(`/api/v1/clients/${resolvedParams.id}`)
            const data = clientRes.data.data || clientRes.data

            // Mapping statut / type for dossier
            const statusMap: Record<string, string> = { 'ouvert': 'EN_COURS', 'en_instance': 'EN_ATTENTE', 'cloture': 'CLOTURE' }
            const typeMap: Record<string, string> = { 'contentieux': 'CONTENTIEUX', 'pre_contentieux': 'PRE_CONTENTIEUX', 'transactionnel': 'TRANSACTIONNEL', 'conseil': 'CONSEIL' }

            // Extract Audiences from Dossiers
            const allAudiences = (data.dossiers || []).flatMap((d: any) => d.audiences || [])

            const mappedDossiers = Array.isArray(data.dossiers) ? data.dossiers.map((d: any) => ({
                id: d.id,
                numero: d.reference || "N/A",
                titre: d.titre,
                description: d.description,
                statut: statusMap[d.statut] || 'EN_COURS',
                type: typeMap[d.type] || 'CONSEIL',
                juridiction: d.juridiction || d.partie_adverse || "Tribunal Non Défini",
                revenuAttendu: d.revenu_attendu || 0,
                updatedAt: d.updated_at || d.created_at,
            })) : [];

            // Map Invoices (Paiements)
            const mappedInvoices = Array.isArray(data.invoices) ? data.invoices.map((p: any) => ({
                id: p.id,
                numero: `FAC-${p.id.split('-')[0]}`,
                date: p.date_reception,
                montantTTC: p.montant,
                statut: 'PAYEE' // In Dedalys backend MVP, paiements are money received
            })) : [];

            const mappedClient: any = {
                id: data.id,
                type: data.type, // type is already PERSONNE_MORALE or PERSONNE_PHYSIQUE from backend
                nom: data.nom || '',
                prenom: data.prenom || '',
                raisonSociale: data.raisonSociale || '',
                email: data.email || '',
                telephone: data.telephone || '',
                adresse: data.adresse || '',
                ville: data.ville || '',
                pays: data.pays || "Côte d'Ivoire",
                formeJuridique: data.formeJuridique,
                numeroRCCM: data.numeroRCCM,
                dateNaissance: data.dateNaissance || '',
                lieuNaissance: data.lieuNaissance || '',
                nationalite: data.nationalite || 'Ivoirienne',
                situationFamiliale: data.situation_familiale || data.situationFamiliale || '',
                _count: data._count,
                dossiers: mappedDossiers,
                invoices: mappedInvoices,
                contacts: data.contacts || [],
                audiences: allAudiences.map((a: any) => ({
                    id: a.id,
                    date: a.date,
                    titre: a.titre || a.notes || 'Audience',
                    juridiction: a.juridiction || 'Non défini',
                    statut: a.statut || 'A_VENIR',
                    resultat: a.resultat || null
                })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
                notes: data.notes || "Client du cabinet.",
                revenuAttendu: data.revenu_attendu_total || 0,
                statut_facturation: data.statut_facturation || "NON_REGLE",
                avatar_url: data.avatar_url || null,
                logo_url: data.logo_url || null,
            }

            setClient(mappedClient)
        } catch (error: any) {
            console.error('Error fetching client:', error)
            if (error?.response?.status === 404) return notFound()
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
        try {
            await api.delete(`/api/v1/clients/${resolvedParams.id}`)
            window.location.href = '/clients'
        } catch (error) {
            console.error('Error deleting client:', error)
            alert('Erreur lors de la suppression')
        }
    }

    useEffect(() => {
        fetchClient()
    }, [resolvedParams.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-200 border-t-blue-600"></div>
            </div>
        )
    }

    if (!client) return notFound()

    const activeDossiers = client._count?.dossiers || 0
    // Total Billed = sum of expected revenue across all dossiers + client base revenue
    const totalDossiersRevenue = client.dossiers?.reduce((sum: number, d: any) => sum + (d.revenuAttendu || 0), 0) || 0
    const totalBilled = Math.max(client.revenuAttendu || 0, totalDossiersRevenue)

    // Paid amount = sum of all received payments (invoices mock)
    const paidAmount = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.montantTTC || 0), 0) || 0
    const unpaidAmount = Math.max(0, totalBilled - paidAmount)

    return (
        <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
            {client.type === 'PERSONNE_MORALE' ? (
                <CompanyClientDetail
                    client={client}
                    onEdit={() => setEditDialogOpen(true)}
                    onDelete={handleDelete}
                    onAddContact={() => { setSelectedContact(null); setContactDialogOpen(true) }}
                    onEditContact={(contact: any) => { setSelectedContact(contact); setContactDialogOpen(true) }}
                    activeDossiers={activeDossiers}
                    totalBilled={totalBilled}
                    paidAmount={paidAmount}
                    unpaidAmount={unpaidAmount}
                />
            ) : (
                <IndividualClientDetail
                    client={client}
                    onEdit={() => setEditDialogOpen(true)}
                    onDelete={handleDelete}
                    onAddContact={() => { setSelectedContact(null); setContactDialogOpen(true) }}
                    onEditContact={(contact: any) => { setSelectedContact(contact); setContactDialogOpen(true) }}
                    activeDossiers={activeDossiers}
                    totalBilled={totalBilled}
                    paidAmount={paidAmount}
                    unpaidAmount={unpaidAmount}
                />
            )}

            {/* Dialogs */}
            <ClientFormDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                client={client}
                onSuccess={fetchClient}
            />
            <ContactFormDialog
                open={contactDialogOpen}
                onOpenChange={setContactDialogOpen}
                clientId={client.id}
                contact={selectedContact}
                onSuccess={fetchClient}
            />
        </div>
    )
}

