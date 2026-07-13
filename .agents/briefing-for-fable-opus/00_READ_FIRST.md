# ZIOPSYOP — Briefing for Advanced Analysis (Opus 4.8 / Fable 5)

**Purpose of this folder:** You are an advanced reasoning model being handed a forensic propaganda analysis project mid-stream. A previous agent (Claude Sonnet 4.6) built the data infrastructure and initial visualizations. You are being asked to take the analysis deeper — to find what it could not.

**Working directory:** `/home/jq/Desktop/ziopsyop`
**Supabase project:** `elzmcmpinigpthnklhgj`
**Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion, Canvas 2D, Supabase PostgreSQL, Vercel

---

## What This Project Is

ZIOPSYOP is a forensic intelligence website that exposes coordinated information warfare during the 2023–2026 Israel-Lebanon conflict. It has three parts:

**Part I** — Reddit coordination evidence: r/ForbiddenBromance was a coordinated influence operation targeting r/lebanon (102,610 artifacts, 7,806 users tracked, 83 months of data)

**Part II** — Battlefield reality vs. narrative claims (casualty data, timeline analysis)

**Part III** — THE MEDIA BATTLEFIELD: Forensic comparison of three Telegram channels:
- **Al-Manar** (Hezbollah-affiliated Lebanese media) — 27,104 messages, Aug 2023–Jul 2026
- **Al-Mayadeen** (pan-Arab resistance-aligned) — 13,287 messages, Dec 2023–Jul 2026
- **Channel 14** (Israeli far-right state media, #1 rated TV in Israel) — 6,164 messages, Aug 2023–Jul 2026

**The core thesis:** Channel 14 is the Israeli government's primary propaganda instrument turned inward on Israeli citizens. This dataset proves it.

---

## CRITICAL DATA QUALITY ISSUES TO FIX FIRST

Before any analysis, address these:

1. **35% duplicates** — All three sources have ~35% exact duplicate messages (Telegram forwards/reposts). DEDUPLICATE before any frequency or volume analysis. Use `DISTINCT text` or `COUNT(DISTINCT text)`.
   - Al-Manar: 27,104 total → 17,443 unique
   - Al-Mayadeen: 13,287 total → 9,063 unique
   - Channel 14: 6,164 total → 3,981 unique

2. **47% uncategorized** — The auto-categorization script left massive uncategorized piles:
   - Al-Manar: 36.6% uncategorized
   - Channel 14: **44.9%** uncategorized
   These need reclassification or at minimum topic extraction.

3. **Zero contradictions flagged** — The `is_contradiction` column exists but has never been populated. This is the core forensic task.

---

## WHAT THE DATA ALREADY REVEALS (verified by SQL)

### Loaded Language Forensics (% of unique messages, deduplicated)
| Term | Al-Manar (n=17,443) | Al-Mayadeen (n=9,063) | Channel 14 (n=3,981) | Ratio CH14/Manar |
|------|---------------------|----------------------|----------------------|-----------------|
| "terror/terrorist" | 0.32% | 2.32% | **18.01%** | **56x** |
| "resistance" | 21.74% | 25.46% | 0.28% | 78x inverse |
| "martyr/martyrs" | 6.96% | 13.26% | 0.15% | 46x inverse |
| "proxy/proxies" | 0.01% | 0.21% | **1.28%** | **128x** |
| (aggression, zionist, occupation — run SQL for exact deduped figures) | | | | |

**Interpretation:** Channel 14 uses "terror" in 1 out of every 5.5 unique messages. This is not reporting — it's sustained psychological conditioning.

### Silence/Blackout Events
- 124 days where Al-Manar published but Channel 14 published **nothing** (11.6% of all active days)
- Sep 24 2024: Al-Manar reported **569 martyrs including 50 children and 94 women**. Channel 14: **0 casualty reports that day**
- Jan 26 2025: Al-Manar = 20 casualty events. Channel 14 = 0 casualty events (4 total posts, none on casualties)
- Mar 22 2025, Mar 9 2025: same pattern — 6–8 casualty reports from Al-Manar, Channel 14 silent

### Eschatological/Religious Framing (Channel 14 pinned content)
Top repeat messages include:
- "G-d is closing this chapter of human history. The 3rd World War is being launched by demonic forces against forces of light. You are either with Israel, or you are with the forces of darkness." (repeated 6 times)
- "Oct 28th, 2028 was set to be the target date for the downfall of the Ayatollah's regime in Iran" (6 times)
- Jewish theological post about "chosen people" (7 times — most repeated message in entire dataset)

**Interpretation:** Channel 14's Telegram is not a news channel. It's a religious-nationalist mobilization platform.

---

## WHAT THE PREVIOUS AGENT COULD NOT DO

These require your deeper reasoning capabilities:

### 1. Contradiction Detection Algorithm
Find days where:
- Both sources covered the same event type (identified by overlapping topics/keywords)
- But reported opposite outcomes, casualty counts, or framing

Approach:
```sql
-- Find days with high cross-source topic overlap but divergent category mix
SELECT event_date,
  SUM(CASE WHEN source='almanar' AND category='casualties' THEN 1 ELSE 0 END) as manar_casualties,
  SUM(CASE WHEN source='channel_14' AND category='casualties' THEN 1 ELSE 0 END) as ch14_casualties,
  SUM(CASE WHEN source='almanar' AND category='military_action' THEN 1 ELSE 0 END) as manar_military,
  SUM(CASE WHEN source='channel_14' AND category='military_action' THEN 1 ELSE 0 END) as ch14_military
FROM media_events
GROUP BY event_date
HAVING manar_casualties > 3 AND ch14_casualties = 0  -- casualty blackout
```
Then fetch actual texts for those days and use LLM reasoning to identify specific claim contradictions.

### 2. Narrative Arc Analysis
Map how each source's dominant frame CHANGED over time:
- Pre-Oct 7 2023: What was each channel covering?
- Oct 7 – Oct 31 2023: Initial framing of the Hamas attack
- Nov 2023 – Sep 2024: Escalation phase
- Sep–Nov 2024: Ground invasion / mass casualty phase
- Nov 2024 – Jan 2025: Ceasefire negotiation framing
- Jan 2025 – Jul 2026: Post-ceasefire occupation framing

For each phase: what loaded language dominated? What was suppressed? What contradictions emerged?

### 3. Amplification Cascade Detection
Telegram duplication pattern: same message appearing on multiple dates = being broadcast again.
- "resistance" + repeat = rallying cry
- "terror" + repeat = fear reinforcement
- Measure: for each unique message, track `MAX(event_date) - MIN(event_date)` gap. High gap = deliberate re-amplification.

### 4. Silence as Evidence
Channel 14 was silent for 124+ days when Al-Manar was active. These aren't slow news days — they're days of heavy Lebanese casualties. Compile the complete "blackout list" and match against historical casualty records (OCHA, WHO Lebanon reports).

### 5. Semantic Framing Shift Detection
Track week-by-week occurrence of these terms normalized per unique message:
- "ceasefire" (who uses it more? when does it spike?)
- "civilian" (does CH14 use it for Israeli civilians only?)
- "children/kids" (each source)
- "genocide" (virtually absent from all three? or?)
- "hostage" (CH14 exclusive?)

### 6. The "Proxy" Narrative Forensics
Channel 14 uses "proxy/proxies" at **181x** the rate of Al-Manar. This is the most asymmetric term in the entire dataset. Deep dive: who is being called a proxy, in what context, and does it correlate with escalation events?

### 7. Cross-Source Claim Registry
Build a structured claim registry: for each major event (Beirut bombing campaigns, ceasefire announcements, casualty milestones), extract what each source said within 24–48 hours. Use LLM to compare framing and flag contradictions.

---

## SUPABASE SCHEMA

```sql
-- Main table
media_events (
  id UUID PRIMARY KEY,
  source TEXT CHECK (source IN ('almanar', 'almayadeen', 'channel_14')),
  event_date DATE,
  event_timestamp TIMESTAMPTZ,
  text TEXT,
  message_id TEXT,
  category TEXT,  -- military_action | casualties | political | media_narrative | escalation | ceasefire | uncategorized
  sentiment REAL,
  topics TEXT[],
  is_contradiction BOOLEAN DEFAULT FALSE,
  contradiction_pair_id UUID REFERENCES media_events(id),
  created_at TIMESTAMPTZ
)

-- Pre-aggregated view (bypasses PostgREST 1000-row limit via RPC)
daily_narrative_comparison  -- event_date, source, message_count

-- RPC functions
get_daily_narrative_json(start_date, end_date, sources[])  -- returns full range as JSONB blob
```

### API Access
```bash
SUPABASE_URL=https://elzmcmpinigpthnklhgj.supabase.co
# Keys in .env.local
# Use service role key for unrestricted access
# PostgREST max_rows=1000 — always use the RPC functions for aggregate queries
```

---

## VISUALIZATION ARCHITECTURE

Current Part III page (`/media-war`):
- `MediaNarrativeTimeline` — canvas stacked bar chart, full 3-year range, click for day briefing
- `MediaWarContent` — container with thesis card, claims, stats row
- Stats row hardcodes: 17,451 / 9,079 / 5,015 (WRONG — deduplicate first, real counts: ~17k / ~9k / ~4k)

New visualizations to build (suggestions, you decide what's most impactful):
1. **Lexical Divergence Heatmap** — matrix: [term] × [source] × [month], colored by normalized frequency
2. **Silence Map** — calendar heatmap showing Channel 14 coverage gaps vs Al-Manar activity
3. **Framing Arc** — line chart of loaded term frequency over time per source (who shifts when?)
4. **Contradiction Registry** — interactive table of specific claim pairs (side-by-side quotes with dates)
5. **Amplification Cascade** — timeline of broadcast repetition events

---

## TECHNICAL CONSTRAINTS

- Canvas 2D preferred over SVG for performance (existing components use this pattern)
- Framer Motion for entry animations
- Tailwind CSS with custom CSS variables: `--threat` (#ff4d5e), `--archive` (#b6ff7c), `--purple` (#7b39d0)
- No D3 (not currently used)
- Next.js App Router, all data fetching in API routes (not client-side Supabase calls)
- TypeScript strict mode
- Colors: Al-Manar = `#b6ff7c`, Al-Mayadeen = `#7b39d0`, Channel 14 = `#ff4d5e`

---

## TOOLS AVAILABLE

- `mcp__plugin_supabase_supabase__execute_sql` — direct DB queries
- `mcp__plugin_chrome-devtools-mcp_chrome-devtools__*` — browser testing
- Antigravity (agy/Gemini): use for bulk SQL analysis, repetitive scaffolding, large reads
- GitHub Copilot: secondary subagent for code generation
- Tavily search: route through SOCKS5 tunnel on localhost:1080 (Lebanese IP blocked)
  - `curl --socks5-hostname 127.0.0.1:1080 -X POST https://api.tavily.com/search ...`
  - TAVILY_API_KEY in ~/.zshrc

---

## THE GOAL

Every naive visitor to ziopsyop.com should finish Part III understanding, in plain terms:
1. Channel 14 calls everything "terror" — 1 in 5 messages. This is psychological manipulation.
2. On days when Lebanon had hundreds of casualties, Channel 14 published nothing.
3. Channel 14 rebroadcasts religious-nationalist content framing the war as cosmic good vs. evil.
4. The numbers are not opinions. They are in the database. Every claim is verifiable.

**The forensic standard:** Every visualization must be reproducible from the SQL. No assertions without citations. The data speaks — your job is to make it impossible to misunderstand.

---

## WHAT TO DO NEXT

1. Deduplicate the dataset (add a `is_duplicate` flag or create a deduplicated view)
2. Run the silence detection SQL and build the "Channel 14 blackout list"
3. Run the loaded language analysis per phase (Oct 2023, Nov–Sep 2024, Sep–Nov 2024, post-ceasefire)
4. Identify top 20 contradiction pairs (same event, opposite framing)
5. Build 2–3 new visualizations from the list above — prioritize the Silence Map and Lexical Divergence Heatmap as they're most immediately comprehensible to a naive viewer
6. Update the MediaWarContent stats to use deduplicated counts
7. Write a "FINDINGS" section on the media-war page with the 5 most damning verifiable facts from the data

Good luck. The data is damning. Your job is to make it undeniable.
