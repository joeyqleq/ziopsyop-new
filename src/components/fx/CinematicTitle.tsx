"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CinematicTitleProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
}

/**
 * Per-letter cinematic entrance. Every letter gets its own micro-detail:
 * a deterministic pseudo-random y-offset, rotation, blur and timing skew —
 * so the word assembles like debris locking into place, never uniformly.
 */
export function CinematicTitle({
  text,
  className,
  as = "h2",
  delay = 0,
}: CinematicTitleProps) {
  const MotionTag = motion[as];
  const letters = text.split("");

  // deterministic per-letter variance (no hydration mismatch)
  const seed = (i: number, m: number) =>
    (((i + 1) * 9301 + 49297) % 233280) / 233280 * m;

  return (
    <MotionTag
      className={cn("inline-block", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      aria-label={text}
    >
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="inline-block will-change-transform"
          variants={{
            hidden: {
              opacity: 0,
              y: 18 + seed(i, 26),
              rotate: seed(i, 10) - 5,
              filter: "blur(6px)",
            },
            show: {
              opacity: 1,
              y: 0,
              rotate: 0,
              filter: "blur(0px)",
              transition: {
                delay: delay + i * 0.035 + seed(i, 0.08),
                duration: 0.55 + seed(i, 0.25),
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </MotionTag>
  );
}
