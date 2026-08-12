export type DatasetSnapshot = {
  table: string;
  rows: number;
  layer: "PRIMARY INDEX" | "STRUCTURED RECORD" | "DERIVED" | "AGGREGATE";
  grain: string;
  coverage: string;
  provenance: string;
};

/**
 * Published inventory snapshot, verified read-only against Supabase on 2026-08-12.
 * These are provenance/display facts, not a second authoritative dataset.
 */
export const DATASET_SNAPSHOT_VERIFIED_AT = "12 AUG 2026 · 18:30 UTC";

export const DATASET_SNAPSHOT: DatasetSnapshot[] = [
  { table: "media_events", rows: 46_555, layer: "PRIMARY INDEX", grain: "one publisher item", coverage: "04 Aug 2023—13 Jul 2026", provenance: "Al-Manar · Al Mayadeen · Channel 14" },
  { table: "hezbollah_strikes", rows: 100, layer: "STRUCTURED RECORD", grain: "one strike record", coverage: "12 Nov 2024—18 Jun 2025", provenance: "release record + event cross-check" },
  { table: "hezbollah_strike_categories", rows: 19, layer: "AGGREGATE", grain: "target-class summary", coverage: "campaign periods", provenance: "derived from structured strike records" },
  { table: "idf_kia", rows: 49, layer: "STRUCTURED RECORD", grain: "one named fatality", coverage: "01 Nov 2024—17 Jun 2025", provenance: "official notices + reporting" },
  { table: "idf_kia_meta", rows: 2, layer: "DERIVED", grain: "campaign estimate band", coverage: "campaign periods", provenance: "official count vs estimate contract" },
  { table: "lebanese_civilian_casualties", rows: 19, layer: "STRUCTURED RECORD", grain: "one incident or aggregate", coverage: "01 Nov 2024—15 Jun 2025", provenance: "public incident and health records" },
  { table: "lebanese_casualties_meta", rows: 3, layer: "AGGREGATE", grain: "campaign summary", coverage: "campaign periods", provenance: "public health and incident records" },
  { table: "idf_hardware_losses", rows: 26, layer: "STRUCTURED RECORD", grain: "one equipment-loss class", coverage: "campaign periods", provenance: "public reporting + release transcripts" },
  { table: "cost_to_israel_summary", rows: 3, layer: "DERIVED", grain: "campaign cost estimate", coverage: "campaign periods", provenance: "declared assumptions + unit-cost references" },
  { table: "infrastructure_destruction", rows: 15, layer: "STRUCTURED RECORD", grain: "one site or destruction class", coverage: "campaign periods", provenance: "humanitarian + geospatial reporting" },
  { table: "infrastructure_destruction_meta", rows: 2, layer: "AGGREGATE", grain: "campaign summary", coverage: "campaign periods", provenance: "structured destruction records" },
  { table: "targeting_disparity_comparison", rows: 4, layer: "DERIVED", grain: "actor-period comparison", coverage: "campaign periods", provenance: "declared comparison rules" },
  { table: "timeline_events", rows: 24, layer: "STRUCTURED RECORD", grain: "one dated event", coverage: "01 Oct 2024—18 Jun 2025", provenance: "cross-record timeline" },
  { table: "reddit_user_sentiment", rows: 50, layer: "DERIVED", grain: "user-period measure", coverage: "research windows", provenance: "Arctic Shift public archive" },
  { table: "reddit_subreddit_metrics", rows: 79, layer: "AGGREGATE", grain: "subreddit-period measure", coverage: "research windows", provenance: "Arctic Shift public archive" },
  { table: "media_coverage_gaps", rows: 13, layer: "DERIVED", grain: "incident-outlet comparison", coverage: "04 Aug 2020—05 Mar 2026", provenance: "13/13 rows carry source title + URL" },
  { table: "idf_commander_quotes", rows: 13, layer: "PRIMARY INDEX", grain: "one attributed statement", coverage: "01 Mar—18 Jun 2025", provenance: "named outlet attribution" },
  { table: "hezbollah_weapon_systems", rows: 19, layer: "STRUCTURED RECORD", grain: "one weapon-system profile", coverage: "2019—01 Feb 2025", provenance: "public releases + technical reporting" },
  { table: "reddit_overview", rows: 1, layer: "AGGREGATE", grain: "corpus summary", coverage: "Sep 2019—Jun 2026", provenance: "Arctic Shift public archive" },
];

export const UPDATE_PIPELINE = [
  ["01", "CAPTURE", "Store the original URL, publisher ID, retrieval time and an immutable content hash."],
  ["02", "NORMALIZE", "Resolve actor, date, location and observation grain without rewriting the source claim as fact."],
  ["03", "DE-DUPLICATE", "Match canonical IDs, mirrored clips, text hashes and event windows before inserting a new record."],
  ["04", "GRADE", "Separate primary claim, external corroboration, model inference and unresolved allegation."],
  ["05", "PUBLISH", "Validate required provenance fields, upsert Supabase, regenerate views, then verify the live exhibit."],
] as const;

export const RESEARCH_GATES = [
  {
    status: "QUEUED",
    title: "Three missing comparison streams",
    detail: "Times of Israel, Al Jazeera English and BBC/BBC Verify remain named benchmarks, not loaded observations. Their ingestion must preserve publisher IDs and day-level missingness.",
  },
  {
    status: "DESIGNED",
    title: "Israeli market event study",
    detail: "A falsifiable TA-35 and sector study can test abnormal returns around declared military events with controls, placebo dates and multiple-testing correction. No market-causation claim is published yet.",
  },
  {
    status: "GATED",
    title: "Water, offshore resources and territorial intent",
    detail: "Resource scarcity and South Lebanon geography are context. They become evidence of motive only if a dated primary record links policy or operations to capture; proximity alone is not that bridge.",
  },
  {
    status: "GATED",
    title: "Epstein–Barak document network",
    detail: "Direct association and communications are document-retrieval leads. No verified primary record currently connects that relationship to Lebanon policy, military planning or the present war, so it is excluded from causal exhibits.",
  },
] as const;
