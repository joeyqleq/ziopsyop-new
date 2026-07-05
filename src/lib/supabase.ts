import "server-only";

/**
 * Server-only Supabase data access for the Battlefield Forensics (Part 2).
 *
 * We talk to PostgREST directly with `fetch` so we ship zero extra client
 * bundle weight and never expose a credential to the browser. The
 * service-role key lives only in server env (.env.local) and is read here
 * inside Server Components / route handlers — never imported by client code.
 */

/**
 * Query a table via the PostgREST REST endpoint.
 * `query` is a raw PostgREST query string, e.g. "select=*&order=id.asc".
 * Results are cached for an hour and tagged so they can be revalidated.
 *
 * Env vars are read lazily inside the function (never at module top level) so
 * a missing credential fails soft — pages render their empty-state instead of
 * the whole route crashing during module evaluation.
 */
export async function sbSelect<T = Record<string, unknown>>(
  table: string,
  query = "select=*",
): Promise<T[]> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    // Fail soft: pages render their empty-state instead of crashing.
    console.log(
      "[v0] Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — returning [] for",
      table,
    );
    return [];
  }

  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      next: { revalidate: 3600, tags: ["battlefield", table] },
    });
    if (!res.ok) {
      console.log(`[v0] Supabase ${table} -> ${res.status}`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.log(`[v0] Supabase fetch failed for ${table}:`, (err as Error).message);
    return [];
  }
}
