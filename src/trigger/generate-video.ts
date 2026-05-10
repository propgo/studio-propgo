import { task, logger } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import { generateVideoClipWithFallback } from "@/lib/fal/generate-video";
import type { GenerationModelId, AspectRatioId } from "@/lib/constants/generation";
import type { StoryboardScene } from "@/lib/ai/generate-storyboard";

interface GenerateVideoPayload {
  generationId: string;
  projectId: string;
  storyboardId: string;
  userId: string;
  modelId: GenerationModelId;
  aspectRatio: AspectRatioId;
  quality: string;
  musicTrack: string;
  creditsToDeduct: number;
  voiceoverScript: { sceneId: string; narrationLine: string }[];
}

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: "video" } }
  );
}

export const generatePropertyVideo = task({
  id: "generate-property-video",
  maxDuration: 3600, // 60 minutes max
  run: async (payload: GenerateVideoPayload) => {
    const supabase = getServiceSupabase();

    async function updateStatus(
      status: string,
      extra: Record<string, unknown> = {}
    ) {
      await supabase
        .from("generations")
        .update({ status, ...extra })
        .eq("id", payload.generationId);
    }

    logger.info("Starting video generation", { generationId: payload.generationId });

    // Step 1: Load storyboard scenes + photos
    await updateStatus("generating");

    const { data: storyboard } = await supabase
      .from("storyboards")
      .select("scenes")
      .eq("id", payload.storyboardId)
      .single();

    if (!storyboard) {
      await updateStatus("failed", { error_message: "Storyboard not found" });
      throw new Error("Storyboard not found");
    }

    const scenes = storyboard.scenes as StoryboardScene[];

    // Load signed URLs for each scene's photo
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const photoIds = scenes
      .filter((s) => s.photoId)
      .map((s) => s.photoId as string);

    const { data: photos } = await publicClient
      .schema("video")
      .from("project_photos")
      .select("id, storage_path")
      .in("id", photoIds);

    const photoPathMap = new Map(photos?.map((p) => [p.id, p.storage_path]) ?? []);

    // Step 2: Generate a clip per scene
    const clipUrls: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene) continue;

      logger.info(`Generating clip ${i + 1}/${scenes.length}`, { sceneId: scene.id });

      const storagePath = scene.photoId ? photoPathMap.get(scene.photoId) : null;

      if (!storagePath) {
        logger.warn("No photo for scene, skipping clip", { sceneId: scene.id });
        continue;
      }

      // Get a signed URL for the photo
      const { data: signedData } = await publicClient.storage
        .from("studio-uploads")
        .createSignedUrl(storagePath, 3600);

      if (!signedData?.signedUrl) {
        logger.warn("Could not get signed URL", { storagePath });
        continue;
      }

      try {
        const clip = await generateVideoClipWithFallback({
          imageUrl: signedData.signedUrl,
          prompt: scene.narrationLine ?? scene.sceneLabel,
          cameraMovement: scene.cameraMovement ?? "slow_pan",
          modelId: payload.modelId,
          aspectRatio: payload.aspectRatio,
        });
        clipUrls.push(clip.outputUrl);
        if (clip.usedFallback) {
          logger.warn("Used fallback model for clip", { sceneId: scene.id });
        }
      } catch (err) {
        logger.error("Clip generation failed", { sceneId: scene.id, error: err });
        // Continue with remaining scenes rather than aborting
      }
    }

    if (clipUrls.length === 0) {
      await updateStatus("failed", { error_message: "All clip generations failed" });
      throw new Error("No clips generated");
    }

    // Step 3: Call Remotion worker to stitch clips
    await updateStatus("rendering", {
      fal_job_id: `clips-${payload.generationId}`,
    });

    const workerUrl = process.env.REMOTION_WORKER_URL;
    let finalOutputUrl = clipUrls[0]; // fallback = first raw clip

    if (workerUrl) {
      try {
        const manifest = {
          generationId: payload.generationId,
          projectTitle: "Property Video",
          scenes: scenes
            .map((s, i) => ({
              id: s.id,
              clipUrl: clipUrls[i] ?? clipUrls[0],
              narrationLine: payload.voiceoverScript.find((v) => v.sceneId === s.id)?.narrationLine ?? s.narrationLine ?? "",
              sceneLabel: s.sceneLabel,
              durationSeconds: 5,
              cameraMovement: s.cameraMovement ?? "static",
            }))
            .filter((_, i) => clipUrls[i]),
          brandKit: {
            agentName: "PropGo Agent",
            primaryColor: "#4A6CF7",
          },
          musicTrack: payload.musicTrack,
          aspectRatio: payload.aspectRatio,
          quality: payload.quality,
          watermark: false,
        };

        const workerSecret = process.env.WORKER_SECRET ?? "";
        const renderRes = await fetch(`${workerUrl}/render`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(workerSecret ? { Authorization: `Bearer ${workerSecret}` } : {}),
          },
          body: JSON.stringify(manifest),
        });

        if (renderRes.ok) {
          const { jobId } = await renderRes.json() as { jobId: string };

          // Poll for completion (max 45 min)
          let outputUrl: string | null = null;
          for (let poll = 0; poll < 540; poll++) {
            await new Promise((r) => setTimeout(r, 5000));
            const statusRes = await fetch(`${workerUrl}/render/${jobId}/status`, {
              headers: workerSecret ? { Authorization: `Bearer ${workerSecret}` } : {},
            });
            if (statusRes.ok) {
              const status = await statusRes.json() as { status: string; outputUrl: string | null; progress: number };
              logger.info("Render progress", { progress: status.progress });
              if (status.status === "complete" && status.outputUrl) {
                outputUrl = status.outputUrl;
                break;
              }
              if (status.status === "failed") {
                logger.warn("Remotion render failed, using raw clip fallback");
                break;
              }
            }
          }

          if (outputUrl) finalOutputUrl = outputUrl;
        } else {
          logger.warn("Remotion worker returned error, using raw clip fallback");
        }
      } catch (err) {
        logger.warn("Remotion worker unreachable, using raw clip fallback", { err });
      }
    } else {
      logger.warn("REMOTION_WORKER_URL not set — using raw clip as output");
    }

    // Step 4: Mark complete + deduct credits
    await updateStatus("complete", {
      output_url: finalOutputUrl,
      completed_at: new Date().toISOString(),
      duration_seconds: scenes.length * 5,
    });

    // Deduct credits
    await supabase.from("credit_transactions").insert({
      user_id: payload.userId,
      type: "generation_consume",
      amount: -payload.creditsToDeduct,
      generation_id: payload.generationId,
      description: `Video generation - ${scenes.length} scenes`,
    });

    // Reduce wallet balance
    await supabase.rpc("deduct_credits", {
      p_user_id: payload.userId,
      p_amount: payload.creditsToDeduct,
    });

    logger.info("Generation complete", {
      generationId: payload.generationId,
      clipCount: clipUrls.length,
      outputUrl: finalOutputUrl,
    });

    return { success: true, clipCount: clipUrls.length, outputUrl: finalOutputUrl };
  },
});
