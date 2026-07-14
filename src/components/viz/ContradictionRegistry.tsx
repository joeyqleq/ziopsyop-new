"use client";

import { motion } from "framer-motion";
import { TracedCard } from "@/components/fx/TracedCard";

interface ContradictionPair {
  id: string;
  date: string;
  context: string;
  almanar: string;
  ch14: string;
  verdict: string;
  verdictColor: string;
  analysis: string;
}

const PAIRS: ContradictionPair[] = [
  {
    id: "C-001",
    date: "AUG 14, 2024",
    context: "IDF airstrike on Marjayoun, South Lebanon",
    almanar:
      "2 martyrs, 4 injuries in a Zionist air raid on Marjayoun town in South Lebanon — Health Ministry",
    ch14:
      "✅ A short while ago, the IAF struck a Hezbollah military structure in the area of Ayta ash Shab. So far, Israel has eliminated over 666 Hezbollah terrorists, and Hezbollah has killed 12",
    verdict: "CASUALTY ERASURE",
    verdictColor: "#ff4d5e",
    analysis:
      "Same day. Al-Manar records the day's civilian toll: 2 dead, 4 wounded. Channel 14 responds with a cumulative elimination count — reframing a civilian airstrike as a milestone in a kill-ratio narrative.",
  },
  {
    id: "C-002",
    date: "SEP 23, 2024",
    context: "Mass Israeli strikes across Lebanon — single deadliest day of the war",
    almanar:
      "Lebanese Health Ministry: 492 martyrs and 1,645 injuries — including 274 martyrs confirmed, 21 children, 39 women",
    ch14:
      "✅ Hundreds of Hezbullah terrorists killed and nearly a thousand injured in Israeli strikes in Lebanon today. Will Nasrullah leave his tunnel and help his fighters?",
    verdict: "MASS CASUALTY INVERSION",
    verdictColor: "#ff4d5e",
    analysis:
      "The Lebanese Health Ministry — a government body, not a resistance organ — confirmed 492 civilians dead including 21 children and 39 women. Channel 14 labels the same event a terrorist elimination operation and mocks Hezbollah's leader. The dead are not acknowledged.",
  },
  {
    id: "C-003",
    date: "OCT 01, 2024",
    context: "Jaffa stabbing attack — 8 Israeli civilians killed on Israeli soil",
    almanar: "Eight Zionists Dead in Jaffa Shooting, Many More Wounded",
    ch14:
      '✅ ALL IS WELL! IDF Spokesman: "We do not now see other aerial threats from Iran...So we issued instructions to the Israeli populace to leave safety areas."',
    verdict: "REALITY SUPPRESSION",
    verdictColor: "#f59e0b",
    analysis:
      "Al-Manar reports 8 Israelis killed in Jaffa — on Israeli soil. Channel 14's lead that same day: 'ALL IS WELL' quoting the IDF on Iranian aerial threat levels. The attack is not mentioned. The casualties don't exist in Channel 14's record.",
  },
];

function QuoteBlock({
  label,
  text,
  color,
  traceColor,
}: {
  label: string;
  text: string;
  color: string;
  traceColor: string;
}) {
  return (
    <div
      className="rounded border p-3 md:p-4 flex flex-col gap-2 h-full"
      style={{ borderColor: `${traceColor}44`, background: `${traceColor}08` }}
    >
      <p
        className="font-mono text-[8px] tracking-[0.35em] font-bold"
        style={{ color }}
      >
        {label}
      </p>
      <p className="text-xs md:text-sm text-foreground leading-relaxed font-mono flex-1">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

export function ContradictionRegistry() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <TracedCard traceColor="var(--threat)" className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <p className="font-mono text-[9px] tracking-[0.4em] text-threat mb-1">
            // EX-MW-04 — DOCUMENTED CONTRADICTIONS
          </p>
          <p className="font-mono text-sm md:text-base font-bold text-foreground">
            SAME-DAY. SAME-EVENT. OPPOSITE REALITIES.
          </p>
          <p className="mt-2 text-xs text-muted leading-relaxed max-w-2xl">
            Three cases where Al-Manar and Channel 14 reported on the same
            event on the same day — and produced mutually incompatible
            accounts. Flagged{" "}
            <span className="font-mono text-threat">is_contradiction = TRUE</span>{" "}
            in the forensic database.
          </p>
        </div>

        {/* Pairs */}
        <div className="flex flex-col gap-6">
          {PAIRS.map((pair, i) => (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              {/* Pair header row */}
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-[8px] tracking-[0.25em] text-muted-2 border border-borderc px-1.5 py-0.5 rounded">
                    {pair.id}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-muted">
                    {pair.date}
                  </span>
                  <span className="text-xs text-muted-2">{pair.context}</span>
                </div>
                <span
                  className="font-mono text-[9px] tracking-[0.25em] font-bold px-2 py-0.5 rounded border"
                  style={{
                    color: pair.verdictColor,
                    borderColor: `${pair.verdictColor}55`,
                    background: `${pair.verdictColor}12`,
                  }}
                >
                  {pair.verdict}
                </span>
              </div>

              {/* Side-by-side quotes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <QuoteBlock
                  label="AL-MANAR — DOCUMENTED REALITY"
                  text={pair.almanar}
                  color="#b6ff7c"
                  traceColor="#b6ff7c"
                />
                <QuoteBlock
                  label="CHANNEL 14 — OFFICIAL NARRATIVE"
                  text={pair.ch14}
                  color="#ff4d5e"
                  traceColor="#ff4d5e"
                />
              </div>

              {/* Analysis */}
              <p className="mt-3 text-xs text-muted leading-relaxed border-l-2 border-borderc pl-3">
                {pair.analysis}
              </p>

              {/* Divider between pairs */}
              {i < PAIRS.length - 1 && (
                <div className="mt-6 h-px w-full bg-borderc" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-borderc">
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-2 leading-relaxed">
            SOURCE: Cross-referenced Telegram exports — ManarTV-EN (Al-Manar) and
            Channel 14 English Edition. All timestamps UTC. Flagged via SQL
            contradiction detection on{" "}
            <span className="text-threat">media_events.is_contradiction</span>.
            Three pairs confirmed. Registry will expand as detection coverage
            increases.
          </p>
        </div>
      </TracedCard>
    </motion.div>
  );
}
