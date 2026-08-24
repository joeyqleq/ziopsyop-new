const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elzmcmpinigpthnklhgj.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Accept-Profile': 'private'
};

async function queryTable(table, select = '*') {
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to query ${table}: ${await res.text()}`);
  }
  return await res.json();
}

async function run() {
  try {
    console.log("--- SOURCE ORGANIZATIONS IN RESEARCH EVENTS ---");
    const events = await queryTable('research_events', 'source_title,source_url');
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
    console.log("Orgs Count:");
    console.table(Object.entries(orgs).sort((a,b) => b[1] - a[1]));
    
    console.log("\n--- SAFE URL SAMPLES ---");
    console.table(urlSamples);

    console.log("\n--- MEDIA FEED COVERAGE ---");
    const counts = await queryTable('media_daily_counts', 'source,local_day,message_count');
    const mediaAggr = {};
    counts.forEach(c => {
      if (!mediaAggr[c.source]) mediaAggr[c.source] = { count: 0, min_date: c.local_day, max_date: c.local_day };
      mediaAggr[c.source].count += c.message_count;
      if (c.local_day < mediaAggr[c.source].min_date) mediaAggr[c.source].min_date = c.local_day;
      if (c.local_day > mediaAggr[c.source].max_date) mediaAggr[c.source].max_date = c.local_day;
    });
    console.table(mediaAggr);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
