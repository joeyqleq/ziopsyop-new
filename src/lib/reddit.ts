import "server-only";
import { sbSelect } from "@/lib/supabase";

/**
 * Part I data layer — reads the r/ForbiddenBromance forensic dataset from
 * Supabase and returns it in the EXACT shape the Part I chart components
 * already expect (formerly public/data/analysis.json). This lets the charts
 * stay byte-for-byte identical while the source becomes a live, appendable DB.
 */

export interface AnalysisData {
  overview: {
    posts: number;
    comments: number;
    hebrew_posts: number;
    hebrew_comments: number;
    downloaded_user_histories: number;
  };
  monthly_activity: Array<{
    month: string;
    posts: number;
    comments: number;
    hebrew_posts: number;
    hebrew_comments: number;
  }>;
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
    source_title?: string;
    source_url?: string;
  }>;
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

/** Fetch and reshape the full Part I dataset from Supabase. */
export async function getPartIData(): Promise<AnalysisData> {
  const [metrics, events, authors, overviewRows] = await Promise.all([
    sbSelect<MetricRow>("reddit_subreddit_metrics", "select=*&order=period.asc"),
    sbSelect<EventRow>("media_coverage_gaps", "select=*&order=event_date.asc"),
    sbSelect<AuthorRow>(
      "reddit_user_sentiment",
      "select=*&order=karma_score.desc.nullslast",
    ),
    sbSelect<OverviewRow>("reddit_overview", "select=*&limit=1"),
  ]);

  const overview = overviewRows[0] ?? {
    posts: 0,
    comments: 0,
    hebrew_posts: 0,
    hebrew_comments: 0,
    downloaded_user_histories: 0,
  };

  return {
    overview,
    monthly_activity: metrics.map((r) => ({
      month: r.period,
      posts: n(r.posts),
      comments: n(r.comments),
      hebrew_posts: n(r.hebrew_posts),
      hebrew_comments: n(r.hebrew_comments),
    })),
    keyword_trends: metrics.map((r) => ({
      month: r.period,
      hezbollah: n(r.kw_hezbollah),
      iran: n(r.kw_iran),
      peace: n(r.kw_peace),
      sectarian: n(r.kw_sectarian),
      gaza_palestine: n(r.kw_gaza_palestine),
      identity: n(r.kw_identity),
    })),
    monthly_spikes: metrics.map((r) => ({
      month: r.period,
      posts: n(r.posts),
      comments: n(r.comments),
      total: n(r.posts) + n(r.comments),
      post_zscore: n(r.post_zscore),
      comment_zscore: n(r.comment_zscore),
    })),
    flair_monthly: metrics.map((r) => ({
      month: r.period,
      categories: r.flair_categories ?? {},
    })),
    event_timeline: events.map((e) => ({
      window_month: e.period ?? "",
      event_date: e.event_date,
      label: e.event_label,
      description: e.description ?? "",
      source_title: e.source_title ?? undefined,
      source_url: e.source_url ?? undefined,
    })),
    top_authors: authors.map((a) => ({
      author: a.username,
      flair: a.flair ?? undefined,
      posts: n(a.post_count_period),
      comments: n(a.comment_count_period),
      total: n(a.post_count_period) + n(a.comment_count_period),
    })),
  };
}
