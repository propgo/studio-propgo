import { fal } from "@fal-ai/client";

if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
}

export interface ScriptLine {
  sceneId: string;
  sceneTag: string;
  sceneLabel: string;
  narrationLine: string;
  language: "en" | "bm";
}

export interface ScriptInput {
  sceneId: string;
  sceneTag: string;
  sceneLabel: string;
  currentNarration?: string;
}

export interface PropertyContext {
  title: string;
  propertyType: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  builtUpSqft?: number;
  price?: number;
  keyFeatures: string[];
  description?: string;
}

const TONE_MAP: Record<string, string> = {
  bungalow: "luxury, sophisticated, aspirational",
  semi_d: "premium, professional, aspirational",
  terrace: "warm, family-friendly, practical",
  apartment: "modern, urban, lifestyle-focused",
  condo: "modern, urban, lifestyle-focused",
  commercial: "professional, business-focused",
  land: "investment-focused, opportunity-driven",
};

function buildScriptPrompt(
  property: PropertyContext,
  scenes: ScriptInput[],
  language: "en" | "bm"
): string {
  const tone = TONE_MAP[property.propertyType] ?? "warm, professional";
  const price = property.price ? `RM ${property.price.toLocaleString("en-MY")}` : "price not disclosed";
  const features = property.keyFeatures.length > 0 ? property.keyFeatures.join(", ") : "none";
  const langInstruction =
    language === "bm"
      ? "Write ALL narration lines in fluent Bahasa Malaysia. Use professional, persuasive property marketing language."
      : "Write ALL narration lines in fluent English. Use professional, persuasive property marketing language.";

  const sceneList = scenes
    .map((s, i) => `${i + 1}. Scene: "${s.sceneLabel}" [tag: ${s.sceneTag}]`)
    .join("\n");

  return `You are a professional real estate voiceover scriptwriter.

PROPERTY:
- Title: ${property.title}
- Type: ${property.propertyType} in ${property.city}, ${property.state}
- ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms${property.builtUpSqft ? `, ${property.builtUpSqft} sqft` : ""}
- Asking: ${price}
- Key Features: ${features}
- Tone: ${tone}
${property.description ? `- Overview: ${property.description}` : ""}

SCENES TO WRITE FOR:
${sceneList}

RULES:
1. ${langInstruction}
2. Each narration line: 8–16 words, flows naturally when spoken aloud
3. Match scene content — don't describe a kitchen in a bedroom scene
4. Build momentum: start with wow, build interest, close with call-to-action
5. Branding card line should be a compelling call-to-action

Return ONLY valid JSON:
{
  "lines": [
    { "sceneId": "<id>", "narrationLine": "<text>" }
  ]
}`;
}

interface FalLLMResult {
  output?: string;
}

export async function generateScript(
  property: PropertyContext,
  scenes: ScriptInput[],
  language: "en" | "bm" = "en"
): Promise<{ lines: ScriptLine[]; error?: never } | { error: string; lines?: never }> {
  if (scenes.length === 0) return { error: "No scenes to generate script for" };

  if (!process.env.FAL_KEY) {
    return { lines: buildFallbackScript(scenes, property, language) };
  }

  try {
    const prompt = buildScriptPrompt(property, scenes, language);
    const result = await fal.run("fal-ai/any-llm", {
      input: {
        model: "openai/gpt-4o",
        system_prompt: "You are a real estate voiceover scriptwriter. Return ONLY valid JSON, no markdown.",
        prompt,
        max_tokens: 1500,
      },
    }) as FalLLMResult;

    const raw = (result.output ?? "").trim().replace(/^```json?\s*/i, "").replace(/\s*```\s*$/, "");
    const parsed = JSON.parse(raw) as { lines: { sceneId: string; narrationLine: string }[] };

    const sceneMap = new Map(scenes.map((s) => [s.sceneId, s]));

    return {
      lines: parsed.lines.map((l) => ({
        sceneId: l.sceneId,
        sceneTag: sceneMap.get(l.sceneId)?.sceneTag ?? "",
        sceneLabel: sceneMap.get(l.sceneId)?.sceneLabel ?? "",
        narrationLine: l.narrationLine,
        language,
      })),
    };
  } catch (err) {
    console.error("Script generation error:", err);
    return { lines: buildFallbackScript(scenes, property, language) };
  }
}

