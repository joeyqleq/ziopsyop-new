export interface ViolationEvent {
  event_id: string;
  ceasefire_phase: "pre_ceasefire_2024" | "active_conflict_oct24" | "ceasefire_nov24" | "violation_period_2025" | "active_conflict_2026";
  date: string;
  time_utc?: string;
  attacker: "IDF" | "Hezbollah" | "IRGC" | "LAF" | "SLA_remnant" | "Unknown";
  attack_type: string;
  target_category: string;
  location: {
    name: string;
    district: string;
    governorate: string;
    country: "Lebanon" | "Israel" | "Border";
    lat: number;
    lon: number;
    accuracy: "exact" | "estimated" | "district_level";
  };
  casualties: {
    killed_total: number;
    wounded_total: number;
    breakdown: {
      lebanese_civilians: number;
      lebanese_military: number;
      hezbollah_fighters: number;
      unifil: number;
      journalists: number;
      medical_workers: number;
      idf_soldiers: number;
      israeli_civilians: number;
    };
  };
  destruction: {
    buildings_destroyed: number;
    vehicles: number;
    estimated_cost_usd: number;
    cultural_heritage_damaged: boolean;
  };
  double_tap: boolean;
  verified_by_unifil: boolean;
  unifil_report_reference?: string;
  ihl_classification: "likely_compliant" | "contested" | "likely_violation" | "confirmed_violation";
  dahiyeh_doctrine_pattern: boolean;
  source_urls: string[];
  media_covered_by: {
    lebanese_arabic: boolean;
    lebanese_english: boolean;
    lebanese_french: boolean;
    israeli_hebrew: boolean;
    israeli_english: boolean;
    unifil: boolean;
    international: boolean;
  };
  reddit_discussion_ids: string[];
  notes?: string;
}

export interface MediaCoverage {
  event_id: string;
  event_date: string;
  event_type: string;
  attacker: string;
  target_type: string;
  location: { name: string; lat: number; lon: number; district: string };
  casualties: { killed: number; wounded: number; type: string };
  media_coverage: {
    lebanese_arabic: { covered: boolean; outlets: string[]; framing: string; url: string };
    lebanese_english: { covered: boolean; outlets: string[]; framing: string; url: string };
    lebanese_french: { covered: boolean; outlets: string[]; framing: string; url: string };
    israeli_hebrew: { covered: boolean; outlets: string[]; framing: string; url: string };
    israeli_english: { covered: boolean; outlets: string[]; framing: string; url: string };
    international: { covered: boolean; outlets: string[]; url: string };
  };
  forbidden_bromance_posts: string[];
  narrative_delta: {
    lebanese_vs_israeli_framing: string;
    hebrew_vs_english_framing: string;
    reddit_dominant_frame: string;
  };
  unifil_report_id?: string;
  source_urls: string[];
}

export interface RedditUser {
  username: string;
  user_id?: string;
  flair_declared: "Lebanese" | "Israeli" | "None" | "Other";
  flair_color?: string;
  account_created_utc?: number;
  account_age_days?: number;
  exclude: boolean;
  post_count_total: number;
  comment_count_total: number;
  activity_timeline: Array<{
    month: string;
    posts: number;
    comments: number;
    avg_score: number;
    avg_upvote_ratio: number;
  }>;
  sentiment_timeline: Array<{
    month: string;
    sentiment_score: number;
    dominant_frame: string;
  }>;
  hasbara_buzzword_count: number;
  hasbara_buzzword_rate: number;
  terrorism_label_count: number;
  antisemitism_accusation_count: number;
  lebanese_cultural_ref_count: number;
  phoenician_framing_count: number;
  shia_negative_framing_count: number;
  christian_positive_framing_count: number;
  coordinated_posting_clusters: number;
  brigading_co_occurrences: string[];
  identity_contradiction_score: number;
  identity_contradiction_probability: string;
  most_used_phrases: string[];
  sentiment_shift_events: Array<{
    date: string;
    from_score: number;
    to_score: number;
    trigger?: string;
  }>;
  cross_subreddit_activity: string[];
}

export interface SankeyNode {
  name: string;
  category: "attacker" | "target";
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  casualties?: number;
}

export interface SwimLaneEvent {
  id: string;
  date: string;
  lane: "idf" | "hezbollah" | "unifil" | "civilian_casualties" | "political" | "media_divergence" | "reddit_spike";
  label: string;
  description: string;
  severity: number;
  source_urls: string[];
  color: string;
}
