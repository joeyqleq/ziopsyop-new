const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elzmcmpinigpthnklhgj.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  'apikey': key,
  'Authorization': `Bearer ${key}`
};

async function queryTable(table, select = '*') {
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}&limit=20`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to query ${table}: ${await res.text()}`);
  }
  return await res.json();
}

async function queryRPC(rpc, body = {}) {
  const res = await fetch(`${url}/rest/v1/rpc/${rpc}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Failed to RPC ${rpc}: ${await res.text()}`);
  }
  return await res.json();
}

async function run() {
  try {
    console.log("--- TRYING PUBLIC RPC: get_part_i_core ---");
    try {
      const core = await queryRPC('get_part_i_core');
      console.log("Successfully called get_part_i_core");
      console.log("Monthly metrics sample:", core.data?.monthly?.slice(0, 2));
      console.log("Research events sample:", core.data?.research_events?.slice(0, 2));
    } catch(e) {
      console.error(e.message);
    }
    
    console.log("\n--- TRYING RPC: get_forensics_overview ---");
    try {
      const overview = await queryRPC('get_forensics_overview');
      console.log("Successfully called get_forensics_overview");
      console.log("Forensics counts:", overview.data?.counts);
    } catch(e) {
      console.error(e.message);
    }
    
    console.log("\n--- MEDIA FEED (media_events) ---");
    try {
      const media = await queryTable('media_events', 'source,category,event_date');
      console.table(media);
    } catch(e) {
      console.error(e.message);
    }
    
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
