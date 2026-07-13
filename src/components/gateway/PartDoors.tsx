"use client";

import Link from "next/link";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { useState, useEffect } from "react";
import { TracedCard } from "@/components/fx/TracedCard";

interface Door {
  numeral: string;
  href: string;
  name: string;
  subtitle: string;
  thesis: string;
  manufactures: string;
  stats: { value: string; label: string }[];
  accentVar: string;
  accentHex: string;
  accentText: string;
  status: string;
}

const DOORS: Door[] = [
  {
    numeral: "I",
    href: "/part-i",
    name: "THE MANUFACTURED FRIEND",
    subtitle: "THE SUBREDDIT OPERATION",
    thesis:
      "A fake grassroots friendship on Reddit, engineered to soften Lebanese sentiment while a war is prosecuted.",
    manufactures: "MANUFACTURES CONSENT",
    stats: [
      { value: "93,247", label: "ARTIFACTS ANALYZED" },
      { value: "3:1", label: "ISRAELI–LEBANESE RATIO" },
    ],
    accentVar: "var(--primary)",
    accentHex: "#3ee6c1",
    accentText: "text-primary",
    status: "NARRATIVE FORENSICS",
  },
  {
    numeral: "II",
    href: "/battlefield",
    name: "THE MOST MORAL ARMY",
    subtitle: "THE BATTLEFIELD LEDGER",
    thesis:
      "The claim that Hezbollah are the terrorists and the IDF the most moral army — measured against the documented record of the war.",
    manufactures: "MANUFACTURES MORAL LICENSE",
    stats: [
      { value: "15,000:1", label: "COST ASYMMETRY" },
      { value: "665", label: "DOCUMENTED STRIKES" },
    ],
    accentVar: "var(--accent-yellow)",
    accentHex: "#ffd23f",
    accentText: "text-accent-yellow",
    status: "BATTLEFIELD FORENSICS",
  },
  {
    numeral: "III",
    href: "/media-war",
    name: "THE MANUFACTURED REALITY",
    subtitle: "THE MEDIA BATTLEFIELD",
    thesis:
      "Channel 14 tells Israel what to believe. Al-Manar documents what actually happened. This is the forensic comparison — lie by lie, day by day.",
    manufactures: "MANUFACTURES PERMISSION",
    stats: [
      { value: "3", label: "MEDIA ARMS ANALYZED" },
      { value: "2023–2026", label: "PERIOD COVERED" },
    ],
    accentVar: "var(--threat)",
    accentHex: "#ff4d5e",
    accentText: "text-threat",
    status: "NARRATIVE FORENSICS",
  },
];

const EVERVAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=|<>?!~";

function generateRandomString(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += EVERVAULT_CHARS.charAt(
      Math.floor(Math.random() * EVERVAULT_CHARS.length)
    );
  }
  return result;
}

function EvervaultOverlay({ accentColor }: { accentColor: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Start empty to avoid SSR/client hydration mismatch — populated client-side only
  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    setRandomString(generateRandomString(1500));
  }, []);

  const maskImage = useMotionTemplate`radial-gradient(220px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    setRandomString(generateRandomString(1500));
  }

  return (
    <div
      className="absolute inset-0 z-[0] rounded-[inherit] overflow-hidden"
      onMouseMove={onMouseMove}
    >
      {/* radial color wash — visible everywhere the mask reveals */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover/door:opacity-100 transition-opacity duration-500"
        style={{
          ...style,
          background: `radial-gradient(220px circle, ${accentColor}28, transparent)`,
        }}
      />
      {/* scrambling characters layer.
          Uses mix-blend-screen so it composites additively on the dark bg
          but remains visible behind semi-transparent stat boxes too. */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover/door:opacity-100 mix-blend-screen transition-opacity duration-500"
        style={style}
      >
        <p
          className="absolute inset-x-0 inset-y-0 text-[11px] leading-[1.1] break-words whitespace-pre-wrap font-mono select-none overflow-hidden"
          style={{ color: accentColor, opacity: 0.45 }}
        >
          {randomString}
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Two co-equal doors. Identical footprint, mirrored accents — neither part
 * is subordinate. This is the structural heart of the "two operations, one
 * machine" thesis.
 */
export function PartDoors() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24"
      aria-label="The two operations"
    >
      <div className="text-center mb-10">
        <p className="font-mono text-[10px] tracking-[0.5em] text-muted-2">
          SELECT AN OPERATION
        </p>
        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-muted">
          THREE FRONTS · ONE MACHINE · EQUAL WEIGHT
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {DOORS.map((door, i) => (
          <motion.div
            key={door.href}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
          >
            <Link href={door.href} className="group group/door block h-full">
              <TracedCard
                traceColor={door.accentVar}
                className="relative flex h-full flex-col p-7 md:p-9 transition-transform duration-300 group-hover:-translate-y-1"
              >
                <EvervaultOverlay accentColor={door.accentHex} />

                {/* numeral watermark */}
                <span
                  className="pointer-events-none absolute right-5 top-3 z-[1] select-none font-mono font-bold leading-none opacity-[0.09] text-[7rem] md:text-[9rem]"
                  style={{ color: door.accentVar }}
                  aria-hidden="true"
                >
                  {door.numeral}
                </span>

                <div className="relative z-[2] flex flex-1 flex-col">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-bold tracking-[0.3em] ${door.accentText}`}
                    >
                      PART {door.numeral}
                    </span>
                    <span className="h-px flex-1 bg-borderc" />
                    <span className="font-mono text-[9px] tracking-[0.25em] text-muted-2">
                      {door.status}
                    </span>
                  </div>

                  <h2 className="mt-5 font-mono text-xl md:text-2xl font-bold tracking-[0.04em] text-foreground text-balance">
                    {door.name}
                  </h2>
                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.28em] text-muted-2">
                    {door.subtitle}
                  </p>

                  <p className="mt-4 text-sm text-muted leading-relaxed text-pretty">
                    {door.thesis}
                  </p>

                  <p
                    className={`mt-4 font-mono text-[10px] tracking-[0.25em] ${door.accentText}`}
                  >
                    ▸ {door.manufactures}
                  </p>

                  {/* signature stats */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {door.stats.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-md border border-borderc bg-black/30 px-3 py-2.5"
                      >
                        <p
                          className={`font-mono text-lg md:text-xl font-bold tabular-nums ${door.accentText}`}
                        >
                          {s.value}
                        </p>
                        <p className="mt-0.5 font-mono text-[8px] tracking-[0.18em] text-muted-2">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-7">
                    <span
                      className={`inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] ${door.accentText}`}
                    >
                      ENTER PART {door.numeral}
                      <span className="transition-transform group-hover:translate-x-1.5">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </TracedCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* the connective tissue */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted leading-relaxed text-pretty"
      >
        One broadcasts the friendship that never existed. One sanctifies
        the violence that friendship was built to hide. One manufactures the
        reality that permits both.{" "}
        <span className="text-foreground">
          No single operation works without the others.
        </span>
      </motion.p>
    </section>
  );
}
