"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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

  // For mount-based animation, drive the variant with state
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (animateOnMount) setMounted(true); }, [animateOnMount]);

  const animProps = animateOnMount
    ? { initial: "hidden", animate: mounted ? "show" : "hidden" }
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
          className="inline-block will-change-transform"
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
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </MotionTag>
  );
}
