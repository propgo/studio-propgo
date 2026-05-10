import { fal } from "@fal-ai/client";

if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

export interface SceneInput {
  photoId: string;
  photoUrl: string;
  sceneTag: string;
  sceneLabel: string;
}

export interface StoryboardScene {
  id: string;
  photoId: string | null;
  photoUrl: string | null;
  sceneTag: string;
  sceneLabel: string;
  cameraMovement: string;
  durationSeconds: number;
  narrationLine: string;
}

export interface PropertyContext {
  title: string;
  propertyType: string;
  state: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  floors?: number;
  builtUpSqft?: number;
  furnishing?: string;
  tenure?: string;
  price?: number;
  keyFeatures: string[];
  description?: string;
  hasFloorPlan: boolean;
}

const CAMERA_MOVEMENTS: Record<string, string> = {
  exterior_facade: "slow push-in",
  exterior_entrance: "pan right",
  exterior_garden: "aerial drift",
  exterior_aerial: "aerial orbit",
  exterior_pool: "aerial drift",
  living_room: "slow pan",
  dining_room: "slow pan",
  kitchen: "tracking shot",
  dry_kitchen: "tracking shot",
  master_bedroom: "slow push-in",
  master_bathroom: "slow pan",
  bedroom_2: "slow push-in",
  bedroom_3: "slow push-in",
  bedroom_4: "slow push-in",
  bathroom: "slow pan",
  study_room: "slow pan",
  utility_room: "tracking shot",
  balcony: "slow pull-back",
  hallway: "tracking shot",
  amenity_gym: "tracking shot",
  amenity_pool: "aerial drift",
  amenity_playground: "slow pan",
  amenity_clubhouse: "slow pan",
  amenity_lobby: "slow push-in",
  amenity_rooftop: "aerial drift",
  floor_plan: "zoom-in reveal",
  branding_card: "fade-in",
};

function buildPrompt(property: PropertyContext, photos: SceneInput[]): string {
  const photoList = photos.map((p, i) => `  ${i + 1}. [${p.sceneTag}] ${p.sceneLabel} (id: ${p.photoId})`).join("\n");
  const price = property.price ? `RM ${property.price.toLocaleString("en-MY")}` : "price not disclosed";
  const features = property.keyFeatures.length > 0 ? property.keyFeatures.join(", ") : "none listed";
  const tone = property.price && property.price >= 1000000 ? "luxury, sophisticated" : "warm, professional";

  return `You are a real estate video director. Create a storyboard for a property marketing video.

PROPERTY:
- Title: ${property.title}
- Type: ${property.propertyType}
- Location: ${property.city}, ${property.state}
- Bedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}${property.floors ? ` | Floors: ${property.floors}` : ""}${property.builtUpSqft ? ` | ${property.builtUpSqft} sqft` : ""}
- Furnishing: ${property.furnishing ?? "not specified"} | Tenure: ${property.tenure ?? "not specified"}
- Asking Price: ${price}
- Key Features: ${features}
- Tone: ${tone}
${property.description ? `- Description: ${property.description}` : ""}

AVAILABLE PHOTOS:
${photoList}
${property.hasFloorPlan ? "- FLOOR PLAN available (add as a scene after exterior shots)" : ""}

STORYBOARD RULES:
1. Always START with an exterior_facade photo (or the first exterior photo available)
2. ALWAYS END with a "branding_card" scene (no photo needed)
3. If floor plan is available, insert it after exterior shots
4. Min 6 scenes, max 15 scenes
5. Every scene must reference a real photoId from the list above (except branding_card)
6. Each narration_line: max 15 words, spoken in ${tone} tone
7. Use natural scene progression: Exterior → Floor Plan → Living areas → Bedrooms → Bathrooms → Special features → Branding

Return ONLY valid JSON in this exact format:
{
  "scenes": [
    {
      "photoId": "<uuid or null for branding_card>",
      "sceneTag": "<tag>",
      "sceneLabel": "<label>",
      "cameraMovement": "<movement>",
      "durationSeconds": <4-8>,
      "narrationLine": "<max 15 words>"
    }
  ]
}`;
}

interface FalLLMResult {
  output?: string;
}

