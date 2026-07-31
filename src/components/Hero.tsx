"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SpaceBackground } from "@/components/fx/SpaceBackground";
import { DecryptText } from "@/components/fx/DecryptText";
import { GlitchWordmark } from "@/components/fx/GlitchWordmark";
import { AnimatedEye } from "@/components/fx/AnimatedEye";
import type { Transition } from "framer-motion";
import { useBooted } from "@/components/fx/BootContext";

const TICKER_ITEMS = [
  "PART I — 102,610 DATA POINTS INGESTED",
  "PART I — FLAIR RATIO 3:1 — INCONSISTENT WITH STATED PURPOSE",
  "PART I — 2026 NARRATIVE PIVOT DETECTED",
  "PART II — 665 DOCUMENTED STRIKES CATALOGUED",
  "PART II — COST ASYMMETRY 15,000:1",
  "PART II — IHL COMPLIANCE: ONE SIDE IN VIOLATION",
  "PART II — 19 IRON DOME UNITS DESTROYED",
  "PART III — THREE MEDIA STREAMS RECONSTRUCTED",
  "THREE PARTS · ONE INFORMATION APPARATUS",
];

export function Hero() {
  const booted = useBooted();
  const shouldReduceMotion = useReducedMotion() ?? false;

  const EXPO: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.72, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
  const EXPO_FAST: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.58, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <section
      className="relative flex h-svh min-h-[620px] flex-col overflow-hidden"
      data-boot-state={booted ? "signal-acquired" : "standby"}
    >
      {booted ? <SpaceBackground particleCount={360} /> : null}

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-10 text-center sm:px-6 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, filter: "blur(5px)" }}
          animate={
            booted
              ? { opacity: 1, scale: 1, filter: "blur(0px)" }
              : { opacity: 0, scale: 0.94, filter: "blur(5px)" }
          }
          transition={EXPO}
          className="relative mb-3"
        >
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[138%] -translate-x-1/2 -translate-y-1/2 border-x border-primary/15"
            initial={{ opacity: 0, scaleX: 0.35 }}
            animate={booted ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.35 }}
            transition={{ ...EXPO_FAST, delay: shouldReduceMotion ? 0 : 0.08 }}
          />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-primary/20"
            initial={{ opacity: 0, rotate: -12, scale: 0.82 }}
            animate={booted ? { opacity: 1, rotate: 0, scale: 1 } : { opacity: 0, rotate: -12, scale: 0.82 }}
            transition={{ ...EXPO, delay: shouldReduceMotion ? 0 : 0.12 }}
          />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[152%] -translate-x-1/2 bg-primary/35 shadow-[0_0_12px_rgba(62,230,193,0.55)]"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={booted ? { opacity: [0, 0.9, 0.2], scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }
            }
          />
          <span
            aria-hidden="true"
            className="absolute -left-14 top-[34%] hidden font-mono text-[8px] tracking-[0.2em] text-primary/50 sm:block"
          >
            OPTIC // 03
          </span>
          <span
            aria-hidden="true"
            className="absolute -right-16 bottom-[31%] hidden font-mono text-[8px] tracking-[0.2em] text-primary/50 sm:block"
          >
            LOCKED // LIVE
          </span>
          <AnimatedEye size="clamp(9.25rem, 20vw, 12.25rem)" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, filter: "blur(3px)" }}
          animate={booted ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(3px)" }}
          transition={{ ...EXPO_FAST, delay: shouldReduceMotion ? 0 : 0.12 }}
          className="mb-3 font-mono text-[9px] tracking-[0.42em] text-primary sm:text-[10px] md:text-[11px]"
        >
          {booted && <DecryptText text="//  SIGNAL FROM NOISE" speed={34} delay={200} startOnView={false} />}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)", filter: "blur(5px)" }}
          animate={
            booted
              ? { opacity: 1, clipPath: "inset(0 0% 0 0)", filter: "blur(0px)" }
              : { opacity: 0, clipPath: "inset(0 100% 0 0)", filter: "blur(5px)" }
          }
          transition={{ ...EXPO_FAST, delay: shouldReduceMotion ? 0 : 0.2 }}
        >
          <h1 className="sr-only">ZIOPSYOP</h1>
          <GlitchWordmark
            className="font-mono font-bold text-[clamp(2.7rem,10vw,6rem)] leading-none tracking-[0.06em] text-foreground"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
          animate={
            booted
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 10, filter: "blur(3px)" }
          }
          transition={{ ...EXPO_FAST, delay: shouldReduceMotion ? 0 : 0.34 }}
          className="mt-4 max-w-[68ch] text-pretty text-[13px] leading-relaxed text-muted sm:text-sm md:text-base"
        >
          One Zionist information apparatus, exposed through{" "}
          <span className="text-foreground">three connected investigations</span>:
          the manufactured friendship, the manufactured morality, and the
          manufactured reality. The methodology shows how the records were
          assembled and connected. Together, they resolve into one conclusion.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={booted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ ...EXPO_FAST, delay: shouldReduceMotion ? 0 : 0.52 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[9px] tracking-[0.16em] text-muted-2 sm:gap-x-4 sm:text-[10px]"
        >
          <span className="px-2.5 py-1 border border-borderc rounded bg-black/40">
            THREE PARTS
          </span>
          <span className="text-primary/60">/</span>
          <span>2019 — 2026</span>
          <span className="text-primary/60">/</span>
          <span>METHODOLOGY: <span className="text-primary glow-primary">OPEN</span></span>
          <span className="text-primary/60">/</span>
          <span>CASE STATUS: <span className="text-threat glow-threat">ACTIVE</span></span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ ...EXPO_FAST, delay: shouldReduceMotion ? 0 : 0.7 }}
        className="relative border-t border-b border-borderc bg-black/45 backdrop-blur-sm overflow-hidden"
      >
        <div className="ticker-track flex w-max items-center py-2.5">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {TICKER_ITEMS.map((item, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center font-mono text-[10px] tracking-[0.22em] text-muted whitespace-nowrap"
                >
                  <span className="mx-5 text-primary">▮</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : { opacity: 0 }}
        transition={{ ...EXPO_FAST, delay: shouldReduceMotion ? 0 : 0.86 }}
        className="absolute bottom-14 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 pointer-events-none"
        aria-hidden="true"
      >
        <span className="font-mono text-[9px] tracking-[0.4em] text-muted-2">
          ENTER THE RECORD
        </span>
        <motion.span
          animate={
            shouldReduceMotion
              ? { opacity: 0.7 }
              : { y: [0, 5, 0], opacity: [0.3, 1, 0.3] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
          }
          className="text-primary text-xs"
        >
          ▼
        </motion.span>
      </motion.div>
    </section>
  );
}
