import { getSupabase } from "@/lib/supabase/client";
import type { Tag, TagType } from "@/lib/supabase/types";

export class DuplicateTagError extends Error {
  constructor(name: string) {
    super(`Tag "${name}" already exists`);
    this.name = "DuplicateTagError";
  }
}

type PostgrestErrorLike = { code?: string; message: string };

function isDuplicateError(err: PostgrestErrorLike): boolean {
  return err.code === "23505";
}

export async function listTags(): Promise<Tag[]> {
  const { data, error } = await getSupabase()
    .from("tags")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Tag[];
}

export async function createTag(name: string, type: TagType): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");

  const { data, error } = await getSupabase()
    .from("tags")
    .insert({ name: trimmed, type })
    .select("*")
    .single();

  if (error) {
    if (isDuplicateError(error)) throw new DuplicateTagError(trimmed);
    throw new Error(error.message);
  }
  return data as Tag;
}

export async function renameTag(id: string, name: string): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");

  const { data, error } = await getSupabase()
    .from("tags")
    .update({ name: trimmed })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (isDuplicateError(error)) throw new DuplicateTagError(trimmed);
    throw new Error(error.message);
  }
  return data as Tag;
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await getSupabase().from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
