-- 004_media_events.sql
-- Part III: The Media Battlefield — media event storage for narrative comparison
-- Sources: Al-Manar (Hezbollah media), Al-Mayadeen (pro-resistance), Channel 14 (Israeli state)

CREATE TABLE IF NOT EXISTS media_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('almanar', 'almayadeen', 'channel_14')),
  event_date DATE NOT NULL,
  event_timestamp TIMESTAMPTZ,
  text TEXT NOT NULL,
  message_id TEXT,
  category TEXT,
  sentiment REAL, -- -1 to 1, null until analyzed
  topics TEXT[], -- array of matched topic keywords
  is_contradiction BOOLEAN DEFAULT FALSE,
  contradiction_pair_id UUID REFERENCES media_events(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_events_date ON media_events(event_date);
CREATE INDEX IF NOT EXISTS idx_media_events_source ON media_events(source);
CREATE INDEX IF NOT EXISTS idx_media_events_category ON media_events(category);

-- View for daily narrative comparison
CREATE OR REPLACE VIEW daily_narrative_comparison AS
SELECT
  event_date,
  source,
  COUNT(*) as message_count,
  ARRAY_AGG(DISTINCT category) as categories,
  ARRAY_AGG(text ORDER BY event_timestamp) as messages
FROM media_events
GROUP BY event_date, source
ORDER BY event_date, source;
