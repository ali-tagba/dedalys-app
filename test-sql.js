const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function run() {
    let connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (!connectionString) {
        console.error("No DATABASE_URL found in .env.local.");
        return;
    }

    if (!connectionString.includes('sslmode=require')) {
        connectionString += '?sslmode=require';
    }

    console.log("Connecting to Postgres...");
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
