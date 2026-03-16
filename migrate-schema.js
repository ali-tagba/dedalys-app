const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function run() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("No POSTGRES_URL_NON_POOLING found in .env");
        return;
    }

    console.log("Connecting to Postgres (direct, non-pooling)...");
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const queries = [
        // Ensure all GED columns exist
        `ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS is_folder boolean DEFAULT false`,
        `ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.fichiers(id) ON DELETE CASCADE`,
        `ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS couleur text DEFAULT 'blue'`,
        `ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS url text`,
        `ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS taille bigint DEFAULT 0`,
        `ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS type_fichier text`,
        `ALTER TABLE public.fichiers ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false`,
        // Make chemin_stockage nullable (folders don't have a storage path)
        `ALTER TABLE public.fichiers ALTER COLUMN chemin_stockage DROP NOT NULL`,
        // Create notes_dossier table
        `CREATE TABLE IF NOT EXISTS public.notes_dossier (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            dossier_id uuid REFERENCES public.dossiers(id) ON DELETE CASCADE NOT NULL,
            auteur_id uuid REFERENCES public.utilisateurs(id) ON DELETE SET NULL,
            contenu text NOT NULL,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        )`,
        // Enable RLS but allow authenticated users
        `ALTER TABLE public.notes_dossier ENABLE ROW LEVEL SECURITY`,
        `ALTER TABLE public.fichiers ENABLE ROW LEVEL SECURITY`,
        // Create fichiers storage bucket
        `INSERT INTO storage.buckets (id, name, public) VALUES ('fichiers', 'fichiers', true) ON CONFLICT (id) DO NOTHING`,
    ];

    for (const sql of queries) {
        try {
            await client.query(sql);
            console.log(`✓ ${sql.slice(0, 60).trim()}...`);
        } catch (e) {
            if (e.message.includes('already exists') || e.message.includes('duplicate')) {
                console.log(`  skip (exists): ${sql.slice(0, 60).trim()}`);
            } else {
                console.error(`✗ Error: ${e.message} | SQL: ${sql.slice(0, 80)}`);
            }
        }
    }

    // Test: verify notes_dossier table
    try {
        const r = await client.query(`SELECT COUNT(*) FROM public.notes_dossier`);
        console.log(`\n✓ notes_dossier table OK, ${r.rows[0].count} rows`);
    } catch (e) {
        console.error('✗ notes_dossier not accessible:', e.message);
    }

    // Test: verify fichiers columns
    const r2 = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='fichiers'
        ORDER BY ordinal_position
    `);
    console.log(`\n✓ fichiers columns:`, r2.rows.map(r => r.column_name).join(', '));

    await client.end();
    console.log('\nDone!');
}

run().catch(console.error);
