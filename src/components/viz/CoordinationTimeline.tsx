"use client";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface CoordEvent {
  timestamp: string;
  date: string;
  hour: string;
  user_count: number;
  users: string[];
}
interface Props { events: CoordEvent[]; }

const KNOWN_OPS: Record<string, string> = {
  "2023-10-07": "Oct 7 Attack",
  "2023-10-08": "Oct 7 +1d",
  "2024-09-23": "IDF Lebanon Campaign",
  "2024-09-30": "IDF Ground Push",
  "2024-10-07": "Oct 7 Anniversary",
  "2021-05-10": "Operation Guardian of Walls",
  "2020-08-04": "Beirut Explosion",
};

export function CoordinationTimeline({ events }: Props) {
  const [selected, setSelected] = useState<CoordEvent | null>(null);

  // aggregate by date, keep max user_count per day
  const daily = useMemo(() => {
    const map = new Map<string, { date: string; max_users: number; total_events: number; peak_users: string[]; }>();
    events.forEach((e) => {
      const existing = map.get(e.date);
      if (!existing || e.user_count > existing.max_users) {
        map.set(e.date, {
          date: e.date,
          max_users: e.user_count,
          total_events: (existing?.total_events || 0) + 1,
          peak_users: e.users,
        });
      } else {
        existing.total_events += 1;
      }
    });
    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter((d) => d.max_users >= 3);
  }, [events]);

  const threshold = 5;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-threat" />
          <span className="font-mono text-[10px] text-muted">≥{threshold} users active same hour</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-archive" />
          <span className="font-mono text-[10px] text-muted">3-4 users active same hour</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-px bg-primary/60" />
          <span className="font-mono text-[10px] text-muted">known military operation</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={daily} margin={{ top: 8, right: 8, left: -20, bottom: 60 }}
          onClick={(data) => { const d = data as { activePayload?: Array<{ payload: { date: string } }> }; d?.activePayload?.[0] && setSelected(events.find(e => e.date === d.activePayload![0].payload.date) || null); }}>
          <XAxis
            dataKey="date"
            tick={{ fill: "#565b64", fontSize: 8, fontFamily: "JetBrains Mono" }}
            angle={-55}
            textAnchor="end"
            interval={Math.floor(daily.length / 12)}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          />
          <YAxis
            tick={{ fill: "#565b64", fontSize: 9, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            domain={[0, 8]}
            label={{ value: "simultaneous users", angle: -90, position: "insideLeft", fill: "#565b64", fontSize: 8, fontFamily: "JetBrains Mono" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              const op = KNOWN_OPS[d.date];
              return (
                <div className="bg-black/95 border border-borderc rounded p-3 font-mono text-[10px] space-y-1 min-w-[180px]">
                  <p className="text-foreground">{d.date}</p>
                  {op && <p className="text-primary">⚡ {op}</p>}
                  <p className="text-threat">peak: {d.max_users} users same hour</p>
                  <p className="text-muted">{d.total_events} coordination windows</p>
                  <p className="text-muted-2 text-[9px] mt-1">{d.peak_users.slice(0,4).join(", ")}{d.peak_users.length > 4 ? "..." : ""}</p>
                </div>
              );
            }}
          />
          {Object.keys(KNOWN_OPS).map((date) => (
            <ReferenceLine key={date} x={date} stroke="rgba(182,255,124,0.3)" strokeDasharray="3 3" strokeWidth={1} />
          ))}
          <Bar dataKey="max_users" radius={[2, 2, 0, 0]}>
            {daily.map((d, i) => (
              <Cell
                key={i}
                fill={d.max_users >= threshold ? "#ff4d5e" : "#e8b44c"}
                fillOpacity={d.max_users >= threshold ? 0.9 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selected && (
        <div className="border border-threat/40 rounded bg-threat/5 p-3 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-threat">{selected.date} {selected.hour}</span>
            <button onClick={() => setSelected(null)} className="text-muted-2 hover:text-foreground">✕</button>
          </div>
          <p className="text-foreground mt-1">{selected.user_count} users active simultaneously:</p>
          <p className="text-muted mt-1">{selected.users.join(" · ")}</p>
        </div>
      )}

      {/* top coordination moments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        {events.slice(0, 6).map((e, i) => {
          const op = KNOWN_OPS[e.date];
          return (
            <div key={i} className="border border-borderc rounded p-2.5 bg-surface/40 font-mono text-[10px]">
              <div className="flex justify-between items-start">
                <span className="text-foreground">{e.date} {e.hour}</span>
                <span className={`${e.user_count >= threshold ? "text-threat" : "text-archive"} font-bold`}>{e.user_count} users</span>
              </div>
              {op && <p className="text-primary text-[9px] mt-0.5">⚡ {op}</p>}
              <p className="text-muted-2 mt-0.5 truncate">{e.users.slice(0,4).join(" · ")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
