"use client";
import { useMemo, useState } from "react";

interface UserNode {
  username: string;
  role: string;
  contradiction_score: number;
  conflict_pct: number;
  israel_hours_pct: number;
  fb_pct: number;
  lang: Record<string, number>;
  top_subreddits: Array<{ sub: string; count: number }>;
  dormancy_gaps: Array<{ days: number; from: string; to: string }>;
  age_days: number;
  total_comments: number;
}
interface Props { users: UserNode[]; }

// Each signal: label, how to compute score 0-100, and a "flags" function
const SIGNALS = [
  {
    key: "conflict_concentration",
    label: "Conflict Concentration",
    desc: "% of all activity in conflict/political subs",
    compute: (u: UserNode) => u.conflict_pct,
    threshold: 70,
    threatColor: true,
  },
  {
    key: "hebrew_content",
    label: "Hebrew Content",
    desc: "% of comments containing Hebrew script",
    compute: (u: UserNode) => Math.min((u.lang?.hebrew || 0) * 3.33, 100),
    threshold: 30,
    threatColor: true,
  },
  {
    key: "israeli_hours",
    label: "Israeli Timezone",
    desc: "% of posts during Israeli daylight hours (UTC 6–22)",
    compute: (u: UserNode) => u.israel_hours_pct,
    threshold: 85,
    threatColor: false,
  },
  {
    key: "fb_embedded",
    label: "FB Embedded",
    desc: "% of activity concentrated in r/ForbiddenBromance",
    compute: (u: UserNode) => u.fb_pct,
    threshold: 20,
    threatColor: true,
  },
  {
    key: "account_age",
    label: "Account Longevity",
    desc: "Account age normalized (older = more cover)",
    compute: (u: UserNode) => Math.min(u.age_days / 40, 100),
    threshold: 50,
    threatColor: false,
  },
  {
    key: "dormancy",
    label: "Dormancy Gaps",
    desc: "Presence of 90+ day dormancy gaps (asset hibernation signal)",
    compute: (u: UserNode) => u.dormancy_gaps.some((g) => g.days > 90) ? 80 : u.dormancy_gaps.length > 0 ? 40 : 0,
    threshold: 60,
    threatColor: true,
  },
  {
    key: "volume",
    label: "Volume Output",
    desc: "Total comment output vs cohort max",
    compute: (u: UserNode) => 0, // filled in dynamically
    threshold: 60,
    threatColor: false,
  },
];

function ScoreCell({ value, threshold, threatColor }: { value: number; threshold: number; threatColor: boolean }) {
  const pct = Math.min(value, 100);
  const hot = pct >= threshold;
  const color = hot && threatColor ? "#ff4d5e" : hot ? "#e8b44c" : pct > 30 ? "#8a8f98" : "rgba(255,255,255,0.08)";

  return (
    <td className="p-0.5 text-center">
      <div
        className="relative w-8 h-8 mx-auto rounded flex items-center justify-center font-mono text-[9px] font-bold transition-all hover:scale-125 cursor-default"
        style={{
          background: `${color}22`,
          border: `1px solid ${color}55`,
          color,
          boxShadow: hot && threatColor ? `0 0 6px ${color}44` : "none",
        }}
        title={`${Math.round(pct)}%`}
      >
        {Math.round(pct)}
      </div>
    </td>
  );
}

export function PersonaContradictionMatrix({ users }: Props) {
  const [sortBy, setSortBy] = useState<"contradiction" | "name" | "conflict">("contradiction");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const maxComments = Math.max(...users.map((u) => u.total_comments), 1);

  const computedSignals = useMemo(() => SIGNALS.map((s) => ({
    ...s,
    compute: s.key === "volume"
      ? (u: UserNode) => Math.round((u.total_comments / maxComments) * 100)
      : s.compute,
  })), [maxComments]);

  const sorted = useMemo(() => {
    const copy = [...users];
    if (sortBy === "contradiction") return copy.sort((a, b) => b.contradiction_score - a.contradiction_score);
    if (sortBy === "conflict") return copy.sort((a, b) => b.conflict_pct - a.conflict_pct);
    return copy.sort((a, b) => a.username.localeCompare(b.username));
  }, [users, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[10px] text-muted-2">sort by:</span>
        {(["contradiction", "conflict", "name"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-all ${
              sortBy === s ? "border-primary text-primary bg-primary/10" : "border-borderc text-muted hover:text-foreground"
            }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-threat/50 bg-threat/15" />
            <span className="font-mono text-[9px] text-muted-2">high-risk signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-archive/50 bg-archive/15" />
            <span className="font-mono text-[9px] text-muted-2">elevated signal</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-borderc">
              <th className="text-left font-mono text-[9px] text-muted-2 font-normal py-2 pr-3 w-36 sticky left-0 bg-background z-10">SUBJECT</th>
              {computedSignals.map((s) => (
                <th
                  key={s.key}
                  className="text-[8px] font-normal text-muted-2 pb-2 px-0.5"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", maxHeight: 80 }}
                  title={s.desc}
                >
                  {s.label}
                </th>
              ))}
              <th className="text-right font-mono text-[9px] text-muted-2 font-normal py-2 pl-2">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => {
              const scores = computedSignals.map((s) => s.compute(user));
              const totalRisk = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              const isHot = hoveredRow === user.username;

              return (
                <tr
                  key={user.username}
                  className={`border-b border-borderc/30 transition-colors ${isHot ? "bg-surface/50" : "hover:bg-surface/20"}`}
                  onMouseEnter={() => setHoveredRow(user.username)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="py-1 pr-3 sticky left-0 bg-background z-10">
                    <div className="font-mono text-[10px]">
                      <p className={`${isHot ? "text-foreground" : "text-muted"} truncate max-w-[130px]`}>
                        {user.username}
                      </p>
                      <p className="text-muted-2 text-[8px]">{user.role.slice(0, 3).replace(/_/g, "")}</p>
                    </div>
                  </td>
                  {computedSignals.map((s, i) => (
                    <ScoreCell key={s.key} value={scores[i]} threshold={s.threshold} threatColor={s.threatColor} />
                  ))}
                  <td className="pl-2 text-right">
                    <span
                      className="font-mono text-[12px] font-bold"
                      style={{ color: totalRisk > 60 ? "#ff4d5e" : totalRisk > 40 ? "#e8b44c" : "#8a8f98" }}
                    >
                      {totalRisk}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-borderc">
        {computedSignals.map((s) => (
          <div key={s.key} className="font-mono text-[9px]">
            <span className="text-foreground">{s.label}</span>
            <span className="text-muted-2 block">{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
