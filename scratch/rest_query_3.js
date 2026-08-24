const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elzmcmpinigpthnklhgj.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json'
};

async function queryRPC(rpc, body = {}) {
  const res = await fetch(`${url}/rest/v1/rpc/${rpc}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Failed to RPC ${rpc}: ${await res.text()}`);
  }
  return await res.json();
}

async function run() {
  try {
    const core = await queryRPC('get_part_i_core');
    const events = core.data.research_events || [];
    
    console.log("--- SOURCE ORGANIZATIONS IN RESEARCH EVENTS ---");
    const orgs = {};
    const urlSamples = [];
    events.forEach(e => {
      if (e.source_title) {
        orgs[e.source_title] = (orgs[e.source_title] || 0) + 1;
      }
      if (e.source_url && urlSamples.length < 5) {
        urlSamples.push({ title: e.source_title, url: e.source_url });
      }
    });
    console.table(Object.entries(orgs).sort((a,b) => b[1] - a[1]));
    
    console.log("\n--- SAFE URL SAMPLES ---");
    console.table(urlSamples);

    console.log("\n--- MEDIA FEED COVERAGE ---");
    const clock = await queryRPC('get_reaction_clock_daily', {
      p_start: '2023-10-01',
      p_end: '2026-08-01'
    });
    
    const mediaAggr = {};
    const data = clock.data || [];
    data.forEach(d => {
      if (d.media_by_source) {
        for (const [source, count] of Object.entries(d.media_by_source)) {
          if (!mediaAggr[source]) mediaAggr[source] = { count: 0, min_date: d.date, max_date: d.date };
          mediaAggr[source].count += count;
          if (count > 0) {
            mediaAggr[source].max_date = d.date; // Updates sequentially
            if (mediaAggr[source].min_date === d.date && mediaAggr[source].count === count) {
              mediaAggr[source].min_date = d.date; 
            }
          }
        }
      }
    });
    console.table(mediaAggr);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
