"use client";
import { useMemo, useState } from "react";

interface MonthlyPoint { month: string; count: number; }
interface UserNode {
  username: string;
  role: string;
  monthly_activity: MonthlyPoint[];
  total_comments: number;
}
interface Props { users: UserNode[]; }

const ROLE_COLORS: Record<string, string> = {
  EMBEDDED_OPERATIVE: "#ff4d5e",
  CONFLICT_SPECIALIST: "#e8b44c",
  HEBREW_SPEAKER: "#7b39d0",
  VETERAN_ACTOR: "#5b9bff",
  PARTICIPANT: "#8a8f98",
};

// Key IDF operation windows for overlay
const OP_MONTHS = new Set([
  "2021-05","2021-06",         // Guardian of Walls
  "2023-10","2023-11",         // Oct 7 + immediate
  "2024-09","2024-10","2024-11","2024-12", // Lebanon campaign
  "2025-01","2025-02",         // continued ops
  "2026-01","2026-02","2026-03", // 2026 ground invasion
]);

export function ActivityHeatmap({ users }: Props) {
  const [sortBy, setSortBy] = useState<"role" | "volume" | "name">("volume");

  const allMonths = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => u.monthly_activity.forEach((m) => set.add(m.month)));
    return Array.from(set).sort();
  }, [users]);

  // show every 4th month label
  const labelMonths = allMonths.filter((_, i) => i % 4 === 0);

  const sorted = useMemo(() => {
    const copy = [...users];
    if (sortBy === "volume") return copy.sort((a, b) => b.total_comments - a.total_comments);
    if (sortBy === "role") return copy.sort((a, b) => a.role.localeCompare(b.role));
    return copy.sort((a, b) => a.username.localeCompare(b.username));
  }, [users, sortBy]);

  const cellW = Math.max(3, Math.min(10, Math.floor(880 / allMonths.length)));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-muted-2">sort:</span>
        {(["volume","role","name"] as const).map((s) => (
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
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-primary/30 rounded-sm border border-primary/40" />
          <span className="font-mono text-[9px] text-muted-2">op window</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: allMonths.length * cellW + 140 }}>
          {/* month axis */}
          <div className="flex mb-1 ml-[140px]">
            {allMonths.map((m) => (
              <div
                key={m}
                style={{ width: cellW, flexShrink: 0 }}
                className="relative"
              >
                {labelMonths.includes(m) && (
                  <span
                    className="absolute font-mono text-[7px] text-muted-2 whitespace-nowrap"
                    style={{ left: 0, transform: "rotate(-45deg) translateX(-4px)", transformOrigin: "left top" }}
                  >
                    {m.slice(2)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-px">
            {sorted.map((user) => {
              const actMap = new Map(user.monthly_activity.map((m) => [m.month, m.count]));
              const maxAct = Math.max(...user.monthly_activity.map((m) => m.count), 1);
              const color = ROLE_COLORS[user.role] || "#8a8f98";

              return (
                <div key={user.username} className="flex items-center gap-0">
                  {/* user label */}
                  <div className="w-[140px] shrink-0 flex items-center gap-1.5 pr-2">
                    <div className="w-1 h-3 rounded-full shrink-0" style={{ background: color }} />
                    <span className="font-mono text-[9px] text-muted truncate">{user.username}</span>
                  </div>

                  {/* cells */}
                  {allMonths.map((m) => {
                    const count = actMap.get(m) || 0;
                    const intensity = count / maxAct;
                    const isOp = OP_MONTHS.has(m);

                    return (
                      <div
                        key={m}
                        style={{
                          width: cellW,
                          height: 12,
                          flexShrink: 0,
                          background: count > 0
                            ? `${color}${Math.round(20 + intensity * 220).toString(16).padStart(2,"0")}`
                            : isOp ? "rgba(182,255,124,0.04)" : "transparent",
                          outline: isOp ? "1px solid rgba(182,255,124,0.12)" : "none",
                          outlineOffset: "-1px",
                        }}
                        title={`${user.username} · ${m} · ${count} comments`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* op window labels */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-borderc">
        {[
          { months: "2021-05/06", label: "Guardian of Walls" },
          { months: "2023-10/11", label: "Oct 7 + aftermath" },
          { months: "2024-09→12", label: "Lebanon ground campaign" },
          { months: "2026-01→03", label: "2026 invasion" },
        ].map((op) => (
          <div key={op.months} className="flex items-center gap-1.5">
            <div className="w-3 h-2 border border-primary/40 bg-primary/05" />
            <span className="font-mono text-[9px] text-muted-2">{op.months} — {op.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
