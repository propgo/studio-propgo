import { fal } from "@fal-ai/client";
import { SCENE_TAGS, type SceneTagValue } from "@/lib/constants/scene-tags";

if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

const TAG_DESCRIPTIONS = SCENE_TAGS.map(
  (t) => `- "${t.value}": ${t.label}`
).join("\n");

const SYSTEM_PROMPT = `You are a real estate photo classifier. Given a property photo, classify it into exactly ONE of the following scene tags:\n\n${TAG_DESCRIPTIONS}\n\nRespond with ONLY the scene tag value (e.g. "living_room"), nothing else.`;

interface FalVisionResult {
  output?: string;
  error?: string;
}

export async function autoTagPhoto(imageUrl: string): Promise<{ scene_tag: SceneTagValue; error?: never } | { scene_tag?: never; error: string }> {
  if (!process.env.FAL_KEY) {
    // No API key — return a sensible default based on URL heuristics
    return { scene_tag: guessTagFromUrl(imageUrl) };
  }

  try {
    const result = await fal.run("fal-ai/any-llm/vision", {
      input: {
        model: "google/gemini-flash-1-5",
        system_prompt: SYSTEM_PROMPT,
        prompt: "What type of room or area is shown in this property photo? Reply with ONLY the scene tag value.",
        image_url: imageUrl,
        max_tokens: 32,
      },
    }) as FalVisionResult;

    const raw = (result.output ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const matched = SCENE_TAGS.find((t) => t.value === raw);
    return { scene_tag: matched?.value ?? "exterior_facade" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fal.ai error";
    return { error: msg };
  }
}

function guessTagFromUrl(url: string): SceneTagValue {
  const lower = url.toLowerCase();
  if (lower.includes("exterior") || lower.includes("facade") || lower.includes("front")) return "exterior_facade";
  if (lower.includes("kitchen")) return "kitchen";
  if (lower.includes("master") || lower.includes("bedroom")) return "master_bedroom";
  if (lower.includes("living")) return "living_room";
  if (lower.includes("bathroom") || lower.includes("toilet")) return "bathroom";
  if (lower.includes("pool")) return "exterior_pool";
  if (lower.includes("balcony")) return "balcony";
  return "exterior_facade";
}
