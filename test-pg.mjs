import { Client } from 'pg';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function run() {
    let connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (!connectionString) {
        console.error("No DATABASE_URL found.");
        return;
    }

    // Some postgres clients require SSL for Supabase
    if (!connectionString.includes('sslmode=require')) {
        connectionString += '?sslmode=require';
    }

    console.log("Connecting to Postgres...", connectionString.split('@')[1]);
    const client = new Client({ connectionString });
    await client.connect();

    try {
        const sql = fs.readFileSync('supabase_updates.sql', 'utf8');
        console.log("Executing SQL...");
        await client.query(sql);
        console.log("SQL executed successfully!");
    } catch (e) {
        console.error("Error executing SQL:", e);
    } finally {
        await client.end();
    }
}

run();
