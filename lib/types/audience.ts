
export type AudienceStatus = "UPCOMING" | "COMPLETED" | "CANCELLED" | "POSTPONED"

export interface Audience {
    id: string
    titre: string | null // Changed from title to match schema
    date: string // ISO Date string
    heure?: string | null
    juridiction: string | null
    avocat: string | null
    clientId: string
    dossierId: string
    statut: string // "A_VENIR" | "TERMINEE" | "REPORTEE" | "ANNULEE"
    notes?: string | null
    client?: any
    dossier?: any
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
