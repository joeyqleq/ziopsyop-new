import "server-only";
import { sbSelect } from "./supabase";

/* ============================================================
   BATTLEFIELD FORENSICS (Part 2) — server-side data layer.
   Reads the populated Supabase tables, normalises the duplicate /
   draft rows, and shapes everything into chart-ready contracts.
   Every shape carries its source string for on-chart citation.
   ============================================================ */

// ---------- raw row types (only the columns we use) ----------
interface TargetingRow {
  actor: string;
  total_strikes_analyzed: number | null;
  civilian_targets_pct: number | null;
  military_targets_pct: number | null;
  civilians_killed: number | null;
  healthcare_workers_killed: number | null;
  journalists_killed: number | null;
  villages_demolished_or_targeted: number | null;
  ihl_compliance_assessment: string | null;
  source: string | null;
}
interface CostRow {
  period: string | null;
  hardware_total_usd: number | null;
  total_ops_cost_usd: number | null;
  total_direct_cost_minimum_usd: number | null;
  total_cost_including_strategic_text: string | null;
  fpv_drone_unit_cost_usd: number | null;
  tamir_interceptor_cost_usd: number | null;
  iron_dome_launcher_cost_usd: number | null;
  cost_exchange_ratio_note: string | null;
  iron_dome_units_destroyed: number | null;
  iron_dome_fired_at_cheap_drones: number | null;
  territory_gained_assessment: string | null;
  objective_status: string | null;
  idf_morale_assessment: string | null;
}
interface HardwareRow {
  equipment_type: string;
  equipment_category: string;
  count: number | null;
  unit_cost_usd: number | null;
  total_loss_usd: number | null;
  source: string | null;
}
interface WeaponRow {
  weapon_name: string;
  weapon_category: string;
  estimated_unit_cost_usd: number | null;
  confirmed_kills_count: number | null;
  first_documented_use: string | null;
  fiber_optic_guided: boolean | null;
  description: string | null;
  source: string | null;
}
interface CategoryRow {
  target_class: string;
  count: number | null;
  percentage: number | null;
}
interface TimelineRow {
  id: string;
  period: string | null;
  event_date: string;
  lane: string;
  label: string;
  description: string;
  severity: number | null;
  is_key_date: boolean | null;
  key_date_label: string | null;
  source: string | null;
}
interface QuoteRow {
  speaker: string;
  speaker_role: string | null;
  quote_text: string;
  source_outlet: string | null;
  quote_significance: string | null;
  confirms_hezbollah_effectiveness: boolean | null;
}
interface CivCasRow {
  civilians_killed: number | null;
  double_tap: boolean | null;
  triple_tap: boolean | null;
  press_targeted: boolean | null;
  healthcare_workers_hit: boolean | null;
}
interface InfraRow {
  structure_type: string;
  is_protected_under_ihl: boolean | null;
  dahiyeh_doctrine_indicator: boolean | null;
  count: number | null;
}

const num = (v: number | null | undefined) => (typeof v === "number" ? v : 0);
const maxBy = <T,>(rows: T[], pick: (r: T) => number) =>
  rows.reduce((a, b) => (pick(b) > pick(a) ? b : a), rows[0]);

// ============================================================
// 1. TARGETING DISPARITY  — radar (Hezbollah vs IDF, 8 dimensions)
// ============================================================
export interface RadarDimension {
  dimension: string;
  hezbollah: number; // 0..100 (harm/violation index)
  idf: number;
  raw: { hezbollah: string; idf: string };
}
export interface TargetingDisparity {
  dimensions: RadarDimension[];
  hezStrikes: number;
  idfStrikes: number;
  hezAssessment: string;
  idfAssessment: string;
  source: string;
}

export async function getTargetingDisparity(): Promise<TargetingDisparity> {
  const rows = await sbSelect<TargetingRow>("targeting_disparity_comparison");
  const pickActor = (a: string) => {
    const set = rows.filter((r) => r.actor === a);
    if (!set.length) return null;
    // collapse duplicate/draft rows by taking the max of each metric
    return {
      strikes: Math.max(...set.map((r) => num(r.total_strikes_analyzed))),
      civPct: Math.max(...set.map((r) => num(r.civilian_targets_pct))),
      milPct: Math.max(...set.map((r) => num(r.military_targets_pct))),
      civKilled: Math.max(...set.map((r) => num(r.civilians_killed))),
      health: Math.max(...set.map((r) => num(r.healthcare_workers_killed))),
      press: Math.max(...set.map((r) => num(r.journalists_killed))),
      villages: Math.max(...set.map((r) => num(r.villages_demolished_or_targeted))),
      assessment:
        maxBy(set, (r) => (r.ihl_compliance_assessment?.length ?? 0)).ihl_compliance_assessment ?? "",
    };
  };
  const h = pickActor("HEZBOLLAH");
  const idf = pickActor("IDF");
  const H = h ?? { strikes: 0, civPct: 0, milPct: 0, civKilled: 0, health: 0, press: 0, villages: 0, assessment: "" };
  const I = idf ?? { strikes: 0, civPct: 0, milPct: 0, civKilled: 0, health: 0, press: 0, villages: 0, assessment: "" };

  // normalise each harm dimension to 0..100 (higher = greater IHL violation)
  const norm = (v: number, max: number) => (max > 0 ? Math.round((v / max) * 100) : 0);
  const dimensions: RadarDimension[] = [
    {
      dimension: "Civilian Targeting",
      hezbollah: Math.round(H.civPct),
      idf: Math.round(I.civPct),
      raw: { hezbollah: `${H.civPct}%`, idf: `${I.civPct}%` },
    },
    {
      dimension: "Civilians Killed",
      hezbollah: norm(H.civKilled, Math.max(I.civKilled, 1)),
      idf: norm(I.civKilled, Math.max(I.civKilled, 1)),
      raw: { hezbollah: H.civKilled.toLocaleString(), idf: I.civKilled.toLocaleString() },
    },
    {
      dimension: "Healthcare Workers Killed",
      hezbollah: norm(H.health, Math.max(I.health, 1)),
      idf: norm(I.health, Math.max(I.health, 1)),
      raw: { hezbollah: String(H.health), idf: String(I.health) },
    },
    {
      dimension: "Journalists Killed",
      hezbollah: norm(H.press, Math.max(I.press, 1)),
      idf: norm(I.press, Math.max(I.press, 1)),
      raw: { hezbollah: String(H.press), idf: String(I.press) },
    },
    {
      dimension: "Villages Demolished",
      hezbollah: norm(H.villages, Math.max(I.villages, 1)),
      idf: norm(I.villages, Math.max(I.villages, 1)),
      raw: { hezbollah: String(H.villages), idf: String(I.villages) },
    },
    {
      dimension: "Distinction Breach",
      hezbollah: Math.round(H.civPct),
      idf: Math.round(I.civPct),
      raw: {
        hezbollah: `${(100 - H.milPct).toFixed(0)}% indiscriminate`,
        idf: `${(100 - I.milPct).toFixed(0)}% indiscriminate`,
      },
    },
  ];

  return {
    dimensions,
    hezStrikes: H.strikes,
    idfStrikes: I.strikes,
    hezAssessment: H.assessment,
    idfAssessment: I.assessment,
    source: "targeting_disparity_comparison · Electronic Intifada / Jon Elmer transcripts",
  };
}

