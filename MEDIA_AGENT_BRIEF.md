# ZIOPSYOP — Media Intelligence Agent Brief
**Date:** 2026-08-12  
**Written by:** Claude Code (main frontend agent)  
**For:** Codex / secondary AI agent tasked with data ingestion + Supabase enrichment

---

## 0. SHELL ACCESS

Use your **loopback connector** to get a shell on the user's compute at `/home/jq/Desktop/ziopsyop`. All file paths below assume that working directory. The `.env.local` file there contains all credentials you need.

---

## 1. PROJECT CONTEXT — WHAT ZIOPSYOP IS

**ziopsyop.me** is a forensic intelligence website exposing a Zionist information operation across three interconnected investigations:

- **Part I — THE MANUFACTURED FRIEND**: r/ForbiddenBromance subreddit analysis. 102,610 Reddit artifacts (Sep 2019–Jul 2026, 83 months, 7,806 users). Proves coordinated Israeli narrative management on a subreddit that presented itself as neutral Lebanese-Israeli dialogue. Key finding: 3:1 Israeli-to-Lebanese posting ratio, anomalous downvoting patterns against Lebanese users, documented 2026 narrative pivot.

- **Part II — THE MOST MORAL ARMY**: Battlefield ledger. 665 documented strikes. 15,000:1 cost asymmetry. IHL compliance analysis. Geolocated attack map. Amnesty-verified post-ceasefire destruction. IDF hardware losses (52 Merkava tanks confirmed).

- **Part III — THE MANUFACTURED REALITY** (your focus): Media comparison system. Three publication streams parsed message-by-message. The thesis: Channel 14 (right-wing Israeli broadcaster) intentionally lies to its own public to justify war, weapons sales, and suppression of Palestinian/Lebanese resistance — while the people suffering the consequences are systematically called terrorists for resisting arguably the most powerful military on earth.

**The overarching thesis of ziopsyop:** These three operations (manufactured friendship, manufactured moral license, manufactured reality) are not separate — they are one coordinated information apparatus designed to maintain Israeli public support for a forever-war that kills civilians, destroys villages, and violates international law, while making it socially acceptable to dismiss resistance as terrorism.

**The goal of your work:** Strengthen the evidence that Israeli media (specifically Channel 14 / Ynet / Times of Israel) intentionally frames events falsely to its domestic audience — creating a feedback loop that justifies military escalation, weapons procurement, and occupation.

---

## 2. CREDENTIALS

All in `/home/jq/Desktop/ziopsyop/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://elzmcmpinigpthnklhgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_dV5x0K4Mx0EVVr_J6eiBiw_Cy4s5paH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsem1jbXBpbmlncHRobmtsaGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE1MDk3OCwiZXhwIjoyMDk0NzI2OTc4fQ.54_EI7ISgL65CvP-WNULaJc0pcJjWQRPXTqcE07O-Gk
SUPABASE_DB_PASSWORD=fihyMmcFq2QgCma3
```

Use the **service role key** for all inserts/updates. PostgREST REST endpoint: `https://elzmcmpinigpthnklhgj.supabase.co/rest/v1/`

---

## 3. EXISTING SUPABASE SCHEMA — `media_events` TABLE

This is the primary table for Part III. Current shape:

```sql
id               uuid (primary key)
source           text  -- 'almanar' | 'almayadeen' | 'channel_14'
event_date       date
event_timestamp  timestamptz
text             text  -- raw message content
message_id       text  -- e.g. "channel_14_12942" (must be unique to avoid duplicates)
category         text  -- 'military_action' | 'civilian_casualties' | 'political_narrative' | 'propaganda' | 'uncategorized'
sentiment        text  -- nullable, e.g. 'negative' | 'positive' | 'neutral'
topics           text[] -- array of topic tags e.g. ['lebanon', 'israel', 'hezbollah']
is_contradiction boolean -- TRUE if this message contradicts a same-day message from another source
contradiction_pair_id  text -- nullable, links to the paired message
created_at       timestamptz
```

**Existing data coverage:**
- `almanar` (Al-Manar TV English): ~27,104 messages — data exists but needs updating to Aug 2026
- `almayadeen` (Al Mayadeen English): ~13,287 messages — same, needs updating
- `channel_14` (Channel 14 English): ~6,164 messages — same, needs updating

**Existing RPC functions you should know about:**
- `get_daily_narrative_json(start_date, end_date)` → daily counts per source
- `get_silence_map_data()` → silence map data

---

