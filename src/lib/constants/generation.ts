export const GENERATION_MODELS = [
  {
    id: "kling-2.6",
    label: "Kling 2.6",
    description: "Fast, cinematic quality",
    credits: 5,
    badge: null,
    falModel: "fal-ai/kling-video/v2.1/image-to-video",
  },
  {
    id: "seedance-2.0",
    label: "Seedance 2.0",
    description: "Higher detail, slower",
    credits: 15,
    badge: "Recommended",
    falModel: "fal-ai/bytedance/seedance-1.5-lite/image-to-video",
  },
  {
    id: "runway-gen4",
    label: "Runway Gen-4",
    description: "Premium cinematic",
    credits: 30,
    badge: "Premium",
    falModel: "fal-ai/runway-gen4/image-to-video",
  },
  {
    id: "veo-3",
    label: "Veo 3",
    description: "Google ultra quality",
    credits: 40,
    badge: "Ultra",
    falModel: "fal-ai/veo3/image-to-video",
  },
] as const;

export type GenerationModelId = (typeof GENERATION_MODELS)[number]["id"];

export const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9", subLabel: "Landscape", icon: "▬" },
  { id: "9:16", label: "9:16", subLabel: "Portrait", icon: "▮" },
  { id: "1:1", label: "1:1", subLabel: "Square", icon: "■" },
  { id: "4:3", label: "4:3", subLabel: "Classic", icon: "▭" },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

export const QUALITY_OPTIONS = [
  { id: "720p", label: "720p", subLabel: "Standard HD", creditsMultiplier: 1 },
  { id: "1080p", label: "1080p", subLabel: "Full HD", creditsMultiplier: 2 },
] as const;

export type QualityId = (typeof QUALITY_OPTIONS)[number]["id"];

export const MUSIC_TRACKS = [
  { id: "upbeat_corporate", label: "Upbeat Corporate", emoji: "🎵" },
  { id: "cinematic", label: "Cinematic", emoji: "🎬" },
  { id: "calm_ambient", label: "Calm Ambient", emoji: "🌿" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "none", label: "No Music", emoji: "🔇" },
] as const;

export type MusicTrackId = (typeof MUSIC_TRACKS)[number]["id"];

export function calculateCreditCost(
  modelId: GenerationModelId,
  qualityId: QualityId,
  sceneCount: number
): number {
  const model = GENERATION_MODELS.find((m) => m.id === modelId);
  const quality = QUALITY_OPTIONS.find((q) => q.id === qualityId);
  if (!model || !quality) return 0;
  return model.credits * quality.creditsMultiplier * sceneCount;
}
