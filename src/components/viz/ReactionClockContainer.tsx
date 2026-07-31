"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActorMediaActivationExplorer,
  type ActorMediaActivationExplorerProps,
} from "@/components/viz/ActorMediaActivationExplorer";

interface ReactionClockPayload
  extends Pick<
    ActorMediaActivationExplorerProps,
    | "mediaDaily"
    | "redditDaily"
    | "actorActivity"
    | "events"
    | "hourlyActivity"
    | "actorHourProfiles"
    | "associations"
  > {
  metadata: {
    timezone: string;
    granularity: string;
    supports_exact_latency: boolean;
    association_scope: string;
    missing_value_contract: string;
    start: string;
    end: string;
    range_days: number;
    coverageStart: string;
    coverageEnd: string;
  };
}

const DATE_PRESETS = [
  { id: "90d", label: "90D", days: 90 },
  { id: "1y", label: "1Y", days: 365 },
  { id: "3y", label: "3Y", days: 1095 },
  { id: "all", label: "ALL" },
];

export function ReactionClockContainer() {
  const [payload, setPayload] = useState<ReactionClockPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<AbortController | null>(null);
  const loadedRangeRef = useRef<string>("");

  const loadRange = useCallback(
    async (range?: { startDate: string; endDate: string }) => {
      const rangeKey = range ? `${range.startDate}:${range.endDate}` : "default";
      if (rangeKey === loadedRangeRef.current) return;

      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (range) {
        params.set("start", range.startDate);
        params.set("end", range.endDate);
      }

      try {
        const response = await fetch(
          `/api/reaction-clock${params.size ? `?${params}` : ""}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Reaction Clock API returned ${response.status}`);
        }
        const next = (await response.json()) as ReactionClockPayload;
        loadedRangeRef.current = `${next.metadata.start}:${next.metadata.end}`;
        setPayload(next);
      } catch (caught) {
        if ((caught as Error).name !== "AbortError") {
          setError((caught as Error).message);
        }
      } finally {
        if (requestRef.current === controller) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRange(), 0);
    return () => {
      window.clearTimeout(timer);
      requestRef.current?.abort();
    };
  }, [loadRange]);

  if (!payload && loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-md border border-borderc bg-black/20">
        <p className="caret font-mono text-[10px] tracking-[0.3em] text-primary">
          QUERYING CANONICAL CLOCK
        </p>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="rounded-md border border-threat/30 bg-threat/[0.04] p-5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-threat">
          REACTION CLOCK UNAVAILABLE
        </p>
        <p className="mt-2 text-xs text-muted">{error ?? "No response data."}</p>
        <button
          type="button"
          onClick={() => void loadRange()}
          className="mt-4 min-h-11 rounded border border-borderc px-4 font-mono text-[9px] text-foreground hover:border-primary/40"
        >
          RETRY QUERY
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="pointer-events-none absolute right-3 top-3 z-20 rounded border border-primary/25 bg-black/80 px-2 py-1 font-mono text-[8px] tracking-[0.16em] text-primary">
          RANGE QUERY…
        </div>
      )}
      {error && (
        <p className="mb-2 rounded border border-threat/25 bg-threat/[0.05] px-3 py-2 font-mono text-[9px] text-threat">
          {error} · retaining the last verified range
        </p>
      )}
      <ActorMediaActivationExplorer
        mediaDaily={payload.mediaDaily}
        redditDaily={payload.redditDaily}
        actorActivity={payload.actorActivity}
        events={payload.events}
        hourlyActivity={payload.hourlyActivity}
        actorHourProfiles={payload.actorHourProfiles}
        associations={payload.associations}
        datePresets={DATE_PRESETS}
        initialPresetId="1y"
        coverageStartDate={payload.metadata.coverageStart}
        coverageEndDate={payload.metadata.coverageEnd}
        timezoneLabel="ASIA/BEIRUT"
        onRangeChange={(range) =>
          void loadRange({
            startDate: range.startDate,
            endDate: range.endDate,
          })
        }
      />
    </div>
  );
}

export default ReactionClockContainer;
