"use client";
import { useMemo, useState } from "react";

interface SubEntry { sub: string; count: number; }
interface UserNode {
  username: string;
  role: string;
  conflict_pct: number;
  total_comments: number;
  top_subreddits: SubEntry[];
}
interface Props { users: UserNode[]; }

const CONFLICT_SUBS = new Set([
  "ForbiddenBromance","IsraelPalestine","Israel_Palestine","AskMiddleEast",
  "lebanon","Israel","2ndYomKippurWar","2mediterranean4u","worldnews",
  "neoliberal","NewIran","Israeli","Jewish","Judaism","Lebanese",
]);

const ROLE_COLORS: Record<string, string> = {
  EMBEDDED_OPERATIVE: "#ff4d5e",
  CONFLICT_SPECIALIST: "#e8b44c",
  HEBREW_SPEAKER: "#7b39d0",
  VETERAN_ACTOR: "#5b9bff",
  PARTICIPANT: "#8a8f98",
};

export function SubredditConcentrationMap({ users }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  // collect all unique subs across all users, rank by total activity
  const allSubs = useMemo(() => {
    const totals = new Map<string, number>();
    users.forEach((u) => {
      u.top_subreddits.forEach(({ sub, count }) => {
        totals.set(sub, (totals.get(sub) || 0) + count);
      });
    });
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([sub]) => sub);
  }, [users]);

  const sorted = [...users].sort((a, b) => b.conflict_pct - a.conflict_pct);

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-[10px] border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left text-muted-2 py-1.5 pr-3 w-36 font-normal sticky left-0 bg-background z-10">USER</th>
            {allSubs.map((sub) => (
              <th
                key={sub}
                className={`text-[9px] font-normal pb-2 px-0.5 ${CONFLICT_SUBS.has(sub) ? "text-threat/70" : "text-muted-2"}`}
                style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", maxHeight: 90 }}
                title={`r/${sub}`}
              >
                {sub.length > 14 ? sub.slice(0, 13) + "…" : sub}
              </th>
            ))}
            <th className="text-muted-2 font-normal pl-2 text-right">CONC%</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((user) => {
            const subMap = new Map(user.top_subreddits.map((s) => [s.sub, s.count]));
            const maxCount = Math.max(...user.top_subreddits.map((s) => s.count), 1);
            const isHovered = hovered === user.username;
            return (
              <tr
                key={user.username}
                className={`border-t border-borderc/40 transition-colors ${isHovered ? "bg-surface/60" : "hover:bg-surface/30"}`}
                onMouseEnter={() => setHovered(user.username)}
                onMouseLeave={() => setHovered(null)}
              >
                <td className="py-1.5 pr-3 sticky left-0 bg-background z-10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ROLE_COLORS[user.role] || "#8a8f98" }} />
                    <span className={`${isHovered ? "text-foreground" : "text-muted"} truncate max-w-[100px]`}>
                      {user.username}
                    </span>
                  </div>
                </td>
                {allSubs.map((sub) => {
                  const count = subMap.get(sub) || 0;
                  const intensity = count / maxCount;
                  const isConflict = CONFLICT_SUBS.has(sub);
                  return (
                    <td key={sub} className="p-0.5 text-center">
                      {count > 0 ? (
                        <div
                          className="w-4 h-4 mx-auto rounded-sm transition-transform hover:scale-150"
                          style={{
                            background: isConflict
                              ? `rgba(255,77,94,${0.15 + intensity * 0.75})`
                              : `rgba(182,255,124,${0.1 + intensity * 0.5})`,
                            boxShadow: intensity > 0.5 && isConflict ? "0 0 4px rgba(255,77,94,0.4)" : "none",
                          }}
                          title={`r/${sub}: ${count} comments`}
                        />
                      ) : (
                        <div className="w-4 h-4 mx-auto" />
                      )}
                    </td>
                  );
                })}
                <td className="pl-2 text-right">
                  <span className={`font-bold ${user.conflict_pct > 70 ? "text-threat" : user.conflict_pct > 40 ? "text-archive" : "text-muted"}`}>
                    {user.conflict_pct}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex gap-4 mt-3 pt-3 border-t border-borderc">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(255,77,94,0.7)" }} />
          <span className="font-mono text-[9px] text-muted">conflict sub activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(182,255,124,0.5)" }} />
          <span className="font-mono text-[9px] text-muted">non-conflict sub activity</span>
        </div>
        <span className="font-mono text-[9px] text-muted-2 ml-auto">darker = higher volume · CONC% = % of all activity in conflict subs</span>
      </div>
    </div>
  );
}
