import postgres from 'postgres';

const connectionString = 'postgresql://postgres.xgytxckiatphdxkifctb:G7%40vT3dedalys%23Lp9%21Kx5%24Zm2Q@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const sql = postgres(connectionString, { ssl: 'require' });

async function run() {
    try {
        console.log("1. Ajout statut_facturation...");
        await sql`ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS statut_facturation text DEFAULT 'NON_REGLE';`;

        console.log("2. Ajout logo_url et avatar_url...");
        await sql`ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS logo_url text;`;
        await sql`ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS avatar_url text;`;
        await sql`ALTER TABLE public.points_de_contact ADD COLUMN IF NOT EXISTS avatar_url text;`;

        console.log("3. Création notes_privees...");
        await sql`
      CREATE TABLE IF NOT EXISTS public.notes_privees (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
          auteur_id uuid REFERENCES public.utilisateurs(id) ON DELETE SET NULL,
          contenu text NOT NULL,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;

        console.log("4. Configuration RLS...");
        await sql`ALTER TABLE public.notes_privees ENABLE ROW LEVEL SECURITY;`;

        try { await sql`DROP POLICY IF EXISTS "Users can view notes of their clients" ON public.notes_privees;` } catch (e) { }
        try { await sql`DROP POLICY IF EXISTS "Users can insert notes for their clients" ON public.notes_privees;` } catch (e) { }
        try { await sql`DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes_privees;` } catch (e) { }
        try { await sql`DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes_privees;` } catch (e) { }

        await sql`
      CREATE POLICY "Users can view notes of their clients" ON public.notes_privees
          FOR SELECT USING (
              client_id IN (
                  SELECT id FROM public.clients WHERE espace_id IN (
                      SELECT espace_id FROM public.utilisateurs WHERE id = auth.uid()
                  )
              )
          );
    `;
        await sql`
      CREATE POLICY "Users can insert notes for their clients" ON public.notes_privees
          FOR INSERT WITH CHECK (
              client_id IN (
                  SELECT id FROM public.clients WHERE espace_id IN (
                      SELECT espace_id FROM public.utilisateurs WHERE id = auth.uid()
                  )
              )
          );
    `;
        await sql`
      CREATE POLICY "Users can update their own notes" ON public.notes_privees
          FOR UPDATE USING (
              auteur_id = auth.uid()
          );
    `;
        await sql`
      CREATE POLICY "Users can delete their own notes" ON public.notes_privees
          FOR DELETE USING (
              auteur_id = auth.uid()
          );
    `;

        console.log("5. Migration des notes existantes...");
        await sql`
      INSERT INTO public.notes_privees (client_id, contenu)
      SELECT id, notes FROM public.clients 
      WHERE notes IS NOT NULL AND notes != '' AND notes != 'Client du cabinet.'
      ON CONFLICT DO NOTHING;
    `;

        console.log("SQL Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await sql.end();
    }
}

run();
