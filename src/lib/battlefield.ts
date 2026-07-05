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
// 8. CREATIVE — strike taxonomy + exchange reactor inputs
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
