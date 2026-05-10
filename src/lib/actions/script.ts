"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateScript,
  regenerateLine,
  type ScriptLine,
  type PropertyContext,
  type ScriptInput,
} from "@/lib/ai/generate-script";
import type { StoryboardScene } from "@/lib/ai/generate-storyboard";

async function getProjectContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
): Promise<PropertyContext | null> {
  const { data } = await supabase
    .schema("video")
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (!data) return null;

  return {
    title: data.title as string,
    propertyType: (data.property_type ?? "residential") as string,
    city: (data.city ?? "") as string,
    state: (data.state ?? "") as string,
    bedrooms: (data.bedrooms ?? 0) as number,
    bathrooms: (data.bathrooms ?? 0) as number,
    builtUpSqft: data.built_up_sqft as number | undefined,
    price: data.price as number | undefined,
    keyFeatures: (data.key_features ?? []) as string[],
    description: data.description as string | undefined,
  };
}

export async function generateScriptAction(
  projectId: string,
  scenes: StoryboardScene[],
  language: "en" | "bm" = "en"
): Promise<{ lines: ScriptLine[]; error?: never } | { error: string; lines?: never }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const property = await getProjectContext(supabase, projectId, user.id);
  if (!property) return { error: "Project not found" };

  const sceneInputs: ScriptInput[] = scenes.map((s) => ({
    sceneId: s.id,
    sceneTag: s.sceneTag,
    sceneLabel: s.sceneLabel,
    currentNarration: s.narrationLine,
  }));

  return generateScript(property, sceneInputs, language);
}

export async function regenerateLineAction(
  projectId: string,
  scene: StoryboardScene,
  language: "en" | "bm" = "en"
): Promise<{ narrationLine: string; error?: never } | { error: string; narrationLine?: never }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const property = await getProjectContext(supabase, projectId, user.id);
  if (!property) return { error: "Project not found" };

  return regenerateLine(
    property,
    {
      sceneId: scene.id,
      sceneTag: scene.sceneTag,
      sceneLabel: scene.sceneLabel,
      currentNarration: scene.narrationLine,
    },
    language
  );
}