export async function generateStoryboard(
  property: PropertyContext,
  photos: SceneInput[]
): Promise<{ scenes: StoryboardScene[]; error?: never } | { scenes?: never; error: string }> {
  if (photos.length === 0) {
    return { error: "No photos available to build storyboard" };
  }

  // Build a fallback storyboard if no FAL_KEY
  if (!process.env.FAL_KEY) {
    return { scenes: buildFallbackStoryboard(property, photos) };
  }

  try {
    const prompt = buildPrompt(property, photos);

    const result = await fal.run("fal-ai/any-llm", {
      input: {
        model: "openai/gpt-4o",
        system_prompt:
          "You are a professional real estate video director. Return ONLY valid JSON, no markdown, no explanation.",
        prompt,
        max_tokens: 2000,
      },
    }) as FalLLMResult;

    const raw = (result.output ?? "").trim();
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```json?\s*/i, "").replace(/\s*```\s*$/, "");

    const parsed = JSON.parse(jsonStr) as { scenes: Omit<StoryboardScene, "id" | "photoUrl">[] };

    const photoMap = new Map(photos.map((p) => [p.photoId, p]));

    const scenes: StoryboardScene[] = parsed.scenes.map((scene, i) => ({
      id: `scene-${i}-${Date.now()}`,
      photoId: scene.photoId ?? null,
      photoUrl: scene.photoId ? (photoMap.get(scene.photoId)?.photoUrl ?? null) : null,
      sceneTag: scene.sceneTag,
      sceneLabel: scene.sceneLabel,
      cameraMovement: scene.cameraMovement || (CAMERA_MOVEMENTS[scene.sceneTag] ?? "slow pan"),
      durationSeconds: Math.min(Math.max(scene.durationSeconds ?? 5, 3), 10),
      narrationLine: scene.narrationLine ?? "",
    }));

    return { scenes };
  } catch (err) {
    // Fall back to rule-based storyboard on AI error
    console.error("Storyboard AI error:", err);
    return { scenes: buildFallbackStoryboard(property, photos) };
  }
}

function buildFallbackStoryboard(property: PropertyContext, photos: SceneInput[]): StoryboardScene[] {
  // Rule-based ordering: exterior first, branding last
  const ORDER = [
    "exterior_facade", "exterior_entrance", "exterior_aerial", "exterior_garden", "exterior_pool",
    "floor_plan",
    "living_room", "dining_room", "kitchen", "dry_kitchen",
    "master_bedroom", "master_bathroom",
    "bedroom_2", "bedroom_3", "bedroom_4",
    "bathroom", "study_room", "balcony", "hallway", "utility_room",
    "amenity_gym", "amenity_pool", "amenity_rooftop", "amenity_clubhouse", "amenity_lobby", "amenity_playground",
  ];

  const sorted = [...photos].sort((a, b) => {
    const ai = ORDER.indexOf(a.sceneTag);
    const bi = ORDER.indexOf(b.sceneTag);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const scenes: StoryboardScene[] = sorted.slice(0, 14).map((p, i) => ({
    id: `scene-${i}`,
    photoId: p.photoId,
    photoUrl: p.photoUrl,
    sceneTag: p.sceneTag,
    sceneLabel: p.sceneLabel,
    cameraMovement: CAMERA_MOVEMENTS[p.sceneTag] ?? "slow pan",
    durationSeconds: 5,
    narrationLine: defaultNarration(p.sceneTag, property),
  }));

  // Always end with branding card
  scenes.push({
    id: `scene-branding`,
    photoId: null,
    photoUrl: null,
    sceneTag: "branding_card",
    sceneLabel: "Branding Card",
    cameraMovement: "fade-in",
    durationSeconds: 4,
    narrationLine: `Contact us today to schedule your viewing.`,
  });

  return scenes;
}

function defaultNarration(sceneTag: string, property: PropertyContext): string {
  const map: Record<string, string> = {
    exterior_facade: `Welcome to this beautiful ${property.propertyType} in ${property.city}.`,
    exterior_entrance: "A grand entrance sets the tone for elegant living.",
    exterior_garden: "Lush landscaping creates a serene outdoor retreat.",
    exterior_pool: "Enjoy resort-style living with a private pool.",
    living_room: "Spacious living areas designed for comfort and style.",
    dining_room: "An elegant dining space perfect for entertaining.",
    kitchen: "A modern kitchen fitted for culinary excellence.",
    master_bedroom: "The master bedroom offers a luxurious sanctuary.",
    master_bathroom: "Indulge in a spa-like master ensuite experience.",
    balcony: "Step out to breathtaking views from your private balcony.",
    amenity_pool: "Resort-style amenities await residents every day.",
    floor_plan: `${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms — perfectly planned.`,
  };
  return map[sceneTag] ?? "Every detail crafted for exceptional living.";
}
