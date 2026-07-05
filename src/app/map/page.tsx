"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { ChartFrame, SegToggle } from "@/components/fx/ChartFrame";
import { TracedCard } from "@/components/fx/TracedCard";
import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { DecryptText } from "@/components/fx/DecryptText";

const AttackMap = dynamic(
  () => import("@/components/viz/AttackMap").then((m) => m.AttackMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center">
        <p className="font-mono text-xs tracking-[0.3em] text-primary caret">
          LOADING GEOSPATIAL INTELLIGENCE
        </p>
      </div>
    ),
  }
);

interface MapEvent {
  event_id: string;
  date: string;
  attacker: string;
  attack_type: string;
  target_category: string;
  location: {
    name: string;
    lat: number;
    lon: number;
    governorate: string;
    accuracy: string;
  };
  casualties: { killed_total: number; wounded_total: number };
  ihl_classification: string;
  description?: string;
  source_urls: string[];
}

type AttackerFilter = "all" | "IDF" | "Hezbollah" | "UNIFIL";
type SeverityFilter = "all" | "high" | "medium" | "low";
type IhlFilter = "all" | "violation" | "compliant";

function severityOf(e: MapEvent) {
  const k = e.casualties.killed_total;
  if (k >= 5) return "high";
  if (k >= 1) return "medium";
  return "low";
}

