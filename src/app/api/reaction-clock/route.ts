import { NextRequest, NextResponse } from "next/server";
import type {
  ActorHourProfileObservation,
  ActorMediaActivationExplorerProps,
  ActorMediaDailyPulse,
  ActorMediaSourcedEvent,
  ActorRedditDailyVolume,
} from "@/components/viz/ActorMediaActivationExplorer";
import { sbRpc } from "@/lib/supabase";

const DAY_MS = 86_400_000;
const MEDIA_SOURCES = ["almanar", "almayadeen", "channel_14"] as const;

interface PartICoreResponse {
  metadata: Record<string, unknown>;
  data: {
    overview: {
      date_range_start?: string | null;
      date_range_end?: string | null;
    } | null;
    research_events?: Array<{
      event_key: string;
      event_date?: string | null;
      label?: string | null;
      description?: string | null;
      source_title?: string | null;
      source_url?: string | null;
      evidence_status: "sourced" | "unsourced_context";
    }>;
  };
}

interface ReactionDay {
  date: string;
  reddit_total: number | null;
  reddit_observed: boolean;
  media_by_source: Record<string, number | null>;
  media_observed_by_source: Record<string, boolean>;
  media_observed: boolean;
  same_day_pair_observed: boolean;
  next_day_pair_observed: boolean;
}

interface ReactionResponse {
  metadata: {
    timezone: string;
    granularity: string;
    supports_exact_latency: boolean;
    association_scope: string;
    missing_value_contract: string;
    start: string;
    end: string;
    range_days: number;
  };
  data: ReactionDay[];
}

interface ActorProfileResponse {
  metadata: {
    timezone: string;
    granularity: string;
    date_linked: boolean;
    supports_exact_latency: boolean;
  };
  data: Array<{
    actor: string;
    hour: number;
    activity_pct: number | null;
  }>;
}

function isDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function addDays(date: string, amount: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + amount * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function clampDate(value: string, min: string, max: string): string {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export async function GET(request: NextRequest) {
  const core = await sbRpc<PartICoreResponse>(
    "get_part_i_core",
    {},
    { revalidate: 3600, tags: ["part-i-core"] },
  );
  const coverageStart = core?.data.overview?.date_range_start ?? null;
  const coverageEnd = core?.data.overview?.date_range_end ?? null;

  if (!isDate(coverageStart) || !isDate(coverageEnd)) {
    return NextResponse.json(
      { error: "Reaction Clock coverage metadata is unavailable" },
      { status: 503 },
    );
  }

  const requestedStart = request.nextUrl.searchParams.get("start");
  const requestedEnd = request.nextUrl.searchParams.get("end");
  if (
    (requestedStart !== null && !isDate(requestedStart)) ||
    (requestedEnd !== null && !isDate(requestedEnd))
  ) {
    return NextResponse.json(
      { error: "start and end must use YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const end = clampDate(requestedEnd ?? coverageEnd, coverageStart, coverageEnd);
  const start = clampDate(
    requestedStart ?? addDays(end, -364),
    coverageStart,
    coverageEnd,
  );

  if (start > end) {
    return NextResponse.json(
      { error: "start must be on or before end" },
      { status: 400 },
    );
  }

  const [reaction, actorProfiles] = await Promise.all([
    sbRpc<ReactionResponse>(
      "get_reaction_clock_daily",
      {
        p_start: start,
        p_end: end,
        p_sources: MEDIA_SOURCES,
      },
      { revalidate: 3600, tags: ["reaction-clock", start, end] },
    ),
    sbRpc<ActorProfileResponse>(
      "get_actor_hour_profiles",
      {},
      { revalidate: 3600, tags: ["actor-hour-profiles"] },
    ),
  ]);

  if (!reaction || !actorProfiles) {
    return NextResponse.json(
      { error: "Reaction Clock data could not be loaded" },
      { status: 502 },
    );
  }

  const mediaDaily: ActorMediaDailyPulse[] = reaction.data
    .filter((row) => row.media_observed)
    .map((row) => ({
      date: row.date,
      ...(row.media_observed_by_source.almanar
        ? { alManar: row.media_by_source.almanar ?? 0 }
        : {}),
      ...(row.media_observed_by_source.almayadeen
        ? { alMayadeen: row.media_by_source.almayadeen ?? 0 }
        : {}),
      ...(row.media_observed_by_source.channel_14
        ? { channel14: row.media_by_source.channel_14 ?? 0 }
        : {}),
    }));

  const redditDaily: ActorRedditDailyVolume[] = reaction.data
    .filter(
      (row): row is ReactionDay & { reddit_total: number } =>
        row.reddit_observed && row.reddit_total !== null,
    )
    .map((row) => ({ date: row.date, volume: row.reddit_total }));

  const events: ActorMediaSourcedEvent[] = (
    core?.data.research_events ?? []
  )
    .filter(
      (event) =>
        isDate(event.event_date ?? null) &&
        event.event_date! >= start &&
        event.event_date! <= end,
    )
    .map((event) => ({
      id: event.event_key,
      date: event.event_date!,
      title: event.label ?? "Context event",
      sourceLabel:
        event.evidence_status === "sourced"
          ? event.source_title ?? "Source"
          : "Context annotation · source URL not supplied",
      ...(event.source_url ? { sourceUrl: event.source_url } : {}),
      ...(event.description ? { summary: event.description } : {}),
      confidence:
        event.evidence_status === "sourced" ? "medium" : "not-assessed",
    }));

  const actorHourProfiles: ActorHourProfileObservation[] =
    actorProfiles.data
      .filter((row) => row.activity_pct !== null)
      .map((row) => ({
        actor: row.actor,
        hour: row.hour,
        activityPct: row.activity_pct!,
      }));

  const sameDayObserved = reaction.data.filter(
    (row) => row.same_day_pair_observed,
  ).length;
  const nextDayObserved = reaction.data.filter(
    (row) => row.next_day_pair_observed,
  ).length;
  const actorCount = new Set(actorHourProfiles.map((row) => row.actor)).size;

  const payload: Pick<
    ActorMediaActivationExplorerProps,
    | "mediaDaily"
    | "redditDaily"
    | "actorActivity"
    | "events"
    | "hourlyActivity"
    | "actorHourProfiles"
    | "associations"
  > & {
    metadata: ReactionResponse["metadata"] & {
      coverageStart: string;
      coverageEnd: string;
      actorProfileMetadata: ActorProfileResponse["metadata"];
    };
  } = {
    metadata: {
      ...reaction.metadata,
      coverageStart,
      coverageEnd,
      actorProfileMetadata: actorProfiles.metadata,
    },
    mediaDaily,
    redditDaily,
    actorActivity: [],
    events,
    hourlyActivity: [],
    actorHourProfiles,
    associations: [
      {
        id: "daily-alignment",
        title: "Media ↔ Reddit activation windows",
        statement: `${sameDayObserved} civil days in this range contain both a supplied Reddit observation and at least one supplied media observation; ${nextDayObserved} media-observed days are followed by a supplied Reddit observation on the next civil day.`,
        basis:
          "Direct counts from the canonical Beirut-local day spine; absent observations remain gaps rather than inferred zeroes.",
        confidence: "high",
        coverage: {
          observed: sameDayObserved,
          expected: reaction.data.length,
          unit: "civil days",
        },
        limitations: [
          "Day-grain alignment is descriptive and cannot establish exact reaction latency.",
          "A shared spike can reflect the same external event rather than direct coordination.",
        ],
      },
      {
        id: "actor-rhythm",
        title: "Recurring actor activity clocks",
        statement: `${actorCount} forensic actor histories provide complete aggregate hour-of-day profiles. Repeating bands can be compared across actors without pretending those aggregate schedules are linked to a particular news event.`,
        basis:
          "All-history UTC hour distributions are rendered in a separate 24-column matrix.",
        confidence: "high",
        coverage: {
          observed: actorHourProfiles.length,
          expected: actorCount * 24,
          unit: "actor-hour cells",
        },
        limitations: [
          "Profiles are date-unlinked aggregates.",
          "Recurring schedules are consistent with shared routines but do not by themselves identify an employer or command structure.",
        ],
      },
    ],
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
