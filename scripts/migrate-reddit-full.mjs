/**
 * ONE-TIME migration + full seed for Part I.
 *
 * Adds the columns the Part I charts need to the 3 Reddit tables, creates a
 * tiny reddit_overview table, then loads the COMPLETE analysis.json snapshot.
 * Idempotent: ADD COLUMN IF NOT EXISTS + DELETE-then-INSERT.
 *
 * Run once:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/migrate-reddit-full.mjs
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!PASSWORD) {
  console.error("Set SUPABASE_DB_PASSWORD in env before running.");
  process.exit(1);
}

const client = new pg.Client({
  host: "aws-1-ap-northeast-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.elzmcmpinigpthnklhgj",
  password: PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const data = JSON.parse(
  readFileSync(new URL("../public/data/analysis.json", import.meta.url)),
);

async function main() {
  await client.connect();
  console.log("[migrate] connected");

  // ---- schema ---------------------------------------------------------------
  await client.query(`
    ALTER TABLE reddit_subreddit_metrics
      ADD COLUMN IF NOT EXISTS posts integer,
      ADD COLUMN IF NOT EXISTS comments integer,
      ADD COLUMN IF NOT EXISTS hebrew_posts integer,
      ADD COLUMN IF NOT EXISTS hebrew_comments integer,
      ADD COLUMN IF NOT EXISTS post_zscore numeric,
      ADD COLUMN IF NOT EXISTS comment_zscore numeric,
      ADD COLUMN IF NOT EXISTS kw_hezbollah integer,
      ADD COLUMN IF NOT EXISTS kw_iran integer,
      ADD COLUMN IF NOT EXISTS kw_peace integer,
      ADD COLUMN IF NOT EXISTS kw_sectarian integer,
      ADD COLUMN IF NOT EXISTS kw_gaza_palestine integer,
      ADD COLUMN IF NOT EXISTS kw_identity integer,
      ADD COLUMN IF NOT EXISTS flair_categories jsonb;
  `);
  await client.query(`
    ALTER TABLE reddit_user_sentiment
      ADD COLUMN IF NOT EXISTS flair text;
  `);
  await client.query(`
    ALTER TABLE media_coverage_gaps
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS source_title text,
      ADD COLUMN IF NOT EXISTS source_url text;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS reddit_overview (
      id integer PRIMARY KEY DEFAULT 1,
      posts integer,
      comments integer,
      hebrew_posts integer,
      hebrew_comments integer,
      downloaded_user_histories integer,
      CONSTRAINT reddit_overview_singleton CHECK (id = 1)
    );
  `);
  console.log("[migrate] schema ready");

  // ---- build per-month merged rows -----------------------------------------
  const kw = Object.fromEntries(data.keyword_trends.map((r) => [r.month, r]));
  const sp = Object.fromEntries(data.monthly_spikes.map((r) => [r.month, r]));
  const fl = Object.fromEntries(data.flair_monthly.map((r) => [r.month, r]));

  await client.query("DELETE FROM reddit_subreddit_metrics;");
  for (const m of data.monthly_activity) {
    const k = kw[m.month] || {};
    const s = sp[m.month] || {};
    const f = fl[m.month];
    await client.query(
      `INSERT INTO reddit_subreddit_metrics
        (period, post_volume, posts, comments, hebrew_posts, hebrew_comments,
         post_zscore, comment_zscore, kw_hezbollah, kw_iran, kw_peace,
         kw_sectarian, kw_gaza_palestine, kw_identity, flair_categories)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        m.month, m.posts, m.posts, m.comments, m.hebrew_posts, m.hebrew_comments,
        s.post_zscore ?? null, s.comment_zscore ?? null,
        k.hezbollah ?? 0, k.iran ?? 0, k.peace ?? 0, k.sectarian ?? 0,
        k.gaza_palestine ?? 0, k.identity ?? 0,
        f ? JSON.stringify(f.categories) : null,
      ],
    );
  }
  console.log(`[migrate] subreddit_metrics: ${data.monthly_activity.length} rows`);

  await client.query("DELETE FROM media_coverage_gaps;");
  for (const e of data.event_timeline) {
    await client.query(
      `INSERT INTO media_coverage_gaps
        (period, event_date, event_label, description, source_title, source_url)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        e.window_month, e.event_date, e.label, e.description ?? null,
        e.source_title ?? null, e.source_url ?? null,
      ],
    );
  }
  console.log(`[migrate] media_coverage_gaps: ${data.event_timeline.length} rows`);

  await client.query("DELETE FROM reddit_user_sentiment;");
  for (const a of data.top_authors) {
    await client.query(
      `INSERT INTO reddit_user_sentiment
        (username, flair, post_count_period, comment_count_period, karma_score)
       VALUES ($1,$2,$3,$4,$5)`,
      [a.author, a.flair ?? null, a.posts, a.comments, a.total],
    );
  }
  console.log(`[migrate] user_sentiment: ${data.top_authors.length} rows`);

  const o = data.overview;
  await client.query(
    `INSERT INTO reddit_overview
       (id, posts, comments, hebrew_posts, hebrew_comments, downloaded_user_histories)
     VALUES (1,$1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET
       posts=EXCLUDED.posts, comments=EXCLUDED.comments,
       hebrew_posts=EXCLUDED.hebrew_posts, hebrew_comments=EXCLUDED.hebrew_comments,
       downloaded_user_histories=EXCLUDED.downloaded_user_histories`,
    [o.posts, o.comments, o.hebrew_posts, o.hebrew_comments, o.downloaded_user_histories],
  );
  console.log("[migrate] overview upserted");

  await client.end();
  console.log("[migrate] DONE");
}

main().catch((e) => {
  console.error("[migrate] FAILED:", e.message);
  process.exit(1);
});