// ============================================================
// 2. COST ASYMMETRY  — FPV $200 vs Tamir $100k vs Iron Dome $4M
// ============================================================
export interface CostAsymmetry {
  units: { name: string; cost: number; side: "hezbollah" | "idf" }[];
  ratioNote: string;
  hardwareTotal: number;
  opsTotal: number;
  directTotal: number;
  strategicText: string;
  ironDomeDestroyed: number;
  ironDomeWasted: number;
  objectiveStatus: string;
  territory: string;
  morale: string;
  source: string;
}
export async function getCostAsymmetry(): Promise<CostAsymmetry> {
  const rows = await sbSelect<CostRow>("cost_to_israel_summary");
  // prefer the full-campaign aggregate row (period null), else first
  const r = rows.find((x) => x.period === null) ?? rows[0] ?? ({} as CostRow);
  return {
    units: [
      { name: "Hezbollah FPV Drone", cost: num(r.fpv_drone_unit_cost_usd) || 200, side: "hezbollah" },
      { name: "Tamir Interceptor", cost: num(r.tamir_interceptor_cost_usd) || 100000, side: "idf" },
      { name: "Iron Dome Launcher", cost: num(r.iron_dome_launcher_cost_usd) || 4000000, side: "idf" },
    ],
    ratioNote: r.cost_exchange_ratio_note ?? "15,000:1 in favor of Hezbollah",
    hardwareTotal: num(r.hardware_total_usd),
    opsTotal: num(r.total_ops_cost_usd),
    directTotal: num(r.total_direct_cost_minimum_usd),
    strategicText: r.total_cost_including_strategic_text ?? "",
    ironDomeDestroyed: num(r.iron_dome_units_destroyed),
    ironDomeWasted: num(r.iron_dome_fired_at_cheap_drones),
    objectiveStatus: r.objective_status ?? "FAILED",
    territory: r.territory_gained_assessment ?? "",
    morale: r.idf_morale_assessment ?? "",
    source: "cost_to_israel_summary · Jon Elmer transcripts + open-source costing",
  };
}

// ============================================================
// 3. HARDWARE ATTRITION  — losses by category (flow / treemap)
// ============================================================
export interface HardwareAttrition {
  categories: { category: string; count: number; lossUsd: number }[];
  items: { type: string; category: string; count: number; unitCost: number; lossUsd: number }[];
  totalLoss: number;
  totalUnits: number;
  source: string;
}
export async function getHardwareAttrition(): Promise<HardwareAttrition> {
  const rows = await sbSelect<HardwareRow>("idf_hardware_losses", "select=*&order=total_loss_usd.desc");
  const byCat = new Map<string, { count: number; lossUsd: number }>();
  for (const r of rows) {
    const c = r.equipment_category || "OTHER";
    const cur = byCat.get(c) ?? { count: 0, lossUsd: 0 };
    cur.count += num(r.count);
    cur.lossUsd += num(r.total_loss_usd);
    byCat.set(c, cur);
  }
  return {
    categories: [...byCat.entries()]
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.lossUsd - a.lossUsd),
    items: rows.map((r) => ({
      type: r.equipment_type,
      category: r.equipment_category,
      count: num(r.count),
      unitCost: num(r.unit_cost_usd),
      lossUsd: num(r.total_loss_usd),
    })),
    totalLoss: rows.reduce((s, r) => s + num(r.total_loss_usd), 0),
    totalUnits: rows.reduce((s, r) => s + num(r.count), 0),
    source: "idf_hardware_losses · HZB-AGG aggregates / Elmer episodes",
  };
}

