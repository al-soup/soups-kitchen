#!/usr/bin/env node

/**
 * Local-dev resource seeder. Uploads files from supabase/seed-files/ into the
 * 'resources' Storage bucket and inserts matching rows into public.resources.
 *
 * Designed to run after `supabase db reset`. Skips silently when the seed
 * directory is missing or empty. Never blocks the reset on failure — all
 * errors are logged and the process always exits 0.
 */

import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.resolve(__dirname, "..", "supabase", "seed-files");
const BUCKET = "resources";

const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
  ".md": "text/markdown",
  ".txt": "text/plain",
  ".json": "application/json",
};

function sanitizeFilename(name) {
  const lastDot = name.lastIndexOf(".");
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  const ext = lastDot > 0 ? name.slice(lastDot) : "";
  const safeBase =
    base
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}._-]+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "file";
  const safeExt = ext.replace(/[^A-Za-z0-9.]/g, "").toLowerCase();
  return `${safeBase}${safeExt}`;
}

function defaultLabel(filename) {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

function listSeedFiles() {
  let entries;
  try {
    entries = readdirSync(SEED_DIR);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  return entries.filter((name) => {
    if (name.startsWith(".")) return false;
    try {
      return statSync(path.join(SEED_DIR, name)).isFile();
    } catch {
      return false;
    }
  });
}

function readSupabaseEnv() {
  // `supabase status -o env` prints KEY="value" lines. Parse them into a map.
  const out = execSync("supabase status -o env", {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const env = {};
  for (const line of out.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="(.*)"$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const files = listSeedFiles();
  if (files.length === 0) {
    console.log("seed-resources: no files in supabase/seed-files/, skipping.");
    return;
  }

  let env;
  try {
    env = readSupabaseEnv();
  } catch (err) {
    console.warn(
      "seed-resources: could not read `supabase status -o env`. Is Supabase running?",
      err.message
    );
    return;
  }

  const apiUrl = env.API_URL;
  const serviceKey = env.SERVICE_ROLE_KEY;
  if (!apiUrl || !serviceKey) {
    console.warn(
      "seed-resources: missing API_URL or SERVICE_ROLE_KEY from supabase status."
    );
    return;
  }

  const supabase = createClient(apiUrl, serviceKey, {
    auth: { persistSession: false },
  });

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filename of files) {
    const filepath = path.join(SEED_DIR, filename);
    const buffer = readFileSync(filepath);
    const ext = path.extname(filename).toLowerCase();
    const mime = MIME_BY_EXT[ext] ?? "application/octet-stream";
    const id = randomUUID();
    const safeName = sanitizeFilename(filename);
    const storagePath = `${id}/${safeName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType: mime, upsert: false });
      if (uploadError) {
        // Treat "already exists" as a skip — same dir + same UUIDs can't
        // really collide, but be defensive.
        if (/already exists/i.test(uploadError.message)) {
          skipped++;
          continue;
        }
        throw new Error(`storage upload failed: ${uploadError.message}`);
      }

      const { error: insertError } = await supabase.from("resources").insert({
        id,
        bucket: BUCKET,
        storage_path: storagePath,
        filename,
        mime_type: mime,
        size_bytes: buffer.byteLength,
        label: defaultLabel(filename),
      });
      if (insertError) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
        throw new Error(`insert failed: ${insertError.message}`);
      }

      uploaded++;
      console.log(`seed-resources: uploaded ${filename}`);
    } catch (err) {
      failed++;
      console.warn(`seed-resources: ${filename} — ${err.message}`);
    }
  }

  console.log(
    `seed-resources: done. uploaded=${uploaded} skipped=${skipped} failed=${failed}`
  );
}

main().catch((err) => {
  console.warn("seed-resources: unexpected error:", err);
});
