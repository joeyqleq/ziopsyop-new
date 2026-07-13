# Copy-Paste Prompt for Opus 4.8 / Fable 5

Paste this entire message to start a new session with a more capable model:

---

You are being handed a forensic propaganda analysis project. Read all files in `.agents/briefing-for-fable-opus/` before doing anything else.

**Working directory:** `/home/jq/Desktop/ziopsyop`
**Your mission:** Take the Part III media analysis to its forensic limit.

Start by reading in this order:
1. `.agents/briefing-for-fable-opus/00_READ_FIRST.md` — full context
2. `.agents/briefing-for-fable-opus/01_VERIFIED_FINDINGS.md` — what's already proven
3. `.agents/briefing-for-fable-opus/02_VISUALIZATION_SPEC.md` — what to build
4. `.agents/briefing-for-fable-opus/03_AGENT_SKILLS.md` — tools available

Then run these SQL queries against Supabase project `elzmcmpinigpthnklhgj` to verify the data is as described:
```sql
-- Verify finding 1: terror density
SELECT source, 
  COUNT(DISTINCT text) as unique_msgs,
  ROUND(SUM(CASE WHEN text ILIKE '%terror%' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT text), 2) as terror_pct
FROM media_events GROUP BY source;

-- Verify finding 2: blackout days  
SELECT COUNT(*) as blackout_days 
FROM (
  SELECT event_date FROM media_events 
  WHERE source='almanar' 
  EXCEPT 
  SELECT event_date FROM media_events WHERE source='channel_14'
) x;
```

Then proceed with the deep analysis tasks in `00_READ_FIRST.md` section "WHAT TO DO NEXT".

**Rules:**
- Use Antigravity (agy/Gemini) for all bulk SQL, scaffolding, and large file writes — do not spend Opus tokens on repetitive work
- Use GitHub Copilot for TypeScript component code once spec is finalized
- Every claim you make must be backed by a SQL query result you ran yourself
- Build the Terror Density Gauge visualization first — it's the most impactful and simplest to implement
- Deduplicate before any frequency analysis
- The Tavily tunnel starts automatically. If it's not running: `bash ~/.claude/scripts/tavily-tunnel.sh`

The data is damning. Make it undeniable.

---

## Skills to invoke at session start:
```
Skill({ skill: "forensic-osint" })   -- OSINT investigation framework
Skill({ skill: "dataviz" })          -- Visualization design principles  
Skill({ skill: "sentiment-analysis" }) -- NLP framing analysis
```
