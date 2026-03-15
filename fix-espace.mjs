import { Client } from 'pg';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function run() {
    let connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (!connectionString) {
        console.error("No DATABASE_URL found.");
        return;
    }

    if (!connectionString.includes('sslmode=require')) {
        connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
    }

    console.log("Connecting to Postgres...", connectionString.split('@')[1]);
    const client = new Client({ connectionString });
    await client.connect();

    try {
        let res = await client.query('SELECT id FROM espaces LIMIT 1');
        let espaceId;
        if (res.rowCount === 0) {
            const insert = await client.query("INSERT INTO espaces (nom) VALUES ('Espace Principal') RETURNING id");
            espaceId = insert.rows[0].id;
            console.log("Created fallback Espace:", espaceId);
        } else {
            espaceId = res.rows[0].id;
        }

        console.log('Using espaceId:', espaceId);

        await client.query('UPDATE utilisateurs SET espace_id = $1 WHERE espace_id IS NULL', [espaceId]);
        console.log('Updated missing utilisateurs to Espace.');

        const users = await client.query('SELECT id, role FROM utilisateurs');
        for (const u of users.rows) {
            await client.query('INSERT INTO membres_espace (espace_id, utilisateur_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [espaceId, u.id, u.role || 'GUEST']);
        }
        console.log('Updated membres_espace successfully.');
    } catch (e) {
        console.error("Error executing SQL:", e);
    } finally {
        await client.end();
    }
}

run();
