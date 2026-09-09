/**
 * Knowledge Base MCP server (remote, Streamable HTTP, stateless).
 *
 * Lets an agentic coding tool (Claude Code etc.) create KB entries from any
 * machine without running anything locally. Gated by a static bearer token
 * (KB_MCP_TOKEN); DB access uses the service role (bypasses RLS). The
 * KB→habit trigger fires as usual.
 *
 * Tools: kb_list_tags, kb_search, kb_create_entry.
 *
 * Register in Claude Code (user scope, once per machine):
 *   claude mcp add --transport http --scope user soups-kitchen-kb \
 *     https://<ref>.supabase.co/functions/v1/kb-mcp \
 *     --header "Authorization: Bearer <KB_MCP_TOKEN>"
 */

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

const SITE_URL = (
  Deno.env.get("KB_SITE_URL") ?? "https://www.soup.one"
).replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TagType = "topic" | "concept";

interface TagRow {
  id: string;
  name: string;
  type: TagType;
}

interface SearchRow {
  id: number;
  question: string;
  summary: string;
  tags: TagRow[] | null;
  total_count: number | string | null;
}

// Untyped client: generated DB types live in the Next app, not shared here.
// deno-lint-ignore no-explicit-any
type Supabase = SupabaseClient<any, "public", any>;

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

// Constant-time compare; `===` short-circuits and leaks length/prefix timing.
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

function authorize(req: Request): Response | null {
  const token = Deno.env.get("KB_MCP_TOKEN");
  if (!token)
    return Response.json(
      { error: "KB_MCP_TOKEN not configured" },
      { status: 500 }
    );
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!timingSafeEqual(provided, token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

async function fetchTags(supabase: Supabase): Promise<TagRow[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, type")
    .order("type")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as TagRow[];
}

function entryUrl(id: number): string {
  return `${SITE_URL}/apps/knowledge-base/${id}`;
}

/**
 * Resolve tag names (case-insensitive) to rows. Creates missing tags of the
 * given type when `createMissing` is true; otherwise throws listing unknowns.
 */
async function resolveTags(
  supabase: Supabase,
  names: string[],
  type: TagType,
  createMissing: boolean
): Promise<TagRow[]> {
  const wanted = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (wanted.length === 0) return [];

  const all = await fetchTags(supabase);
  const byName = new Map(all.map((t) => [t.name.toLowerCase(), t]));

  const found: TagRow[] = [];
  const missing: string[] = [];
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
    found.push(...((data ?? []) as unknown as TagRow[]));
  }
  return found;
}

// ---------------------------------------------------------------------------
// MCP server
// ---------------------------------------------------------------------------

function text(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
  };
}

function fail(message: string) {
  return { isError: true, content: [{ type: "text" as const, text: message }] };
}

async function run<T>(
  fn: () => Promise<T>
): Promise<T | ReturnType<typeof fail>> {
  try {
    return await fn();
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

function buildServer(supabase: Supabase): McpServer {
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
        const tags = await fetchTags(supabase);
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
    ({ query, limit }: { query: string; limit: number }) =>
      run(async () => {
        const { data, error } = await supabase.rpc("search_knowledge", {
          q: query,
          p_offset: 0,
          p_limit: limit,
        });
        if (error) throw new Error(error.message);
        const rows = ((data ?? []) as unknown as SearchRow[]).slice(0, limit);
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
    ({
      question,
      summary,
      detail,
      topics,
      concepts,
      create_missing_tags,
    }: {
      question: string;
      summary: string;
      detail?: string;
      topics: string[];
      concepts: string[];
      create_missing_tags: boolean;
    }) =>
      run(async () => {
        const topicRows = await resolveTags(
          supabase,
          topics,
          "topic",
          create_missing_tags
        );
        const conceptRows = await resolveTags(
          supabase,
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
        const created = entry as unknown as {
          id: number;
          question: string;
          created_at: string;
        };

        if (tagRows.length > 0) {
          const { error: tagsErr } = await supabase
            .from("knowledge_tags")
            .insert(
              tagRows.map((t) => ({ knowledge_id: created.id, tag_id: t.id }))
            );
          if (tagsErr) {
            await supabase.from("knowledge").delete().eq("id", created.id);
            throw new Error(`Linking tags failed: ${tagsErr.message}`);
          }
        }

        return text({
          id: created.id,
          url: entryUrl(created.id),
          question: created.question,
          tags: tagRows.map((t) => `${t.type}:${t.name}`),
          created_at: created.created_at,
        });
      })
  );

  return server;
}

// ---------------------------------------------------------------------------
// HTTP entry
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  const authError = authorize(req);
  if (authError) return authError;

  // deno-lint-ignore no-explicit-any
  const supabase: Supabase = createClient<any>(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Stateless: fresh server + transport per request, no session ids.
  const server = buildServer(supabase);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return await transport.handleRequest(req);
  } finally {
    await transport.close();
  }
});