export default function MapPage() {
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [attacker, setAttacker] = useState<AttackerFilter>("all");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [ihl, setIhl] = useState<IhlFilter>("all");

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (attacker !== "all" && e.attacker !== attacker) return false;
      if (severity !== "all" && severityOf(e) !== severity) return false;
      if (ihl === "violation" && !e.ihl_classification.includes("violation"))
        return false;
      if (ihl === "compliant" && !e.ihl_classification.includes("compliant"))
        return false;
      return true;
    });
  }, [events, attacker, severity, ihl]);

  const stats = useMemo(() => {
    const killed = filtered.reduce((s, e) => s + e.casualties.killed_total, 0);
    const wounded = filtered.reduce((s, e) => s + e.casualties.wounded_total, 0);
    const violations = filtered.filter((e) =>
      e.ihl_classification.includes("violation")
    ).length;
    const civilian = filtered.filter((e) =>
      e.target_category.startsWith("civilian")
    ).length;
    return { count: filtered.length, killed, wounded, violations, civilian };
  }, [filtered]);

  return (
    <PageShell backdrop="warp">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-10">
        <header className="text-center pb-8">
          <p className="font-mono text-[10px] tracking-[0.5em] text-primary mb-3">
            <DecryptText text="//  SECTION 03 — KINETIC GROUND TRUTH" speed={28} />
          </p>
          <CinematicTitle
            as="h1"
            text="ATTACK MAP"
            className="font-mono font-bold text-[clamp(1.8rem,6vw,3.4rem)] leading-none tracking-[0.08em] text-foreground"
          />
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted leading-relaxed text-balance">
            Every documented military action in Lebanon, January 2024 — June
            2026. This is the physical reality the influence operation exists to
            reframe. Filter by actor, severity and IHL classification to
            interrogate the record yourself.
          </p>
        </header>

        {/* live ledger of filtered selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Incidents", value: stats.count, cls: "text-primary", color: "var(--primary)" },
            { label: "Killed", value: stats.killed, cls: "text-threat", color: "var(--threat)" },
            { label: "Wounded", value: stats.wounded, cls: "text-archive", color: "var(--archive)" },
            { label: "IHL Violations", value: stats.violations, cls: "text-threat", color: "var(--threat)" },
            { label: "Civilian Targets", value: stats.civilian, cls: "text-viz-blue", color: "var(--viz-blue)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <TracedCard traceColor={s.color} className="p-3.5 text-center h-full">
                <p className={`font-mono text-lg md:text-xl font-bold tabular-nums ${s.cls}`}>
                  {s.value.toLocaleString()}
                </p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-muted uppercase mt-1">
                  {s.label}
                </p>
              </TracedCard>
            </motion.div>
          ))}
        </div>

        <ChartFrame
          exhibit="EX-17"
          title="GEOSPATIAL INCIDENT RECORD"
          subtitle="Marker shape encodes incident type; pulse intensity encodes casualty weight. Click any marker for the full sourced record."
          accent="var(--threat)"
          classification="GEOLOCATED"
          controls={
            <div className="flex flex-wrap gap-2 justify-end">
              <SegToggle<AttackerFilter>
                options={[
                  { value: "all", label: "All actors" },
                  { value: "IDF", label: "IDF" },
                  { value: "Hezbollah", label: "HZB" },
                  { value: "UNIFIL", label: "UNIFIL" },
                ]}
                value={attacker}
                onChange={setAttacker}
              />
              <SegToggle<SeverityFilter>
                options={[
                  { value: "all", label: "Any severity" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Med" },
                  { value: "low", label: "Low" },
                ]}
                value={severity}
                onChange={setSeverity}
                threat
              />
              <SegToggle<IhlFilter>
                options={[
                  { value: "all", label: "All IHL" },
                  { value: "violation", label: "Violations" },
                  { value: "compliant", label: "Compliant" },
                ]}
                value={ihl}
                onChange={setIhl}
              />
            </div>
          }
          commentary={{
            reads:
              "Geolocated military incidents with attacker, target category, casualties and an International Humanitarian Law assessment for each strike.",
            means:
              "Filter to civilian target categories and the geography speaks: residential quarters, hospitals, ambulances, journalists, water infrastructure. The violation density maps onto population centers, not military positions.",
            puzzle:
              "This map is why the operation on the other pages exists. A conversation that stayed honest about these coordinates could never sell 'dialogue'. The data the subreddit suppresses is the data you are looking at.",
          }}
        >
          <AttackMap events={filtered} />

          {/* legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
            <Legend color="#ff4d5e" shape="circle" label="IDF strike on civilians" />
            <Legend color="#e8b44c" shape="triangle" label="IDF strike on military" />
            <Legend color="#5b9bff" shape="diamond" label="UNIFIL incident" />
            <Legend color="#3ee6c1" shape="star" label="Hezbollah launch" />
            <Legend color="#a78bfa" shape="x" label="Assassination" />
            <Legend color="#8a8f98" shape="square" label="LAF / unattributed" />
          </div>
        </ChartFrame>

        {/* incident docket */}
        <div className="mt-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-mono text-sm font-bold tracking-[0.15em] text-foreground uppercase">
              Incident Docket
            </h2>
            <p className="font-mono text-[10px] tracking-[0.15em] text-muted-2">
              {filtered.length} RECORDS IN CURRENT VIEW
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, 12).map((e, i) => (
              <motion.div
                key={e.event_id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: (i % 3) * 0.06, duration: 0.4 }}
              >
                <TracedCard
                  traceColor={
                    e.ihl_classification.includes("violation")
                      ? "var(--threat)"
                      : "var(--primary)"
                  }
                  className="p-4 h-full"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[9px] tracking-[0.2em] text-muted-2">
                      {e.event_id}
                    </span>
                    <span
                      className={`stamp ${
                        e.ihl_classification.includes("violation")
                          ? "text-threat"
                          : "text-primary"
                      }`}
                    >
                      {e.ihl_classification.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-archive mb-1">
                    {e.date} — {e.location.name}
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    {e.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-muted-2">
                    <span>
                      <span className="text-threat">{e.casualties.killed_total}</span> killed
                    </span>
                    <span>
                      <span className="text-archive">{e.casualties.wounded_total}</span> wounded
                    </span>
                    <span className="ml-auto uppercase">{e.attacker}</span>
                  </div>
                </TracedCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Legend({
  color,
  shape,
  label,
}: {
  color: string;
  shape: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.06em] text-muted">
      <span
        className="w-2.5 h-2.5 inline-block shrink-0"
        style={{
          backgroundColor: color,
          borderRadius:
            shape === "circle" ? "50%" : shape === "diamond" ? "2px" : "1px",
          transform: shape === "diamond" ? "rotate(45deg) scale(0.85)" : "none",
        }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
