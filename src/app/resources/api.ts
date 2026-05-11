import { getSupabase } from "@/lib/supabase/client";
import { RESOURCES_BUCKET, type Resource } from "@/lib/supabase/types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export function sanitizeFilename(name: string): string {
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

function defaultLabel(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

export async function listResources(): Promise<Resource[]> {
  const { data, error } = await getSupabase()
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Resource[];
}

export async function uploadResource(file: File): Promise<Resource> {
  const supabase = getSupabase();
  const id = crypto.randomUUID();
  const safeName = sanitizeFilename(file.name);
  const storagePath = `${id}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(RESOURCES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  if (uploadError) throw new UploadError(uploadError.message);

  const { data, error: insertError } = await supabase
    .from("resources")
    .insert({
      id,
      bucket: RESOURCES_BUCKET,
      storage_path: storagePath,
      filename: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      label: defaultLabel(file.name),
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(RESOURCES_BUCKET).remove([storagePath]);
    throw new Error(insertError.message);
  }

  return data as Resource;
}

export async function renameResource(
  id: string,
  label: string
): Promise<Resource> {
  const trimmed = label.trim();
  if (!trimmed) throw new Error("Label is required");

  const { data, error } = await getSupabase()
    .from("resources")
    .update({ label: trimmed })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Resource;
}

export async function deleteResource(resource: Resource): Promise<void> {
  const supabase = getSupabase();
  const { error: storageError } = await supabase.storage
    .from(resource.bucket)
    .remove([resource.storage_path]);
  if (storageError) throw new Error(storageError.message);

  const { error: deleteError } = await supabase
    .from("resources")
    .delete()
    .eq("id", resource.id);
  if (deleteError) throw new Error(deleteError.message);
}

export async function getSignedUrl(resource: Resource): Promise<string> {
  const { data, error } = await getSupabase()
    .storage.from(resource.bucket)
    .createSignedUrl(resource.storage_path, SIGNED_URL_TTL_SECONDS);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export function placeholderToken(resourceId: string): string {
  return `{{resource:${resourceId}}}`;
}
