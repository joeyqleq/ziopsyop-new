---
name: silence-detector  
description: Identify Channel 14 blackout events — days where Al-Manar reported significant casualties or military events but Channel 14 published nothing. Correlate with external casualty records via Tavily.
metadata:
  type: skill
  domain: forensic-analysis
  project: ziopsyop
---

# Silence Detector

## Purpose
Silence is evidence. When a news channel publishes nothing on days of mass casualties, that is an editorial decision. This skill compiles the complete blackout list and cross-references it.

## SQL: Complete Blackout List

```sql
-- Days where Al-Manar active, CH14 completely absent
SELECT 
  event_date,
  SUM(CASE WHEN source='almanar' THEN 1 ELSE 0 END) as almanar_msgs,
  SUM(CASE WHEN source='almayadeen' THEN 1 ELSE 0 END) as mayadeen_msgs,
  SUM(CASE WHEN source='almanar' AND category='casualties' THEN 1 ELSE 0 END) as casualty_reports,
  STRING_AGG(CASE WHEN source='almanar' AND category='casualties' THEN LEFT(text, 100) END, ' | ') as sample_casualties
FROM media_events
WHERE event_date NOT IN (SELECT DISTINCT event_date FROM media_events WHERE source='channel_14')
GROUP BY event_date
HAVING SUM(CASE WHEN source='almanar' THEN 1 ELSE 0 END) >= 5
ORDER BY casualty_reports DESC, almanar_msgs DESC;
```

## Cross-Reference with External Sources (Tavily)

For each blackout date with high casualty count, search:
```bash
curl --socks5-hostname 127.0.0.1:1080 -X POST "https://api.tavily.com/search" \
  -H "Content-Type: application/json" \
  -d "{\"api_key\":\"$TAVILY_API_KEY\",
       \"query\":\"Lebanon casualties {date} OCHA UN\",
       \"max_results\":3,
       \"search_depth\":\"advanced\"}"
```

## Output

Two formats:
1. **Blackout calendar** — data for the Silence Map visualization (date, almanar_count, ch14_count)
2. **Blackout registry** — verified list of dates with external source confirmation, for the Contradiction Registry table
