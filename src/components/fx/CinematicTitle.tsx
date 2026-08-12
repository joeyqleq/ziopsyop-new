"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CinematicTitleProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  /** fire animation on mount instead of whileInView (use for above-fold headers) */
  animateOnMount?: boolean;
}

export function CinematicTitle({
  text,
  className,
  as = "h2",
  delay = 0,
  animateOnMount = false,
}: CinematicTitleProps) {
  const MotionTag = motion[as];
  const letters = text.split("");

  const seed = (i: number, m: number) =>
    (((i + 1) * 9301 + 49297) % 233280) / 233280 * m;

  const animProps = animateOnMount
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.4 } };

  return (
    <MotionTag
      className={cn("inline-block", className)}
      aria-label={text}
      {...animProps}
    >
      {letters.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className={cn("inline-block will-change-transform", ch === "O" && "brand-zero")}
          variants={{
            hidden: {
              opacity: 0,
              y: 14 + seed(i, 18),
              rotate: seed(i, 7) - 3.5,
              filter: "blur(4px)",
            },
            show: {
              opacity: 1,
              y: 0,
              rotate: 0,
              filter: "blur(0px)",
              transition: {
                delay: delay + i * 0.022 + seed(i, 0.05),
                duration: 0.42 + seed(i, 0.16),
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {ch === " " ? " " : ch === "O" ? "0" : ch}
        </motion.span>
      ))}
    </MotionTag>
  );
}
