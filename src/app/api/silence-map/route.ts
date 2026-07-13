import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=86400",
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

export async function GET() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503, headers: CORS_HEADERS });
  }

  const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/get_silence_map_data`;
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_start_date: "2023-08-01", p_end_date: "2026-07-31" }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[silence-map] rpc error:", err);
      return NextResponse.json({ error: "RPC failed" }, { status: 502, headers: CORS_HEADERS });
    }

    const payload = await res.json();
    const rows = Array.isArray(payload) ? payload : [];
    return NextResponse.json(rows, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("[silence-map] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500, headers: CORS_HEADERS });
  }
}
