-- 006_part_i_indexes_and_legacy_rpc_hardening.sql
-- Cover active-ingestion foreign keys and close legacy RPC exposure without
-- changing the server routes that call them with the service-role credential.

CREATE INDEX IF NOT EXISTS reddit_overview_ingestion_idx
  ON private.reddit_overview (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_monthly_flair_ingestion_idx
  ON private.reddit_monthly_flair (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_accounts_ingestion_idx
  ON private.reddit_accounts (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_metrics_ingestion_idx
  ON private.reddit_account_metrics (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_assessments_ingestion_idx
  ON private.reddit_account_assessments (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_languages_ingestion_idx
  ON private.reddit_account_languages (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_subreddits_ingestion_idx
  ON private.reddit_account_subreddits (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_hour_profile_ingestion_idx
  ON private.reddit_account_hour_profile (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_monthly_activity_ingestion_idx
  ON private.reddit_account_monthly_activity (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_dormancy_gaps_ingestion_idx
  ON private.reddit_account_dormancy_gaps (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_sentiment_counts_ingestion_idx
  ON private.reddit_account_sentiment_counts (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_account_comment_samples_ingestion_idx
  ON private.reddit_account_comment_samples (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_reply_edges_ingestion_idx
  ON private.reddit_reply_edges (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_coordination_events_ingestion_idx
  ON private.reddit_coordination_events (ingestion_run_id);
CREATE INDEX IF NOT EXISTS reddit_coordination_members_ingestion_idx
  ON private.reddit_coordination_members (ingestion_run_id);
CREATE INDEX IF NOT EXISTS research_events_ingestion_idx
  ON private.research_events (ingestion_run_id);
CREATE INDEX IF NOT EXISTS research_eras_ingestion_idx
  ON private.research_eras (ingestion_run_id);

ALTER FUNCTION public.get_daily_narrative_json(date, date, text[])
  SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_daily_narrative_summary(date, date, text[])
  SET search_path = pg_catalog, public;
ALTER FUNCTION public.get_silence_map_data(date, date)
  SET search_path = pg_catalog, public;

REVOKE EXECUTE ON FUNCTION public.get_daily_narrative_json(date, date, text[])
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_daily_narrative_summary(date, date, text[])
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_silence_map_data(date, date)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_daily_narrative_json(date, date, text[])
  TO service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_narrative_summary(date, date, text[])
  TO service_role;
GRANT EXECUTE ON FUNCTION public.get_silence_map_data(date, date)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable()
  TO service_role;

ALTER VIEW public.daily_narrative_comparison
  SET (security_invoker = true);