## 4. NEW TELEGRAM EXPORTS TO INGEST

Location: `/home/jq/Desktop/ziopsyop/new_media/`

**Sources and sizes:**
```
Al Jadeed Arabic        214MB   (NEW source — not in DB yet)
Al Jazeera Arabic       101MB   (NEW source — not in DB yet)
Al Jazeera English 1     19MB   (NEW source — not in DB yet)
Al Jazeera English 2     13MB   (NEW source — not in DB yet)
Al Manar TV English      41MB   (UPDATE — add messages since last export)
Al Mayadeen English      48MB   (UPDATE — add messages since last export)
Channel 14 Hebrew        54MB   (NEW — Hebrew version, need translation/analysis)
ChatExport_2026-08-16   158MB   (IDENTIFY first — appears to be Euronews Persian / يورونيوز)
Middle East Eye English  49MB   (NEW source — not in DB yet)
Times of Israel English  19MB   (NEW source — critical for Israeli domestic framing analysis)
Ynet Hebrew              70MB   (NEW source — critical Israeli Hebrew outlet, need analysis)
```

**Format:** Telegram HTML exports. Each folder has `messages.html`, `messages2.html`, ... up to `messages90+.html`. Standard Telegram export format. Each message has:
- Date/time (in `<div class="pull_right date details" title="DD.MM.YYYY HH:MM:SS UTC+02:00">`)
- Message text (in `<div class="text">`)
- Message ID (in the outer `<div class="message" id="message12345">`)
- Forwarded from info (in `<div class="forwarded body">` if applicable)

**Deduplication:** Use `message_id` as the unique key. Format it as `{source_slug}_{telegram_message_id}`. For updates to existing sources, only insert rows where `message_id` doesn't already exist.

---

## 5. YOUR PRIMARY TASK — DATA INGESTION

### 5a. Parse all new_media exports

Write a Python script (save to `/home/jq/Desktop/ziopsyop/scratch/ingest_new_media.py`) that:

1. Parses all HTML files in each source folder using BeautifulSoup
2. Extracts: message_id, timestamp, raw text, any forwarded-from info
3. Filters for **Lebanon-Israel conflict relevance** — use keyword matching first (lebanon, israel, hezbollah, idf, gaza, strikes, martyrs, civilians, resistance, occupation, ceasefire, etc.) — then use an LLM call if you have API access, or just flag everything and let categorization handle it
4. **Categorizes** each message into one of:
   - `military_action` — strikes, operations, casualties, hardware
   - `civilian_casualties` — deaths, injuries, displacement of civilians
   - `political_narrative` — diplomatic claims, justifications, accusations
   - `propaganda` — messages that make demonstrably false or misleading claims (see section 6)
   - `ceasefire_violation` — messages about ceasefire breaches
   - `uncategorized` — default fallback
5. **Sentiment tagging**: positive/negative/neutral from the source's perspective
6. **Source slug mapping**:
   ```
   Al Jadeed Arabic        → 'al_jadeed_ar'
   Al Jazeera Arabic       → 'al_jazeera_ar'
   Al Jazeera English 1    → 'al_jazeera_en'
   Al Jazeera English 2    → 'al_jazeera_en'  (same source, different export period — deduplicate by message_id)
   Al Manar TV English     → 'almanar'  (existing — UPDATE only)
   Al Mayadeen English     → 'almayadeen'  (existing — UPDATE only)
   Channel 14 Hebrew       → 'channel_14_he'  (Hebrew — needs translation layer or topic extraction)
   ChatExport_2026-08-16   → identify channel name from messages.html title first, then slug accordingly
   Middle East Eye English → 'middle_east_eye'
   Times of Israel English → 'times_of_israel'
   Ynet Hebrew             → 'ynet_he'
   ```
7. Upsert into `media_events` using `message_id` as the conflict key (ON CONFLICT DO NOTHING)

### 5b. Schema extension you need to add

Before inserting new sources, run this SQL migration via the Supabase REST API (POST to `/rest/v1/rpc/` or directly via psql with the DB password):

```sql
-- Add new source values if using a constraint, or just ensure the column is unconstrained text
-- Also add new columns for richer analysis:
ALTER TABLE media_events 
  ADD COLUMN IF NOT EXISTS source_language text DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS translated_text text,
  ADD COLUMN IF NOT EXISTS framing_label text,  -- 'terrorist_framing' | 'resistance_framing' | 'neutral' | 'dehumanizing'
  ADD COLUMN IF NOT EXISTS weapon_mention boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS civilian_context boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS contains_false_claim boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS false_claim_notes text;
```

