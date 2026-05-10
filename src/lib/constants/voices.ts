export const VOICE_STYLES = [
  {
    id: "en_male_pro",
    label: "Professional Male",
    language: "en" as const,
    langLabel: "English",
    elevenLabsVoiceId: "nPczCjzI2devNBz1zQrb", // Brian - professional male
    description: "Deep, authoritative English male voice",
  },
  {
    id: "en_female_pro",
    label: "Professional Female",
    language: "en" as const,
    langLabel: "English",
    elevenLabsVoiceId: "EXAVITQu4vr4xnSDxMaL", // Bella - professional female
    description: "Clear, confident English female voice",
  },
  {
    id: "bm_male_pro",
    label: "Professional Male",
    language: "bm" as const,
    langLabel: "Bahasa Malaysia",
    elevenLabsVoiceId: "VR6AewLTigWG4xSOukaG", // Arnold - used for BM male
    description: "Professional Bahasa Malaysia male voice",
  },
  {
    id: "bm_female_pro",
    label: "Professional Female",
    language: "bm" as const,
    langLabel: "Bahasa Malaysia",
    elevenLabsVoiceId: "XB0fDUnXU5powFXDhCwa", // Charlotte - used for BM female
    description: "Professional Bahasa Malaysia female voice",
  },
] as const;

export type VoiceStyleId = (typeof VOICE_STYLES)[number]["id"];
