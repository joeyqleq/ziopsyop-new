"use client";

import { motion } from "framer-motion";
import { CinematicTitle } from "@/components/fx/CinematicTitle";
import { DecryptText } from "@/components/fx/DecryptText";
import { cn } from "@/lib/utils";

export function PageIntro({
  marker,
  title,
  systemLine,
  description,
  accent = "var(--primary)",
  align = "center",
  className,
}: {
  marker: string;
  title: string;
  systemLine?: string;
  description: React.ReactNode;
  accent?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative pb-9",
        centered ? "text-center" : "text-left",
        className,
      )}
    >
      <div
        className={cn(
          "mb-5 flex items-center gap-3 font-mono text-[9px] tracking-[0.3em]",
          centered && "justify-center",
        )}
        style={{ color: accent }}
      >
        <span className="h-px w-9" style={{ backgroundColor: accent }} aria-hidden="true" />
        <DecryptText text={marker} speed={40} scrambleCycles={1} startOnView={false} brandUppercaseO />
        <span className="h-px w-9 opacity-40" style={{ backgroundColor: accent }} aria-hidden="true" />
      </div>

      <CinematicTitle
        as="h1"
        text={title}
        animateOnMount
        className="max-w-5xl text-balance font-sans text-[clamp(2.45rem,7vw,5.6rem)] font-black uppercase leading-[0.88] tracking-[-0.035em] text-foreground"
      />

      {systemLine && (
        <p className="mt-5 font-mono text-[10px] tracking-[0.22em] text-muted-2 md:text-[11px]">
          <DecryptText text={systemLine} speed={42} scrambleCycles={1} delay={300} brandUppercaseO />
        </p>
      )}

      <div
        className={cn(
          "mt-5 max-w-3xl text-pretty text-sm leading-relaxed text-muted md:text-base",
          centered && "mx-auto",
        )}
      >
        {description}
      </div>
    </motion.header>
  );
}
