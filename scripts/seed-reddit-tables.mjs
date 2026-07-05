// One-time migration: seed the 3 empty Reddit tables in Supabase from the
// static public/data/analysis.json snapshot. Idempotent: it deletes existing
// rows in each target table first, then inserts fresh.
//
// Run:  node --env-file-if-exists=/vercel/share/.env.project scripts/seed-reddit-tables.mjs
//
// This does NOT touch Part I rendering (still reads analysis.json). It only
// populates Supabase so the data becomes a living, appendable ledger.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error("[seed] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const analysis = JSON.parse(
  readFileSync(join(__dirname, "..", "public", "data", "analysis.json"), "utf8"),
);

const SUBREDDIT = "ForbiddenBromance";
const KEYWORD_KEYS = ["hezbollah", "iran", "peace", "sectarian", "gaza_palestine", "identity"];

// month "YYYY-MM" -> a first-of-month date string
const monthToDate = (m) => (/^\d{4}-\d{2}$/.test(m) ? `${m}-01` : null);

async function rest(method, path, body) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${method} ${path} -> ${res.status} ${t}`);
  }
  return res;
}

async function wipe(table) {
  // delete all rows (id >= 0 matches every row)
  await rest("DELETE", `${table}?id=gte.0`);
}

async function insert(table, rows) {
  // chunk to stay well under any payload limits
  const size = 200;
  for (let i = 0; i < rows.length; i += size) {
    await rest("POST", table, rows.slice(i, i + size));
  }
}

// ---- build reddit_subreddit_metrics (monthly) ------------------------------
function buildSubredditMetrics() {
  const activity = analysis.monthly_activity ?? [];
  const keywords = new Map((analysis.keyword_trends ?? []).map((k) => [k.month, k]));
  const spikes = new Map((analysis.monthly_spikes ?? []).map((s) => [s.month, s]));
  const maxPosts = Math.max(1, ...activity.map((a) => a.posts ?? 0));

  return activity.map((a) => {
    const kw = keywords.get(a.month);
    const sp = spikes.get(a.month);
    let topNarrative = null;
    if (kw) {
      let best = -1;
      for (const key of KEYWORD_KEYS) {
        if ((kw[key] ?? 0) > best) {
          best = kw[key] ?? 0;
          topNarrative = key;
        }
      }
    }
    return {
      subreddit: SUBREDDIT,
      period: a.month,
      post_volume: a.posts ?? 0,
      post_volume_index: Number((((a.posts ?? 0) / maxPosts) * 100).toFixed(2)),
      vote_anomaly_score: sp?.post_zscore != null ? Number(Number(sp.post_zscore).toFixed(3)) : null,
      top_narrative_label: topNarrative,
      // analytic percentages not present in the snapshot — left null for later
      anti_hezbollah_posts_pct: null,
      pro_idf_posts_pct: null,
      anti_shia_posts_pct: null,
      neutral_posts_pct: null,
      fpv_drone_mention_count: null,
      civilian_casualty_mention_count: null,
      ceasefire_mention_count: null,
      coordinated_behavior_score: null,
      narrative_pivot_detected: null,
      narrative_pivot_date: null,
      narrative_pivot_direction: null,
    };
  });
}

// ---- build media_coverage_gaps (events) ------------------------------------
function buildCoverageGaps() {
  const events = analysis.event_timeline ?? [];
  return events.map((e) => ({
    period: e.window_month ?? null,
    event_date: e.event_date ?? monthToDate(e.window_month),
    event_label: e.label ?? null,
    event_ref_id: null,
    hebrew_media_framing: null,
    english_media_framing: e.description ?? null,
    reddit_coverage_present: null,
    reddit_framing: null,
    gap_type: null,
    gap_severity_score: null,
    fpv_blackout: null,
    civilian_toll_omitted: null,
    source: e.source_url ? `${e.source_title ?? ""} ${e.source_url}`.trim() : e.source_title ?? null,
  }));
}

// ---- build reddit_user_sentiment (top authors) -----------------------------
function buildUserSentiment() {
  const authors = analysis.top_authors ?? [];
  return authors.map((a) => ({
    username: a.author,
    flair: null,
    period: "all_time",
    sentiment_score: null,
    shift_magnitude: null,
    post_count_period: a.posts ?? 0,
    comment_count_period: a.comments ?? 0,
    dominant_narrative: null,
    anti_shia_content_flag: null,
    pro_shia_content_flag: null,
    account_age_days: null,
    karma_score: a.total ?? null,
    anomaly_flag: null,
    anomaly_type: null,
  }));
}

async function main() {
  const jobs = [
    ["reddit_subreddit_metrics", buildSubredditMetrics()],
    ["media_coverage_gaps", buildCoverageGaps()],
    ["reddit_user_sentiment", buildUserSentiment()],
  ];

  for (const [table, rows] of jobs) {
    process.stdout.write(`[seed] ${table}: wiping... `);
    await wipe(table);
    process.stdout.write(`inserting ${rows.length} rows... `);
    await insert(table, rows);
    // verify
    const res = await fetch(`${URL}/rest/v1/${table}?select=id`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "count=exact", Range: "0-0" },
    });
    const range = res.headers.get("content-range");
    console.log(`done. count=${range}`);
  }
  console.log("[seed] complete.");
}

main().catch((e) => {
  console.error("[seed] FAILED:", e.message);
  process.exit(1);
});
