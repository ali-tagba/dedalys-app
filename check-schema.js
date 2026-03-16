const https = require('https');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function req(path, method = 'GET', body = null) {
    return new Promise((resolve) => {
        const url = new URL(SUPABASE_URL + path);
        const opts = { hostname: url.hostname, path: url.pathname + url.search, method, headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` } };
        const r = https.request(opts, (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, body: d }); } }); });
        r.on('error', e => resolve({ status: -1, body: e.message }));
        if (body) r.write(JSON.stringify(body));
        r.end();
    });
}

async function run() {
    // Check dossiers columns
    const d = await req('/rest/v1/dossiers?select=id,titre,statut,type,domaine,juridiction,reference&limit=1');
    console.log('dossiers basic cols:', d.status, JSON.stringify(d.body).slice(0, 100));

    const d2 = await req('/rest/v1/dossiers?select=prochaine_audience&limit=1');
    console.log('prochaine_audience:', d2.status, JSON.stringify(d2.body).slice(0, 120));

    const d3 = await req('/rest/v1/dossiers?select=is_archived&limit=1');
    console.log('is_archived:', d3.status, JSON.stringify(d3.body).slice(0, 120));

    // Check fichiers columns
    const f1 = await req('/rest/v1/fichiers?select=chemin_stockage&limit=1');
    console.log('fichiers.chemin_stockage:', f1.status, JSON.stringify(f1.body).slice(0, 120));

    // Try insert folder with null chemin_stockage
    console.log('\nAll schema checks done.');
    process.exit(0);
}
run().catch(console.error);