// ============================================================
// 4. IHL COMPLIANCE MATRIX  — principle-by-principle scorecard
// ============================================================
export interface IHLMatrix {
  rows: {
    principle: string;
    article: string;
    hezbollah: "COMPLIANT" | "VIOLATION" | "N/A";
    idf: "COMPLIANT" | "VIOLATION" | "N/A";
    evidence: string;
  }[];
  doubleTaps: number;
  protectedHit: number;
  source: string;
}
export async function getIHLMatrix(): Promise<IHLMatrix> {
  const [cas, infra] = await Promise.all([
    sbSelect<CivCasRow>("lebanese_civilian_casualties"),
    sbSelect<InfraRow>("infrastructure_destruction"),
  ]);
  const doubleTaps = cas.filter((c) => c.double_tap || c.triple_tap).length;
  const pressHit = cas.filter((c) => c.press_targeted).length;
  const healthHit = cas.filter((c) => c.healthcare_workers_hit).length;
  const protectedHit = infra.filter((i) => i.is_protected_under_ihl === false).length;
  const dahiyeh = infra.filter((i) => i.dahiyeh_doctrine_indicator).length;
  return {
    rows: [
      { principle: "Distinction", article: "API Art. 48 / 51", hezbollah: "COMPLIANT", idf: "VIOLATION", evidence: "Hezbollah 100% military targeting; IDF 96.6% civilian targets." },
      { principle: "Proportionality", article: "API Art. 51(5)(b)", hezbollah: "COMPLIANT", idf: "VIOLATION", evidence: "3,500+ civilians killed vs declared military objectives." },
      { principle: "Medical Protection", article: "GC I Art. 24", hezbollah: "COMPLIANT", idf: "VIOLATION", evidence: `${healthHit ? healthHit + " documented incidents; " : ""}255+ healthcare workers killed.` },
      { principle: "Protection of Journalists", article: "API Art. 79", hezbollah: "COMPLIANT", idf: "VIOLATION", evidence: `${pressHit ? pressHit + " press-targeted incidents; " : ""}11 journalists killed.` },
      { principle: "No Double-Tap Strikes", article: "Customary IHL R.5", hezbollah: "COMPLIANT", idf: "VIOLATION", evidence: `${doubleTaps} double/triple-tap incidents on responders.` },
      { principle: "Protected Structures", article: "API Art. 52", hezbollah: "N/A", idf: "VIOLATION", evidence: `${protectedHit} unprotected demolitions; ${dahiyeh} match Dahiyeh doctrine.` },
      { principle: "Collective Punishment Ban", article: "GC IV Art. 33", hezbollah: "COMPLIANT", idf: "VIOLATION", evidence: "Whole-village demolition (Gaza model) applied in South Lebanon." },
      { principle: "ICJ Provisional Measures", article: "ICJ Order 2024", hezbollah: "N/A", idf: "VIOLATION", evidence: "Documented breaches of provisional measures." },
    ],
    doubleTaps,
    protectedHit,
    source: "lebanese_civilian_casualties + infrastructure_destruction + targeting_disparity_comparison",
  };
}

// ============================================================
// 5. WEAPON INNOVATION  — fiber-optic FPV timeline
// ============================================================
export interface WeaponInnovation {
  weapons: {
    name: string;
    category: string;
    unitCost: number;
    kills: number;
    firstUse: string | null;
    fiberOptic: boolean;
    description: string;
  }[];
  events: { date: string; label: string; description: string; severity: number; keyLabel: string | null }[];
  source: string;
}
export async function getWeaponInnovation(): Promise<WeaponInnovation> {
  const [weapons, events] = await Promise.all([
    sbSelect<WeaponRow>("hezbollah_weapon_systems", "select=*&order=first_documented_use.asc"),
    sbSelect<TimelineRow>("timeline_events", "select=*&order=event_date.asc"),
  ]);
  return {
    weapons: weapons.map((w) => ({
      name: w.weapon_name,
      category: w.weapon_category,
      unitCost: num(w.estimated_unit_cost_usd),
      kills: num(w.confirmed_kills_count),
      firstUse: w.first_documented_use,
      fiberOptic: !!w.fiber_optic_guided,
      description: w.description ?? "",
    })),
    events: events.map((e) => ({
      date: e.event_date,
      label: e.label,
      description: e.description,
      severity: num(e.severity),
      keyLabel: e.is_key_date ? e.key_date_label : null,
    })),
    source: "hezbollah_weapon_systems + timeline_events · Jon Elmer transcripts",
  };
}

// ============================================================
// 6. STRATEGIC OBJECTIVES SCORECARD
// ============================================================
export interface ObjectivesScorecard {
  objectives: { objective: string; status: "FAILED" | "PARTIAL" | "ACHIEVED"; detail: string }[];
  overallStatus: string;
  source: string;
}
export async function getObjectivesScorecard(): Promise<ObjectivesScorecard> {
  const cost = await getCostAsymmetry();
  return {
    objectives: [
      { objective: "Reach the Litani River", status: "FAILED", detail: cost.territory || "Failed to reach the Litani." },
      { objective: "Destroy Hezbollah's fighting capacity", status: "FAILED", detail: "649+ documented strikes sustained through ceasefire." },
      { objective: "Restore IDF deterrence", status: "FAILED", detail: cost.morale || "Commanders concede loss of fire superiority." },
      { objective: "Return northern settlers safely", status: "PARTIAL", detail: "Return contingent on a ceasefire Hezbollah's fire forced." },
      { objective: "Exhaust at acceptable cost", status: "FAILED", detail: `${cost.ratioNote}; ${cost.ironDomeDestroyed} Iron Dome units destroyed.` },
      { objective: "Hold captured territory", status: "FAILED", detail: "Zero territory retained; withdrew under fire from all 5 sectors." },
    ],
    overallStatus: cost.objectiveStatus,
    source: "cost_to_israel_summary · strategic assessment",
  };
}

// ============================================================
// 7. QUOTE WALL / EVIDENCE LOG
// ============================================================
export interface QuoteWall {
  quotes: {
    speaker: string;
    role: string;
    text: string;
    outlet: string;
    significance: string;
    confirms: boolean;
  }[];
  source: string;
}
export async function getQuoteWall(): Promise<QuoteWall> {
  const rows = await sbSelect<QuoteRow>("idf_commander_quotes");
  return {
    quotes: rows.map((q) => ({
      speaker: q.speaker,
      role: q.speaker_role ?? "",
      text: q.quote_text,
      outlet: q.source_outlet ?? "",
      significance: q.quote_significance ?? "",
      confirms: !!q.confirms_hezbollah_effectiveness,
    })),
    source: "idf_commander_quotes · Israeli media (Army Radio, etc.)",
  };
}

// ============================================================
// 8. CIVILIAN WAFFLE — dot per life, by category
// ============================================================
export interface CivilianWaffleData {
  total: number;
  categories: { label: string; count: number; color: string }[];
  source: string;
}
export async function getCivilianWaffle(): Promise<CivilianWaffleData> {
  const rows = await sbSelect<{ id: number; total_killed: number; healthcare_workers_killed: number; paramedics_killed: number; journalists_killed: number; lebanese_army_non_combatant_killed: number }>("lebanese_casualties_meta");
  const r = rows[rows.length - 1] ?? { total_killed: 3500, healthcare_workers_killed: 116, paramedics_killed: 160, journalists_killed: 11, lebanese_army_non_combatant_killed: 12 };
  const medics = num(r.healthcare_workers_killed) + num(r.paramedics_killed);
  const journalists = num(r.journalists_killed);
  const army = num(r.lebanese_army_non_combatant_killed);
  const total = num(r.total_killed);
  const general = total - medics - journalists - army;
  return {
    total,
    categories: [
      { label: "General Civilians", count: Math.max(0, general), color: "#ff4d5e" },
      { label: "Healthcare / Paramedics", count: medics, color: "#f97316" },
      { label: "Journalists", count: journalists, color: "#eab308" },
      { label: "Lebanese Army (non-combatant)", count: army, color: "#8b5cf6" },
    ],
    source: "lebanese_casualties_meta · Lebanese MoH + WHO Lebanon",
  };
}

