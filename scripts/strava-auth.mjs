#!/usr/bin/env node

/**
 * One-time Strava OAuth setup script.
 * Opens browser for authorization, catches the callback,
 * exchanges the code for tokens, and stores them in strava_tokens.
 *
 * Required env vars:
 *   STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET,
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL),
 *   SERVICE_ROLE_KEY_SUPABASE,
 *   STRAVA_TOKEN_KEY (32+ char passphrase for at-rest token encryption)
 */

import { createServer } from "node:http";
import { URL } from "node:url";
import { exec } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CALLBACK_PORT = 8089;
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/callback`;

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------

function loadEnvFile(path) {
  try {
    const content = readFileSync(path, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // file not found — ignore
  }
}

// Load .env.local for convenience
loadEnvFile(resolve(process.cwd(), ".env.local"));

function requireEnv(name, fallback) {
  const value = process.env[name] || (fallback && process.env[fallback]);
  if (!value) {
    console.error(
      `Missing env var: ${name}${fallback ? ` (or ${fallback})` : ""}`
    );
    process.exit(1);
  }
  return value;
}

const CLIENT_ID = requireEnv("STRAVA_CLIENT_ID");
const CLIENT_SECRET = requireEnv("STRAVA_CLIENT_SECRET");
const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
const SERVICE_ROLE_KEY = requireEnv("SERVICE_ROLE_KEY_SUPABASE");
const STRAVA_TOKEN_KEY = requireEnv("STRAVA_TOKEN_KEY");

// ---------------------------------------------------------------------------
// Strava token exchange
// ---------------------------------------------------------------------------

async function exchangeCode(code) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token exchange failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Supabase upsert
// ---------------------------------------------------------------------------

async function storeTokens({
  access_token,
  refresh_token,
  expires_at,
  athlete,
}) {
  const headers = {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };

  // RPC encrypts plaintext columns with STRAVA_TOKEN_KEY before insert and
  // wipes any prior row.
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_strava_tokens`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      p_athlete_id: athlete.id,
      p_access_token: access_token,
      p_refresh_token: refresh_token,
      p_expires_at: expires_at,
      p_key: STRAVA_TOKEN_KEY,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase RPC failed (${res.status}): ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Open browser
// ---------------------------------------------------------------------------

function openBrowser(url) {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${cmd} "${url}"`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const authorizeUrl =
  `https://www.strava.com/oauth/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=activity:read_all` +
  `&approval_prompt=auto`;

console.log("Opening Strava authorization page...\n");
console.log(authorizeUrl, "\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);

  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>Authorization failed</h1><p>You can close this tab.</p>");
    console.error("Authorization denied or missing code:", error);
    server.close();
    process.exit(1);
  }

  try {
    console.log("Exchanging code for tokens...");
    const tokens = await exchangeCode(code);

    console.log(`Athlete ID: ${tokens.athlete.id}`);
    console.log(
      `Access token expires at: ${new Date(tokens.expires_at * 1000).toISOString()}`
    );

    console.log("Storing tokens in Supabase...");
    await storeTokens(tokens);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Success!</h1><p>Tokens stored. You can close this tab.</p>");
    console.log("\nDone! Tokens stored in strava_tokens table.");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`<h1>Error</h1><pre>${err.message}</pre>`);
    console.error(err);
  }

  server.close();
});

server.listen(CALLBACK_PORT, () => {
  console.log(`Listening on http://localhost:${CALLBACK_PORT}/callback\n`);
  openBrowser(authorizeUrl);
});
