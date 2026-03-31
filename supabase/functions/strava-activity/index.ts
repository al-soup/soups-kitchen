import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_ACTIVITIES_URL =
  "https://www.strava.com/api/v3/athlete/activities";

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

interface TokenRow {
  id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function ensureFreshToken(
  supabase: ReturnType<typeof createClient>,
  token: TokenRow,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // 60s buffer so we don't use a token that's about to expire
  if (token.expires_at > now + 60) {
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
    throw new Error(`Strava token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  const { error } = await supabase
    .from("strava_tokens")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", token.id);

  if (error) throw new Error(`Failed to update tokens: ${error.message}`);

  return data.access_token;
}

// ---------------------------------------------------------------------------
// Fetch activities
// ---------------------------------------------------------------------------

async function fetchActivities(
  accessToken: string,
  after: number,
): Promise<unknown[]> {
  const url = `${STRAVA_ACTIVITIES_URL}?after=${after}&per_page=30`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava activities fetch failed (${res.status}): ${text}`);
  }

  return res.json();
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

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: token, error: tokenError } = await supabase
      .from("strava_tokens")
      .select("*")
      .limit(1)
      .single();

    if (tokenError || !token) {
      return errorResponse(
        500,
        "No Strava tokens found. Run pnpm strava:auth first.",
      );
    }

    const accessToken = await ensureFreshToken(supabase, token as TokenRow);

    // const yesterday = Math.floor(Date.now() / 1000) - 86400 * 14; // last 14 days // FIXME
    // Fetch activities from the last 24 hours
    const yesterday = Math.floor(Date.now() / 1000) - 86400;
    const activities = await fetchActivities(accessToken, yesterday);

    return new Response(
      JSON.stringify({ activities, count: activities.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return errorResponse(502, (err as Error).message);
  }
});
