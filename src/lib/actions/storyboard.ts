"use server";

import { createClient } from "@/lib/supabase/server";
import { generateStoryboard, type StoryboardScene } from "@/lib/ai/generate-storyboard";

export async function generateStoryboardAction(projectId: string): Promise<
  { scenes: StoryboardScene[]; storyboardId: string; error?: never } | { error: string; scenes?: never; storyboardId?: never }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch project details
  const { data: project } = await supabase
    .schema("video")
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return { error: "Project not found" };

  // Fetch tagged photos
  const { data: photos } = await supabase
    .schema("video")
    .from("project_photos")
    .select("id, storage_path, scene_tag, ai_suggested_tag, upload_order")
    .eq("project_id", projectId)
    .order("upload_order", { ascending: true });

  // Fetch floor plans
  const { data: floorPlans } = await supabase
    .schema("video")
    .from("project_floor_plans")
    .select("id, storage_path, floor_label, include_in_video")
    .eq("project_id", projectId)
    .eq("include_in_video", true);

  // Build signed URLs for all photos
  const photoInputs = await Promise.all(
    (photos ?? []).map(async (p) => {
      let url = "";
      if (p.storage_path) {
        const { data } = await supabase.storage
          .from("studio-uploads")
          .createSignedUrl(p.storage_path, 3600);
        url = data?.signedUrl ?? "";
      }
      return {
        photoId: p.id as string,
        photoUrl: url,
        sceneTag: (p.scene_tag ?? "exterior_facade") as string,
        sceneLabel: p.scene_tag as string,
      };
    })
  );

  const hasFloorPlan = (floorPlans ?? []).length > 0;

  const propertyContext = {
    title: project.title as string,
    propertyType: (project.property_type ?? "residential") as string,
    state: (project.state ?? "") as string,
    city: (project.city ?? "") as string,
    bedrooms: (project.bedrooms ?? 0) as number,
    bathrooms: (project.bathrooms ?? 0) as number,
    floors: project.floors as number | undefined,
    builtUpSqft: project.built_up_sqft as number | undefined,
    furnishing: project.furnishing as string | undefined,
    tenure: project.tenure as string | undefined,
    price: project.price as number | undefined,
    keyFeatures: (project.key_features ?? []) as string[],
    description: project.description as string | undefined,
    hasFloorPlan,
  };

  const result = await generateStoryboard(propertyContext, photoInputs);
  if (result.error) return { error: result.error };

  // Get existing storyboard version count
  const { count } = await supabase
    .schema("video")
    .from("storyboards")
    .select("id", { count: "exact" })
    .eq("project_id", projectId);

  const version = (count ?? 0) + 1;

  // Save storyboard
  const { data: saved, error: saveErr } = await supabase
    .schema("video")
    .from("storyboards")
    .insert({
      project_id: projectId,
      scenes: result.scenes,
      version,
    })
    .select("id")
    .single();

  if (saveErr) return { error: saveErr.message };

  return { scenes: result.scenes ?? [], storyboardId: saved.id as string };
}

export async function saveStoryboard(
  projectId: string,
  storyboardId: string,
  scenes: StoryboardScene[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: project } = await supabase
    .schema("video")
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return { error: "Project not found" };

  const { error: updateErr } = await supabase
    .schema("video")
    .from("storyboards")
    .update({ scenes })
    .eq("id", storyboardId);

  if (updateErr) return { error: updateErr.message };

  // Update project status to storyboard_ready
  await supabase
    .schema("video")
    .from("projects")
    .update({ status: "storyboard_ready" })
    .eq("id", projectId);

  return {};
}
