import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_BUCKET = "studio-uploads";
const VIDEOS_BUCKET = "studio-videos";

export type UploadResult = { path: string; url: string; error?: never } | { path?: never; url?: never; error: string };

function buildUploadPath(userId: string, projectId: string, type: "photo" | "floor-plan", filename: string) {
  const ext = filename.split(".").pop() ?? "jpg";
  const id = uuidv4();
  return `${userId}/${projectId}/${type}/${id}.${ext}`;
}

export async function uploadPhoto(
  userId: string,
  projectId: string,
  file: File
): Promise<UploadResult> {
  const supabase = createClient();
  const path = buildUploadPath(userId, projectId, "photo", file.name);

  const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function uploadFloorPlan(
  userId: string,
  projectId: string,
  file: File
): Promise<UploadResult> {
  const supabase = createClient();
  const path = buildUploadPath(userId, projectId, "floor-plan", file.name);

  const { error } = await supabase.storage.from(UPLOADS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(UPLOADS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function deleteUpload(path: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(UPLOADS_BUCKET).remove([path]);
  if (error) return { error: error.message };
  return {};
}

export function getPublicVideoUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(VIDEOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