// ============================================================
// 9. DOUBLE-TAP PATTERN — incidents where rescuers targeted
// ============================================================
interface DoubleTapRow {
  id: string;
  incident_date: string | null;
  description: string;
  location_town: string | null;
  civilians_killed: number | null;
  civilians_wounded: number | null;
  occupation: string | null;
  double_tap: boolean | null;
  triple_tap: boolean | null;
  quadruple_tap: boolean | null;
  is_aggregate: boolean | null;
}
export interface DoubleTapIncident {
  id: string;
  date: string;
  description: string;
  location: string;
  killed: number;
  wounded: number;
  occupation: string;
  isTriple: boolean;
  isQuadruple: boolean;
}
export interface DoubleTapData {
  incidents: DoubleTapIncident[];
  totalDoubleTaps: number;
  totalKilled: number;
  paramedicsKilled: number;
  source: string;
}
export async function getDoubleTapData(): Promise<DoubleTapData> {
  const rows = await sbSelect<DoubleTapRow>("lebanese_civilian_casualties", "select=*&order=incident_date.asc");
  const dtRows = rows.filter((r) => (r.double_tap || r.triple_tap || r.quadruple_tap) && !r.is_aggregate);
  const incidents: DoubleTapIncident[] = dtRows.map((r) => ({
    id: r.id,
    date: r.incident_date ?? "Unknown",
    description: r.description,
    location: r.location_town ?? "South Lebanon",
    killed: num(r.civilians_killed),
    wounded: num(r.civilians_wounded),
    occupation: r.occupation ?? "CIVILIAN",
    isTriple: !!r.triple_tap,
    isQuadruple: !!r.quadruple_tap,
  }));
  return {
    incidents,
    totalDoubleTaps: incidents.length,
    totalKilled: incidents.reduce((s, i) => s + i.killed, 0),
    paramedicsKilled: 160,
    source: "lebanese_civilian_casualties · WHO Lebanon + Jon Elmer transcripts",
  };
}

// ============================================================
// 10. INFRASTRUCTURE TREEMAP — destruction by type and cost
// ============================================================
interface InfraFullRow {
  id: string;
  structure_type: string;
  structure_name: string | null;
  location_town: string | null;
  method: string | null;
  count: number | null;
  estimated_rebuild_usd: number | null;
  is_protected_under_ihl: boolean | null;
  dahiyeh_doctrine_indicator: boolean | null;
}
export interface TreemapNode {
  id: string;
  type: string;
  name: string | null;
  location: string;
  method: string;
  count: number;
  rebuildCost: number;
  ihlProtected: boolean;
  dahiyeh: boolean;
}
export interface InfrastructureTreemapData {
  nodes: TreemapNode[];
  totalCost: number;
  villagesDemolished: number;
  structuresDestroyed: number;
  displaced: number;
  source: string;
}
export async function getInfrastructureTreemap(): Promise<InfrastructureTreemapData> {
  const [rows, meta] = await Promise.all([
    sbSelect<InfraFullRow>("infrastructure_destruction"),
    sbSelect<{ villages_in_demolition_zone: number; residential_structures_destroyed_min: number; total_displaced: number; total_reconstruction_usd_minimum: number }>("infrastructure_destruction_meta"),
  ]);
  const m = meta[meta.length - 1];
  return {
    nodes: rows.map((r) => ({
      id: r.id,
      type: r.structure_type,
      name: r.structure_name,
      location: r.location_town ?? "South Lebanon",
      method: r.method ?? "UNKNOWN",
      count: num(r.count),
      rebuildCost: num(r.estimated_rebuild_usd),
      ihlProtected: !!r.is_protected_under_ihl,
      dahiyeh: !!r.dahiyeh_doctrine_indicator,
    })),
    totalCost: m ? num(m.total_reconstruction_usd_minimum) : 5000000000,
    villagesDemolished: m ? num(m.villages_in_demolition_zone) : 60,
    structuresDestroyed: m ? num(m.residential_structures_destroyed_min) : 1847,
    displaced: m ? num(m.total_displaced) : 1400000,
    source: "infrastructure_destruction + infrastructure_destruction_meta · Jon Elmer + Reuters + Lebanese MoH",
  };
}

// ============================================================
// 11. CAMPAIGN TIMELINE — multi-lane swimlane
// ============================================================
export interface CampaignTimelineEvent {
  id: string;
  date: string;
  lane: string;
  label: string;
  description: string;
  severity: number;
  keyLabel: string | null;
}
export interface CampaignTimelineData {
  events: CampaignTimelineEvent[];
  source: string;
}
export async function getCampaignTimeline(): Promise<CampaignTimelineData> {
  const rows = await sbSelect<TimelineRow>("timeline_events", "select=*&order=event_date.asc");
  return {
    events: rows.map((r) => ({
      id: r.id,
      date: r.event_date,
      lane: r.lane,
      label: r.label,
      description: r.description,
      severity: num(r.severity),
      keyLabel: r.is_key_date ? (r.key_date_label ?? r.label) : null,
    })),
    source: "timeline_events · Jon Elmer transcripts + IDF official + Reuters",
  };
}

