"use client";
import { useMemo, useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface UserNode {
  username: string;
  role: string;
  lang: Record<string, number>;
  conflict_pct: number;
  israel_hours_pct: number;
  fb_pct: number;
  contradiction_score: number;
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

const PALETTE = [
  "#b6ff7c","#ff4d5e","#e8b44c","#7b39d0","#5b9bff","#a78bfa",
  "#f97316","#22d3ee","#ec4899","#84cc16","#f59e0b","#06b6d4",
];

export function LanguageRadar({ users }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(users.slice(0, 6).map((u) => u.username)));

  // Build radar axes: each axis = one behavioral signal
  const axes = [
    { key: "conflict_pct", label: "Conflict Focus", max: 100 },
    { key: "israel_hours_pct", label: "Israeli Hours", max: 100 },
    { key: "fb_pct", label: "FB Embedded", max: 100 },
    { key: "contradiction_score", label: "Contradiction", max: 100 },
    { key: "hebrew_pct", label: "Hebrew Content", max: 30 },
    { key: "volume_norm", label: "Volume (norm)", max: 100 },
  ];

  const maxComments = Math.max(...users.map((u) => u.total_comments), 1);

  const radarData = useMemo(() => axes.map((ax) => {
    const point: Record<string, number | string> = { axis: ax.label };
    users.forEach((u) => {
      let val = 0;
      if (ax.key === "hebrew_pct") val = Math.min(u.lang?.hebrew || 0, ax.max);
      else if (ax.key === "volume_norm") val = Math.round((u.total_comments / maxComments) * 100);
      else val = Math.min((u as unknown as Record<string, number>)[ax.key] || 0, ax.max);
      point[u.username] = Math.round((val / ax.max) * 100);
    });
    return point;
  }), [users, maxComments, axes]);

  const toggle = (u: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(u) ? next.delete(u) : next.add(u);
    return next;
  });

  return (
    <div className="space-y-4">
      {/* user toggles */}
      <div className="flex flex-wrap gap-1.5">
        {users.map((u, i) => (
          <button
            key={u.username}
            onClick={() => toggle(u.username)}
            className="flex items-center gap-1 px-2 py-1 rounded border transition-all text-[9px] font-mono"
            style={{
              borderColor: selected.has(u.username) ? PALETTE[i % PALETTE.length] : "rgba(255,255,255,0.08)",
              background: selected.has(u.username) ? `${PALETTE[i % PALETTE.length]}18` : "transparent",
              color: selected.has(u.username) ? PALETTE[i % PALETTE.length] : "#565b64",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_COLORS[u.role] }} />
            {u.username}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <PolarGrid stroke="rgba(255,255,255,0.07)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#8a8f98", fontSize: 10, fontFamily: "JetBrains Mono" }}
          />
          {users.map((u, i) =>
            selected.has(u.username) ? (
              <Radar
                key={u.username}
                name={u.username}
                dataKey={u.username}
                stroke={PALETTE[i % PALETTE.length]}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={0.08}
                strokeWidth={1.5}
              />
            ) : null
          )}
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-black/95 border border-borderc rounded p-2 font-mono text-[10px] space-y-1">
                  <p className="text-muted-2 mb-1">{label}</p>
                  {payload.map((p, i) => (
                    <p key={i} style={{ color: p.stroke as string }}>
                      {p.name}: {p.value}
                    </p>
                  ))}
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <p className="text-[9px] text-muted-2 font-mono text-center">
        all axes normalised 0–100 · "Contradiction" = persona inconsistency score · "FB Embedded" = % activity in r/ForbiddenBromance
      </p>
    </div>
  );
}
