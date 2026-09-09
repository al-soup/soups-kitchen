#!/usr/bin/env node

/**
 * Knowledge Base MCP server (stdio).
 *
 * Lets an agentic coding tool (Claude Code etc.) create KB entries directly
 * from the CLI. Talks to Supabase with the same RLS path as the web form:
 * signs in as a user holding the `manager` role on `knowledge`.
 *
 * Tools: kb_list_tags, kb_search, kb_create_entry.
 *
 * Config (env vars override file): `mcp/kb/.env` next to this file.
 *   KB_SUPABASE_URL              e.g. https://<ref>.supabase.co
 *   KB_SUPABASE_PUBLISHABLE_KEY  anon / publishable key
 *   KB_EMAIL                     manager user email
 *   KB_PASSWORD                  manager user password
 *   KB_SITE_URL                  optional, default https://www.soup.one
 *
 * Register: see README.md "Knowledge Base MCP".
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path) {
  try {
    for (const line of readFileSync(path, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // no env file — rely on process.env
  }
}

loadEnvFile(resolve(HERE, ".env"));

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`kb-mcp: missing ${name} (set env var or mcp/kb/.env)`);
    process.exit(1);
  }
  return v;
}

const SUPABASE_URL = requireEnv("KB_SUPABASE_URL");
const SUPABASE_KEY = requireEnv("KB_SUPABASE_PUBLISHABLE_KEY");
const EMAIL = requireEnv("KB_EMAIL");
const PASSWORD = requireEnv("KB_PASSWORD");
const SITE_URL = (process.env.KB_SITE_URL ?? "https://www.soup.one").replace(
  /\/$/,
  ""
);

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: true },
});

let signedIn = false;
async function ensureSession() {
  if (signedIn) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return;
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (error) throw new Error(`Sign-in failed: ${error.message}`);
  signedIn = true;
}

async function fetchTags() {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, type")
    .order("type")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

function entryUrl(id) {
  return `${SITE_URL}/apps/knowledge-base/${id}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function text(payload) {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return { content: [{ type: "text", text: body }] };
}

function fail(message) {
  return { isError: true, content: [{ type: "text", text: message }] };
}

async function run(fn) {
  try {
    await ensureSession();
    return await fn();
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

/**
 * Resolve tag names (case-insensitive) to rows. Creates missing tags of the
 * given type when `createMissing` is true; otherwise throws listing unknowns.
 */
async function resolveTags(names, type, createMissing) {
  const wanted = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (wanted.length === 0) return [];

  const all = await fetchTags();
  const byName = new Map(all.map((t) => [t.name.toLowerCase(), t]));

  const found = [];
  const missing = [];
  for (const name of wanted) {
    const hit = byName.get(name.toLowerCase());
    if (!hit) missing.push(name);
    else if (hit.type !== type)
      throw new Error(`Tag "${hit.name}" is a ${hit.type}, not a ${type}`);
    else found.push(hit);
  }

  if (missing.length > 0) {
    if (!createMissing) {
      throw new Error(
        `Unknown ${type} tag(s): ${missing.join(", ")}. ` +
          `Call kb_list_tags to see existing tags or pass create_missing_tags=true.`
      );
    }
    const { data, error } = await supabase
      .from("tags")
      .insert(missing.map((name) => ({ name, type })))
      .select("id, name, type");
    if (error) throw new Error(`Creating tags failed: ${error.message}`);
    found.push(...(data ?? []));
  }
  return found;
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({ name: "soups-kitchen-kb", version: "1.0.0" });

server.registerTool(
  "kb_list_tags",
  {
    title: "List KB tags",
    description:
      "List existing knowledge base tags grouped by type (topic / concept). " +
      "Call before kb_create_entry to pick fitting tags.",
    inputSchema: {},
  },
  () =>
    run(async () => {
      const tags = await fetchTags();
      return text({
        topics: tags.filter((t) => t.type === "topic").map((t) => t.name),
        concepts: tags.filter((t) => t.type === "concept").map((t) => t.name),
      });
    })
);

server.registerTool(
  "kb_search",
  {
    title: "Search KB",
    description:
      "Full-text + fuzzy search over knowledge base entries. Use to check " +
      "for an existing entry before creating a duplicate.",
    inputSchema: {
      query: z.string().min(1).describe("Search terms"),
      limit: z.number().int().min(1).max(50).default(10),
    },
  },
  ({ query, limit }) =>
    run(async () => {
      const { data, error } = await supabase.rpc("search_knowledge", {
        q: query,
        p_offset: 0,
        p_limit: limit,
      });
      if (error) throw new Error(error.message);
      const rows = (data ?? []).slice(0, limit);
      return text({
        total: Number(rows[0]?.total_count ?? 0),
        items: rows.map((r) => ({
          id: r.id,
          question: r.question,
          summary: r.summary,
          tags: (r.tags ?? []).map((t) => t.name),
          url: entryUrl(r.id),
        })),
      });
    })
);

server.registerTool(
  "kb_create_entry",
  {
    title: "Create KB entry",
    description:
      "Create a knowledge base entry. `question` is the title, `summary` is " +
      "1-2 sentences, `detail` is markdown (code blocks, ascii diagrams ok). " +
      "Tags are matched by name, case-insensitive; unknown tags fail unless " +
      "create_missing_tags=true. Returns id + URL.",
    inputSchema: {
      question: z.string().min(1).describe("Title, phrased as a question"),
      summary: z.string().min(1).describe("1-2 sentence core answer"),
      detail: z
        .string()
        .optional()
        .describe("Markdown body. Omit for summary-only entries."),
      topics: z
        .array(z.string())
        .default([])
        .describe("Topic tag names, e.g. ['TypeScript']"),
      concepts: z
        .array(z.string())
        .default([])
        .describe("Concept tag names, e.g. ['Cache']"),
      create_missing_tags: z
        .boolean()
        .default(false)
        .describe("Create tags that don't exist yet"),
    },
  },
  ({ question, summary, detail, topics, concepts, create_missing_tags }) =>
    run(async () => {
      const topicRows = await resolveTags(topics, "topic", create_missing_tags);
      const conceptRows = await resolveTags(
        concepts,
        "concept",
        create_missing_tags
      );
      const tagRows = [...topicRows, ...conceptRows];

      const fields = {
        question: question.trim(),
        summary: summary.trim(),
        detail: detail?.trim() ? detail.trim() : null,
      };
      const { data: entry, error: insertErr } = await supabase
        .from("knowledge")
        .insert(fields)
        .select("id, question, created_at")
        .single();
      if (insertErr) throw new Error(insertErr.message);

      if (tagRows.length > 0) {
        const { error: tagsErr } = await supabase
          .from("knowledge_tags")
          .insert(
            tagRows.map((t) => ({ knowledge_id: entry.id, tag_id: t.id }))
          );
        if (tagsErr) {
          await supabase.from("knowledge").delete().eq("id", entry.id);
          throw new Error(`Linking tags failed: ${tagsErr.message}`);
        }
      }

      return text({
        id: entry.id,
        url: entryUrl(entry.id),
        question: entry.question,
        tags: tagRows.map((t) => `${t.type}:${t.name}`),
        created_at: entry.created_at,
      });
    })
);

const transport = new StdioServerTransport();
await server.connect(transport);