---

## 6. YOUR SECONDARY TASK — OSINT ANALYSIS FOR NEW VISUALIZATIONS

This is the intelligence work. You need to analyze the corpus and produce findings that can become data visualizations. The goal is to **prove with data** that Israeli media intentionally misleads its domestic audience.

### 6a. The Propaganda Taxonomy

When parsing Channel 14 (Hebrew + English), Times of Israel, and Ynet, look for and flag:

1. **Dehumanizing language** — terms like "human animals", "terrorists" applied to civilians, describing Hezbollah fighters as non-combatants when IHL recognizes them as combatants, etc.
2. **Casualty reversal** — Israeli outlets reporting IDF casualties only or minimizing Lebanese civilian casualties. Cross-reference with Al-Manar/Al Mayadeen same-day reports. The gap IS the evidence.
3. **Strike justification without casualty acknowledgment** — "surgical strike on Hezbollah infrastructure" with no mention of civilians killed. Al-Manar same day reports civilian deaths.
4. **Weapons framing** — how often Israeli outlets mention "Iron Dome", "precision munitions", "self-defense" vs. how often Lebanese outlets report the same events as massacres.
5. **Omission of post-ceasefire violations** — ceasefire was announced but IDF continued operations. Did Channel 14 report these violations? Track silence.

### 6b. New Data Tables to Create

Create these new tables in Supabase:

```sql
-- Narrative gap: same event, different framing from two sources
CREATE TABLE IF NOT EXISTS narrative_gaps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date date NOT NULL,
  event_description text,
  source_a text NOT NULL,  -- e.g. 'channel_14'
  source_a_framing text,   -- what channel 14 said
  source_a_message_id text REFERENCES media_events(message_id),
  source_b text NOT NULL,  -- e.g. 'almanar'
  source_b_framing text,   -- what al-manar said
  source_b_message_id text REFERENCES media_events(message_id),
  gap_type text,  -- 'casualty_reversal' | 'omission' | 'dehumanization' | 'justification_without_context'
  severity integer CHECK (severity BETWEEN 1 AND 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Keyword frequency over time per source (for "terror density" style analysis)
CREATE TABLE IF NOT EXISTS keyword_frequency (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  event_date date NOT NULL,
  keyword text NOT NULL,
  count integer NOT NULL,
  per_thousand_messages numeric,  -- normalized rate
  created_at timestamptz DEFAULT now(),
  UNIQUE(source, event_date, keyword)
);

-- Source silence log: days when a source published zero messages about a documented event
CREATE TABLE IF NOT EXISTS source_silence (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  silence_date date NOT NULL,
  verified_event text,  -- what actually happened that day (from other sources)
  event_severity text,  -- 'mass_casualty' | 'strike' | 'political'
  other_sources_covered text[],  -- which sources DID cover it
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source, silence_date, verified_event)
);
```

### 6c. Specific Analyses to Run and Persist

**Analysis 1 — Terror Density by Source**
Count occurrences of: `terror*`, `terrorist`, `terrorism`, `Hamas`, `Hezbollah` (as pejorative), `human animals`, `savages` per 1000 messages, per source, per month. Store in `keyword_frequency`. This will show Channel 14 / Times of Israel running 10-50x higher "terror framing" than resistance-aligned outlets for the same events.

**Analysis 2 — Casualty Reporting Gap**
For every day where Al-Manar or Al Mayadeen reported civilian casualties (Lebanese/Palestinian), check if Channel 14 / Times of Israel reported the same event. Record the gap in `narrative_gaps`. Expected finding: Israeli outlets systematically omit or minimize Lebanese civilian casualties while amplifying Israeli casualties and IDF "successes".

**Analysis 3 — Weapons Procurement Language**
Track mentions of: `Iron Dome`, `THAAD`, `F-35`, `Arrow`, `David's Sling`, `US aid`, `military assistance` in Israeli outlets. These often spike BEFORE or AFTER major escalations — suggesting domestic media is used to build public appetite for weapons spending.

**Analysis 4 — The "Human Shields" Deflection**
Count `human shields` mentions in Israeli outlets per month. Cross-reference with Amnesty/UNIFIL documented civilian strikes. The claim goes up every time a large civilian death toll is reported — it's a predictable deflection mechanism.

