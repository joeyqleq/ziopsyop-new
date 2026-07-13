import { NextResponse } from "next/server";

/**
 * GET /api/media-events
 *
 * Query params:
 *   - start: YYYY-MM-DD (required)
 *   - end: YYYY-MM-DD (required)
 *   - source: comma-separated list e.g. "almanar,channel_14" (default: all)
 *   - category: category filter or "all" (default: all)
 *
 * Returns media events in the given date range from Supabase.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const sourceParam = searchParams.get("source");
  const categoryParam = searchParams.get("category");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing required params: start, end (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start) || !dateRegex.test(end)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  // Build PostgREST query
  const parts = [
    "select=*",
    `event_date=gte.${start}`,
    `event_date=lte.${end}`,
    "order=event_date.asc,event_timestamp.asc",
  ];

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

  const query = parts.join("&");
  const url = `${SUPABASE_URL}/rest/v1/media_events?${query}`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300, tags: ["media-events"] },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[media-events] Supabase error ${res.status}:`, errText);
      return NextResponse.json(
        { error: "Database query failed", status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      events: data,
      count: data.length,
      range: { start, end },
      filters: {
        source: sourceParam || "all",
        category: categoryParam || "all",
      },
    });
  } catch (err) {
    console.error("[media-events] Fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
