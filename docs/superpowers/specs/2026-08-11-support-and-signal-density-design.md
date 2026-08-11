# ZIOPSYOP Support and Signal-Density Design

Date: 2026-08-11
Status: Approved for implementation

## Goal

Add an original, clearly personal support experience that explains why ZIOPSYOP exists, what it costs to sustain, and why payment access from Lebanon requires an intermediary. At the same time, make the boot sequence's symbolic ASCII scenes more legible and teach visitors that chart analysis drawers are clickable.

The work must preserve the existing 53-second boot timeline, direct-root replay behavior, reduced-motion behavior, research architecture, and dark forensic design system.

## Support route

Create `/support` under the heading `FUND THE COUNTER-SIGNAL`. Use `SUPPORT`, not `DONATE`, in navigation and calls to action because this is personal support for independent research, not a registered charity.

The page opens with a pointer-responsive ASCII signal field. Characters resolve around the pointer into rings, traces, and short counter-signal fragments. The field is deterministic, bounded, and static under reduced motion. Payment cards use the same local reveal language, with archive amber as their primary accent.

Core statement:

> I built ZIOPSYOP for one reason: to expose, dismantle, and debunk Israel's propaganda about Lebanon, the resistance, and the wars Israel wages while insisting on its own moral innocence.
>
> This is my personal contribution—built from Lebanon, from the heart, and without a party, NGO, government, state actor, sponsor, or editorial board behind it.
>
> The finished site hides the real cost: thousands of agent and AI API calls, model experimentation, vision-model training, hosting, databases, infrastructure, source gathering, watching and classifying hours of footage, cross-referencing records, writing, designing, and manually checking what the machines could not. The bill is measurable. The effort honestly is not.
>
> If this work helped you see through Israel's information apparatus—and you want me to keep building investigations like it—you are welcome to help keep the counter-signal alive.

Payment-access disclosure:

> Lebanon is effectively excluded from many major payment rails. Stripe, PayPal, Payoneer, and similar providers do not give me a workable Lebanese onboarding and receiving route. For Ko-fi and PayPal, a trusted person in the United States receives the contribution and transfers it to me. Crypto is received directly. This is personal support for independent research, not a charitable donation, and no tax receipt is issued.

Payment methods, verified from the existing Trump Files implementation:

- Ko-fi: `https://ko-fi.com/poi5on`
- PayPal: `https://www.paypal.me/joeyq2`
- TRON/TRC-20: `TLQro76K8ASUKvenz3fiyCSM5N4uGwK1ho`
- Polygon: `0x12081a23789f0034638B102b53056334564eE678`

The crypto addresses above come from decoding the supplied QR images, because the old visible strings were incomplete. The QR files are reused locally; no remote image dependency is introduced.

## Discoverability

- Desktop navigation gets a separate amber `SUPPORT` link at the same visual scale as the existing groups, with a subtle signal pulse.
- Mobile navigation gets a separated full-width `SUPPORT THE WORK` row.
- Inner pages get a quiet right-edge `KEEP THE SIGNAL LIVE` tab. On small screens it becomes a compact bottom-right button. It never auto-opens, is hidden on `/support`, and remains inert/hidden while the root boot sequence owns the screen.
- The new `/support` route is included in the sitemap.

## Expandable-analysis cue

Collapsed `ANALYST COMMENTARY` and `PLAIN LANGUAGE BRIEF` controls receive a small animated pointer/click glyph adjacent to the label. It appears only while the drawer is collapsed, stops when opened, and is disabled under reduced motion. The cue is part of the actual button so it remains correctly aligned on every screen size and works with keyboard focus.

## Boot signal-density pass

Timing and scene boundaries remain unchanged.

- Ambient backdrop: add near and far glyph layers, more address blocks, and a denser floor while keeping alpha restrained. Use a real resolved monospace canvas font instead of the nonexistent `--font-jetbrains` variable.
- Israeli flag: reduce cell size, increase field occupancy above 60 percent, remove blank field glyphs, strengthen blue/white contrast, and thicken the Star of David so the symbol reads before it shatters.
- Cedar: reduce cell size, retain more edge foliage, strengthen the trunk, and add depth through glyph weight and color rather than a flat opacity increase.
- FPV scene: increase terrain occupancy to roughly 35–45 percent, add horizon/topography bands and target silhouettes, and strengthen telemetry while preserving the existing lock beat.
- Canvas DPR remains capped at 2 and generated fields remain deterministic to avoid hydration, browser, and performance drift.

## Data and visualization refresh plan

This implementation does not mutate research data. ZIOPSYOP Supabase remains the canonical destination for every future dataset.

Phase 1 — freshness and provenance:

- Add a Supabase dataset registry with dataset name, authoritative table or RPC, coverage start/end, last successful ingest, source count, row count, checksum, and fallback artifact version.
- Build deterministic `data:audit` output that identifies stale coverage, static-only visualizations, RPC/date mismatches, missing provenance, and fallback drift.
- Fix known mixed authority: `events.json` and `user_forensics.json` should become generated, versioned fallbacks from Supabase rather than independent sources.

Phase 2 — incremental ingestion:

- Add idempotent, checkpointed `data:ingest:reddit`, `data:ingest:media`, and `data:ingest:battlefield` commands with explicit date ranges, dry-run mode, source IDs, and upserts.
- Verify every batch before promotion: row-count deltas, duplicate keys, null rates, date continuity, source URL validity, and checksum changes.
- Remove hard-coded query end dates, including the silence-map RPC boundary, after the backing tables are current.

Phase 3 — visualization contracts:

- Give every live exhibit a small contract: source tables/RPC, fields, filters, coverage window, last refresh, uncertainty, and fallback behavior.
- Replace code-authored sample datasets only when source-backed replacements exist; label retained demonstrations as illustrative rather than measured.
- Generate browser-consumable JSON snapshots only after Supabase validation so production can retain a safe static fallback without splitting authority.

Phase 4 — additions:

- Change-point detection for account and narrative behavior.
- Media-to-Reddit lead/lag analysis with confidence intervals rather than visual correlation alone.
- A correction and contradiction ledger linking claims, later corrections, and source evidence.
- Day-level coverage-gap views with explicit date controls and no ambiguous sliders.
- Geospatial confidence and source-agreement layers for mapped incidents.
- Actor behavior-change cohorts and a public data-release log.

## Verification

- TypeScript and production build pass.
- Desktop and mobile browser checks cover `/support`, navigation, the persistent support tab, payment links, QR rendering, copy controls, keyboard focus, and reduced motion.
- Root-load checks confirm the support affordance does not appear over the boot sequence and the boot still lasts 53 seconds.
- Scene snapshots confirm the flag, cedar, FPV terrain, and final wordmark remain legible in Chromium and Firefox-family rendering.
- Existing unrelated working-tree files are preserved.
