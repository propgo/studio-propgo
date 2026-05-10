export interface RenderScene {
  id: string;
  clipUrl: string;
  narrationLine: string;
  sceneLabel: string;
  durationSeconds: number;
  cameraMovement: string;
}

export interface BrandKit {
  agentName: string;
  agentPhone?: string;
  agentEmail?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface RenderManifest {
  generationId: string;
  projectTitle: string;
  scenes: RenderScene[];
  brandKit: BrandKit;
  voiceoverUrl?: string;
  musicTrack: string;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3";
  quality: "720p" | "1080p";
  watermark: boolean;
}

export const ASPECT_RATIO_DIMENSIONS: Record<
  RenderManifest["aspectRatio"],
  { width: number; height: number }
> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:3": { width: 1440, height: 1080 },
};

export const QUALITY_SCALE: Record<RenderManifest["quality"], number> = {
  "720p": 0.667,
  "1080p": 1,
};
