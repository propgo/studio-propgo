import { fal } from "@fal-ai/client";
import type { GenerationModelId, AspectRatioId } from "@/lib/constants/generation";
import { GENERATION_MODELS } from "@/lib/constants/generation";

if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

export interface VideoClipInput {
  imageUrl: string;
  prompt: string;
  cameraMovement: string;
  modelId: GenerationModelId;
  aspectRatio: AspectRatioId;
}

export interface VideoClipResult {
  outputUrl: string;
  falJobId: string;
  durationSeconds: number;
}

interface FalVideoOutput {
  video?: { url: string };
  request_id?: string;
}

const CAMERA_PROMPT_MAP: Record<string, string> = {
  static: "static shot, stable camera",
  pan_left: "slow pan left",
  pan_right: "slow pan right",
  zoom_in: "slow zoom in",
  zoom_out: "slow zoom out",
  tilt_up: "slow tilt up",
  tilt_down: "slow tilt down",
  dolly_forward: "dolly forward through space",
  dolly_back: "dolly back, reveal shot",
  orbit: "slow orbit around subject",
  aerial_descend: "aerial drone descend",
  handheld: "handheld camera movement",
};

function buildVideoPrompt(prompt: string, cameraMovement: string): string {
  const cameraDesc = CAMERA_PROMPT_MAP[cameraMovement] ?? cameraMovement;
  return `${prompt}. ${cameraDesc}. Cinematic, high quality real estate video, professional lighting, 4K.`;
}

async function callFalModel(
  falModel: string,
  imageUrl: string,
  prompt: string,
  aspectRatio: AspectRatioId
): Promise<FalVideoOutput> {
  const result = await fal.run(falModel, {
    input: {
      image_url: imageUrl,
      prompt,
      aspect_ratio: aspectRatio,
      duration: 5,
    },
  });
  return result as FalVideoOutput;
}

export async function generateVideoClip(
  input: VideoClipInput,
  retries = 2
): Promise<VideoClipResult> {
  const models = GENERATION_MODELS;
  const modelIndex = models.findIndex((m) => m.id === input.modelId);
  const fullPrompt = buildVideoPrompt(input.prompt, input.cameraMovement);

  // Try primary model, then fall back to lower-cost tier
  for (let attempt = 0; attempt <= retries; attempt++) {
    const fallbackIndex = Math.min(modelIndex + attempt, models.length - 1);
    const model = models[fallbackIndex];
    if (!model) break;

    try {
      const result = await callFalModel(model.falModel, input.imageUrl, fullPrompt, input.aspectRatio);

      const outputUrl = result?.video?.url;
      if (!outputUrl) throw new Error("No output URL returned from Fal.ai");

      return {
        outputUrl,
        falJobId: result.request_id ?? `fal-${Date.now()}`,
        durationSeconds: 5,
      };
    } catch (err) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) throw err;
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }

  throw new Error("All video generation attempts failed");
}

export async function generateVideoClipWithFallback(
  input: VideoClipInput
): Promise<VideoClipResult & { usedFallback: boolean }> {
  try {
    const result = await generateVideoClip(input, 0);
    return { ...result, usedFallback: false };
  } catch {
    // Try next tier down
    const models = GENERATION_MODELS;
    const modelIndex = models.findIndex((m) => m.id === input.modelId);
    const fallback = models[Math.max(0, modelIndex - 1)];

    if (!fallback || fallback.id === input.modelId) throw new Error("No fallback model available");

    const result = await generateVideoClip({ ...input, modelId: fallback.id }, 2);
    return { ...result, usedFallback: true };
  }
}
