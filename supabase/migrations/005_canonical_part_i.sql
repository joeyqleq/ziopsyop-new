-- 005_canonical_part_i.sql
-- Canonical Part I aggregate store and bounded server-only read contracts.
--
-- This migration is deliberately additive:
--   * existing public tables and RPCs are not altered;
--   * normalized source data lives in the non-exposed private schema;
--   * only compact, service-role-only RPCs are added to public;
--   * no raw Reddit artifacts are copied into the database.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE TABLE IF NOT EXISTS private.ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_key text NOT NULL,
  contract_version text NOT NULL DEFAULT 'part-i-v1',
  source_path text NOT NULL,
  source_sha256 text NOT NULL,
  source_bytes bigint NOT NULL CHECK (source_bytes >= 0),
  source_generated_at timestamptz,
  generator_revision text,
  coverage jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  loaded_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  row_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (dataset_key, source_sha256)
);

CREATE TABLE IF NOT EXISTS private.reddit_overview (
  singleton_id smallint PRIMARY KEY DEFAULT 1 CHECK (singleton_id = 1),
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  total_posts integer,
  total_comments integer,
  total_artifacts integer,
  total_unique_users integer,
  date_range_start date,
  date_range_end date,
  months_observed integer,
  peak_month date,
  peak_comments integer,
  hebrew_posts_total integer,
  hebrew_comments_total integer,
  arabic_comments_total integer,
  israeli_flair_user_pct numeric,
  downloaded_user_histories integer,
  events_correlated integer,
  quality_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS private.reddit_monthly_metrics (
  month date PRIMARY KEY,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  posts integer,
  comments integer,
  total integer,
  unique_users integer,
  hebrew_posts integer,
  hebrew_comments integer,
  arabic_posts integer,
  arabic_comments integer,
  avg_score_comments numeric,
  avg_score_posts numeric,
  subscriber_count integer,
  cumulative_unique_users integer,
  new_users integer,
  active_users integer,
  israeli_flair_users integer,
  lebanese_flair_users integer,
  other_flair_users integer,
  no_flair_users integer,
  keyword_hezbollah integer,
  keyword_iran integer,
  keyword_peace integer,
  keyword_sectarian integer,
  keyword_gaza_palestine integer,
  keyword_identity integer,
  post_zscore numeric,
  comment_zscore numeric,
  observed boolean NOT NULL DEFAULT true,
  quality_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS private.reddit_daily_metrics (
  activity_date date PRIMARY KEY,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  posts integer,
  comments integer,
  total integer,
  unique_users integer,
  hebrew_comments integer,
  arabic_comments integer,
  avg_score_comments numeric,
  observed boolean NOT NULL DEFAULT true,
  quality_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS private.reddit_monthly_flair (
  month date NOT NULL,
  flair_category text NOT NULL,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  posts integer,
  comments integer,
  total integer,
  observed boolean NOT NULL DEFAULT true,
  quality_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (month, flair_category)
);

CREATE TABLE IF NOT EXISTS private.reddit_accounts (
  username text PRIMARY KEY,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  first_seen date,
  last_seen date,
  flair text,
  source_scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_suspended boolean,
  is_deleted boolean,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One account may have one row from the top-author scope and another from the
-- deeper forensic scope. Keeping the scope in the key avoids false merging.
CREATE TABLE IF NOT EXISTS private.reddit_account_metrics (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  metric_scope text NOT NULL CHECK (metric_scope IN ('top_authors', 'user_forensics')),
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  posts integer,
  comments integer,
  total integer,
  avg_score numeric,
  conflict_pct numeric,
  hebrew_content_pct numeric,
  first_seen date,
  last_seen date,
  role text,
  age_days integer,
  contradiction_score numeric,
  fb_pct numeric,
  israel_hours_pct numeric,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (username, metric_scope)
);

CREATE TABLE IF NOT EXISTS private.reddit_account_assessments (
  username text PRIMARY KEY REFERENCES private.reddit_accounts(username),
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  role text,
  contradiction_score numeric,
  conflict_pct numeric,
  fb_pct numeric,
  israel_hours_pct numeric,
  age_days integer,
  assessment_basis text NOT NULL DEFAULT 'descriptive_source_fields',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS private.reddit_account_languages (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  language text NOT NULL,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  metric_value numeric,
  metric_unit text NOT NULL DEFAULT 'source_value',
  PRIMARY KEY (username, language)
);

CREATE TABLE IF NOT EXISTS private.reddit_account_subreddits (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  subreddit text NOT NULL,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  rank integer,
  activity_count integer,
  PRIMARY KEY (username, subreddit)
);

CREATE TABLE IF NOT EXISTS private.reddit_account_hour_profile (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  hour_of_day smallint NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  activity_pct numeric,
  timezone text NOT NULL DEFAULT 'UTC',
  date_linked boolean NOT NULL DEFAULT false,
  PRIMARY KEY (username, hour_of_day)
);

CREATE TABLE IF NOT EXISTS private.reddit_account_monthly_activity (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  month date NOT NULL,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  activity_count integer,
  PRIMARY KEY (username, month)
);

CREATE TABLE IF NOT EXISTS private.reddit_account_dormancy_gaps (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  gap_start date NOT NULL,
  gap_end date NOT NULL,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  gap_days integer,
  PRIMARY KEY (username, gap_start, gap_end)
);

CREATE TABLE IF NOT EXISTS private.reddit_account_sentiment_counts (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  sentiment_dimension text NOT NULL,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  activity_count numeric,
  PRIMARY KEY (username, sentiment_dimension)
);

CREATE TABLE IF NOT EXISTS private.reddit_account_comment_samples (
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  sample_index integer NOT NULL,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  sample_text text,
  score numeric,
  sample_date date,
  PRIMARY KEY (username, sample_index)
);

CREATE TABLE IF NOT EXISTS private.reddit_reply_edges (
  source_username text NOT NULL REFERENCES private.reddit_accounts(username),
  target_username text NOT NULL REFERENCES private.reddit_accounts(username),
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  interaction_count integer,
  PRIMARY KEY (source_username, target_username)
);

CREATE TABLE IF NOT EXISTS private.reddit_coordination_events (
  event_key text PRIMARY KEY,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  event_timestamp timestamptz,
  event_date date,
  event_hour smallint CHECK (event_hour BETWEEN 0 AND 23),
  user_count integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS private.reddit_coordination_members (
  event_key text NOT NULL REFERENCES private.reddit_coordination_events(event_key),
  username text NOT NULL REFERENCES private.reddit_accounts(username),
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  PRIMARY KEY (event_key, username)
);

CREATE TABLE IF NOT EXISTS private.research_events (
  event_key text PRIMARY KEY,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  event_date date,
  label text,
  description text,
  category text,
  significance text,
  region text,
  source_title text,
  source_url text,
  evidence_status text NOT NULL CHECK (evidence_status IN ('sourced', 'unsourced_context')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS private.research_eras (
  era_key text PRIMARY KEY,
  ingestion_run_id uuid NOT NULL REFERENCES private.ingestion_runs(id),
  start_date date,
  end_date date,
  label text,
  description text,
  tone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reddit_monthly_metrics_ingestion_idx
  ON private.reddit_monthly_metrics (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_daily_metrics_ingestion_idx
  ON private.reddit_daily_metrics (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_daily_metrics_date_idx
  ON private.reddit_daily_metrics (activity_date);
CREATE INDEX IF NOT EXISTS reddit_account_metrics_scope_idx
  ON private.reddit_account_metrics (metric_scope, total DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS reddit_account_monthly_date_idx
  ON private.reddit_account_monthly_activity (month, username);
CREATE INDEX IF NOT EXISTS reddit_coordination_events_date_idx
  ON private.reddit_coordination_events (event_date);
CREATE INDEX IF NOT EXISTS research_events_date_idx
  ON private.research_events (event_date);

-- The canonical key is source + message_id. Blank message IDs are kept as
-- individual records so separate unsourced rows are never silently merged.
CREATE OR REPLACE VIEW private.canonical_media_events
WITH (security_invoker = true)
AS
WITH keyed AS (
  SELECT
    m.*,
    CASE
      WHEN nullif(btrim(m.message_id), '') IS NULL THEN 'row:' || m.id::text
      ELSE 'message:' || m.message_id
    END AS canonical_key
  FROM public.media_events AS m
),
ranked AS (
  SELECT
    k.*,
    first_value(k.id) OVER (
      PARTITION BY k.source, k.canonical_key
      ORDER BY k.created_at DESC NULLS LAST, k.event_timestamp DESC NULLS LAST, k.id DESC
    ) AS survivor_id,
    row_number() OVER (
      PARTITION BY k.source, k.canonical_key
      ORDER BY k.created_at DESC NULLS LAST, k.event_timestamp DESC NULLS LAST, k.id DESC
    ) AS survivor_rank
  FROM keyed AS k
),
id_map AS (
  SELECT
    id AS original_id,
    survivor_id
  FROM ranked
),
merged_topics AS (
  SELECT
    k.source,
    k.canonical_key,
    array_agg(DISTINCT topic ORDER BY topic) AS topics
  FROM keyed AS k
  CROSS JOIN LATERAL unnest(coalesce(k.topics, ARRAY[]::text[])) AS topic
  GROUP BY k.source, k.canonical_key
),
merged AS (
  SELECT
    k.source,
    k.canonical_key,
    bool_or(coalesce(k.is_contradiction, false)) AS is_contradiction,
    (
      array_agg(
        k.contradiction_pair_id
        ORDER BY k.created_at DESC NULLS LAST, k.id DESC
      ) FILTER (WHERE k.contradiction_pair_id IS NOT NULL)
    )[1] AS raw_contradiction_pair_id
  FROM keyed AS k
  GROUP BY k.source, k.canonical_key
)
SELECT
  r.id,
  r.source,
  r.canonical_key,
  r.event_date,
  r.event_timestamp,
  r.text,
  r.message_id,
  r.category,
  r.sentiment,
  coalesce(mt.topics, r.topics) AS topics,
  m.is_contradiction,
  coalesce(pair_map.survivor_id, m.raw_contradiction_pair_id) AS contradiction_pair_id,
  r.created_at
FROM ranked AS r
JOIN merged AS m
  ON m.source = r.source
 AND m.canonical_key = r.canonical_key
LEFT JOIN merged_topics AS mt
  ON mt.source = r.source
 AND mt.canonical_key = r.canonical_key
LEFT JOIN id_map AS pair_map
  ON pair_map.original_id = m.raw_contradiction_pair_id
WHERE r.survivor_rank = 1;

CREATE MATERIALIZED VIEW IF NOT EXISTS private.media_daily_counts AS
SELECT
  coalesce(
    (event_timestamp AT TIME ZONE 'Asia/Beirut')::date,
    event_date
  ) AS local_day,
  source,
  count(*)::integer AS message_count
FROM private.canonical_media_events
GROUP BY 1, 2
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS media_daily_counts_day_source_idx
  ON private.media_daily_counts (local_day, source);
CREATE INDEX IF NOT EXISTS media_daily_counts_source_day_idx
  ON private.media_daily_counts (source, local_day);

REFRESH MATERIALIZED VIEW private.media_daily_counts;

ALTER TABLE private.ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_monthly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_monthly_flair ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_hour_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_monthly_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_dormancy_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_sentiment_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_account_comment_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_reply_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_coordination_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.reddit_coordination_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.research_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.research_eras ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA private TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA private
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private
  GRANT SELECT ON TABLES TO service_role;

CREATE OR REPLACE FUNCTION public.get_part_i_core()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, private
AS $$
  WITH latest_versions AS (
    SELECT DISTINCT ON (dataset_key)
      id,
      dataset_key,
      source_sha256,
      completed_at,
      row_counts
    FROM private.ingestion_runs
    WHERE status = 'completed'
    ORDER BY dataset_key, completed_at DESC NULLS LAST, started_at DESC
  )
  SELECT jsonb_build_object(
    'metadata', jsonb_build_object(
      'granularity', 'monthly',
      'timezone', 'UTC',
      'daily_rows_included', false,
      'authoritative_store', 'supabase',
      'versions', coalesce(
        (
          SELECT jsonb_object_agg(
            dataset_key,
            jsonb_build_object(
              'sha256', source_sha256,
              'completed_at', completed_at,
              'row_counts', row_counts
            )
          )
          FROM latest_versions
        ),
        '{}'::jsonb
      )
    ),
    'data', jsonb_build_object(
      'overview', (
        SELECT to_jsonb(o) - 'ingestion_run_id'
        FROM private.reddit_overview AS o
        WHERE o.singleton_id = 1
          AND o.ingestion_run_id = (
            SELECT id FROM latest_versions WHERE dataset_key = 'full_analysis'
          )
      ),
      'monthly', coalesce(
        (
          SELECT jsonb_agg(to_jsonb(m) - 'ingestion_run_id' ORDER BY m.month)
          FROM private.reddit_monthly_metrics AS m
          WHERE m.ingestion_run_id = (
            SELECT id FROM latest_versions WHERE dataset_key = 'full_analysis'
          )
        ),
        '[]'::jsonb
      ),
      'flair', coalesce(
        (
          SELECT jsonb_agg(to_jsonb(f) - 'ingestion_run_id' ORDER BY f.month, f.flair_category)
          FROM private.reddit_monthly_flair AS f
          WHERE f.ingestion_run_id = (
            SELECT id FROM latest_versions WHERE dataset_key = 'full_analysis'
          )
        ),
        '[]'::jsonb
      ),
      'research_events', coalesce(
        (
          SELECT jsonb_agg(to_jsonb(e) - 'ingestion_run_id' ORDER BY e.event_date, e.event_key)
          FROM private.research_events AS e
          WHERE e.ingestion_run_id = (
            SELECT id FROM latest_versions WHERE dataset_key = 'events_research'
          )
        ),
        '[]'::jsonb
      ),
      'research_eras', coalesce(
        (
          SELECT jsonb_agg(to_jsonb(e) - 'ingestion_run_id' ORDER BY e.start_date, e.era_key)
          FROM private.research_eras AS e
          WHERE e.ingestion_run_id = (
            SELECT id FROM latest_versions WHERE dataset_key = 'events_research'
          )
        ),
        '[]'::jsonb
      ),
      'quality_notes', jsonb_build_array(
        'Flair post counts retain a source-generator quality flag until regenerated.',
        'Research events without source URLs are contextual annotations, not corroborated evidence.'
      ),
      'top_actors', coalesce(
        (
          SELECT jsonb_agg(to_jsonb(a) - 'ingestion_run_id' ORDER BY a.total DESC NULLS LAST)
          FROM (
            SELECT *
            FROM private.reddit_account_metrics
            WHERE metric_scope = 'top_authors'
              AND ingestion_run_id = (
                SELECT id FROM latest_versions WHERE dataset_key = 'full_analysis'
              )
            ORDER BY total DESC NULLS LAST
            LIMIT 12
          ) AS a
        ),
        '[]'::jsonb
      )
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_reaction_clock_daily(
  p_start date,
  p_end date,
  p_sources text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  result jsonb;
BEGIN
  IF p_start IS NULL OR p_end IS NULL OR p_end < p_start THEN
    RAISE EXCEPTION 'A valid inclusive start/end range is required';
  END IF;

  IF (p_end - p_start) > 3650 THEN
    RAISE EXCEPTION 'Reaction Clock ranges are limited to 3651 days';
  END IF;

  WITH available_sources AS (
    SELECT DISTINCT source
    FROM private.media_daily_counts
  ),
  requested_sources AS (
    SELECT source
    FROM available_sources
    WHERE p_sources IS NULL OR source = ANY(p_sources)
  ),
  spine AS (
    -- Include one look-ahead day so the requested range's final row can expose
    -- a real next-day value without claiming exact event latency.
    SELECT generate_series(p_start, p_end + 1, interval '1 day')::date AS local_day
  ),
  latest_full_run AS (
    SELECT id
    FROM private.ingestion_runs
    WHERE dataset_key = 'full_analysis'
      AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST, started_at DESC
    LIMIT 1
  ),
  reddit_windowed AS (
    SELECT
      d.*,
      avg(d.total) OVER (
        ORDER BY d.activity_date::timestamp
        RANGE BETWEEN interval '28 days' PRECEDING AND interval '1 day' PRECEDING
      ) AS rolling_baseline,
      stddev_samp(d.total) OVER (
        ORDER BY d.activity_date::timestamp
        RANGE BETWEEN interval '28 days' PRECEDING AND interval '1 day' PRECEDING
      ) AS rolling_stddev
    FROM private.reddit_daily_metrics AS d
    WHERE d.ingestion_run_id = (SELECT id FROM latest_full_run)
  ),
  aligned AS (
    SELECT
      s.local_day,
      r.posts AS reddit_posts,
      r.comments AS reddit_comments,
      r.total AS reddit_total,
      r.unique_users AS reddit_unique_users,
      (r.activity_date IS NOT NULL) AS reddit_observed,
      r.rolling_baseline,
      CASE
        WHEN r.total IS NULL OR r.rolling_baseline IS NULL THEN NULL
        ELSE r.total - r.rolling_baseline
      END AS reddit_deviation,
      CASE
        WHEN r.total IS NULL OR r.rolling_stddev IS NULL OR r.rolling_stddev = 0 THEN NULL
        ELSE (r.total - r.rolling_baseline) / r.rolling_stddev
      END AS reddit_zscore,
      media.media_by_source,
      media.observed_by_source,
      media.media_total,
      media.media_observed
    FROM spine AS s
    LEFT JOIN reddit_windowed AS r
      ON r.activity_date = s.local_day
    LEFT JOIN LATERAL (
      SELECT
        coalesce(
          jsonb_object_agg(rs.source, m.message_count ORDER BY rs.source),
          '{}'::jsonb
        ) AS media_by_source,
        coalesce(
          jsonb_object_agg(rs.source, (m.local_day IS NOT NULL) ORDER BY rs.source),
          '{}'::jsonb
        ) AS observed_by_source,
        sum(m.message_count)::integer AS media_total,
        coalesce(bool_or(m.local_day IS NOT NULL), false) AS media_observed
      FROM requested_sources AS rs
      LEFT JOIN private.media_daily_counts AS m
        ON m.local_day = s.local_day
       AND m.source = rs.source
    ) AS media ON true
  ),
  with_next_day AS (
    SELECT
      a.*,
      lead(a.reddit_total) OVER (ORDER BY a.local_day) AS next_day_reddit_total,
      lead(a.reddit_observed) OVER (ORDER BY a.local_day) AS next_day_reddit_observed
    FROM aligned AS a
  )
  SELECT jsonb_build_object(
    'metadata', jsonb_build_object(
      'granularity', 'day',
      'timezone', 'Asia/Beirut',
      'start', p_start,
      'end', p_end,
      'range_days', (p_end - p_start) + 1,
      'supports_exact_latency', false,
      'association_scope', 'same-day and next-day descriptive alignment only',
      'actor_hour_profiles_date_linked', false,
      'missing_value_contract', 'null with observed=false'
    ),
    'data', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'date', local_day,
          'reddit_posts', reddit_posts,
          'reddit_comments', reddit_comments,
          'reddit_total', reddit_total,
          'reddit_unique_users', reddit_unique_users,
          'reddit_observed', reddit_observed,
          'reddit_rolling_baseline', rolling_baseline,
          'reddit_deviation', reddit_deviation,
          'reddit_zscore', reddit_zscore,
          'media_by_source', media_by_source,
          'media_observed_by_source', observed_by_source,
          'media_total', media_total,
          'media_observed', media_observed,
          'same_day_pair_observed', reddit_observed AND media_observed,
          'next_day_reddit_total', next_day_reddit_total,
          'next_day_pair_observed', media_observed AND coalesce(next_day_reddit_observed, false)
        )
        ORDER BY local_day
      ),
      '[]'::jsonb
    )
  )
  INTO result
  FROM with_next_day
  WHERE local_day <= p_end;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_actor_hour_profiles()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, private
AS $$
  WITH latest_forensics_run AS (
    SELECT id
    FROM private.ingestion_runs
    WHERE dataset_key = 'user_forensics'
      AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST, started_at DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'metadata', jsonb_build_object(
      'granularity', 'aggregate hour-of-day profile',
      'timezone', 'UTC',
      'date_linked', false,
      'supports_exact_latency', false
    ),
    'data', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'actor', h.username,
          'hour', h.hour_of_day,
          'activity_pct', h.activity_pct
        )
        ORDER BY h.username, h.hour_of_day
      ),
      '[]'::jsonb
    )
  )
  FROM private.reddit_account_hour_profile AS h
  WHERE h.ingestion_run_id = (SELECT id FROM latest_forensics_run);
$$;

CREATE OR REPLACE FUNCTION public.get_forensics_overview()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, private
AS $$
  WITH latest_full_run AS (
    SELECT id
    FROM private.ingestion_runs
    WHERE dataset_key = 'full_analysis'
      AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST, started_at DESC
    LIMIT 1
  ),
  latest_forensics_run AS (
    SELECT id
    FROM private.ingestion_runs
    WHERE dataset_key = 'user_forensics'
      AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST, started_at DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'metadata', jsonb_build_object(
      'granularity', 'summary',
      'timezone', 'UTC',
      'authoritative_store', 'supabase'
    ),
    'data', jsonb_build_object(
      'counts', jsonb_build_object(
        'accounts', (
          SELECT count(*)
          FROM private.reddit_accounts
          WHERE ingestion_run_id IN (
            (SELECT id FROM latest_full_run),
            (SELECT id FROM latest_forensics_run)
          )
        ),
        'forensic_accounts', (
          SELECT count(*)
          FROM private.reddit_account_metrics
          WHERE metric_scope = 'user_forensics'
            AND ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        'scoped_metrics', (
          SELECT count(*)
          FROM private.reddit_account_metrics
          WHERE ingestion_run_id IN (
            (SELECT id FROM latest_full_run),
            (SELECT id FROM latest_forensics_run)
          )
        ),
        'reply_edges', (
          SELECT count(*) FROM private.reddit_reply_edges
          WHERE ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        'hour_profile_rows', (
          SELECT count(*) FROM private.reddit_account_hour_profile
          WHERE ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        'coordination_events', (
          SELECT count(*) FROM private.reddit_coordination_events
          WHERE ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        'coordination_memberships', (
          SELECT count(*) FROM private.reddit_coordination_members
          WHERE ingestion_run_id = (SELECT id FROM latest_forensics_run)
        )
      ),
      'actors', coalesce(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'account', to_jsonb(a) - 'ingestion_run_id',
              'metrics', to_jsonb(m) - 'ingestion_run_id',
              'assessment', to_jsonb(x) - 'ingestion_run_id'
            )
            ORDER BY m.total DESC NULLS LAST, a.username
          )
          FROM private.reddit_accounts AS a
          JOIN private.reddit_account_metrics AS m
            ON m.username = a.username
           AND m.metric_scope = 'user_forensics'
           AND m.ingestion_run_id = (SELECT id FROM latest_forensics_run)
          LEFT JOIN private.reddit_account_assessments AS x
            ON x.username = a.username
           AND x.ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        '[]'::jsonb
      ),
      'reply_edges', coalesce(
        (
          SELECT jsonb_agg(to_jsonb(e) - 'ingestion_run_id' ORDER BY e.interaction_count DESC, e.source_username, e.target_username)
          FROM private.reddit_reply_edges AS e
          WHERE e.ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        '[]'::jsonb
      ),
      'coordination', jsonb_build_object(
        'events', (
          SELECT count(*)
          FROM private.reddit_coordination_events
          WHERE ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        'memberships', (
          SELECT count(*)
          FROM private.reddit_coordination_members
          WHERE ingestion_run_id = (SELECT id FROM latest_forensics_run)
        )
      )
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_dossier(
  p_username text,
  p_sample_limit integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, private
AS $$
  WITH latest_full_run AS (
    SELECT id
    FROM private.ingestion_runs
    WHERE dataset_key = 'full_analysis'
      AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST, started_at DESC
    LIMIT 1
  ),
  latest_forensics_run AS (
    SELECT id
    FROM private.ingestion_runs
    WHERE dataset_key = 'user_forensics'
      AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST, started_at DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'metadata', jsonb_build_object(
      'granularity', 'single account',
      'timezone', 'UTC',
      'target', p_username,
      'hour_profiles_date_linked', false
    ),
    'data', CASE
      WHEN a.username IS NULL THEN NULL
      ELSE jsonb_build_object(
        'account', to_jsonb(a) - 'ingestion_run_id',
        'metrics', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(m) - 'ingestion_run_id' ORDER BY m.metric_scope)
            FROM private.reddit_account_metrics AS m
            WHERE m.username = a.username
              AND m.ingestion_run_id IN (
                (SELECT id FROM latest_full_run),
                (SELECT id FROM latest_forensics_run)
              )
          ),
          '[]'::jsonb
        ),
        'assessment', (
          SELECT to_jsonb(x) - 'ingestion_run_id'
          FROM private.reddit_account_assessments AS x
          WHERE x.username = a.username
            AND x.ingestion_run_id = (SELECT id FROM latest_forensics_run)
        ),
        'languages', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(l) - 'ingestion_run_id' ORDER BY l.language)
            FROM private.reddit_account_languages AS l
            WHERE l.username = a.username
              AND l.ingestion_run_id = (SELECT id FROM latest_forensics_run)
          ),
          '[]'::jsonb
        ),
        'subreddits', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(s) - 'ingestion_run_id' ORDER BY s.rank)
            FROM private.reddit_account_subreddits AS s
            WHERE s.username = a.username
              AND s.ingestion_run_id = (SELECT id FROM latest_forensics_run)
          ),
          '[]'::jsonb
        ),
        'hour_profile', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(h) - 'ingestion_run_id' ORDER BY h.hour_of_day)
            FROM private.reddit_account_hour_profile AS h
            WHERE h.username = a.username
              AND h.ingestion_run_id = (SELECT id FROM latest_forensics_run)
          ),
          '[]'::jsonb
        ),
        'monthly_activity', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(ma) - 'ingestion_run_id' ORDER BY ma.month)
            FROM private.reddit_account_monthly_activity AS ma
            WHERE ma.username = a.username
              AND ma.ingestion_run_id = (SELECT id FROM latest_forensics_run)
          ),
          '[]'::jsonb
        ),
        'dormancy_gaps', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(g) - 'ingestion_run_id' ORDER BY g.gap_start)
            FROM private.reddit_account_dormancy_gaps AS g
            WHERE g.username = a.username
              AND g.ingestion_run_id = (SELECT id FROM latest_forensics_run)
          ),
          '[]'::jsonb
        ),
        'sentiment_counts', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(sc) - 'ingestion_run_id' ORDER BY sc.sentiment_dimension)
            FROM private.reddit_account_sentiment_counts AS sc
            WHERE sc.username = a.username
              AND sc.ingestion_run_id = (SELECT id FROM latest_forensics_run)
          ),
          '[]'::jsonb
        ),
        'comment_samples', coalesce(
          (
            SELECT jsonb_agg(to_jsonb(cs) - 'ingestion_run_id' ORDER BY cs.sample_index)
            FROM (
              SELECT *
              FROM private.reddit_account_comment_samples
              WHERE username = a.username
                AND ingestion_run_id = (SELECT id FROM latest_forensics_run)
              ORDER BY sample_index
              LIMIT greatest(0, least(coalesce(p_sample_limit, 5), 5))
            ) AS cs
          ),
          '[]'::jsonb
        )
      )
    END
  )
  FROM (SELECT 1) AS seed
  LEFT JOIN private.reddit_accounts AS a
    ON a.username = p_username
   AND a.ingestion_run_id IN (
     (SELECT id FROM latest_full_run),
     (SELECT id FROM latest_forensics_run)
   );
$$;

REVOKE EXECUTE ON FUNCTION public.get_part_i_core()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_reaction_clock_daily(date, date, text[])
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_actor_hour_profiles()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_forensics_overview()
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_dossier(text, integer)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_part_i_core() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_reaction_clock_daily(date, date, text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_actor_hour_profiles() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_forensics_overview() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_dossier(text, integer) TO service_role;