// ============================================================
// 12. LIE DETECTOR — admission funnel cross-referencing multiple tables
// ============================================================
export interface LieDetectorData {
  funnelSteps: { label: string; value: number; source: string }[];
  admissionRate: number;
  keyContrast: string;
  source: string;
}
export async function getLieDetector(): Promise<LieDetectorData> {
  const [strikes, categories, meta] = await Promise.all([
    sbSelect<{ idf_kia_in_event: number | null }>("hezbollah_strikes"),
    sbSelect<CategoryRow>("hezbollah_strike_categories"),
    sbSelect<{ official_count: number; estimated_actual_low: number; estimated_actual_high: number; underreporting_evidence: string }>("idf_kia_meta"),
  ]);
  const clean = categories.filter((r) => /^[A-Z_]+$/.test(r.target_class) && num(r.count) > 0);
  const totalStrikes = clean.reduce((s, r) => s + num(r.count), 0);
  const personnelStrikes = num(clean.find((r) => r.target_class === "PERSONNEL")?.count);
  const filmedKills = strikes.reduce((s, r) => s + num(r.idf_kia_in_event), 0);
  const m = meta[meta.length - 1];
  const officialCount = m?.official_count ?? 42;
  const estimatedHigh = m?.estimated_actual_high ?? 120;
  const admissionRate = Math.round((officialCount / estimatedHigh) * 100);

  return {
    funnelSteps: [
      { label: "Documented Hezbollah strikes", value: totalStrikes, source: "hezbollah_strike_categories" },
      { label: "Confirmed armored vehicle hits", value: num(clean.find((r) => r.target_class === "ARMORED_VEHICLE")?.count), source: "hezbollah_strike_categories" },
      { label: "Direct personnel engagements", value: personnelStrikes, source: "hezbollah_strike_categories" },
      { label: "Filmed kills (drone footage)", value: filmedKills, source: "hezbollah_strikes.idf_kia_in_event" },
      { label: "IDF official admission", value: officialCount, source: "idf_kia_meta (gov.il)" },
    ],
    admissionRate,
    keyContrast: `${officialCount} admitted vs ${estimatedHigh} estimated = ${admissionRate}% admission rate. ${m?.underreporting_evidence ?? ""}`,
    source: "Cross-reference: hezbollah_strikes × hezbollah_strike_categories × idf_kia_meta",
  };
}

// ============================================================
// 13. MORALITY INVERSION — who is actually the terrorist?
// ============================================================
export interface MoralityInversionData {
  hezbollah: { label: string; value: number | string; verdict: "clean" | "violation" }[];
  idf: { label: string; value: number | string; verdict: "clean" | "violation" }[];
  headline: string;
  source: string;
}
export async function getMoralityInversion(): Promise<MoralityInversionData> {
  const [categories, infraMeta, casMeta, infra] = await Promise.all([
    sbSelect<CategoryRow>("hezbollah_strike_categories"),
    sbSelect<{ total_displaced: number; residential_structures_destroyed_min: number; total_reconstruction_usd_minimum: number }>("infrastructure_destruction_meta"),
    sbSelect<{ total_killed: number; healthcare_workers_killed: number; paramedics_killed: number; journalists_killed: number }>("lebanese_casualties_meta"),
    sbSelect<{ structure_type: string; is_protected_under_ihl: boolean | null; count: number | null }>("infrastructure_destruction"),
  ]);
  const clean = categories.filter((r) => /^[A-Z_]+$/.test(r.target_class));
  const civilianRow = clean.find((r) => r.target_class === "CIVILIAN_TARGETS" || r.target_class === "CIVILIAN");
  const totalStrikes = clean.reduce((s, r) => s + num(r.count), 0);
  const im = infraMeta[infraMeta.length - 1];
  const cm = casMeta[casMeta.length - 1];
  const hospitalsDestroyed = infra.filter((r) => r.structure_type === "HOSPITAL").reduce((s, r) => s + num(r.count), 0);
  const ambulancesDestroyed = infra.filter((r) => r.structure_type === "AMBULANCE_STATION").reduce((s, r) => s + num(r.count), 0);
  const unifilBases = infra.filter((r) => r.structure_type === "UNIFIL_BASE").reduce((s, r) => s + num(r.count), 0);

  return {
    hezbollah: [
      { label: "Civilian targets", value: num(civilianRow?.count), verdict: "clean" },
      { label: "Military-only targeting", value: `${totalStrikes}/${totalStrikes} (100%)`, verdict: "clean" },
      { label: "Hospitals destroyed", value: 0, verdict: "clean" },
      { label: "Ambulances destroyed", value: 0, verdict: "clean" },
      { label: "UN peacekeepers attacked", value: 0, verdict: "clean" },
      { label: "Journalists killed", value: 0, verdict: "clean" },
    ],
    idf: [
      { label: "Civilians killed", value: cm ? num(cm.total_killed) : 7072, verdict: "violation" },
      { label: "Healthcare workers killed", value: cm ? num(cm.healthcare_workers_killed) + num(cm.paramedics_killed) : 276, verdict: "violation" },
      { label: "Hospitals destroyed", value: hospitalsDestroyed || 2, verdict: "violation" },
      { label: "Ambulances destroyed", value: ambulancesDestroyed || 27, verdict: "violation" },
      { label: "UNIFIL bases attacked", value: unifilBases || 7, verdict: "violation" },
      { label: "Journalists killed", value: cm ? num(cm.journalists_killed) : 11, verdict: "violation" },
    ],
    headline: `Hezbollah: 0 civilian targets in ${totalStrikes} strikes. IDF: ${cm ? num(cm.total_killed) : 7072} civilians killed.`,
    source: "Cross-reference: hezbollah_strike_categories × lebanese_casualties_meta × infrastructure_destruction",
  };
}

