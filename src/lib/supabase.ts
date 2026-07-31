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

/**
 * Call a server-only PostgREST RPC with the service-role credential.
 *
 * Public clients have no EXECUTE privilege on the canonical analytics RPCs;
 * route handlers use this helper to expose only bounded, presentation-ready
 * responses. Function names are constrained to SQL identifiers so a caller
 * cannot smuggle a path into the URL.
 */
export async function sbRpc<T>(
  functionName: string,
  body: Record<string, unknown> = {},
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<T | null> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.log(`[v0] Supabase env missing — RPC ${functionName} returning null`);
    return null;
  }

  if (!/^[a-z_][a-z0-9_]*$/.test(functionName)) {
    throw new Error(`Invalid Supabase RPC name: ${functionName}`);
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: {
        revalidate: options.revalidate ?? 3600,
        tags: options.tags ?? ["supabase-rpc", functionName],
      },
    });

    if (!res.ok) {
      console.log(`[v0] Supabase RPC ${functionName} -> ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.log(
      `[v0] Supabase RPC ${functionName} failed:`,
      (err as Error).message,
    );
    return null;
  }
}