**Analysis 5 — The Ceasefire Violation Blackout**
The November 2024 ceasefire was followed by documented IDF violations (extended deadlines, continued positions, post-ceasefire strikes). Track how Channel 14 / Times of Israel / Ynet covered these vs. how Al-Manar / Middle East Eye / Al Jazeera covered them. Store confirmed violations in `narrative_gaps` with `gap_type='omission'`.

**Analysis 6 — Cross-Language Divergence (Hebrew vs English)**
Channel 14 Hebrew vs Channel 14 English is particularly important. Israeli domestic (Hebrew) messaging is often more extreme than international-facing English messaging. If you can do translation (use a model or Google Translate API), compare the framing. Store divergence cases in `narrative_gaps`.

---

## 7. NEW VISUALIZATION IDEAS FOR CLAUDE CODE (FRONTEND)

After you complete your analysis, the following visualizations should be built by the frontend agent (Claude Code). Document your findings so these can be built:

1. **Propaganda Heatmap** — Calendar heatmap (like GitHub activity grid) showing days colored by "propaganda intensity" per source. Red = high terror framing / dehumanization. Cross-source comparison side by side.

2. **Casualty Reporting Gap Chart** — Dual-axis time series: Lebanese civilian casualties reported (from Al-Manar/Al Jazeera) vs. mentions in Israeli outlets. The gap = the silence. Visually powerful.

3. **Weapons Language Spike Detector** — Annotated timeline showing spikes in weapons-procurement language in Israeli media, annotated with "request for US aid" events and subsequent escalations.

4. **Human Shields Deflection Counter** — Each time "human shields" is mentioned in an Israeli outlet within 72h of a mass-casualty event, it gets flagged. Accumulated count displayed as a counter widget.

5. **Cross-Language Framing Divergence** — If Hebrew/English divergence exists, show a side-by-side comparison of how the same event was described to domestic vs international audiences.

6. **Narrative Race** — Animated timeline showing which source reported a major event first, and how framing evolved across sources in the 48h after. Proves pre-formed narratives, not news.

7. **Source Coverage Matrix** — Grid: rows = major events (strikes, casualties, political), columns = sources. Cell = covered / not covered / covered differently. Empty cells = deliberate omission.

---

## 8. HANDOFF DOCUMENT INSTRUCTIONS

When you finish your work, create a file at:
`/home/jq/Desktop/ziopsyop/MEDIA_AGENT_HANDOFF.md`

It must contain:
- List of all scripts written and what they do
- All new Supabase tables created (with row counts)
- All new data ingested (rows per source, date range covered)
- Summary of key findings (top 5 most damning evidence points)
- For each proposed visualization: the exact Supabase table + query/RPC needed, the data shape the frontend component should expect, and suggested chart type
- Any SQL RPCs you created that the frontend needs to call
- Any blockers or data quality issues found

---

## 9. TECHNICAL NOTES

- **Python environment**: Python 3 available. Install `beautifulsoup4`, `requests`, `python-dotenv` if needed via pip
- **Deduplication**: Always check `message_id` before inserting. `ON CONFLICT (message_id) DO NOTHING` in SQL
- **Batch inserts**: Insert in batches of 500 rows to avoid PostgREST timeouts
- **Hebrew/Arabic content**: If you can't translate, at minimum extract: dates, numbers, named entities (IDF, Hezbollah, Lebanon, Gaza, casualties), URLs. These alone are analytically useful
- **The `ChatExport_2026-08-16` folder**: First identify the channel from `messages.html` title (it appears to be Euronews Persian / يورونيوز). Determine relevance and slug accordingly
- **Existing parser reference**: There's a previous Telegram parser mentioned in commit history. You can check git log or look for Python scripts in project root

---

## 10. WHAT NOT TO DO

- Do NOT touch any frontend `.tsx` or `.ts` files — leave all frontend work to Claude Code
- Do NOT modify `src/` directory at all
- Do NOT push to GitHub — leave that to Claude Code
- Do NOT delete existing `media_events` rows — only add new ones
- Do NOT ingest content unrelated to Lebanon-Israel conflict (filter aggressively)

---

## THE BIG PICTURE

The user wants this project to be the most rigorous, data-driven, forensically credible exposure of Israeli information warfare on the internet. Every visualization should be traceable to primary sources. Every claim should be falsifiable. The goal is not propaganda in the other direction — it's methodologically honest documentation of a documented information operation, using the perpetrators' own published messages as evidence.

The people of Lebanon and Palestine live with the consequences of this propaganda machine — occupation, displacement, collective punishment — while being called terrorists for resisting. This data is their counter-record.

Make it airtight.
