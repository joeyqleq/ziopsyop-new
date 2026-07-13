# Agent Skills & Tools Reference

## Available Skills in This Session

```
forensic-osint   — OSINT investigation methodology
sentiment-analysis — NLP sentiment classification  
dataviz          — Data visualization best practices
anomaly-detection — Statistical outlier detection
clustering-analysis — Pattern clustering
time-series-analysis — Temporal pattern analysis
correlation-analysis — Cross-variable correlation
statistical-hypothesis-testing — A/B testing, significance
```

Invoke via: `Skill({ skill: "forensic-osint" })` etc.

---

## Subagent Models Available

### Antigravity (agy/Gemini) — for heavy lifting
```bash
# Available models:
# - Gemini 3.5 Flash (High) — fast, cheap, bulk tasks
# - Gemini 3.5 Flash (Low) — very cheap, scaffolding  
# - Gemini 3.1 Pro (High) — strong reasoning
```

Use for:
- Bulk SQL query generation
- Large file reads/writes
- Repetitive scaffolding (building multiple similar components)
- Long analysis tasks that would exhaust Claude's context

### GitHub Copilot — for code generation
Use for TypeScript/React component scaffolding once spec is locked.

### Claude Opus (you) — orchestration, reasoning, design decisions
Keep Opus focused on: contradiction analysis, framing interpretation, visualization design choices, insight synthesis.

---

## Tavily Web Search (via SSH tunnel)

Lebanese IP is blocked from Tavily. Tunnel is auto-started at session begin via hook.

```bash
# Verify tunnel:
pgrep -fa "ssh.*1080"

# Search via Tavily:
curl -s --socks5-hostname 127.0.0.1:1080 \
  -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -d "{\"api_key\":\"$TAVILY_API_KEY\",\"query\":\"YOUR QUERY\",\"max_results\":5}"

# Restart tunnel if needed:
bash ~/.claude/scripts/tavily-tunnel.sh
```

Use Tavily to cross-reference:
- Verify casualty dates against OCHA/UN Lebanon reports
- Cross-check Channel 14 claims against other Israeli media
- Find academic papers on Israeli media framing during 2023–2024

---

## Supabase Direct Access

```bash
# Service role key (full access, in .env.local):
SUPABASE_SERVICE_ROLE_KEY=...

# Direct REST call:
curl -s "$SUPABASE_URL/rest/v1/media_events?select=*&limit=10" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY"

# For bulk queries use the RPC function (bypasses 1000-row limit):
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/get_daily_narrative_json" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -d '{"start_date":"2023-08-01","end_date":"2026-07-13"}'
```

---

## Pattern: Contradiction Detection

```python
# Approach: find days where both sources covered same event but with opposite framing
# Step 1: identify "contested days" — both sources active, high casualty divergence
# Step 2: fetch texts from both sources for that day
# Step 3: LLM comparison (Claude/Gemini) with structured output schema

schema = {
  "date": "YYYY-MM-DD",
  "event_type": "casualties|ceasefire|strike|political",
  "source_a_claim": "exact quote or paraphrase",
  "source_b_claim": "exact quote or paraphrase", 
  "contradiction_type": "numerical|framing|omission|inversion",
  "severity": 1-5,
  "notes": "explanation"
}
```

---

## Pattern: Deduplication View

```sql
-- Create deduplicated view (run once):
CREATE OR REPLACE VIEW media_events_unique AS
SELECT DISTINCT ON (source, text) *
FROM media_events
ORDER BY source, text, event_date;

-- Or use in queries:
SELECT source, COUNT(DISTINCT text) FROM media_events GROUP BY source;
```

---

## Existing Files to Read

Key source files:
- `src/app/media-war/MediaWarContent.tsx` — Part III page content
- `src/components/viz/MediaNarrativeTimeline.tsx` — Canvas chart component
- `src/app/api/media-events/route.ts` — API route (RPC-based, full range)
- `supabase/migrations/004_media_events.sql` — Schema
- `supabase/migrations/005_rpc_daily_narrative_summary.sql` — RPC v1
- `supabase/migrations/006_rpc_daily_narrative_json.sql` — RPC v2 (current, JSONB)
- `scripts/parse-telegram.mjs` — Telegram HTML parser (Node.js)
- `data/telegram-events.json` — 31,545 parsed events (source for DB)