export async function regenerateLine(
  property: PropertyContext,
  scene: ScriptInput,
  language: "en" | "bm" = "en"
): Promise<{ narrationLine: string; error?: never } | { error: string; narrationLine?: never }> {
  const result = await generateScript(property, [scene], language);
  if (result.error) return { error: result.error };
  return { narrationLine: result.lines?.[0]?.narrationLine ?? "" };
}

const EN_FALLBACKS: Record<string, string> = {
  exterior_facade: "Welcome to your dream home — elegantly designed for modern living.",
  exterior_entrance: "A grand entrance that makes a lasting first impression.",
  exterior_garden: "Lush, landscaped gardens create a serene private retreat.",
  exterior_pool: "Dive into luxury with your own private pool.",
  exterior_aerial: "Nestled in a prime location with stunning surroundings.",
  living_room: "Spacious living areas designed for comfort and style.",
  dining_room: "An elegant dining space perfect for memorable gatherings.",
  kitchen: "A chef-ready kitchen fitted with premium appliances.",
  dry_kitchen: "A functional dry kitchen designed for everyday convenience.",
  master_bedroom: "The master suite — your personal sanctuary of luxury.",
  master_bathroom: "Indulge in a spa-like bathroom crafted for relaxation.",
  bedroom_2: "Generously sized bedrooms offer comfort for the whole family.",
  bedroom_3: "Versatile rooms ideal for family, guests, or a home office.",
  bedroom_4: "Ample space for a growing family or creative use.",
  bathroom: "Beautifully appointed bathrooms finished to the finest detail.",
  study_room: "A dedicated study — perfect for work, focus, and creativity.",
  balcony: "Step out to your private balcony and breathe in the views.",
  hallway: "Elegant hallways connect each space with seamless flow.",
  amenity_gym: "Stay active with a fully equipped residents' gym.",
  amenity_pool: "Resort-style pool facilities to unwind every day.",
  amenity_rooftop: "A breathtaking rooftop deck with panoramic city views.",
  amenity_clubhouse: "Premium social spaces designed for community and leisure.",
  amenity_lobby: "A stunning lobby sets the tone for refined urban living.",
  floor_plan: "Thoughtfully designed floor plan to maximise space and flow.",
  branding_card: "Contact us today — your dream home awaits.",
};

const BM_FALLBACKS: Record<string, string> = {
  exterior_facade: "Selamat datang ke rumah impian anda — reka bentuk moden yang memukau.",
  exterior_entrance: "Pintu masuk yang memukau meninggalkan kesan pertama yang indah.",
  exterior_garden: "Taman landskap yang menghijau mewujudkan ruang peribadi yang tenang.",
  exterior_pool: "Nikmati kemewahan kolam renang peribadi anda sendiri.",
  living_room: "Ruang tamu yang luas direka untuk keselesaan dan gaya hidup moden.",
  dining_room: "Ruang makan yang elegan sempurna untuk jamuan istimewa bersama keluarga.",
  kitchen: "Dapur moden dilengkapi peralatan premium untuk kemudahan memasak.",
  master_bedroom: "Bilik utama — tempat perlindungan peribadi anda yang mewah.",
  master_bathroom: "Bilik mandi seperti spa yang direka untuk kerehatan mutlak.",
  bedroom_2: "Bilik tidur yang luas memberikan keselesaan untuk seluruh keluarga.",
  bathroom: "Bilik mandi yang cantik dengan kemasan terbaik.",
  balcony: "Balkoni peribadi dengan pemandangan yang memukau.",
  amenity_pool: "Kemudahan kolam renang bertaraf resort untuk dinikmati setiap hari.",
  amenity_gym: "Pusat kecergasan lengkap untuk gaya hidup aktif.",
  floor_plan: "Pelan lantai yang bijak memaksimumkan ruang dan keselesaan.",
  branding_card: "Hubungi kami hari ini — rumah impian anda menanti.",
};

function buildFallbackScript(
  scenes: ScriptInput[],
  _property: PropertyContext,
  language: "en" | "bm"
): ScriptLine[] {
  const fallbacks = language === "bm" ? BM_FALLBACKS : EN_FALLBACKS;
  return scenes.map((s) => ({
    sceneId: s.sceneId,
    sceneTag: s.sceneTag,
    sceneLabel: s.sceneLabel,
    narrationLine:
      s.currentNarration ||
      fallbacks[s.sceneTag] ||
      (language === "bm"
        ? "Ruang yang direka dengan teliti untuk kehidupan yang sempurna."
        : "Every detail crafted for an exceptional lifestyle."),
    language,
  }));
}
