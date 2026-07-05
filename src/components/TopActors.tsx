"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SegToggle } from "@/components/fx/ChartFrame";

interface Author {
  author: string;
  flair?: string;
  posts: number;
  comments: number;
  total: number;
}

interface Props {
  data: Author[];
}

type Sort = "total" | "posts" | "comments";

function flairColor(flair?: string) {
  const f = (flair || "").toLowerCase();
  if (f.includes("israel")) return "border-threat/40 text-threat bg-threat/10";
  if (f.includes("leban")) return "border-primary/40 text-primary bg-primary/10";
  if (f.includes("jew") || f.includes("diaspora")) return "border-archive/40 text-archive bg-archive/10";
  return "border-borderc text-muted bg-black/30";
}

export function TopActors({ data }: Props) {
  const [sort, setSort] = useState<Sort>("total");

  const sorted = useMemo(
    () => [...data].sort((a, b) => b[sort] - a[sort]).slice(0, 20),
    [data, sort]
  );
  const max = sorted[0]?.[sort] || 1;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <SegToggle<Sort>
          options={[
            { value: "total", label: "Total" },
            { value: "posts", label: "Posts" },
            { value: "comments", label: "Comments" },
          ]}
          value={sort}
          onChange={setSort}
        />
      </div>
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
        {sorted.map((author, i) => (
          <motion.div
            key={author.author}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025, duration: 0.35 }}
            className="group flex items-center gap-3 px-3 py-2 rounded-md border border-borderc bg-black/25 hover:border-primary/30 hover:bg-black/40 transition-colors"
          >
            <span className="font-mono text-[10px] text-muted-2 w-6 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-foreground truncate">
                  u/{author.author}
                </span>
                {author.flair && (
                  <span
                    className={`font-mono text-[9px] tracking-[0.08em] px-1.5 py-px rounded-[3px] border ${flairColor(author.flair)}`}
                  >
                    {author.flair}
                  </span>
                )}
              </div>
              <div className="mt-1.5 h-1 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary/70 group-hover:bg-primary transition-colors"
                  initial={{ width: 0 }}
                  animate={{ width: `${(author[sort] / max) * 100}%` }}
                  transition={{ delay: i * 0.025 + 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-xs text-primary tabular-nums">
                {author[sort].toLocaleString()}
              </span>
              <span className="block font-mono text-[9px] text-muted-2 tabular-nums">
                {author.posts}p / {author.comments}c
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