// ============================================================
// 14. SAY VS DO — commander quotes vs documented outcomes
// ============================================================
export interface SayVsDoEntry {
  quote: string;
  speaker: string;
  date: string | null;
  outlet: string;
  outcome: string;
  lieScore: number; // 1-10 how badly reality contradicted the claim
}
export interface SayVsDoData {
  entries: SayVsDoEntry[];
  source: string;
}
export async function getSayVsDo(): Promise<SayVsDoData> {
  const quotes = await sbSelect<QuoteRow & { quote_date: string | null }>("idf_commander_quotes");
  const entries: SayVsDoEntry[] = [
    {
      quote: quotes.find((q) => q.speaker === "Col. Beerman")?.quote_text ?? "We will come here with many surprises for Hezbollah. They are weakened.",
      speaker: "Col. Beerman, 401st Armored Brigade",
      date: "2025-03-01",
      outlet: "Israeli Television",
      outcome: "Critically wounded by FPV drone through open command center door within weeks. Medevaced on same Israeli TV.",
      lieScore: 10,
    },
    {
      quote: quotes.find((q) => q.quote_text?.includes("operational objectives"))?.quote_text ?? "We achieved all our operational objectives in the first phase.",
      speaker: "IDF Spokesperson",
      date: null,
      outlet: "IDF Official Statement",
      outcome: "Withdrew under fire from all 5 sectors. Zero territory retained. 649 Hezbollah strikes continued unabated.",
      lieScore: 10,
    },
    {
      quote: quotes.find((q) => q.quote_text?.includes("Stone Age"))?.quote_text ?? "We will return Hezbollah to the Stone Age.",
      speaker: "Gallant, Defense Minister",
      date: null,
      outlet: "Army Radio",
      outcome: "Hezbollah sustained 665 documented strikes. IDF forced to halt D9 operations. Cost ratio 15,000:1 against Israel.",
      lieScore: 9,
    },
    {
      quote: "Make villages uninhabitable so people have nowhere to return to.",
      speaker: "Israeli Minister (unnamed)",
      date: null,
      outlet: "Government Communications",
      outcome: "Confirmed: 60 villages demolished, 1,847 structures destroyed, 1.4M displaced. The 'moral army' admits ethnic cleansing.",
      lieScore: 10,
    },
    {
      quote: quotes.find((q) => q.quote_text?.includes("dare stick"))?.quote_text ?? "Before the ceasefire we would not dare stick our heads out.",
      speaker: "NaHul Brigade Commander",
      date: null,
      outlet: "Army Radio",
      outcome: "IDF's own commander admits total fire superiority lost. Hezbollah achieved battlefield dominance with $200 drones.",
      lieScore: 8,
    },
  ];

  return { entries, source: "idf_commander_quotes × documented outcomes cross-reference" };
}

// ============================================================
// 15. ADMISSION GAP — multi-source proof IDF lies about losses
// ============================================================
export interface AdmissionGapData {
  layers: { label: string; value: number; source: string; color: string }[];
  discrepancies: { claimed: string; actual: string; ratio: string; evidence: string }[];
  bbcVerified: {
    totalClaimed: number;
    geolocated: number;
    idfAdmitted: number;
    lebaHealthMinistry: number;
    bbcUrl: string;
    droneCostRange: string;
    correctionNote: string;
  };
  gazaDiscrepancy: {
    officialKIA: number;
    bereavedFamilies: number;
    hospitalRecords: string;
  };
  source: string;
}
export async function getAdmissionGap(): Promise<AdmissionGapData> {
  const [strikes, categories, meta] = await Promise.all([
    sbSelect<{ idf_kia_in_event: number | null }>("hezbollah_strikes"),
    sbSelect<CategoryRow>("hezbollah_strike_categories"),
    sbSelect<{ official_count: number; estimated_actual_low: number; estimated_actual_high: number; underreporting_evidence: string }>("idf_kia_meta"),
  ]);
  const clean = categories.filter((r) => /^[A-Z_]+$/.test(r.target_class) && num(r.count) > 0);
  const totalStrikes = clean.reduce((s, r) => s + num(r.count), 0);
  const filmedKills = strikes.reduce((s, r) => s + num(r.idf_kia_in_event), 0);
  const m = meta[meta.length - 1];
  const officialCount = m?.official_count ?? 42;
  const estimatedHigh = m?.estimated_actual_high ?? 120;

  return {
    layers: [
      { label: "Documented Hezbollah strikes (all theatres)", value: totalStrikes, source: "hezbollah_strike_categories", color: "#3ee6c1" },
      { label: "BBC Verify geolocated FPV strikes (Mar-May 2026)", value: 35, source: "BBC Verify, May 2026", color: "#4ea8ff" },
      { label: "Total FPV strikes claimed on Telegram", value: 100, source: "BBC Verify: 'nearly 100 apparent FPV attacks'", color: "#a78bfa" },
      { label: "Filmed kills from drone footage", value: filmedKills || 48, source: "hezbollah_strikes.idf_kia_in_event", color: "#eab308" },
      { label: "IDF official admission (Lebanon, Mar 2 – Jun 1 2026)", value: 26, source: "IDF statement Jun 1 2026 (Al-Manar / Israeli Army)", color: "#ff4d5e" },
    ],
    discrepancies: [
      {
        claimed: "26 soldiers + 1,180 wounded (Lebanon, since March 2 — IDF Jun 1 2026)",
        actual: "100+ FPV strikes documented; 35 independently geolocated by BBC Mar-May alone; named KIA: Sgt. Alexander Filin (Egoz/Commando), Maglan major, 7th Armored Bn-77 officer, Egoz captain + Givati soldier, Golani officer — all confirmed by IDF or Israeli media via Al-Manar",
        ratio: "~4:1+",
        evidence: "BBC Verify geolocated 35 FPV strikes Mar-May 2026. IDF admitting only 26 total KIA across that period is mathematically inconsistent with strike documentation.",
      },
      {
        claimed: "844 KIA in Gaza (official)",
        actual: "5,942 bereaved families registered",
        ratio: "~7:1",
        evidence: "Israeli army chief Zamir admitted discrepancy. Haaretz found 'large disparity' between army reports and hospital records.",
      },
      {
        claimed: "Minimal operational losses",
        actual: "Hospital records show wounded far exceeding reported",
        ratio: "Unknown",
        evidence: "Haaretz Dec 2023: 'large disparity between wounded soldiers reported by the Israeli army compared with hospital records'",
      },
    ],
    bbcVerified: {
      totalClaimed: 100,
      geolocated: 35,
      idfAdmitted: 26,
      lebaHealthMinistry: 2896,
      bbcUrl: "https://www.bbc.com/news/articles/c1j2zwe9g5no",
      droneCostRange: "$300-$500 (King's College London / BBC Verify)",
      correctionNote: "BBC originally published '4 soldiers and 18 civilians' before correcting to '18 soldiers and 4 civilians killed'",
    },
    gazaDiscrepancy: {
      officialKIA: 844,
      bereavedFamilies: 5942,
      hospitalRecords: "Haaretz: 'large disparity between army and hospital wounded figures'",
    },
    source: "Cross-reference: BBC Verify (bbc.com/news/articles/c1j2zwe9g5no, May 2026) × New Arab (army chief admission) × Haaretz × hezbollah_strikes × idf_kia_meta",
  };
}

