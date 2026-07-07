"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CanvasRevealEffect } from "@/components/fx/CanvasRevealEffect";

interface SubEntry { sub: string; count: number; }
interface DormancyGap { days: number; from: string; to: string; }
interface FbSentiment {
  anti_hezbollah: number;
  pro_lebanon: number;
  pro_israel: number;
  sample_comments: Array<{ text: string; score: number; date: string | null }>;
}
interface UserNode {
  username: string;
  role: string;
  contradiction_score: number;
  conflict_pct: number;
  fb_pct: number;
  israel_hours_pct: number;
  age_days: number;
  first_seen: string | null;
  last_seen: string | null;
  total_comments: number;
  total_posts: number;
  lang: Record<string, number>;
  top_subreddits: SubEntry[];
  dormancy_gaps: DormancyGap[];
  fb_sentiment: FbSentiment;
}
interface Props { users: UserNode[]; }

const ROLE_META: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  EMBEDDED_OPERATIVE:  { label: "EMBEDDED OPERATIVE",  color: "#ff4d5e", bgColor: "rgba(255,77,94,0.08)",   borderColor: "rgba(255,77,94,0.35)" },
  CONFLICT_SPECIALIST: { label: "CONFLICT SPECIALIST", color: "#e8b44c", bgColor: "rgba(232,180,76,0.08)",  borderColor: "rgba(232,180,76,0.35)" },
  HEBREW_SPEAKER:      { label: "HEBREW SPEAKER",      color: "#7b39d0", bgColor: "rgba(123,57,208,0.08)",  borderColor: "rgba(123,57,208,0.35)" },
  VETERAN_ACTOR:       { label: "VETERAN ACTOR",       color: "#5b9bff", bgColor: "rgba(91,155,255,0.08)",  borderColor: "rgba(91,155,255,0.35)" },
  PARTICIPANT:         { label: "PARTICIPANT",          color: "#8a8f98", bgColor: "rgba(138,143,152,0.06)", borderColor: "rgba(138,143,152,0.2)"  },
};

const CANVAS_COLORS: Record<string, number[][]> = {
  EMBEDDED_OPERATIVE:  [[255, 77, 94]],
  CONFLICT_SPECIALIST: [[232, 180, 76]],
  HEBREW_SPEAKER:      [[123, 57, 208]],
  VETERAN_ACTOR:       [[91, 155, 255]],
  PARTICIPANT:         [[138, 143, 152]],
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1 w-full bg-surface-2 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }}
      />
    </div>
  );
}

