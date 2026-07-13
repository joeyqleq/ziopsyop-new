---
name: contradiction-detector
description: Find days where Al-Manar/Al-Mayadeen and Channel 14 reported the same event with opposite claims. Fetch contested-day SQL, retrieve sample texts, classify contradiction type and severity using structured output.
metadata:
  type: skill
  domain: forensic-analysis
  project: ziopsyop
---

# Contradiction Detector

## Purpose
Identify specific claim pairs where two sources covered the same event but reported opposite outcomes, casualty counts, or framing. Output a structured contradiction registry.

## Step 1: Find Contested Days

```sql
-- Days with high casualty divergence
SELECT event_date,
  SUM(CASE WHEN source='almanar' AND category='casualties' THEN 1 ELSE 0 END) as manar_cas,
  SUM(CASE WHEN source='channel_14' AND category='casualties' THEN 1 ELSE 0 END) as ch14_cas,
  SUM(CASE WHEN source='almanar' THEN 1 ELSE 0 END) as manar_total,
  SUM(CASE WHEN source='channel_14' THEN 1 ELSE 0 END) as ch14_total
FROM media_events
GROUP BY event_date
HAVING SUM(CASE WHEN source='almanar' THEN 1 ELSE 0 END) > 5
   AND SUM(CASE WHEN source='channel_14' THEN 1 ELSE 0 END) > 0
ORDER BY (SUM(CASE WHEN source='almanar' AND category='casualties' THEN 1 ELSE 0 END) - 
          SUM(CASE WHEN source='channel_14' AND category='casualties' THEN 1 ELSE 0 END)) DESC
LIMIT 30;
```

## Step 2: Fetch Texts for Each Contested Day

```sql
SELECT source, category, text, event_timestamp
FROM media_events
WHERE event_date = '{target_date}'
  AND source IN ('almanar', 'channel_14')
  AND category IN ('casualties', 'military_action', 'ceasefire')
ORDER BY source, event_timestamp;
```

## Step 3: LLM Classification (structured output)

For each day pair, classify using this schema:
```json
{
  "date": "YYYY-MM-DD",
  "event_description": "what actually happened",
  "almanar_claim": "paraphrase + key quote",
  "ch14_claim": "paraphrase + key quote OR 'SILENT'",
  "contradiction_type": "numerical_dispute | framing_inversion | omission | fabrication",
  "severity": 1-5,
  "verdict": "CONFIRMED_CONTRADICTION | FRAMING_DIVERGENCE | OMISSION | CONSISTENT"
}
```

## Output Format

Markdown table for MediaWarContent.tsx:
| Date | Event | Al-Manar | Channel 14 | Type | Severity |
|------|-------|----------|------------|------|----------|

## Notes
- Omission (Channel 14 silent on casualty day) counts as contradiction type = "omission", severity = 4–5
- Numerical disputes (different death toll) = "numerical_dispute", severity = 3–4  
- Framing inversion ("martyrs" vs "terrorists killed") = "framing_inversion", severity = 5 if same event
- Use only unique texts (deduplicated) for final counts
