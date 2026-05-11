"use server";

import { createClient } from "@/lib/supabase/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { GenerationConfig } from "@/components/projects/generation-config";
import type { ScriptLine } from "@/lib/ai/generate-script";
import type { VoiceStyleId } from "@/lib/constants/voices";

interface StartGenerationInput {
  projectId: string;
  storyboardId: string;
  config: GenerationConfig;
  scriptLines: ScriptLine[];
  voiceStyleId: VoiceStyleId;
  language: "en" | "bm";
}

export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("video")
    .from("wallets")
    .select("monthly_credits, topup_credits")
    .eq("user_id", userId)
    .single();

  if (!data) return 0;
  return (data.monthly_credits as number) + (data.topup_credits as number);
}

export async function startGeneration(
  input: StartGenerationInput
): Promise<{ generationId: string; error?: never } | { error: string; generationId?: never }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify user has enough credits
  const credits = await getUserCredits(user.id);
  if (credits < input.config.creditCost) {
    return { error: `Insufficient credits. Need ${input.config.creditCost}, have ${credits}.` };
  }

  // Create generation record
  const { data: generation, error: genError } = await supabase
    .schema("video")
    .from("generations")
    .insert({
      project_id: input.projectId,
      storyboard_id: input.storyboardId,
      user_id: user.id,
      model: input.config.modelId,
      aspect_ratio: input.config.aspectRatio,
      quality: input.config.quality,
      music_track: input.config.musicTrack,
      credits_used: input.config.creditCost,
      voiceover_script: input.scriptLines,
      voice_style: input.voiceStyleId,
      status: "queued",
    })
    .select("id")
    .single();

  if (genError || !generation) {
    return { error: genError?.message ?? "Failed to create generation record" };
  }

  // Deduct credits upfront so the balance reflects immediately.
  // The Trigger.dev task will refund on failure.
  const { error: deductError } = await supabase
    .schema("video")
    .rpc("deduct_credits", {
      p_user_id: user.id,
      p_amount: input.config.creditCost,
    });

  if (deductError) {
    // Roll back the generation record if deduction fails
    await supabase.schema("video").from("generations").delete().eq("id", generation.id);
    return { error: "Failed to deduct credits. Please try again." };
  }

  // Log the transaction immediately
  await supabase.schema("video").from("credit_transactions").insert({
    user_id: user.id,
    type: "generation_consume",
    amount: -input.config.creditCost,
    generation_id: generation.id,
    description: `Video generation queued`,
  });

  // Enqueue Trigger.dev task
  try {
    const handle = await tasks.trigger("generate-property-video", {
      generationId: generation.id as string,
      projectId: input.projectId,
      storyboardId: input.storyboardId,
      userId: user.id,
      modelId: input.config.modelId,
      aspectRatio: input.config.aspectRatio,
      quality: input.config.quality,
      musicTrack: input.config.musicTrack,
      creditsToDeduct: input.config.creditCost,
      voiceoverScript: input.scriptLines.map((l) => ({
        sceneId: l.sceneId,
        narrationLine: l.narrationLine,
      })),
    });

    // Store trigger run ID
    await supabase
      .schema("video")
      .from("generations")
      .update({ trigger_run_id: handle.id })
      .eq("id", generation.id);

    // Update project status
    await supabase
      .schema("video")
      .from("projects")
      .update({ status: "generating" })
      .eq("id", input.projectId);

    return { generationId: generation.id as string };
  } catch (err) {
    // Roll back generation record and refund credits if task enqueue fails
    await supabase.schema("video").from("generations").delete().eq("id", generation.id);
    await supabase.schema("video").rpc("refund_credits", {
      p_user_id: user.id,
      p_amount: input.config.creditCost,
    });
    const msg = err instanceof Error ? err.message : "Failed to start generation";
    return { error: msg };
  }
}
