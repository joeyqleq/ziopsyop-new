# Visualization Specifications for Part III Deep Analysis

## Priority 1: The Terror Density Gauge (MUST BUILD)

**What it shows:** A single number that is impossible to ignore. Channel 14 uses "terror" in 29.5% of unique messages. This should be displayed as a large forensic-style meter with comparison bars.

**Design:**
- Three vertical bars, side by side, full height of viewport section
- Al-Manar bar: 0.43% filled (lime green, #b6ff7c)
- Al-Mayadeen bar: 3.7% filled (purple, #7b39d0)
- Channel 14 bar: 29.5% filled (red, #ff4d5e) — towers over the others
- Numbers animate up on scroll entry
- Label underneath: "% of messages containing the word 'terror'"
- Forensic footnote: "n=17,443 / 9,063 / 3,981 unique messages"

**Impact:** Naive viewers immediately grasp the asymmetry. No explanation needed.

---

## Priority 2: The Silence Map (MUST BUILD)

**What it shows:** A calendar heatmap showing Channel 14's publishing activity alongside Al-Manar's casualty reporting. The gaps are the story.

**Data query:**
```sql
SELECT event_date,
  SUM(CASE WHEN source='almanar' THEN 1 ELSE 0 END) as almanar_total,
  SUM(CASE WHEN source='almanar' AND category='casualties' THEN 1 ELSE 0 END) as almanar_casualties,
  SUM(CASE WHEN source='channel_14' THEN 1 ELSE 0 END) as ch14_total
FROM media_events
GROUP BY event_date ORDER BY event_date;
```

**Design:** Two rows of calendar squares (one per day, 3 years).
- Row 1: Al-Manar — green intensity = message count, red overlay = casualty reports
- Row 2: Channel 14 — red intensity = message count. Empty squares = silence.
- Click day → show sample texts from both sources
- Annotate key blackout dates with tooltips: "Sep 24, 2024: 569 dead in Lebanon. Channel 14: silent."

---

## Priority 3: Lexical Divergence Matrix

**What it shows:** A grid of loaded terms × sources, colored by frequency. The asymmetry is visually overwhelming.

**Terms to track (x-axis):** terror, resistance, martyr, aggression, proxy, occupation, civilian, children, surgical, self-defense, genocide, hostage, dismantled, ceasefire, zionist

**Sources (y-axis):** Al-Manar, Al-Mayadeen, Channel 14

**Color:** Red = high frequency, blue = low, neutral = near-average. Each cell shows the normalized percentage.

---

## Priority 4: Narrative Phase Timeline

**What it shows:** How each source's dominant vocabulary SHIFTED across the war's phases.

**Phases:**
1. Pre-war (Aug–Oct 6, 2023)
2. Oct 7 response (Oct 7–31, 2023)
3. Escalation (Nov 2023–Sep 2024)
4. Mass casualty phase (Sep–Nov 2024)
5. Ceasefire period (Nov 2024–Jan 2025)
6. Post-ceasefire occupation (Jan 2025–Jul 2026)

**For each phase:** top 5 terms by frequency per source, normalized to unique messages.

---

## Priority 5: Contradiction Registry Table

**What it shows:** Side-by-side quotes from Al-Manar and Channel 14 on the same event.

**Format:**
| Date | Event Type | Al-Manar Says | Channel 14 Says | Verdict |
|------|-----------|---------------|-----------------|---------|

**Key contradiction pairs to find:**
- Sep 24, 2024: Casualty reports (Al-Manar: 569 dead) vs. Channel 14 coverage
- Any ceasefire date: Al-Manar framing vs. Channel 14 framing
- Any major strike: "aggression" vs. "surgical operation" framing

---

## Design System

All existing Part III components use:
```typescript
// Colors (CSS vars in globals.css)
--threat: #ff4d5e     // Channel 14
--archive: #b6ff7c    // Al-Manar  
// purple: #7b39d0    // Al-Mayadeen

// Typography
font-mono  // all labels and numbers
tracking-[0.3em] to tracking-[0.5em]  // uppercase labels

// Animation pattern
<motion.div whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
```

Existing canvas components for reference: `MediaNarrativeTimeline.tsx`, `MapTimeline.tsx`
Both use `ResizeObserver` + `window.devicePixelRatio` scaling pattern.
