"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TracedCard } from "@/components/fx/TracedCard";

interface Props {
  overview: {
    posts: number;
    comments: number;
    hebrew_posts: number;
    hebrew_comments: number;
    downloaded_user_histories: number;
  };
}

/** Animated count-up that ticks like an odometer being decrypted. */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1400;
    const start = performance.now();
    let raf: number;
    const step = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsOverview({ overview }: Props) {
  const stats = [
    {
      label: "Total Posts",
      value: overview.posts,
      color: "var(--primary)",
      cls: "text-primary",
    },
    {
      label: "Total Comments",
      value: overview.comments,
      color: "var(--viz-blue)",
      cls: "text-viz-blue",
    },
    {
      label: "Hebrew Artifacts",
      value: overview.hebrew_posts + overview.hebrew_comments,
      color: "var(--archive)",
      cls: "text-archive",
    },
    {
      label: "Tracked Actors",
      value: overview.downloaded_user_histories,
      color: "var(--threat)",
      cls: "text-threat",
    },
    {
      label: "Months Analyzed",
      value: 79,
      color: "var(--viz-violet)",
      cls: "text-viz-violet",
    },
    {
      label: "Data Points",
      value: 93247,
      color: "var(--primary)",
      cls: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.5 }}
        >
          <TracedCard
            traceColor={stat.color}
            className="p-4 text-center h-full"
          >
            <p className={`text-xl md:text-2xl font-bold font-mono ${stat.cls}`}>
              <CountUp target={stat.value} />
            </p>
            <p className="font-mono text-[9px] text-muted uppercase tracking-[0.2em] mt-1.5">
              {stat.label}
            </p>
          </TracedCard>
        </motion.div>
      ))}
    </div>
  );
}
