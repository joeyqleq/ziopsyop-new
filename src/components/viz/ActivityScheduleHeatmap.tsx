"use client";
import { useMemo } from "react";

interface ActivityUser {
  username: string;
  israel_hours_pct: number;
  hour_distribution: Array<{ hour: number; pct: number }>;
}
interface CoordEvent {
  timestamp: string;
  date: string;
  hour: string;
  user_count: number;
  users: string[];
}
interface Props {
  users: ActivityUser[];
  events: CoordEvent[];
}

export function ActivityScheduleHeatmap({ users, events }: Props) {
  const schedule = useMemo(
    () => [...users].sort((a, b) => b.israel_hours_pct - a.israel_hours_pct),
    [users]
  );
  const maxHourPct = useMemo(
    () => Math.max(1, ...users.flatMap((u) => u.hour_distribution.map((h) => h.pct))),
    [users]
  );
  const sharedWindowEvents = events.filter((e) => {
    const h = Number.parseInt(e.hour, 10);
    return h >= 14 && h <= 19;
  }).length;
  const alignedUsers = users.filter((u) => u.israel_hours_pct >= 70).length;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-borderc bg-black/20 p-3">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 font-mono">
          <p className="text-[10px] tracking-[0.18em] text-foreground">
            SHARED 24-HOUR ACTIVITY FINGERPRINT
          </p>
          <p className="text-[9px] text-muted">
            {alignedUsers}/{users.length} subjects &ge;70% in dataset&apos;s Israel-hours band &middot;{" "}
            {sharedWindowEvents}/{events.length} co-activity windows at 14:00–19:00 UTC
          </p>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[680px] space-y-1">
            {/* hour header */}
            <div className="grid grid-cols-[150px_repeat(24,minmax(12px,1fr))] gap-px font-mono text-[8px] text-muted-2">
              <span>SUBJECT / UTC HOUR</span>
              {Array.from({ length: 24 }, (_, h) => (
                <span key={h} className="text-center">
                  {h % 3 === 0 ? h : ""}
                </span>
              ))}
            </div>

            {/* user rows */}
            {schedule.map((user) => {
              const byHour = new Map(user.hour_distribution.map((h) => [h.hour, h.pct]));
              return (
                <div
                  key={user.username}
                  className="grid grid-cols-[150px_repeat(24,minmax(12px,1fr))] gap-px"
                >
                  <span
                    className="truncate pr-2 font-mono text-[9px] text-muted"
                    title={user.username}
                  >
                    {user.username}
                  </span>
                  {Array.from({ length: 24 }, (_, h) => {
                    const pct = byHour.get(h) ?? 0;
                    const strength = pct / maxHourPct;
                    return (
                      <span
                        key={h}
                        className={
                          h >= 14 && h <= 19
                            ? "h-3 ring-1 ring-inset ring-primary/20"
                            : "h-3"
                        }
                        style={{
                          backgroundColor: `rgba(123,57,208,${0.06 + strength * 0.88})`,
                        }}
                        title={`${user.username} · ${h.toString().padStart(2, "0")}:00 UTC · ${pct.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-muted-2">
          Similar schedules are consistent with a geographically concentrated cohort.
          They strengthen a coordination assessment only when combined with reply,
          language and event evidence.
        </p>
      </div>

      {/* top co-activity windows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {events.slice(0, 6).map((e, i) => (
          <div
            key={i}
            className="border border-borderc rounded p-2.5 bg-surface/40 font-mono text-[10px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-foreground">
                {e.date} {e.hour}
              </span>
              <span
                className={`${e.user_count >= 5 ? "text-threat" : "text-archive"} font-bold`}
              >
                {e.user_count} users
              </span>
            </div>
            <p className="text-muted-2 mt-0.5 truncate">
              {e.users.slice(0, 4).join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
