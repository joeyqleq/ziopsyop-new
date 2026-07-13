import { NextResponse } from "next/server";

/**
 * GET /api/media-events
 *
 * Query params:
 *   - start: YYYY-MM-DD (required)
 *   - end: YYYY-MM-DD (required)
 *   - source: comma-separated list e.g. "almanar,channel_14" (default: all)
 *   - category: category filter e.g. "military_action" or "all" (default: all)
 *   - summary: "true" to return daily counts per source (lighter payload)
 *   - limit: number of rows (default 500)
 *   - offset: pagination offset (default 0)
 *
 * Returns media events in the given date range from Supabase.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=3600",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const sourceParam = searchParams.get("source");
  const categoryParam = searchParams.get("category");
  const summaryParam = searchParams.get("summary");
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing required params: start, end (YYYY-MM-DD)" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start) || !dateRegex.test(end)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  // Pagination
  const limit = Math.min(Math.max(parseInt(limitParam || "500", 10) || 500, 1), 5000);
  const offset = Math.max(parseInt(offsetParam || "0", 10) || 0, 0);

  // Determine if summary mode
  const isSummary = summaryParam === "true";

  // Build PostgREST query
  const parts: string[] = [];

  if (isSummary) {
    // For summary mode, select only date and source to count client-side
    parts.push("select=event_date,source");
  } else {
    parts.push("select=*");
  }

  parts.push(`event_date=gte.${start}`);
  parts.push(`event_date=lte.${end}`);
  parts.push("order=event_date.asc");

  // Source filter
  if (sourceParam && sourceParam !== "all") {
    const sources = sourceParam.split(",").map((s) => s.trim());
    const validSources = ["almanar", "almayadeen", "channel_14"];
    const filtered = sources.filter((s) => validSources.includes(s));
    if (filtered.length > 0) {
      parts.push(`source=in.(${filtered.join(",")})`);
    }
  }

  // Category filter
  if (categoryParam && categoryParam !== "all") {
    parts.push(`category=eq.${categoryParam}`);
  }

  // Pagination (only for non-summary mode; summary fetches all to aggregate)
  if (!isSummary) {
    parts.push(`limit=${limit}`);
    parts.push(`offset=${offset}`);
  }

  const query = parts.join("&");
  const url = `${SUPABASE_URL}/rest/v1/media_events?${query}`;

  try {
    const fetchHeaders: Record<string, string> = {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };

    // Request count header for pagination metadata
    if (!isSummary) {
      fetchHeaders["Prefer"] = "count=exact";
    }

    const res = await fetch(url, {
      headers: fetchHeaders,
      next: { revalidate: 300, tags: ["media-events"] },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[media-events] Supabase error ${res.status}:`, errText);
      return NextResponse.json(
        { error: "Database query failed", status: res.status },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const data = await res.json();

    // Summary mode: aggregate daily counts per source
    if (isSummary) {
      const countsMap: Record<string, { almanar: number; almayadeen: number; channel_14: number }> = {};

      for (const row of data) {
        const date = row.event_date;
        if (!countsMap[date]) {
          countsMap[date] = { almanar: 0, almayadeen: 0, channel_14: 0 };
        }
        const src = row.source as "almanar" | "almayadeen" | "channel_14";
        if (src in countsMap[date]) {
          countsMap[date][src]++;
        }
      }

      const summary = Object.entries(countsMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({ date, ...counts }));

      return NextResponse.json(summary, { headers: CORS_HEADERS });
    }

    // Parse total count from Content-Range header
    const contentRange = res.headers.get("content-range");
    const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : undefined;

    return NextResponse.json(
      {
        events: data,
        count: data.length,
        total,
        range: { start, end },
        pagination: { limit, offset },
        filters: {
          source: sourceParam || "all",
          category: categoryParam || "all",
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    console.error("[media-events] Fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
