import "server-only";
import { sbSelect } from "@/lib/supabase";
import fs from "fs";
import path from "path";

/**
 * Part I data layer — reads the r/ForbiddenBromance forensic dataset from
 * Supabase and returns it in the EXACT shape the Part I chart components
 * already expect. JSON fallback reads public/data/full_analysis.json and
 * public/data/events_research.json when Supabase has no rows.
 */

export interface Era {
  start: string;
  end: string;
  label: string;
  tone: string;
}

export interface GrowthPoint {
  month: string;
  cumulative_unique_users: number;
  new_users_this_month: number;
  active_users: number;
  subscriber_count: number;
  posts: number;
  comments: number;
  israeli_flair_users: number;
  lebanese_flair_users: number;
  other_flair_users: number;
  no_flair_users: number;
}

export interface DailyPoint {
  date: string;
  posts: number;
  comments: number;
  total: number;
  unique_users: number;
  hebrew_comments: number;
  arabic_comments: number;
  avg_score_comments: number;
}

export interface AnalysisData {
  overview: {
    posts: number;
    comments: number;
    hebrew_posts: number;
    hebrew_comments: number;
    downloaded_user_histories: number;
    total_artifacts?: number;
    total_unique_users?: number;
    months_observed?: number;
    peak_month?: string;
  };
  monthly_activity: Array<{
    month: string;
    posts: number;
    comments: number;
    hebrew_posts: number;
    hebrew_comments: number;
  }>;
  daily_activity: DailyPoint[];
  subreddit_growth: GrowthPoint[];
  keyword_trends: Array<{
    month: string;
    hezbollah: number;
    iran: number;
    peace: number;
    sectarian: number;
    gaza_palestine: number;
    identity: number;
  }>;
  monthly_spikes: Array<{
    month: string;
    posts: number;
    comments: number;
    total: number;
    post_zscore: number;
    comment_zscore: number;
  }>;
  flair_monthly: Array<{
    month: string;
    categories: Record<string, { posts: number; comments: number; total: number }>;
  }>;
  event_timeline: Array<{
    window_month: string;
    event_date: string;
    label: string;
    description: string;
    category?: string;
    source_title?: string;
    source_url?: string;
  }>;
  eras: Era[];
  top_authors: Array<{
    author: string;
    flair?: string;
    posts: number;
    comments: number;
    total: number;
  }>;
}

interface MetricRow {
  period: string;
  posts: number | null;
  comments: number | null;
  hebrew_posts: number | null;
  hebrew_comments: number | null;
  post_zscore: number | string | null;
  comment_zscore: number | string | null;
  kw_hezbollah: number | null;
  kw_iran: number | null;
  kw_peace: number | null;
  kw_sectarian: number | null;
  kw_gaza_palestine: number | null;
  kw_identity: number | null;
  flair_categories: Record<string, { posts: number; comments: number; total: number }> | null;
}

interface EventRow {
  period: string | null;
  event_date: string;
  event_label: string;
  description: string | null;
  source_title: string | null;
  source_url: string | null;
}

interface AuthorRow {
  username: string;
  flair: string | null;
  post_count_period: number | null;
  comment_count_period: number | null;
  karma_score: number | null;
}

interface OverviewRow {
  posts: number;
  comments: number;
  hebrew_posts: number;
  hebrew_comments: number;
  downloaded_user_histories: number;
}

const n = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? Number(v) : v;

function readJson<T>(relPath: string): T | null {
  try {
    const abs = path.join(process.cwd(), "public", relPath);
    return JSON.parse(fs.readFileSync(abs, "utf-8")) as T;
  } catch {
    return null;
  }
}