function DossierCard({ user }: { user: UserNode }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const meta = ROLE_META[user.role] || ROLE_META.PARTICIPANT;
  const canvasColors = CANVAS_COLORS[user.role] || [[138, 143, 152]];

  const hebrewPct = user.lang?.hebrew || 0;
  const arabicPct = user.lang?.arabic || 0;

  const topSub = user.top_subreddits[0];
  const fbSentiment = user.fb_sentiment;
  const totalSentiment = (fbSentiment?.anti_hezbollah || 0) + (fbSentiment?.pro_lebanon || 0) + (fbSentiment?.pro_israel || 0) || 1;

  return (
    <motion.div
      layout
      className="relative rounded-lg border overflow-hidden cursor-pointer group"
      style={{ borderColor: meta.borderColor, background: meta.bgColor }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* canvas reveal on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-0"
          >
            <CanvasRevealEffect
              colors={canvasColors}
              animationSpeed={0.6}
              dotSize={2}
              opacities={[0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7]}
              showGradient={false}
              containerClassName="opacity-30"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-4">
        {/* header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
              <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: meta.color }}>
                {meta.label}
              </span>
            </div>
            <h3 className="font-mono text-sm font-bold text-foreground">
              u/{user.username}
            </h3>
            <p className="font-mono text-[10px] text-muted-2 mt-0.5">
              {user.first_seen} → {user.last_seen} · {user.age_days}d
            </p>
          </div>
          {/* contradiction badge */}
          <div
            className="shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: user.contradiction_score > 50 ? "#ff4d5e" : user.contradiction_score > 25 ? "#e8b44c" : "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="font-mono text-[11px] font-bold tabular-nums"
              style={{ color: user.contradiction_score > 50 ? "#ff4d5e" : user.contradiction_score > 25 ? "#e8b44c" : "#8a8f98" }}
            >
              {user.contradiction_score}
            </span>
          </div>
        </div>

        {/* stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "COMMENTS", val: user.total_comments.toLocaleString() },
            { label: "CONFLICT%", val: `${user.conflict_pct}%` },
            { label: "IL HRS%", val: `${user.israel_hours_pct}%` },
          ].map(({ label, val }) => (
            <div key={label} className="bg-black/30 rounded p-1.5 text-center">
              <p className="font-mono text-[8px] text-muted-2">{label}</p>
              <p className="font-mono text-[12px] font-bold text-foreground">{val}</p>
            </div>
          ))}
        </div>

        {/* concentration bars */}
        <div className="space-y-2 mb-3">
          <div>
            <div className="flex justify-between font-mono text-[9px] text-muted-2 mb-0.5">
              <span>conflict concentration</span>
              <span style={{ color: meta.color }}>{user.conflict_pct}%</span>
            </div>
            <MiniBar value={user.conflict_pct} max={100} color={meta.color} />
          </div>
          {hebrewPct > 0.5 && (
            <div>
              <div className="flex justify-between font-mono text-[9px] text-muted-2 mb-0.5">
                <span>hebrew content</span>
                <span className="text-eye-purple">{hebrewPct}%</span>
              </div>
              <MiniBar value={hebrewPct} max={30} color="#7b39d0" />
            </div>
          )}
        </div>

        {/* top sub */}
        {topSub && (
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-muted-2">top sub:</span>
            <span className="text-foreground">r/{topSub.sub}</span>
            <span className="text-muted-2 ml-auto">{topSub.count.toLocaleString()}</span>
          </div>
        )}

        {/* dormancy flags */}
        {user.dormancy_gaps.length > 0 && user.dormancy_gaps[0].days > 180 && (
          <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] text-archive">
            <span>⚠</span>
            <span>{user.dormancy_gaps[0].days}d dormancy gap → {user.dormancy_gaps[0].to}</span>
          </div>
        )}

        {/* expand chevron */}
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-[9px] text-muted-2">
            {expanded ? "▲ collapse" : "▼ expand dossier"}
          </span>
          <span className="font-mono text-[9px]" style={{ color: meta.color }}>
            contra: {user.contradiction_score}/100
          </span>
        </div>
      </div>

      {/* expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 overflow-hidden"
          >
            <div className="px-4 pb-4 border-t pt-3" style={{ borderColor: meta.borderColor }}>

              {/* sentiment breakdown */}
              {fbSentiment && (
                <div className="mb-3">
                  <p className="font-mono text-[9px] text-muted-2 mb-1.5 tracking-[0.2em]">FB SENTIMENT PROFILE</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "anti-hezbollah", val: fbSentiment.anti_hezbollah, color: "#ff4d5e" },
                      { label: "pro-lebanon", val: fbSentiment.pro_lebanon, color: "#b6ff7c" },
                      { label: "pro-israel", val: fbSentiment.pro_israel, color: "#5b9bff" },
                    ].map(({ label, val, color }) => (
                      <div key={label}>
                        <div className="flex justify-between font-mono text-[9px] mb-0.5">
                          <span className="text-muted">{label}</span>
                          <span style={{ color }}>{val}</span>
                        </div>
                        <MiniBar value={val} max={totalSentiment} color={color} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* language breakdown */}
              <div className="mb-3">
                <p className="font-mono text-[9px] text-muted-2 mb-1.5 tracking-[0.2em]">LANGUAGE PROFILE</p>
                <div className="flex gap-3 font-mono text-[10px]">
                  <span className="text-muted">EN: <span className="text-foreground">{user.lang?.english?.toFixed(0) || 0}%</span></span>
                  {hebrewPct > 0 && <span className="text-muted">HE: <span className="text-eye-purple">{hebrewPct}%</span></span>}
                  {arabicPct > 0 && <span className="text-muted">AR: <span className="text-archive">{arabicPct}%</span></span>}
                </div>
              </div>

              {/* dormancy timeline */}
              {user.dormancy_gaps.length > 0 && (
                <div className="mb-3">
                  <p className="font-mono text-[9px] text-muted-2 mb-1.5 tracking-[0.2em]">DORMANCY GAPS</p>
                  <div className="space-y-1">
                    {user.dormancy_gaps.slice(0, 3).map((g, i) => (
                      <div key={i} className="flex items-center gap-2 font-mono text-[9px]">
                        <span className="text-archive">▸ {g.days}d</span>
                        <span className="text-muted-2">{g.from} → {g.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* sample comment */}
              {fbSentiment?.sample_comments?.[0] && (
                <div>
                  <p className="font-mono text-[9px] text-muted-2 mb-1.5 tracking-[0.2em]">TOP FB COMMENT</p>
                  <blockquote className="border-l-2 pl-2.5 font-mono text-[9px] text-muted leading-relaxed italic" style={{ borderColor: meta.color }}>
                    "{fbSentiment.sample_comments[0].text.slice(0, 280)}{fbSentiment.sample_comments[0].text.length > 280 ? "…" : ""}"
                  </blockquote>
                  <p className="font-mono text-[8px] text-muted-2 mt-1">
                    score: {fbSentiment.sample_comments[0].score} · {fbSentiment.sample_comments[0].date}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function UserDossierGrid({ users }: Props) {
  const [filter, setFilter] = useState<string>("ALL");

  const roles = ["ALL", ...Array.from(new Set(users.map((u) => u.role)))];
  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);
  const sorted = [...filtered].sort((a, b) => b.contradiction_score - a.contradiction_score);

  return (
    <div className="space-y-4">
      {/* filter bar */}
      <div className="flex flex-wrap gap-2">
        {roles.map((r) => {
          const meta = ROLE_META[r];
          return (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className="font-mono text-[9px] px-2.5 py-1 rounded border transition-all"
              style={{
                borderColor: filter === r ? (meta?.color || "#b6ff7c") : "rgba(255,255,255,0.08)",
                color: filter === r ? (meta?.color || "#b6ff7c") : "#565b64",
                background: filter === r ? `${meta?.color || "#b6ff7c"}15` : "transparent",
              }}
            >
              {r === "ALL" ? "ALL SUBJECTS" : r.replace(/_/g, " ")}
              {r !== "ALL" && <span className="ml-1 opacity-60">({users.filter((u) => u.role === r).length})</span>}
            </button>
          );
        })}
      </div>

      {/* grid */}
      <motion.div layout className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {sorted.map((user) => (
            <motion.div
              key={user.username}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <DossierCard user={user} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="font-mono text-[10px] text-muted-2 text-center pt-2">
        hover card to reveal · click to expand full dossier · ring = contradiction score
      </p>
    </div>
  );
}