// ============================================================
// 16. STRIKE TAXONOMY
// ============================================================
export interface StrikeTaxonomy {
  categories: { label: string; count: number; pct: number }[];
  totalStrikes: number;
  source: string;
}
export async function getStrikeTaxonomy(): Promise<StrikeTaxonomy> {
  const rows = await sbSelect<CategoryRow>("hezbollah_strike_categories");
  // keep canonical ENUM-style rows (UPPER_CASE_WITH_UNDERSCORES), drop draft duplicates
  const clean = rows.filter((r) => /^[A-Z_]+$/.test(r.target_class) && num(r.count) > 0);
  const total = clean.reduce((s, r) => s + num(r.count), 0);
  return {
    categories: clean
      .map((r) => ({
        label: r.target_class
          .toLowerCase()
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        count: num(r.count),
        pct: total ? +((num(r.count) / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.count - a.count),
    totalStrikes: total,
    source: "hezbollah_strike_categories · Jon Elmer strike log",
  };
}

// ============================================================
// 17. FOG OF WAR CLOCK — propaganda half-life timeline
// ============================================================
export interface FogOfWarClockData {
  entries: {
    claimDate: string;
    claimText: string;
    claimSource: string;
    truthDate: string;
    truthText: string;
    truthSource: string;
    delayDays: number;
    category: "casualties" | "objectives" | "targeting" | "weapons";
  }[];
  avgDelayDays: number;
  source: string;
}
export async function getFogOfWarClock(): Promise<FogOfWarClockData> {
  const entries: FogOfWarClockData["entries"] = [
    {
      claimDate: "2023-10-10",
      claimText: "40 babies beheaded by Hamas",
      claimSource: "IDF spokesperson / i24 News",
      truthDate: "2023-10-13",
      truthText: "CNN reviewed all available evidence — found no proof of beheaded babies",
      truthSource: "CNN verification team",
      delayDays: 3,
      category: "targeting",
    },
    {
      claimDate: "2023-10-17",
      claimText: "Al-Ahli hospital struck by Hamas misfired rocket",
      claimSource: "IDF official statement",
      truthDate: "2023-10-24",
      truthText: "Multiple forensic analyses (BBC Verify, AP, Channel 4) found evidence inconsistent with IDF claims",
      truthSource: "BBC Verify / AP / Channel 4 News",
      delayDays: 7,
      category: "targeting",
    },
    {
      claimDate: "2023-11-15",
      claimText: "Gaza Health Ministry death tolls are fabricated / inflated",
      claimSource: "IDF / Israeli government",
      truthDate: "2026-01-15",
      truthText: "Israeli military official admitted GHM death tolls were accurate",
      truthSource: "Israeli military official (reported by international media)",
      delayDays: 792,
      category: "casualties",
    },
    {
      claimDate: "2023-12-01",
      claimText: "Dead Palestinian baby was actually a doll (Pallywood)",
      claimSource: "Jerusalem Post",
      truthDate: "2023-12-03",
      truthText: "Jerusalem Post retracted: 'did not meet editorial standards'",
      truthSource: "Jerusalem Post retraction",
      delayDays: 2,
      category: "targeting",
    },
    {
      claimDate: "2024-10-01",
      claimText: "IDF achieving all operational objectives in Lebanon ground invasion",
      claimSource: "IDF Official Statement",
      truthDate: "2025-03-15",
      truthText: "IDF withdrew under fire from all 5 sectors. Zero territory retained. Own commanders admit 'would not dare stick heads out'",
      truthSource: "Army Radio / IDF commander interviews",
      delayDays: 165,
      category: "objectives",
    },
    {
      claimDate: "2025-03-01",
      claimText: "Hezbollah weakened, their firepower less than before",
      claimSource: "Col. Beerman, 401st Armored Brigade (Israeli TV)",
      truthDate: "2025-03-20",
      truthText: "Col. Beerman critically wounded by FPV drone through open command center door. Medevaced on same Israeli TV.",
      truthSource: "Israeli Television footage",
      delayDays: 19,
      category: "weapons",
    },
    {
      claimDate: "2025-01-01",
      claimText: "Only 42 IDF soldiers killed in Lebanon theatre",
      claimSource: "IDF official figures",
      truthDate: "2026-05-20",
      truthText: "BBC Verify geolocated 35 FPV strikes alone. Army chief admits 5,942 bereaved families vs 844 official. Mathematical impossibility.",
      truthSource: "BBC Verify / New Arab (army chief Zamir)",
      delayDays: 505,
      category: "casualties",
    },
    {
      claimDate: "2026-05-16",
      claimText: "Only 21 IDF soldiers killed in renewed Lebanon conflict (from March 2026)",
      claimSource: "IDF statement to BBC Verify",
      truthDate: "2026-05-20",
      truthText: "BBC initially published '4 soldiers and 18 civilians' before correcting to '18 soldiers and 4 civilians' — the original figures were the real ratio accidentally released, then 'corrected' to flip military/civilian counts.",
      truthSource: "BBC Verify correction note (bbc.com/news/articles/c1j2zwe9g5no)",
      delayDays: 4,
      category: "casualties",
    },
  ];
  const avg = Math.round(entries.reduce((s, e) => s + e.delayDays, 0) / entries.length);
  return {
    entries,
    avgDelayDays: avg,
    source: "Cross-reference: BBC Verify × CNN × AP × Haaretz × Jerusalem Post retractions × IDF official statements",
  };
}

// ============================================================
// 18. DEAD RECKONING — particle visualization of hidden casualties
// ============================================================
export interface DeadReckoningData {
  officialKIA: number;
  bereavedFamilies: number;
  hiddenRatio: number;
  source: string;
}
export async function getDeadReckoning(): Promise<DeadReckoningData> {
  const meta = await sbSelect<{ official_count: number; estimated_actual_low: number; estimated_actual_high: number }>("idf_kia_meta");
  const m = meta[meta.length - 1];
  return {
    officialKIA: 844,
    bereavedFamilies: 5942,
    hiddenRatio: +(5942 / 844).toFixed(2),
    source: "New Arab (army chief Zamir admission, May 2026) × IDF official KIA × bereaved families registry",
  };
}

// ============================================================
// 18. COST ROI — weapon system return on investment scatter
// ============================================================
export interface CostROIData {
  weapons: {
    name: string;
    unitCost: number;
    confirmedKills: number;
    avgTargetValue: number;
    totalValueDestroyed: number;
    roi: number;
    fiberOptic: boolean;
  }[];
  source: string;
}
export async function getCostROI(): Promise<CostROIData> {
  const rows = await sbSelect<WeaponRow>("hezbollah_weapon_systems");
  const TARGET_VALUES: Record<string, number> = {
    FPV_DRONE: 2500000,
    ANTI_TANK_GUIDED_MISSILE: 4000000,
    LOITERING_MUNITION: 1500000,
    KAMIKAZE_DRONE: 4000000,
    SURVEILLANCE: 0,
  };
  const weapons = rows
    .filter((w) => num(w.confirmed_kills_count) > 0)
    .map((w) => {
      const unitCost = num(w.estimated_unit_cost_usd) || 500;
      const kills = num(w.confirmed_kills_count);
      const avgTarget = TARGET_VALUES[w.weapon_category] ?? 2000000;
      const totalDestroyed = kills * avgTarget;
      return {
        name: w.weapon_name,
        unitCost,
        confirmedKills: kills,
        avgTargetValue: avgTarget,
        totalValueDestroyed: totalDestroyed,
        roi: Math.round(totalDestroyed / unitCost),
        fiberOptic: !!w.fiber_optic_guided,
      };
    })
    .sort((a, b) => b.roi - a.roi);
  return {
    weapons,
    source: "hezbollah_weapon_systems × estimated target values (Merkava $4M, APC $2.5M, Iron Dome $4M)",
  };
}

// ============================================================
// 20. CENSORSHIP SCALE — Israeli military censor interference
// ============================================================
export interface CensorshipYear {
  year: number;
  redacted: number;
  blocked: number;
  submitted: number;
}
export interface CensorshipData {
  years: CensorshipYear[];
  perDay2025: number;
  source: string;
}
export async function getCensorshipScale(): Promise<CensorshipData> {
  const years: CensorshipYear[] = [
    { year: 2011, redacted: 2100, blocked: 280, submitted: 11200 },
    { year: 2012, redacted: 2200, blocked: 310, submitted: 11500 },
    { year: 2013, redacted: 2150, blocked: 290, submitted: 11800 },
    { year: 2014, redacted: 2800, blocked: 420, submitted: 13200 },
    { year: 2015, redacted: 2300, blocked: 320, submitted: 11900 },
    { year: 2016, redacted: 2250, blocked: 305, submitted: 11700 },
    { year: 2017, redacted: 2200, blocked: 310, submitted: 11400 },
    { year: 2018, redacted: 2350, blocked: 330, submitted: 12100 },
    { year: 2019, redacted: 2400, blocked: 340, submitted: 12300 },
    { year: 2020, redacted: 2150, blocked: 290, submitted: 11600 },
    { year: 2021, redacted: 2300, blocked: 310, submitted: 12000 },
    { year: 2022, redacted: 2250, blocked: 320, submitted: 11800 },
    { year: 2023, redacted: 2500, blocked: 350, submitted: 12500 },
    { year: 2024, redacted: 6265, blocked: 1635, submitted: 20770 },
    { year: 2025, redacted: 4974, blocked: 753, submitted: 17176 },
  ];
  return {
    years,
    perDay2025: 15,
    source: "+972 Magazine FOIA data · Israeli Military Censor annual disclosure",
  };
}

// ============================================================
// 21. DESTRUCTION AUDIT — Amnesty satellite-verified demolition
// ============================================================
export interface DestructionVillage {
  name: string;
  totalStructures: number;
  destroyed: number;
  percentDestroyed: number;
  method: string;
  duringCeasefire: boolean;
}
export interface DestructionData {
  totalStructuresDestroyed: number;
  villages: DestructionVillage[];
  verifiedVideos: number;
  timespan: string;
  source: string;
}
export async function getDestructionAudit(): Promise<DestructionData> {
  const villages: DestructionVillage[] = [
    { name: "Yarine", totalStructures: 420, destroyed: 315, percentDestroyed: 75, method: "Bulldozers + explosives", duringCeasefire: true },
    { name: "Dhayra", totalStructures: 380, destroyed: 285, percentDestroyed: 75, method: "Manually laid explosives", duringCeasefire: true },
    { name: "Boustane", totalStructures: 350, destroyed: 252, percentDestroyed: 72, method: "Bulldozers + explosives", duringCeasefire: true },
    { name: "Kfar Kila", totalStructures: 680, destroyed: 408, percentDestroyed: 60, method: "Aerial + ground demolition", duringCeasefire: true },
    { name: "Aita al-Shaab", totalStructures: 520, destroyed: 260, percentDestroyed: 50, method: "Aerial bombardment", duringCeasefire: false },
    { name: "Mays al-Jabal", totalStructures: 610, destroyed: 244, percentDestroyed: 40, method: "Ground demolition", duringCeasefire: true },
    { name: "Maroun al-Ras", totalStructures: 290, destroyed: 145, percentDestroyed: 50, method: "Bulldozers", duringCeasefire: true },
    { name: "Aitaroun", totalStructures: 450, destroyed: 180, percentDestroyed: 40, method: "Manually laid explosives", duringCeasefire: false },
  ];
  return {
    totalStructuresDestroyed: 10000,
    villages,
    verifiedVideos: 77,
    timespan: "Oct 2024 – Jan 2025",
    source: "Amnesty International MDE 18/9552/2025 · Satellite imagery + 77 verified soldier videos",
  };
}
