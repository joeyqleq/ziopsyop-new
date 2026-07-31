import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import pg from "pg";

const PROJECT_REF = "elzmcmpinigpthnklhgj";
const CONTRACT_VERSION = "part-i-v1";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(SCRIPT_DIR, "..");
const APPLY = process.argv.includes("--apply");
const VERIFY_SNAPSHOT = process.argv.includes("--verify-snapshot");

const sourceFiles = {
  fullAnalysis: path.join(PROJECT_DIR, "public/data/full_analysis.json"),
  userForensics: path.join(PROJECT_DIR, "public/data/user_forensics.json"),
  eventsResearch: path.join(PROJECT_DIR, "public/data/events_research.json"),
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadEnvFile(path.join(PROJECT_DIR, ".env.local"));

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return {
    raw,
    bytes: Buffer.byteLength(raw),
    sha256: crypto.createHash("sha256").update(raw).digest("hex"),
    data: JSON.parse(raw),
  };
}

function stableKey(prefix, value) {
  return `${prefix}:${crypto
    .createHash("sha256")
    .update(stableStringify(value))
    .digest("hex")
    .slice(0, 32)}`;
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify(value[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function monthDate(value) {
  if (!value) return null;
  const text = String(value);
  return /^\d{4}-\d{2}$/.test(text) ? `${text}-01` : text.slice(0, 10);
}

function dayDate(value) {
  return value ? String(value).slice(0, 10) : null;
}

function hourNumber(value) {
  if (Number.isInteger(value)) return value;
  const match = String(value ?? "").match(/^(\d{1,2})(?::\d{2})?$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function sumIfKnown(...values) {
  return values.every((value) => Number.isFinite(value))
    ? values.reduce((sum, value) => sum + value, 0)
    : null;
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
}

const fullSource = readJson(sourceFiles.fullAnalysis);
const forensicSource = readJson(sourceFiles.userForensics);
const researchSource = readJson(sourceFiles.eventsResearch);

const full = fullSource.data;
const forensic = forensicSource.data;
const research = researchSource.data;

const growthByMonth = new Map(
  (full.subreddit_growth ?? []).map((row) => [row.month, row]),
);
const keywordByMonth = new Map(
  (full.keyword_trends ?? []).map((row) => [row.month, row]),
);
const spikeByMonth = new Map(
  (full.monthly_spikes ?? []).map((row) => [row.month, row]),
);

const overviewRows = [
  {
    singleton_id: 1,
    total_posts: full.overview?.total_posts ?? null,
    total_comments: full.overview?.total_comments ?? null,
    total_artifacts: full.overview?.total_artifacts ?? null,
    total_unique_users: full.overview?.total_unique_users ?? null,
    date_range_start: dayDate(full.overview?.date_range_start),
    date_range_end: dayDate(full.overview?.date_range_end),
    months_observed: full.overview?.months_observed ?? null,
    peak_month: monthDate(full.overview?.peak_month),
    peak_comments: full.overview?.peak_comments ?? null,
    hebrew_posts_total: full.overview?.hebrew_posts_total ?? null,
    hebrew_comments_total: full.overview?.hebrew_comments_total ?? null,
    arabic_comments_total: full.overview?.arabic_comments_total ?? null,
    israeli_flair_user_pct: full.overview?.israeli_flair_user_pct ?? null,
    downloaded_user_histories:
      full.overview?.downloaded_user_histories ?? null,
    events_correlated: full.overview?.events_correlated ?? null,
    quality_flags: {},
  },
];

const monthlyRows = (full.monthly_activity ?? []).map((row) => {
  const growth = growthByMonth.get(row.month) ?? {};
  const keywords = keywordByMonth.get(row.month) ?? {};
  const spikes = spikeByMonth.get(row.month) ?? {};

  return {
    month: monthDate(row.month),
    posts: row.posts ?? null,
    comments: row.comments ?? null,
    total: row.total ?? sumIfKnown(row.posts, row.comments),
    unique_users: row.unique_users ?? null,
    hebrew_posts: row.hebrew_posts ?? null,
    hebrew_comments: row.hebrew_comments ?? null,
    arabic_posts: row.arabic_posts ?? null,
    arabic_comments: row.arabic_comments ?? null,
    avg_score_comments: row.avg_score_comments ?? null,
    avg_score_posts: row.avg_score_posts ?? null,
    subscriber_count: row.subscriber_count ?? growth.subscriber_count ?? null,
    cumulative_unique_users: growth.cumulative_unique_users ?? null,
    new_users: growth.new_users_this_month ?? null,
    active_users: growth.active_users ?? null,
    israeli_flair_users: growth.israeli_flair_users ?? null,
    lebanese_flair_users: growth.lebanese_flair_users ?? null,
    other_flair_users: growth.other_flair_users ?? null,
    no_flair_users: growth.no_flair_users ?? null,
    keyword_hezbollah: keywords.hezbollah ?? null,
    keyword_iran: keywords.iran ?? null,
    keyword_peace: keywords.peace ?? null,
    keyword_sectarian: keywords.sectarian ?? null,
    keyword_gaza_palestine: keywords.gaza_palestine ?? null,
    keyword_identity: keywords.identity ?? null,
    post_zscore: spikes.post_zscore ?? null,
    comment_zscore: spikes.comment_zscore ?? null,
    observed: true,
    quality_flags: {},
  };
});

const dailyRows = (full.daily_activity ?? []).map((row) => ({
  activity_date: dayDate(row.date),
  posts: row.posts ?? null,
  comments: row.comments ?? null,
  total: row.total ?? sumIfKnown(row.posts, row.comments),
  unique_users: row.unique_users ?? null,
  hebrew_comments: row.hebrew_comments ?? null,
  arabic_comments: row.arabic_comments ?? null,
  avg_score_comments: row.avg_score_comments ?? null,
  observed: true,
  quality_flags: {},
}));

const flairRows = (full.flair_monthly ?? []).flatMap((monthRow) =>
  Object.entries(monthRow.categories ?? {}).map(([category, value]) => ({
    month: monthDate(monthRow.month),
    flair_category: category,
    posts: value?.posts ?? null,
    comments: value?.comments ?? null,
    total: value?.total ?? sumIfKnown(value?.posts, value?.comments),
    observed: true,
    quality_flags: {
      posts_field_known_generator_issue: true,
      note: "Source generator emitted zero post counts; retained without correction.",
    },
  })),
);

const topAuthors = full.top_authors ?? [];
const forensicUsers = forensic.users ?? [];
const topAuthorByName = new Map(topAuthors.map((row) => [row.author, row]));
const forensicByName = new Map(
  forensicUsers.map((row) => [row.username, row]),
);
const usernames = [
  ...new Set([...topAuthorByName.keys(), ...forensicByName.keys()]),
].sort();

const accountRows = usernames.map((username) => {
  const top = topAuthorByName.get(username);
  const user = forensicByName.get(username);
  return {
    username,
    first_seen: dayDate(user?.first_seen ?? top?.first_seen),
    last_seen: dayDate(user?.last_seen ?? top?.last_seen),
    flair: top?.flair ?? null,
    source_scopes: [
      ...(top ? ["top_authors"] : []),
      ...(user ? ["user_forensics"] : []),
    ],
    is_suspended: null,
    is_deleted: null,
    _source: user ? "userForensics" : "fullAnalysis",
  };
});

const topMetricRows = topAuthors.map((row) => ({
  username: row.author,
  metric_scope: "top_authors",
  posts: row.posts ?? null,
  comments: row.comments ?? null,
  total: row.total ?? sumIfKnown(row.posts, row.comments),
  avg_score: row.avg_score ?? null,
  conflict_pct: row.conflict_pct ?? null,
  hebrew_content_pct: row.hebrew_content_pct ?? null,
  first_seen: dayDate(row.first_seen),
  last_seen: dayDate(row.last_seen),
  role: null,
  age_days: null,
  contradiction_score: null,
  fb_pct: null,
  israel_hours_pct: null,
  _source: "fullAnalysis",
}));

const forensicMetricRows = forensicUsers.map((row) => ({
  username: row.username,
  metric_scope: "user_forensics",
  posts: row.total_posts ?? null,
  comments: row.total_comments ?? null,
  total: sumIfKnown(row.total_posts, row.total_comments),
  avg_score: null,
  conflict_pct: row.conflict_pct ?? null,
  hebrew_content_pct: null,
  first_seen: dayDate(row.first_seen),
  last_seen: dayDate(row.last_seen),
  role: row.role ?? null,
  age_days: row.age_days ?? null,
  contradiction_score: row.contradiction_score ?? null,
  fb_pct: row.fb_pct ?? null,
  israel_hours_pct: row.israel_hours_pct ?? null,
  _source: "userForensics",
}));

const assessmentRows = forensicUsers.map((row) => ({
  username: row.username,
  role: row.role ?? null,
  contradiction_score: row.contradiction_score ?? null,
  conflict_pct: row.conflict_pct ?? null,
  fb_pct: row.fb_pct ?? null,
  israel_hours_pct: row.israel_hours_pct ?? null,
  age_days: row.age_days ?? null,
  assessment_basis: "descriptive_source_fields",
}));

const languageRows = forensicUsers.flatMap((row) =>
  Object.entries(row.lang ?? {}).map(([language, value]) => ({
    username: row.username,
    language,
    metric_value: value ?? null,
    metric_unit: "source_value",
  })),
);

const subredditRows = forensicUsers.flatMap((row) =>
  (row.top_subreddits ?? []).map((item, index) => ({
    username: row.username,
    subreddit: item.sub,
    rank: index + 1,
    activity_count: item.count ?? null,
  })),
);

const hourRows = forensicUsers.flatMap((row) =>
  (row.hour_distribution ?? []).map((item) => ({
    username: row.username,
    hour_of_day: item.hour,
    activity_pct: item.pct ?? null,
    timezone: "UTC",
    date_linked: false,
  })),
);

const accountMonthlyRows = forensicUsers.flatMap((row) =>
  (row.monthly_activity ?? []).map((item) => ({
    username: row.username,
    month: monthDate(item.month),
    activity_count: item.count ?? null,
  })),
);

const dormancyRows = forensicUsers.flatMap((row) =>
  (row.dormancy_gaps ?? []).map((item) => ({
    username: row.username,
    gap_start: dayDate(item.from),
    gap_end: dayDate(item.to),
    gap_days: item.days ?? null,
  })),
);

const sentimentRows = forensicUsers.flatMap((row) =>
  Object.entries(row.fb_sentiment ?? {})
    .filter(([dimension]) => dimension !== "sample_comments")
    .map(([dimension, value]) => ({
      username: row.username,
      sentiment_dimension: dimension,
      activity_count: value ?? null,
    })),
);

const sampleRows = forensicUsers.flatMap((row) =>
  (row.fb_sentiment?.sample_comments ?? []).map((sample, index) => ({
    username: row.username,
    sample_index: index,
    sample_text: sample.text ?? null,
    score: sample.score ?? null,
    sample_date: dayDate(sample.date),
  })),
);

const replyRows = (forensic.reply_network ?? []).map((row) => ({
  source_username: row.source,
  target_username: row.target,
  interaction_count: row.weight ?? null,
}));

const coordinationRows = (forensic.coordination_events ?? []).map(
  (row, index) => ({
    event_key: stableKey("coordination", {
      index,
      timestamp: row.timestamp,
      users: row.users,
    }),
    event_timestamp: row.timestamp ?? null,
    event_date: dayDate(row.date ?? row.timestamp),
    event_hour: hourNumber(row.hour),
    user_count: row.user_count ?? row.users?.length ?? null,
    _users: row.users ?? [],
  }),
);

const coordinationMemberRows = coordinationRows.flatMap((event) =>
  event._users.map((username) => ({
    event_key: event.event_key,
    username,
  })),
);

const researchEventRows = (research.events ?? []).map((row) => ({
  event_key: stableKey("research-event", row),
  event_date: dayDate(row.date),
  label: row.label ?? null,
  description: row.description ?? null,
  category: row.category ?? null,
  significance: row.significance ?? null,
  region: row.region ?? null,
  source_title: row.source_title ?? null,
  source_url: row.source_url ?? null,
  evidence_status:
    row.source_url || row.source_title ? "sourced" : "unsourced_context",
}));

const researchEraRows = (research.eras ?? []).map((row) => ({
  era_key: stableKey("research-era", row),
  start_date: monthDate(row.start),
  end_date: monthDate(row.end),
  label: row.label ?? null,
  description: row.description ?? null,
  tone: row.tone ?? null,
}));

const snapshotExpected = {
  months: 83,
  activeDates: 2334,
  totalPosts: 5297,
  totalComments: 97313,
  cumulativeUsers: 7806,
  flairRows: 365,
  accounts: 52,
  scopedMetrics: 72,
  assessments: 22,
  languages: 55,
  subreddits: 218,
  hourProfiles: 528,
  accountMonths: 1330,
  dormancyGaps: 55,
  sentimentCounts: 66,
  commentSamples: 110,
  replyEdges: 261,
  coordinationEvents: 100,
  coordinationMemberships: 565,
  researchEvents: 193,
  researchEras: 19,
  canonicalMedia: 30555,
  mediaSourceDays: 2944,
  mediaDistinctDays: 1073,
};

const expected = {
  months: monthlyRows.length,
  activeDates: dailyRows.length,
  totalPosts: overviewRows[0].total_posts,
  totalComments: overviewRows[0].total_comments,
  cumulativeUsers: monthlyRows.at(-1)?.cumulative_unique_users,
  flairRows: flairRows.length,
  accounts: accountRows.length,
  scopedMetrics: topMetricRows.length + forensicMetricRows.length,
  assessments: assessmentRows.length,
  languages: languageRows.length,
  subreddits: subredditRows.length,
  hourProfiles: hourRows.length,
  accountMonths: accountMonthlyRows.length,
  dormancyGaps: dormancyRows.length,
  sentimentCounts: sentimentRows.length,
  commentSamples: sampleRows.length,
  replyEdges: replyRows.length,
  coordinationEvents: coordinationRows.length,
  coordinationMemberships: coordinationMemberRows.length,
  researchEvents: researchEventRows.length,
  researchEras: researchEraRows.length,
};

assertEqual("monthly rows", monthlyRows.length, expected.months);
assertEqual("daily rows", dailyRows.length, expected.activeDates);
assertEqual("overview posts", overviewRows[0].total_posts, expected.totalPosts);
assertEqual(
  "overview comments",
  overviewRows[0].total_comments,
  expected.totalComments,
);
assertEqual("monthly post sum", sum(monthlyRows, "posts"), expected.totalPosts);
assertEqual(
  "monthly comment sum",
  sum(monthlyRows, "comments"),
  expected.totalComments,
);
assertEqual("daily post sum", sum(dailyRows, "posts"), expected.totalPosts);
assertEqual(
  "daily comment sum",
  sum(dailyRows, "comments"),
  expected.totalComments,
);
assertEqual(
  "final cumulative users",
  monthlyRows.at(-1)?.cumulative_unique_users,
  expected.cumulativeUsers,
);
assertEqual("flair rows", flairRows.length, expected.flairRows);
assertEqual("account union", accountRows.length, expected.accounts);
assertEqual(
  "scoped metrics",
  topMetricRows.length + forensicMetricRows.length,
  expected.scopedMetrics,
);
assertEqual("assessments", assessmentRows.length, expected.assessments);
assertEqual("languages", languageRows.length, expected.languages);
assertEqual("subreddits", subredditRows.length, expected.subreddits);
assertEqual("hour profiles", hourRows.length, expected.hourProfiles);
assertEqual(
  "account monthly activity",
  accountMonthlyRows.length,
  expected.accountMonths,
);
assertEqual("dormancy gaps", dormancyRows.length, expected.dormancyGaps);
assertEqual("sentiment counts", sentimentRows.length, expected.sentimentCounts);
assertEqual("comment samples", sampleRows.length, expected.commentSamples);
assertEqual("reply edges", replyRows.length, expected.replyEdges);
assertEqual(
  "coordination events",
  coordinationRows.length,
  expected.coordinationEvents,
);
assertEqual(
  "coordination memberships",
  coordinationMemberRows.length,
  expected.coordinationMemberships,
);
if (
  coordinationRows.some(
    (row) =>
      row.event_hour !== null &&
      (row.event_hour < 0 || row.event_hour > 23),
  )
) {
  throw new Error("coordination event hour fell outside 0-23");
}
assertEqual(
  "research events",
  researchEventRows.length,
  expected.researchEvents,
);
assertEqual("research eras", researchEraRows.length, expected.researchEras);

if (VERIFY_SNAPSHOT) {
  for (const [key, snapshotValue] of Object.entries(snapshotExpected)) {
    if (!(key in expected)) continue;
    assertEqual(`audited snapshot ${key}`, expected[key], snapshotValue);
  }
}

const preparedCounts = {
  overview: overviewRows.length,
  months: monthlyRows.length,
  days: dailyRows.length,
  flair: flairRows.length,
  accounts: accountRows.length,
  scoped_metrics: topMetricRows.length + forensicMetricRows.length,
  assessments: assessmentRows.length,
  languages: languageRows.length,
  subreddits: subredditRows.length,
  hour_profiles: hourRows.length,
  account_months: accountMonthlyRows.length,
  dormancy_gaps: dormancyRows.length,
  sentiment_counts: sentimentRows.length,
  comment_samples: sampleRows.length,
  reply_edges: replyRows.length,
  coordination_events: coordinationRows.length,
  coordination_memberships: coordinationMemberRows.length,
  research_events: researchEventRows.length,
  research_eras: researchEraRows.length,
};

console.log(
  `[part-i] source parity passed: ${preparedCounts.months} months, ${preparedCounts.days} active dates, ${expected.totalPosts} posts, ${expected.totalComments} comments`,
);
console.log(
  `[part-i] forensic parity passed: ${preparedCounts.accounts} accounts, ${preparedCounts.scoped_metrics} scoped metrics, ${preparedCounts.reply_edges} reply edges, ${preparedCounts.coordination_memberships} coordination memberships`,
);

if (!APPLY) {
  console.log("[part-i] dry run complete; pass --apply to write to Supabase");
  process.exit(0);
}

function databaseUrl() {
  const explicit =
    process.env.SUPABASE_DB_URL ??
    process.env.DATABASE_URL ??
    process.env.DIRECT_URL ??
    process.env.POSTGRES_URL;
  if (explicit) return explicit;

  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) return null;

  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${PROJECT_REF}:${encoded}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
}

function safeIdentifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe SQL identifier: ${value}`);
  }
  return `"${value}"`;
}

function safeTable(value) {
  const parts = value.split(".");
  if (parts.length !== 2) throw new Error(`Expected schema.table: ${value}`);
  return parts.map(safeIdentifier).join(".");
}

async function upsertRows(client, spec, rows, batchSize = 400) {
  if (!rows.length) return;

  const table = safeTable(spec.table);
  const columns = Object.keys(spec.columns);
  const insertColumns = columns.map(safeIdentifier).join(", ");
  const recordColumns = columns
    .map((column) => `${safeIdentifier(column)} ${spec.columns[column]}`)
    .join(", ");
  const conflictColumns = spec.conflict.map(safeIdentifier).join(", ");
  const updateColumns = columns.filter(
    (column) => !spec.conflict.includes(column),
  );
  const updates = [
    ...updateColumns.map(
      (column) =>
        `${safeIdentifier(column)} = EXCLUDED.${safeIdentifier(column)}`,
    ),
    ...(spec.touchUpdatedAt ? ['"updated_at" = now()'] : []),
  ].join(", ");

  const query = `
    INSERT INTO ${table} (${insertColumns})
    SELECT ${insertColumns}
    FROM jsonb_to_recordset($1::jsonb) AS x(${recordColumns})
    ON CONFLICT (${conflictColumns}) DO UPDATE SET ${updates}
  `;

  for (let index = 0; index < rows.length; index += batchSize) {
    await client.query(query, [JSON.stringify(rows.slice(index, index + batchSize))]);
  }
}

async function upsertRun(client, {
  datasetKey,
  sourcePath,
  sourceSha256,
  sourceBytes,
  coverage,
  expectedCounts,
  metadata,
}) {
  const result = await client.query(
    `
      INSERT INTO private.ingestion_runs (
        dataset_key,
        contract_version,
        source_path,
        source_sha256,
        source_bytes,
        coverage,
        expected_counts,
        loaded_counts,
        status,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, '{}'::jsonb, 'started', $8::jsonb)
      ON CONFLICT (dataset_key, source_sha256) DO UPDATE SET
        contract_version = EXCLUDED.contract_version,
        source_path = EXCLUDED.source_path,
        source_bytes = EXCLUDED.source_bytes,
        coverage = EXCLUDED.coverage,
        expected_counts = EXCLUDED.expected_counts,
        status = 'started',
        started_at = now(),
        completed_at = NULL,
        metadata = EXCLUDED.metadata
      RETURNING id
    `,
    [
      datasetKey,
      CONTRACT_VERSION,
      sourcePath,
      sourceSha256,
      sourceBytes,
      JSON.stringify(coverage),
      JSON.stringify(expectedCounts),
      JSON.stringify(metadata),
    ],
  );
  return result.rows[0].id;
}

function attachRun(rows, runId) {
  return rows.map(({ _source, _users, ...row }) => ({
    ...row,
    ingestion_run_id: runId,
  }));
}

function attachScopedRuns(rows, runIds) {
  return rows.map(({ _source, _users, ...row }) => ({
    ...row,
    ingestion_run_id: runIds[_source],
  }));
}

const specs = {
  overview: {
    table: "private.reddit_overview",
    conflict: ["singleton_id"],
    touchUpdatedAt: true,
    columns: {
      singleton_id: "smallint",
      ingestion_run_id: "uuid",
      total_posts: "integer",
      total_comments: "integer",
      total_artifacts: "integer",
      total_unique_users: "integer",
      date_range_start: "date",
      date_range_end: "date",
      months_observed: "integer",
      peak_month: "date",
      peak_comments: "integer",
      hebrew_posts_total: "integer",
      hebrew_comments_total: "integer",
      arabic_comments_total: "integer",
      israeli_flair_user_pct: "numeric",
      downloaded_user_histories: "integer",
      events_correlated: "integer",
      quality_flags: "jsonb",
    },
  },
  monthly: {
    table: "private.reddit_monthly_metrics",
    conflict: ["month"],
    touchUpdatedAt: true,
    columns: {
      month: "date",
      ingestion_run_id: "uuid",
      posts: "integer",
      comments: "integer",
      total: "integer",
      unique_users: "integer",
      hebrew_posts: "integer",
      hebrew_comments: "integer",
      arabic_posts: "integer",
      arabic_comments: "integer",
      avg_score_comments: "numeric",
      avg_score_posts: "numeric",
      subscriber_count: "integer",
      cumulative_unique_users: "integer",
      new_users: "integer",
      active_users: "integer",
      israeli_flair_users: "integer",
      lebanese_flair_users: "integer",
      other_flair_users: "integer",
      no_flair_users: "integer",
      keyword_hezbollah: "integer",
      keyword_iran: "integer",
      keyword_peace: "integer",
      keyword_sectarian: "integer",
      keyword_gaza_palestine: "integer",
      keyword_identity: "integer",
      post_zscore: "numeric",
      comment_zscore: "numeric",
      observed: "boolean",
      quality_flags: "jsonb",
    },
  },
  daily: {
    table: "private.reddit_daily_metrics",
    conflict: ["activity_date"],
    touchUpdatedAt: true,
    columns: {
      activity_date: "date",
      ingestion_run_id: "uuid",
      posts: "integer",
      comments: "integer",
      total: "integer",
      unique_users: "integer",
      hebrew_comments: "integer",
      arabic_comments: "integer",
      avg_score_comments: "numeric",
      observed: "boolean",
      quality_flags: "jsonb",
    },
  },
  flair: {
    table: "private.reddit_monthly_flair",
    conflict: ["month", "flair_category"],
    touchUpdatedAt: true,
    columns: {
      month: "date",
      flair_category: "text",
      ingestion_run_id: "uuid",
      posts: "integer",
      comments: "integer",
      total: "integer",
      observed: "boolean",
      quality_flags: "jsonb",
    },
  },
  accounts: {
    table: "private.reddit_accounts",
    conflict: ["username"],
    touchUpdatedAt: true,
    columns: {
      username: "text",
      ingestion_run_id: "uuid",
      first_seen: "date",
      last_seen: "date",
      flair: "text",
      source_scopes: "jsonb",
      is_suspended: "boolean",
      is_deleted: "boolean",
    },
  },
  metrics: {
    table: "private.reddit_account_metrics",
    conflict: ["username", "metric_scope"],
    touchUpdatedAt: true,
    columns: {
      username: "text",
      metric_scope: "text",
      ingestion_run_id: "uuid",
      posts: "integer",
      comments: "integer",
      total: "integer",
      avg_score: "numeric",
      conflict_pct: "numeric",
      hebrew_content_pct: "numeric",
      first_seen: "date",
      last_seen: "date",
      role: "text",
      age_days: "integer",
      contradiction_score: "numeric",
      fb_pct: "numeric",
      israel_hours_pct: "numeric",
    },
  },
  assessments: {
    table: "private.reddit_account_assessments",
    conflict: ["username"],
    touchUpdatedAt: true,
    columns: {
      username: "text",
      ingestion_run_id: "uuid",
      role: "text",
      contradiction_score: "numeric",
      conflict_pct: "numeric",
      fb_pct: "numeric",
      israel_hours_pct: "numeric",
      age_days: "integer",
      assessment_basis: "text",
    },
  },
  languages: {
    table: "private.reddit_account_languages",
    conflict: ["username", "language"],
    columns: {
      username: "text",
      language: "text",
      ingestion_run_id: "uuid",
      metric_value: "numeric",
      metric_unit: "text",
    },
  },
  subreddits: {
    table: "private.reddit_account_subreddits",
    conflict: ["username", "subreddit"],
    columns: {
      username: "text",
      subreddit: "text",
      ingestion_run_id: "uuid",
      rank: "integer",
      activity_count: "integer",
    },
  },
  hours: {
    table: "private.reddit_account_hour_profile",
    conflict: ["username", "hour_of_day"],
    columns: {
      username: "text",
      hour_of_day: "smallint",
      ingestion_run_id: "uuid",
      activity_pct: "numeric",
      timezone: "text",
      date_linked: "boolean",
    },
  },
  accountMonths: {
    table: "private.reddit_account_monthly_activity",
    conflict: ["username", "month"],
    columns: {
      username: "text",
      month: "date",
      ingestion_run_id: "uuid",
      activity_count: "integer",
    },
  },
  dormancy: {
    table: "private.reddit_account_dormancy_gaps",
    conflict: ["username", "gap_start", "gap_end"],
    columns: {
      username: "text",
      gap_start: "date",
      gap_end: "date",
      ingestion_run_id: "uuid",
      gap_days: "integer",
    },
  },
  sentiment: {
    table: "private.reddit_account_sentiment_counts",
    conflict: ["username", "sentiment_dimension"],
    columns: {
      username: "text",
      sentiment_dimension: "text",
      ingestion_run_id: "uuid",
      activity_count: "numeric",
    },
  },
  samples: {
    table: "private.reddit_account_comment_samples",
    conflict: ["username", "sample_index"],
    columns: {
      username: "text",
      sample_index: "integer",
      ingestion_run_id: "uuid",
      sample_text: "text",
      score: "numeric",
      sample_date: "date",
    },
  },
  replies: {
    table: "private.reddit_reply_edges",
    conflict: ["source_username", "target_username"],
    columns: {
      source_username: "text",
      target_username: "text",
      ingestion_run_id: "uuid",
      interaction_count: "integer",
    },
  },
  coordination: {
    table: "private.reddit_coordination_events",
    conflict: ["event_key"],
    touchUpdatedAt: true,
    columns: {
      event_key: "text",
      ingestion_run_id: "uuid",
      event_timestamp: "timestamptz",
      event_date: "date",
      event_hour: "smallint",
      user_count: "integer",
    },
  },
  coordinationMembers: {
    table: "private.reddit_coordination_members",
    conflict: ["event_key", "username"],
    columns: {
      event_key: "text",
      username: "text",
      ingestion_run_id: "uuid",
    },
  },
  researchEvents: {
    table: "private.research_events",
    conflict: ["event_key"],
    touchUpdatedAt: true,
    columns: {
      event_key: "text",
      ingestion_run_id: "uuid",
      event_date: "date",
      label: "text",
      description: "text",
      category: "text",
      significance: "text",
      region: "text",
      source_title: "text",
      source_url: "text",
      evidence_status: "text",
    },
  },
  researchEras: {
    table: "private.research_eras",
    conflict: ["era_key"],
    touchUpdatedAt: true,
    columns: {
      era_key: "text",
      ingestion_run_id: "uuid",
      start_date: "date",
      end_date: "date",
      label: "text",
      description: "text",
      tone: "text",
    },
  },
};

async function validateDatabase(client) {
  const countChecks = [
    ["monthly rows", "private.reddit_monthly_metrics", expected.months],
    ["daily rows", "private.reddit_daily_metrics", expected.activeDates],
    ["flair rows", "private.reddit_monthly_flair", expected.flairRows],
    ["accounts", "private.reddit_accounts", expected.accounts],
    ["scoped metrics", "private.reddit_account_metrics", expected.scopedMetrics],
    ["assessments", "private.reddit_account_assessments", expected.assessments],
    ["languages", "private.reddit_account_languages", expected.languages],
    ["subreddits", "private.reddit_account_subreddits", expected.subreddits],
    ["hour profiles", "private.reddit_account_hour_profile", expected.hourProfiles],
    [
      "account months",
      "private.reddit_account_monthly_activity",
      expected.accountMonths,
    ],
    [
      "dormancy gaps",
      "private.reddit_account_dormancy_gaps",
      expected.dormancyGaps,
    ],
    [
      "sentiment counts",
      "private.reddit_account_sentiment_counts",
      expected.sentimentCounts,
    ],
    [
      "comment samples",
      "private.reddit_account_comment_samples",
      expected.commentSamples,
    ],
    ["reply edges", "private.reddit_reply_edges", expected.replyEdges],
    [
      "coordination events",
      "private.reddit_coordination_events",
      expected.coordinationEvents,
    ],
    [
      "coordination memberships",
      "private.reddit_coordination_members",
      expected.coordinationMemberships,
    ],
    ["research events", "private.research_events", expected.researchEvents],
    ["research eras", "private.research_eras", expected.researchEras],
  ];

  for (const [label, table, expectedCount] of countChecks) {
    const result = await client.query(
      `SELECT count(*)::integer AS count FROM ${safeTable(table)}`,
    );
    assertEqual(`database ${label}`, result.rows[0].count, expectedCount);
  }

  const aggregateResult = await client.query(`
    SELECT
      (SELECT sum(posts)::integer FROM private.reddit_monthly_metrics) AS monthly_posts,
      (SELECT sum(comments)::integer FROM private.reddit_monthly_metrics) AS monthly_comments,
      (SELECT sum(posts)::integer FROM private.reddit_daily_metrics) AS daily_posts,
      (SELECT sum(comments)::integer FROM private.reddit_daily_metrics) AS daily_comments,
      (
        SELECT cumulative_unique_users
        FROM private.reddit_monthly_metrics
        ORDER BY month DESC
        LIMIT 1
      ) AS cumulative_users,
      (
        SELECT coalesce(sum(message_count), 0)::integer
        FROM private.media_daily_counts
      ) AS canonical_media,
      (SELECT count(*)::integer FROM private.media_daily_counts) AS media_source_days,
      (
        SELECT count(DISTINCT local_day)::integer
        FROM private.media_daily_counts
      ) AS media_distinct_days
  `);
  const aggregate = aggregateResult.rows[0];

  assertEqual("database monthly posts", aggregate.monthly_posts, expected.totalPosts);
  assertEqual(
    "database monthly comments",
    aggregate.monthly_comments,
    expected.totalComments,
  );
  assertEqual("database daily posts", aggregate.daily_posts, expected.totalPosts);
  assertEqual(
    "database daily comments",
    aggregate.daily_comments,
    expected.totalComments,
  );
  assertEqual(
    "database cumulative users",
    aggregate.cumulative_users,
    expected.cumulativeUsers,
  );
  if (VERIFY_SNAPSHOT) {
    assertEqual(
      "database canonical media",
      aggregate.canonical_media,
      snapshotExpected.canonicalMedia,
    );
    assertEqual(
      "database media source-days",
      aggregate.media_source_days,
      snapshotExpected.mediaSourceDays,
    );
    assertEqual(
      "database media distinct days",
      aggregate.media_distinct_days,
      snapshotExpected.mediaDistinctDays,
    );
  }

  const mediaSources = await client.query(`
    SELECT source, sum(message_count)::integer AS count
    FROM private.media_daily_counts
    GROUP BY source
    ORDER BY source
  `);
  const sourceCounts = Object.fromEntries(
    mediaSources.rows.map((row) => [row.source, row.count]),
  );
  if (VERIFY_SNAPSHOT) {
    assertEqual("canonical almanar", sourceCounts.almanar, 17450);
    assertEqual("canonical almayadeen", sourceCounts.almayadeen, 9079);
    assertEqual("canonical channel_14", sourceCounts.channel_14, 4026);
  }

  return {
    ...aggregate,
    source_counts: sourceCounts,
  };
}

const connectionString = databaseUrl();
if (!connectionString) {
  throw new Error(
    "--apply requires SUPABASE_DB_PASSWORD or a direct database URL; no credential value was printed",
  );
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  application_name: "ziopsyop-part-i-loader",
});

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL statement_timeout = '180s'");

  const mediaFingerprintResult = await client.query(`
    SELECT
      count(*)::integer AS raw_rows,
      min(event_timestamp) AS first_event,
      max(event_timestamp) AS last_event,
      max(created_at) AS latest_ingest
    FROM public.media_events
  `);
  const mediaFingerprint = mediaFingerprintResult.rows[0];
  const mediaSha256 = crypto
    .createHash("sha256")
    .update(JSON.stringify(mediaFingerprint))
    .digest("hex");

  const runIds = {
    fullAnalysis: await upsertRun(client, {
      datasetKey: "full_analysis",
      sourcePath: "public/data/full_analysis.json",
      sourceSha256: fullSource.sha256,
      sourceBytes: fullSource.bytes,
      coverage: {
        start: overviewRows[0].date_range_start,
        end: overviewRows[0].date_range_end,
        granularity: ["month", "active_day"],
      },
      expectedCounts: {
        overview: 1,
        months: expected.months,
        active_days: expected.activeDates,
        flair_rows: expected.flairRows,
        top_authors: topAuthors.length,
      },
      metadata: {
        authoritative_store: "supabase",
        raw_reddit_artifacts_loaded: false,
      },
    }),
    userForensics: await upsertRun(client, {
      datasetKey: "user_forensics",
      sourcePath: "public/data/user_forensics.json",
      sourceSha256: forensicSource.sha256,
      sourceBytes: forensicSource.bytes,
      coverage: {
        actors: forensicUsers.length,
        hour_profiles_date_linked: false,
      },
      expectedCounts: {
        forensic_users: expected.assessments,
        reply_edges: expected.replyEdges,
        coordination_events: expected.coordinationEvents,
        coordination_memberships: expected.coordinationMemberships,
      },
      metadata: {
        assessment_basis: "descriptive_source_fields",
      },
    }),
    eventsResearch: await upsertRun(client, {
      datasetKey: "events_research",
      sourcePath: "public/data/events_research.json",
      sourceSha256: researchSource.sha256,
      sourceBytes: researchSource.bytes,
      coverage: {
        evidence_status_default: "unsourced_context",
      },
      expectedCounts: {
        events: expected.researchEvents,
        eras: expected.researchEras,
      },
      metadata: {
        source_urls_present: researchEventRows.filter((row) => row.source_url).length,
      },
    }),
    mediaEvents: await upsertRun(client, {
      datasetKey: "media_events",
      sourcePath: "supabase://public/media_events",
      sourceSha256: mediaSha256,
      sourceBytes: 0,
      coverage: {
        timezone: "Asia/Beirut",
        first_event: mediaFingerprint.first_event,
        last_event: mediaFingerprint.last_event,
      },
      expectedCounts: {
        raw_rows: mediaFingerprint.raw_rows,
        canonical_rows_audited_snapshot: snapshotExpected.canonicalMedia,
        source_days_audited_snapshot: snapshotExpected.mediaSourceDays,
      },
      metadata: {
        dedupe_key: ["source", "message_id"],
        blank_message_ids_preserved_individually: true,
      },
    }),
  };

  await upsertRows(
    client,
    specs.overview,
    attachRun(overviewRows, runIds.fullAnalysis),
  );
  await upsertRows(
    client,
    specs.monthly,
    attachRun(monthlyRows, runIds.fullAnalysis),
  );
  await upsertRows(
    client,
    specs.daily,
    attachRun(dailyRows, runIds.fullAnalysis),
  );
  await upsertRows(
    client,
    specs.flair,
    attachRun(flairRows, runIds.fullAnalysis),
  );
  await upsertRows(
    client,
    specs.accounts,
    attachScopedRuns(accountRows, runIds),
  );
  await upsertRows(
    client,
    specs.metrics,
    attachScopedRuns([...topMetricRows, ...forensicMetricRows], runIds),
  );
  await upsertRows(
    client,
    specs.assessments,
    attachRun(assessmentRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.languages,
    attachRun(languageRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.subreddits,
    attachRun(subredditRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.hours,
    attachRun(hourRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.accountMonths,
    attachRun(accountMonthlyRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.dormancy,
    attachRun(dormancyRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.sentiment,
    attachRun(sentimentRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.samples,
    attachRun(sampleRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.replies,
    attachRun(replyRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.coordination,
    attachRun(coordinationRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.coordinationMembers,
    attachRun(coordinationMemberRows, runIds.userForensics),
  );
  await upsertRows(
    client,
    specs.researchEvents,
    attachRun(researchEventRows, runIds.eventsResearch),
  );
  await upsertRows(
    client,
    specs.researchEras,
    attachRun(researchEraRows, runIds.eventsResearch),
  );

  const databaseCounts = await validateDatabase(client);

  const loadedByDataset = {
    fullAnalysis: {
      overview: 1,
      months: monthlyRows.length,
      days: dailyRows.length,
      flair: flairRows.length,
      accounts_from_scope: topAuthors.length,
      scoped_metrics: topMetricRows.length,
    },
    userForensics: {
      users: forensicUsers.length,
      scoped_metrics: forensicMetricRows.length,
      assessments: assessmentRows.length,
      languages: languageRows.length,
      subreddits: subredditRows.length,
      hour_profiles: hourRows.length,
      account_months: accountMonthlyRows.length,
      dormancy_gaps: dormancyRows.length,
      sentiment_counts: sentimentRows.length,
      comment_samples: sampleRows.length,
      reply_edges: replyRows.length,
      coordination_events: coordinationRows.length,
      coordination_memberships: coordinationMemberRows.length,
    },
    eventsResearch: {
      events: researchEventRows.length,
      eras: researchEraRows.length,
    },
    mediaEvents: {
      raw_rows: mediaFingerprint.raw_rows,
      canonical_rows: databaseCounts.canonical_media,
      source_days: databaseCounts.media_source_days,
    },
  };

  for (const [datasetKey, runId] of Object.entries(runIds)) {
    await client.query(
      `
        UPDATE private.ingestion_runs
        SET
          status = 'completed',
          completed_at = now(),
          loaded_counts = $2::jsonb,
          row_counts = $2::jsonb
        WHERE id = $1
      `,
      [runId, JSON.stringify(loadedByDataset[datasetKey])],
    );
  }

  await client.query("COMMIT");
  console.log(
    `[part-i] load committed: ${databaseCounts.canonical_media} canonical media rows and ${databaseCounts.media_source_days} media source-days`,
  );
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(`[part-i] load failed; transaction rolled back: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
