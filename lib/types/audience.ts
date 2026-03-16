
export type AudienceStatus = "UPCOMING" | "COMPLETED" | "CANCELLED" | "POSTPONED"

export interface Audience {
    id: string
    titre?: string | null
    date: string
    heure?: string | null
    juridiction?: string | null
    avocat?: string | null
    clientId?: string
    dossierId?: string
    statut?: string
    resultat?: string | null
    notes?: string | null
    salle_audience?: string | null
    salleAudience?: string | null
    duree?: string | null
    client?: any
    dossier?: any
    utilisateurs?: { nom?: string; prenom?: string }
    flashCR?: any
}

export interface FlashCR {
    id: string
    audienceId: string
    clientId: string
    dossierId: string
    contenu: string
    dateCreation: string
    destinataires: string[] // emails
    statutEnvoi: "SENT" | "DRAFT"
}
