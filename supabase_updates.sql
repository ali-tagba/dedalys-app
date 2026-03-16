-- ══════════════════════════════════════════════════════════════════════════════
-- DEDALYS — Modifications Supabase (version corrigée, compatible Backend + Frontend)
-- Exécuter dans Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════
--
-- IMPORTANT BUCKET : Le backend Python utilise STORAGE_BUCKET = "dedalys-fichiers".
-- On crée aussi "fichiers" pour le frontend Next.js. Les deux coexistent.
-- Si votre backend pointe vers "dedalys-fichiers", créez-le dans le Dashboard
-- ou via ce script (alias ajouté en section 1b).
--

-- ==========================================
-- 1. BUCKETS STORAGE (GED, Avatars, Logos)
-- ==========================================

-- 1a. Bucket "fichiers" (frontend Next.js / GED)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fichiers', 'fichiers', true) 
ON CONFLICT (id) DO NOTHING;

-- 1b. Bucket "dedalys-fichiers" (backend Python — STORAGE_BUCKET)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dedalys-fichiers', 'dedalys-fichiers', false) 
ON CONFLICT (id) DO NOTHING;

-- 1c. Bucket "avatars" (profils clients)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- 1d. Bucket "logos" (logos entreprises)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. POLICIES STORAGE — fichiers (noms uniques, idempotent)
-- ==========================================
DO $$
BEGIN
    DROP POLICY IF EXISTS "dedalys_fichiers_insert" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_fichiers_select" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_fichiers_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "dedalys_fichiers_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'fichiers' AND auth.role() = 'authenticated');

CREATE POLICY "dedalys_fichiers_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'fichiers');

CREATE POLICY "dedalys_fichiers_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'fichiers' AND auth.role() = 'authenticated');

-- ==========================================
-- 3. POLICIES STORAGE — dedalys-fichiers (backend)
-- ==========================================
DO $$
BEGIN
    DROP POLICY IF EXISTS "dedalys_dedalys_fichiers_insert" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_dedalys_fichiers_select" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_dedalys_fichiers_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "dedalys_dedalys_fichiers_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'dedalys-fichiers' AND auth.role() = 'authenticated');

CREATE POLICY "dedalys_dedalys_fichiers_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'dedalys-fichiers');

CREATE POLICY "dedalys_dedalys_fichiers_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'dedalys-fichiers' AND auth.role() = 'authenticated');

-- ==========================================
-- 4. POLICIES STORAGE — avatars
-- ==========================================
DO $$
BEGIN
    DROP POLICY IF EXISTS "dedalys_avatars_insert" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_avatars_update" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_avatars_select" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_avatars_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "dedalys_avatars_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "dedalys_avatars_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "dedalys_avatars_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "dedalys_avatars_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ==========================================
-- 5. POLICIES STORAGE — logos
-- ==========================================
DO $$
BEGIN
    DROP POLICY IF EXISTS "dedalys_logos_insert" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_logos_update" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_logos_select" ON storage.objects;
    DROP POLICY IF EXISTS "dedalys_logos_delete" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "dedalys_logos_insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "dedalys_logos_update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

CREATE POLICY "dedalys_logos_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "dedalys_logos_delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- ==========================================
-- 6. SCHEMA — Clients
-- ==========================================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS statut_facturation text DEFAULT 'NON_REGLE';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS date_naissance date;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS lieu_naissance text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nationalite text DEFAULT 'Ivoirienne';
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS situation_familiale text;

ALTER TABLE public.points_de_contact ADD COLUMN IF NOT EXISTS avatar_url text;

-- ==========================================
-- 7. TABLE notes_privees
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notes_privees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
    auteur_id uuid REFERENCES public.utilisateurs(id) ON DELETE SET NULL,
    contenu text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notes_privees ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view notes of their clients" ON public.notes_privees;
    DROP POLICY IF EXISTS "Users can insert notes for their clients" ON public.notes_privees;
    DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes_privees;
    DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes_privees;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can view notes of their clients" ON public.notes_privees
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM public.clients WHERE espace_id IN (
                SELECT espace_id FROM public.utilisateurs WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert notes for their clients" ON public.notes_privees
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM public.clients WHERE espace_id IN (
                SELECT espace_id FROM public.utilisateurs WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own notes" ON public.notes_privees
    FOR UPDATE USING (auteur_id = auth.uid());

CREATE POLICY "Users can delete their own notes" ON public.notes_privees
    FOR DELETE USING (auteur_id = auth.uid());

-- Migration des notes existantes (seulement si la colonne clients.notes existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'notes'
    ) THEN
        INSERT INTO public.notes_privees (client_id, contenu)
        SELECT c.id, c.notes FROM public.clients c
        WHERE c.notes IS NOT NULL AND c.notes != '' AND c.notes != 'Client du cabinet.'
          AND NOT EXISTS (SELECT 1 FROM public.notes_privees np WHERE np.client_id = c.id AND np.contenu = c.notes);
    END IF;
END $$;

-- ==========================================
-- 8. SCHEMA — Dossiers & Fichiers
-- ==========================================
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS prochaine_audience date;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS juridiction text;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS domaine text;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS chambre text;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS date_ouverture date;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS date_prescription date;

ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS couleur text DEFAULT 'blue';

-- ==========================================
-- 9. TABLE notes_dossier
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notes_dossier (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dossier_id uuid REFERENCES public.dossiers(id) ON DELETE CASCADE NOT NULL,
    auteur_id uuid REFERENCES public.utilisateurs(id) ON DELETE SET NULL,
    contenu text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notes_dossier ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view dossier notes" ON public.notes_dossier;
    DROP POLICY IF EXISTS "Users can insert dossier notes" ON public.notes_dossier;
    DROP POLICY IF EXISTS "Users can update dossier notes" ON public.notes_dossier;
    DROP POLICY IF EXISTS "Users can delete dossier notes" ON public.notes_dossier;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can view dossier notes" ON public.notes_dossier
    FOR SELECT USING (
        dossier_id IN (
            SELECT id FROM public.dossiers WHERE espace_id IN (
                SELECT espace_id FROM public.utilisateurs WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert dossier notes" ON public.notes_dossier
    FOR INSERT WITH CHECK (
        dossier_id IN (
            SELECT id FROM public.dossiers WHERE espace_id IN (
                SELECT espace_id FROM public.utilisateurs WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update dossier notes" ON public.notes_dossier
    FOR UPDATE USING (auteur_id = auth.uid());

CREATE POLICY "Users can delete dossier notes" ON public.notes_dossier
    FOR DELETE USING (
        dossier_id IN (
            SELECT id FROM public.dossiers WHERE espace_id IN (
                SELECT espace_id FROM public.utilisateurs WHERE id = auth.uid()
            )
        )
    );

-- ==========================================
-- 10. AUDIENCES — Nouvelles colonnes
-- ==========================================
ALTER TABLE public.audiences ADD COLUMN IF NOT EXISTS titre text;
ALTER TABLE public.audiences ADD COLUMN IF NOT EXISTS statut text DEFAULT 'A_VENIR';
ALTER TABLE public.audiences ADD COLUMN IF NOT EXISTS resultat text;
ALTER TABLE public.audiences ADD COLUMN IF NOT EXISTS salle_audience text;
ALTER TABLE public.audiences ADD COLUMN IF NOT EXISTS duree text;

-- NOTE : On ne modifie PAS les contraintes NOT NULL sur dossier_id, avocat_assigne_id, heure
-- pour rester compatible avec le backend Python. Le frontend exige un dossier à la création.

-- ==========================================
-- FIN DU SCRIPT
-- ==========================================
