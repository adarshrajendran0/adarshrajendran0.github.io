const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://akmawwkmfvvaftlrhmmp.supabase.co';
const SUPABASE_ANON = 'sb_publishable_gJ0soXWeAnr9iNFaRQ89Ig_blkKK5Q2';

const COLLECTIONS = [
    'projects', 'experience', 'education', 'skills',
    'references', 'personal', 'edu_stories', 'settings'
];

async function sync() {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log('Connecting to Supabase to sync data...');

    for (const col of COLLECTIONS) {
        const url = `${SUPABASE_URL}/rest/v1/${col}?select=*`;
        const res = await fetch(url, {
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`
            }
        });

        if (!res.ok) {
            console.error(`Failed to fetch ${col}: ${res.status} ${res.statusText}`);
            continue;
        }

        const items = await res.json();
        const filePath = path.join(dataDir, `${col}.json`);
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2) + '\n');
        console.log(`✓ Synced ${col} (${items.length} items)`);
    }

    console.log('All collections synchronized successfully.');
}

sync().catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
});
