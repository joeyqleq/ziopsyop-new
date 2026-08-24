const { Client } = require('pg');

const client = new Client({
  host: 'db.elzmcmpinigpthnklhgj.supabase.co',
  port: 5432,
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'fihyMmcFq2QgCma3',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    console.log("--- SCHEMAS & TABLES ---");
    const tables = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('public', 'private')
      ORDER BY table_schema, table_name;
    `);
    console.table(tables.rows);
    
    console.log("\n--- FRONTEND USED APIS/RPCs ---");
    const rpcs = await client.query(`
      SELECT routine_schema, routine_name 
      FROM information_schema.routines 
      WHERE routine_schema IN ('public')
      ORDER BY routine_name;
    `);
    console.table(rpcs.rows);

    console.log("\n--- SOURCE ORGANIZATIONS IN RESEARCH EVENTS ---");
    const orgs = await client.query(`
      SELECT source_title, COUNT(*) as count, MIN(event_date) as min_date, MAX(event_date) as max_date
      FROM private.research_events 
      GROUP BY source_title
      ORDER BY count DESC
      LIMIT 20;
    `);
    console.table(orgs.rows);

    console.log("\n--- MEDIA FEED COVERAGE ---");
    const mediaCounts = await client.query(`
      SELECT source, SUM(message_count) as total_messages, MIN(local_day) as start_date, MAX(local_day) as end_date
      FROM private.media_daily_counts
      GROUP BY source;
    `);
    console.table(mediaCounts.rows);

    console.log("\n--- ORIGINAL SOURCE URL FIELDS ---");
    const urlColumns = await client.query(`
      SELECT table_schema, table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema IN ('public', 'private') 
        AND (column_name ILIKE '%url%' OR column_name ILIKE '%link%' OR column_name ILIKE '%source%')
      ORDER BY table_schema, table_name;
    `);
    console.table(urlColumns.rows);

    console.log("\n--- SAFE AGGREGATE SAMPLE ---");
    const sampleAgg = await client.query(`
      SELECT category, COUNT(*) FROM public.media_events GROUP BY category;
    `);
    console.table(sampleAgg.rows);

    console.log("\n--- SOURCE URL SAMPLES (SAFE) ---");
    const urlSamples = await client.query(`
      SELECT source_title, source_url FROM private.research_events WHERE source_url IS NOT NULL LIMIT 5;
    `);
    console.table(urlSamples.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
