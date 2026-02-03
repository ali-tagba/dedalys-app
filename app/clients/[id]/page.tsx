"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { ContactFormDialog } from "@/components/clients/contact-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Pencil,
    Trash2,
    Briefcase,
    TrendingUp,
    Plus,
    CheckCircle2,
    Calendar,
    FileText,
    Building2,
    MoreHorizontal,
    Globe,
    CreditCard
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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
            const response = await fetch(`/api/clients/${resolvedParams.id}`)
            if (!response.ok) {
                if (response.status === 404) return notFound()
                throw new Error('Failed to fetch client')
            }
            const data = await response.json()
            setClient(data)
        } catch (error) {
            console.error('Error fetching client:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return
        try {
            const response = await fetch(`/api/clients/${resolvedParams.id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete client')
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
    const totalBilled = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.montantTTC || 0), 0) || 0
    const unpaidAmount = client.invoices?.reduce((sum: number, inv: any) => sum + (inv.montantTTC - inv.montantPaye || 0), 0) || 0
    const paidAmount = totalBilled - unpaidAmount

    return (
        <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
            {/* Header / Breadcrumb */}
            <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between flex-none z-10">
                <div className="flex items-center gap-4">
                    <Link href="/clients">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            {client.type === "PERSONNE_PHYSIQUE" ? `${client.nom} ${client.prenom}` : client.raisonSociale}
                            <Badge variant={client.type === "PERSONNE_MORALE" ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 h-5 rounded-full font-medium">
                                {client.type === "PERSONNE_MORALE" ? "Entreprise" : "Particulier"}
                            </Badge>
                        </h1>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {client.id.split('-')[0]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)} className="gap-2">
                        <Pencil className="h-3.5 w-3.5" /> Modifier
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex">

                {/* Sidebar Info - Scrollable */}
                <div className="w-80 lg:w-96 flex-none bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Identity Card */}
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="h-28 w-28 mb-4 ring-4 ring-slate-50 shadow-sm">
                            <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 font-bold">
                                {client.type === "PERSONNE_PHYSIQUE"
                                    ? `${client.nom?.[0]}${client.prenom?.[0]}`
                                    : client.raisonSociale?.[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="w-full space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Dossiers</p>
                                    <p className="text-xl font-bold text-slate-900">{activeDossiers}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Facturé</p>
                                    <p className="text-sm font-bold text-slate-900 truncate" title={formatCurrency(totalBilled)}>
                                        {(totalBilled / 1000).toFixed(0)}k <span className="text-[10px] text-slate-400">FCFA</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Coordonnées</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 group">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Email</p>
                                    <a href={`mailto:${client.email}`} className="text-sm text-slate-900 font-medium hover:text-blue-600 truncate block">
                                        {client.email || "-"}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Téléphone</p>
                                    <p className="text-sm text-slate-900 font-medium select-all">{client.telephone || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Adresse</p>
                                    <p className="text-sm text-slate-900 font-medium leading-relaxed">
                                        {client.adresse || "Non renseignée"}<br />
                                        {client.ville && <span className="text-slate-500">{client.ville}, {client.pays}</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {client.type === "PERSONNE_MORALE" && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Informations Légales</h3>
                                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Forme</span>
                                        <Badge variant="outline" className="bg-white">{client.formeJuridique || "N/A"}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">RCCM</span>
                                        <span className="font-mono text-slate-900 select-all">{client.numeroRCCM || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Contacts List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contacts Clés</h3>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-slate-100" onClick={() => { setSelectedContact(null); setContactDialogOpen(true) }}>
                                <Plus className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {client.contacts?.map((contact: any) => (
                                <div key={contact.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all" onClick={() => { setSelectedContact(contact); setContactDialogOpen(true) }}>
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                                            {contact.prenom?.[0]}{contact.nom?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{contact.prenom} {contact.nom}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{contact.fonction || "Aucune fonction"}</p>
                                    </div>
                                </div>
                            ))}
                            {(!client.contacts || client.contacts.length === 0) && (
                                <p className="text-sm text-slate-400 italic text-center py-2">Aucun contact enregistré</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <Tabs defaultValue="overview" className="w-full space-y-8">
                        <TabsList className="bg-white border p-1 rounded-xl shadow-sm inline-flex h-auto w-auto">
                            <TabsTrigger value="overview" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium">Vue d'ensemble</TabsTrigger>
                            <TabsTrigger value="dossiers" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium">Dossiers</TabsTrigger>
                            <TabsTrigger value="factures" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium">Facturation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
                            {/* Financial Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Chiffre d'Affaires</p>
                                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(totalBilled)}</h3>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Encaissé</p>
                                                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(paidAmount)}</h3>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className={`border-slate-200 shadow-sm hover:shadow-md transition-shadow ${unpaidAmount > 0 ? 'bg-red-50/50' : ''}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-100 rounded-xl text-red-600">
                                                <CreditCard className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Reste à payer</p>
                                                <h3 className="text-2xl font-bold text-red-600">{formatCurrency(unpaidAmount)}</h3>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Activity / Notes */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="border-slate-200 shadow-sm h-full">
                                    <CardHeader className="pb-3 border-b border-slate-100">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" /> Prochaines Audiences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {client.audiences?.length > 0 ? (
                                            <div className="divide-y divide-slate-100">
                                                {client.audiences.slice(0, 3).map((audience: any) => (
                                                    <div key={audience.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                                        <div className="h-12 w-12 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center shadow-sm text-slate-700">
                                                            <span className="text-xs font-bold uppercase text-red-500">{new Date(audience.date).toLocaleString('default', { month: 'short' })}</span>
                                                            <span className="text-lg font-bold">{new Date(audience.date).getDate()}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-slate-900 truncate">{audience.titre}</h4>
                                                            <p className="text-sm text-slate-500 truncate">{audience.juridiction || "Tribunal"}</p>
                                                        </div>
                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">{audience.statut}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-slate-500 italic">Aucune audience pour le moment.</div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 shadow-sm bg-slate-900 text-white h-full relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] transform translate-x-10 -translate-y-10"></div>
                                    <CardHeader className="pb-3 relative z-10">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                                            <FileText className="h-4 w-4 text-blue-400" /> Notes Internes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 min-h-[160px]">
                                            <p className="text-slate-200 text-sm leading-relaxed italic">
                                                "{client.notes || "Ajoutez des notes privées sur ce client ici..."}"
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="dossiers" className="space-y-6 animate-in fade-in-50 duration-500">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-slate-900">Affaires en cours</h3>
                                <Link href={`/dossiers?clientId=${client.id}`}>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        <Plus className="h-4 w-4 mr-2" /> Nouveau Dossier
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {client.dossiers?.map((dossier: any) => (
                                    <div key={dossier.id} className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Briefcase className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-700 transition-colors">{dossier.numero}</h4>
                                                    <Badge className={
                                                        dossier.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                            dossier.statut === 'CLOTURE' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' :
                                                                'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                    }>{dossier.statut}</Badge>
                                                </div>
                                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                                    <ScaleIcon className="h-3.5 w-3.5" />
                                                    {dossier.type} • {dossier.juridiction || "Juridiction non définie"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs text-slate-400 uppercase font-semibold">Dernière activité</p>
                                                <p className="text-sm font-medium text-slate-700">{new Date(dossier.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                            <Link href={`/dossiers/${dossier.id}`}>
                                                <Button variant="ghost" className="group-hover:translate-x-1 transition-transform">
                                                    Ouvrir
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {(!client.dossiers || client.dossiers.length === 0) && (
                                    <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                        <h3 className="text-lg font-medium text-slate-900">Aucun dossier</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto mt-2">Ce client n'a pas encore de dossier associé. Créez-en un pour commencer.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="factures" className="animate-in fade-in-50 duration-500">
                            <Card className="border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-0">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Numéro</th>
                                                <th className="px-6 py-3 font-medium">Date</th>
                                                <th className="px-6 py-3 font-medium text-right">Montant TTC</th>
                                                <th className="px-6 py-3 font-medium text-center">Statut</th>
                                                <th className="px-6 py-3 font-medium"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {client.invoices?.map((invoice: any) => (
                                                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.numero}</td>
                                                    <td className="px-6 py-4 text-slate-500">{new Date(invoice.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right font-mono font-medium">{formatCurrency(invoice.montantTTC)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge variant={invoice.statut === "PAYEE" ? "default" : invoice.statut === "IMPAYEE" ? "destructive" : "secondary"}>
                                                            {invoice.statut}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="sm">Détails</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!client.invoices || client.invoices.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">Aucune facture enregistrée for ce client.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

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

function ScaleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </svg>
    )
}