/** Fetch and reshape the full Part I dataset from Supabase, with JSON fallback. */
export async function getPartIData(): Promise<AnalysisData> {
  // Always load JSON files — they carry daily_activity, subreddit_growth, eras
  type FullJson = {
    overview: Record<string, number | string>;
    monthly_activity: Array<Record<string, number | string>>;
    daily_activity: DailyPoint[];
    subreddit_growth: GrowthPoint[];
    flair_monthly: Array<{ month: string; categories: Record<string, { posts: number; comments: number; total: number }> }>;
    keyword_trends: Array<Record<string, number | string>>;
    monthly_spikes: Array<Record<string, number | string>>;
    top_authors: Array<{ author: string; flair?: string; posts: number; comments: number; total: number }>;
  };
  const fullJson = readJson<FullJson>("data/full_analysis.json");

  type EventsJson = { events: Array<{ date: string; label: string; description: string; category?: string }>; eras: Era[] };
  const eventsJson = readJson<EventsJson>("data/events_research.json");

  const [metrics, events, authors, overviewRows] = await Promise.all([
    sbSelect<MetricRow>("reddit_subreddit_metrics", "select=*&order=period.asc"),
    sbSelect<EventRow>("media_coverage_gaps", "select=*&order=event_date.asc"),
    sbSelect<AuthorRow>(
      "reddit_user_sentiment",
      "select=*&order=karma_score.desc.nullslast",
    ),
    sbSelect<OverviewRow>("reddit_overview", "select=*&limit=1"),
  ]);

  const useSupabase = metrics.length > 0;

  const dbOverview = overviewRows[0];
  const jsonOverview = fullJson?.overview ?? {};
  const overview = {
    posts: dbOverview?.posts ?? Number(jsonOverview.total_posts ?? 0),
    comments: dbOverview?.comments ?? Number(jsonOverview.total_comments ?? 0),
    hebrew_posts: dbOverview?.hebrew_posts ?? Number(jsonOverview.hebrew_posts_total ?? 0),
    hebrew_comments: dbOverview?.hebrew_comments ?? Number(jsonOverview.hebrew_comments_total ?? 0),
    downloaded_user_histories: dbOverview?.downloaded_user_histories ?? Number(jsonOverview.downloaded_user_histories ?? 0),
    total_artifacts: Number(jsonOverview.total_artifacts ?? 0),
    total_unique_users: Number(jsonOverview.total_unique_users ?? 0),
    months_observed: Number(jsonOverview.months_observed ?? 0),
    peak_month: String(jsonOverview.peak_month ?? ""),
  };

  const monthly_activity = useSupabase
    ? metrics.map((r) => ({
        month: r.period,
        posts: n(r.posts),
        comments: n(r.comments),
        hebrew_posts: n(r.hebrew_posts),
        hebrew_comments: n(r.hebrew_comments),
      }))
    : (fullJson?.monthly_activity ?? []).map((r) => ({
        month: String(r.month),
        posts: Number(r.posts ?? 0),
        comments: Number(r.comments ?? 0),
        hebrew_posts: Number(r.hebrew_posts ?? 0),
        hebrew_comments: Number(r.hebrew_comments ?? 0),
      }));

  const keyword_trends = useSupabase
    ? metrics.map((r) => ({
        month: r.period,
        hezbollah: n(r.kw_hezbollah),
        iran: n(r.kw_iran),
        peace: n(r.kw_peace),
        sectarian: n(r.kw_sectarian),
        gaza_palestine: n(r.kw_gaza_palestine),
        identity: n(r.kw_identity),
      }))
    : (fullJson?.keyword_trends ?? []).map((r) => ({
        month: String(r.month),
        hezbollah: Number(r.hezbollah ?? 0),
        iran: Number(r.iran ?? 0),
        peace: Number(r.peace ?? 0),
        sectarian: Number(r.sectarian ?? 0),
        gaza_palestine: Number(r.gaza_palestine ?? 0),
        identity: Number(r.identity ?? 0),
      }));

  const monthly_spikes = useSupabase
    ? metrics.map((r) => ({
        month: r.period,
        posts: n(r.posts),
        comments: n(r.comments),
        total: n(r.posts) + n(r.comments),
        post_zscore: n(r.post_zscore),
        comment_zscore: n(r.comment_zscore),
      }))
    : (fullJson?.monthly_spikes ?? []).map((r) => ({
        month: String(r.month),
        posts: Number(r.posts ?? 0),
        comments: Number(r.comments ?? 0),
        total: Number(r.total ?? 0),
        post_zscore: Number(r.post_zscore ?? 0),
        comment_zscore: Number(r.comment_zscore ?? 0),
      }));

  const flair_monthly = useSupabase
    ? metrics.map((r) => ({
        month: r.period,
        categories: r.flair_categories ?? {},
      }))
    : (fullJson?.flair_monthly ?? []);

  const researchEvents = (eventsJson?.events ?? []).map((e) => ({
    window_month: e.date.slice(0, 7),
    event_date: e.date,
    label: e.label,
    description: e.description,
    category: e.category,
  }));

  const event_timeline = useSupabase && events.length > 0
    ? events.map((e) => ({
        window_month: e.period ?? "",
        event_date: e.event_date,
        label: e.event_label,
        description: e.description ?? "",
        source_title: e.source_title ?? undefined,
        source_url: e.source_url ?? undefined,
      }))
    : researchEvents;

  const top_authors = useSupabase
    ? authors.map((a) => ({
        author: a.username,
        flair: a.flair ?? undefined,
        posts: n(a.post_count_period),
        comments: n(a.comment_count_period),
        total: n(a.post_count_period) + n(a.comment_count_period),
      }))
    : (fullJson?.top_authors ?? []).slice(0, 50).map((a) => ({
        author: a.author,
        flair: a.flair,
        posts: a.posts,
        comments: a.comments,
        total: a.total,
      }));

  return {
    overview,
    monthly_activity,
    daily_activity: fullJson?.daily_activity ?? [],
    subreddit_growth: fullJson?.subreddit_growth ?? [],
    keyword_trends,
    monthly_spikes,
    flair_monthly,
    event_timeline,
    eras: eventsJson?.eras ?? [],
    top_authors,
  };
}
