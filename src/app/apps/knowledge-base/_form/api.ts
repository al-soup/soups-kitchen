import { getSupabase } from "@/lib/supabase/client";
import type {
  Knowledge,
  KnowledgeListItem,
  KnowledgeListPage,
  Tag,
} from "@/lib/supabase/types";

export interface KnowledgeFormInput {
  question: string;
  summary: string;
  detail: string | null;
  tagIds: string[];
}

export class NotFoundError extends Error {
  constructor(id: number | string) {
    super(`Knowledge entry ${id} not found`);
    this.name = "NotFoundError";
  }
}

function isNotFound(err: { code?: string; message: string }) {
  // PGRST116: .single() returned no rows. 22P02: invalid_text_representation
  // (e.g. id is not parseable as bigint).
  return err.code === "PGRST116" || err.code === "22P02";
}

function normalizeInput(input: KnowledgeFormInput) {
  const question = input.question.trim();
  const summary = input.summary.trim();
  const detail = input.detail?.trim() ? input.detail.trim() : null;
  if (!question) throw new Error("Question is required");
  if (!summary) throw new Error("Summary is required");
  return { question, summary, detail };
}

export async function createKnowledge(
  input: KnowledgeFormInput
): Promise<Knowledge> {
  const fields = normalizeInput(input);
  const supabase = getSupabase();

  const { data: entry, error: insertErr } = await supabase
    .from("knowledge")
    .insert(fields)
    .select("*")
    .single();
  if (insertErr) throw new Error(insertErr.message);

  if (input.tagIds.length > 0) {
    const rows = input.tagIds.map((tag_id) => ({
      knowledge_id: entry.id,
      tag_id,
    }));
    const { error: tagsErr } = await supabase
      .from("knowledge_tags")
      .insert(rows);
    if (tagsErr) {
      await supabase.from("knowledge").delete().eq("id", entry.id);
      throw new Error(tagsErr.message);
    }
  }
  return entry as Knowledge;
}

export async function updateKnowledge(
  id: number,
  input: KnowledgeFormInput
): Promise<Knowledge> {
  const fields = normalizeInput(input);
  const supabase = getSupabase();

  const { data: entry, error: updateErr } = await supabase
    .from("knowledge")
    .update(fields)
    .eq("id", id)
    .select("*")
    .single();
  if (updateErr) throw new Error(updateErr.message);

  await setKnowledgeTags(id, input.tagIds);
  return entry as Knowledge;
}

export async function setKnowledgeTags(
  knowledgeId: number,
  tagIds: string[]
): Promise<void> {
  const supabase = getSupabase();

  const { error: deleteErr } = await supabase
    .from("knowledge_tags")
    .delete()
    .eq("knowledge_id", knowledgeId);
  if (deleteErr) throw new Error(deleteErr.message);

  if (tagIds.length === 0) return;

  const rows = tagIds.map((tag_id) => ({
    knowledge_id: knowledgeId,
    tag_id,
  }));
  const { error: insertErr } = await supabase
    .from("knowledge_tags")
    .insert(rows);
  if (insertErr) throw new Error(insertErr.message);
}

export async function getKnowledge(
  id: number
): Promise<{ entry: Knowledge; tagIds: string[] }> {
  const supabase = getSupabase();

  const { data: entry, error: entryErr } = await supabase
    .from("knowledge")
    .select("*")
    .eq("id", id)
    .single();
  if (entryErr) {
    if (isNotFound(entryErr)) throw new NotFoundError(id);
    throw new Error(entryErr.message);
  }

  const { data: tagRows, error: tagsErr } = await supabase
    .from("knowledge_tags")
    .select("tag_id")
    .eq("knowledge_id", id);
  if (tagsErr) throw new Error(tagsErr.message);

  return {
    entry: entry as Knowledge,
    tagIds: (tagRows ?? []).map((r) => r.tag_id),
  };
}

export async function deleteKnowledge(id: number): Promise<void> {
  const { error } = await getSupabase().from("knowledge").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export interface ListKnowledgeParams {
  offset?: number;
  limit?: number;
  topicIds?: string[];
  conceptIds?: string[];
  q?: string;
  signal?: AbortSignal;
}

export async function listKnowledge({
  offset = 0,
  limit = 20,
  topicIds,
  conceptIds,
  q,
  signal,
}: ListKnowledgeParams = {}): Promise<KnowledgeListPage> {
  const supabase = getSupabase();
  const trimmed = q?.trim();
  const query = supabase.rpc("search_knowledge", {
    topic_ids: topicIds?.length ? topicIds : undefined,
    concept_ids: conceptIds?.length ? conceptIds : undefined,
    q: trimmed ? trimmed : undefined,
    p_offset: offset,
    p_limit: limit,
  });
  const { data, error } = await (signal ? query.abortSignal(signal) : query);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const visible = hasMore ? rows.slice(0, limit) : rows;
  const total = Number(rows[0]?.total_count ?? 0);

  const items: KnowledgeListItem[] = visible.map((row) => ({
    id: row.id,
    question: row.question,
    summary: row.summary,
    detail: row.detail,
    search_vector: row.search_vector,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: (row.tags ?? []) as Tag[],
  }));

  return { items, hasMore, total };
}

export async function getKnowledgeTotal(): Promise<number> {
  const { count, error } = await getSupabase()
    .from("knowledge")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}
