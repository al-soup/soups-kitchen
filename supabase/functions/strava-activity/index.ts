import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_ACTIVITIES_URL =
  "https://www.strava.com/api/v3/athlete/activities";

const RIDE_SPORT_TYPES = [
  "Ride",
  "VirtualRide",
  "GravelRide",
  "MountainBikeRide",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TokenRow {
  id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface StravaSummaryActivity {
  id: number;
  sport_type: (typeof RIDE_SPORT_TYPES)[number];
  start_date: string;
  distance: number; // meters
  total_elevation_gain: number; // meters
  average_speed: number; // meters/second
}

interface StravaRideRow {
  strava_activity_id: number;
  ride_date: string;
  distance_km: number;
  elevation_gain_m: number;
  average_speed_kmh: number;
  raw_response: StravaSummaryActivity;
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

type LogLevel = "info" | "warn" | "error";

function log(
  level: LogLevel,
  msg: string,
  fields: Record<string, unknown> = {}
): void {
  const payload = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  });
  if (level === "error") console.error(payload);
  else console.log(payload);
}

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

function authorize(req: Request): Response | null {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) return errorResponse(500, "CRON_SECRET not configured");
  const provided = req.headers.get("x-cron-secret");
  if (provided !== cronSecret) return errorResponse(401, "Unauthorized");
  return null;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

async function ensureFreshToken(
  supabase: ReturnType<typeof createClient>,
  token: TokenRow
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // 60s buffer so we don't use a token that's about to expire
  if (token.expires_at > now + 60) {
    log("info", "token reused", { expires_in: token.expires_at - now });
    return token.access_token;
  }

  const clientId = Deno.env.get("STRAVA_CLIENT_ID");
  const clientSecret = Deno.env.get("STRAVA_CLIENT_SECRET");

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[token] refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("strava_tokens")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", token.id);

  if (error) throw new Error(`[token] persist failed: ${error.message}`);

  log("info", "token refreshed", { expires_at: data.expires_at });
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Fetch activities
// ---------------------------------------------------------------------------

async function fetchActivities(
  accessToken: string,
  after: number
): Promise<StravaSummaryActivity[]> {
  const url = `${STRAVA_ACTIVITIES_URL}?after=${after}&per_page=30`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[fetch] activities failed (${res.status}): ${text}`);
  }

  return (await res.json()) as StravaSummaryActivity[];
}

// ---------------------------------------------------------------------------
// Map + persist
// ---------------------------------------------------------------------------

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toRideRow(a: StravaSummaryActivity): StravaRideRow {
  return {
    strava_activity_id: a.id,
    ride_date: a.start_date,
    distance_km: round(a.distance / 1000, 2),
    elevation_gain_m: round(a.total_elevation_gain, 1),
    average_speed_kmh: round(a.average_speed * 3.6, 2),
    raw_response: a,
  };
}

async function insertRides(
  supabase: ReturnType<typeof createClient>,
  rows: StravaRideRow[]
): Promise<number> {
  if (rows.length === 0) return 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("strava_rides")
    .upsert(rows, {
      onConflict: "strava_activity_id",
      ignoreDuplicates: true,
    })
    .select("strava_activity_id");

  if (error) throw new Error(`[insert] ${error.message}`);

  return (data ?? []).length;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  const authError = authorize(req);
  if (authError) return authError;

  log("info", "run started");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: token, error: tokenError } = await supabase
      .from("strava_tokens")
      .select("*")
      .limit(1)
      .single();

    if (tokenError || !token) {
      log("error", "no strava tokens found", { error: tokenError?.message });
      return errorResponse(
        500,
        "No Strava tokens found. Run pnpm strava:auth first."
      );
    }

    const accessToken = await ensureFreshToken(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase as any,
      token as TokenRow
    );

    // Fetch activities from the last 24 hours
    const since = Math.floor(Date.now() / 1000) - 86400;
    const activities = await fetchActivities(accessToken, since);
    log("info", "activities fetched", { fetched: activities.length });

    const rides = activities.filter((a) =>
      RIDE_SPORT_TYPES.includes(a.sport_type)
    );
    log("info", "activities filtered", {
      kept: rides.length,
      dropped: activities.length - rides.length,
    });

    const rows = rides.map(toRideRow);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inserted = await insertRides(supabase as any, rows);
    const skipped = rows.length - inserted;
    log("info", "rides upserted", { inserted, skipped });

    return new Response(
      JSON.stringify({
        fetched: activities.length,
        kept: rides.length,
        inserted,
        skipped,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = (err as Error).message;
    log("error", "run failed", { error: message });
    return errorResponse(502, message);
  }
});
