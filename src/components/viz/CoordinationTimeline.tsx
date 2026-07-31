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
interface ActivityUser {
  username: string;
  israel_hours_pct: number;
  hour_distribution: Array<{ hour: number; pct: number }>;
}
interface Props { events: CoordEvent[]; users: ActivityUser[]; }

const KNOWN_OPS: Record<string, string> = {
  "2023-10-07": "Oct 7 Attack",
  "2023-10-08": "Oct 7 +1d",
  "2024-09-23": "IDF Lebanon Campaign",
  "2024-09-30": "IDF Ground Push",
  "2024-10-07": "Oct 7 Anniversary",
  "2021-05-10": "Operation Guardian of Walls",
  "2020-08-04": "Beirut Explosion",
};

export function CoordinationTimeline({ events, users }: Props) {
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
  const schedule = useMemo(
    () => [...users].sort((a, b) => b.israel_hours_pct - a.israel_hours_pct),
    [users]
  );
  const maxHourPct = useMemo(
    () => Math.max(1, ...users.flatMap((user) => user.hour_distribution.map((hour) => hour.pct))),
    [users]
  );
  const sharedWindowEvents = events.filter((event) => {
    const hour = Number.parseInt(event.hour, 10);
    return hour >= 14 && hour <= 19;
  }).length;
  const alignedUsers = users.filter((user) => user.israel_hours_pct >= 70).length;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-borderc bg-black/20 p-3">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 font-mono">
          <p className="text-[10px] tracking-[0.18em] text-foreground">SHARED 24-HOUR ACTIVITY FINGERPRINT</p>
          <p className="text-[9px] text-muted">
            {alignedUsers}/{users.length} subjects ≥70% in the dataset&apos;s Israel-hours band · {sharedWindowEvents}/{events.length} co-activity windows at 14:00–19:00 UTC
          </p>
        </div>
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[680px] space-y-1">
            <div className="grid grid-cols-[150px_repeat(24,minmax(12px,1fr))] gap-px font-mono text-[8px] text-muted-2">
              <span>SUBJECT / UTC HOUR</span>
              {Array.from({ length: 24 }, (_, hour) => (
                <span key={hour} className="text-center">{hour % 3 === 0 ? hour : ""}</span>
              ))}
            </div>
            {schedule.map((user) => {
              const byHour = new Map(user.hour_distribution.map((hour) => [hour.hour, hour.pct]));
              return (
                <div key={user.username} className="grid grid-cols-[150px_repeat(24,minmax(12px,1fr))] gap-px">
                  <span className="truncate pr-2 font-mono text-[9px] text-muted" title={user.username}>
                    {user.username}
                  </span>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const pct = byHour.get(hour) ?? 0;
                    const strength = pct / maxHourPct;
                    return (
                      <span
                        key={hour}
                        className={hour >= 14 && hour <= 19 ? "h-3 ring-1 ring-inset ring-primary/20" : "h-3"}
                        style={{ backgroundColor: `rgba(123,57,208,${0.06 + strength * 0.88})` }}
                        title={`${user.username} · ${hour.toString().padStart(2, "0")}:00 UTC · ${pct.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-2">
          Similar schedules are consistent with a geographically concentrated cohort. They strengthen a coordination assessment only when combined with reply, language and event evidence.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-threat" />
          <span className="font-mono text-[10px] text-muted">{threshold}–7 users active in the same hour</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-px bg-primary/60" />
          <span className="font-mono text-[10px] text-muted">major event context</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={daily} margin={{ top: 8, right: 8, left: -20, bottom: 60 }}
          onClick={(data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d = data as any;
            if (d?.activePayload?.[0]) {
              const date = d.activePayload[0].payload.date as string;
              setSelected(events.find((e) => e.date === date) || null);
            }
          }}>
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
                fill="#ff4d5e"
                fillOpacity={0.45 + (d.max_users - threshold) * 0.2}
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
