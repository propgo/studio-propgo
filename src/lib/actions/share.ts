"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

const SHARE_VALIDITY_DAYS = 30;

export async function generateShareLink(
  generationId: string
): Promise<{ shareUrl: string; error?: never } | { error: string; shareUrl?: never }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: gen } = await supabase
    .schema("video")
    .from("generations")
    .select("id, share_token, output_url")
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single();

  if (!gen) return { error: "Generation not found" };
  if (!gen.output_url) return { error: "Video not ready yet" };

  // Reuse existing token if still valid
  if (gen.share_token) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://studio.propgo.my";
    return { shareUrl: `${baseUrl}/share/${gen.share_token as string}` };
  }

  const token = uuidv4().replace(/-/g, "");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SHARE_VALIDITY_DAYS);

  const { error } = await supabase
    .schema("video")
    .from("generations")
    .update({ share_token: token, share_expires_at: expiresAt.toISOString() })
    .eq("id", generationId);

  if (error) return { error: error.message };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://studio.propgo.my";
  return { shareUrl: `${baseUrl}/share/${token}` };
}

export async function getSharedGeneration(token: string) {
  // Use anon client — public read via share token policy
  const supabase = await createClient();

  const { data } = await supabase
    .schema("video")
    .from("generations")
    .select("id, output_url, project_id, created_at, voice_style, voiceover_script")
    .eq("share_token", token)
    .gt("share_expires_at", new Date().toISOString())
    .single();

  if (!data) return null;

  // Load project title
  const { data: project } = await supabase
    .schema("video")
    .from("projects")
    .select("title, city, state, property_type")
    .eq("id", data.project_id as string)
    .single();

  return {
    outputUrl: data.output_url as string,
    projectTitle: (project?.title as string) ?? "Property Video",
    city: (project?.city as string) ?? "",
    state: (project?.state as string) ?? "",
    propertyType: (project?.property_type as string) ?? "",
    createdAt: data.created_at as string,
  };
}
