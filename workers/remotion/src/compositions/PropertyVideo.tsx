import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useVideoConfig,
  staticFile,
} from "remotion";
import { SceneClip } from "../components/SceneClip";
import { BrandCard } from "../components/BrandCard";
import { Watermark } from "../components/Watermark";
import type { RenderManifest } from "../types";

const MUSIC_FILES: Record<string, string> = {
  upbeat_corporate: "music/upbeat_corporate.mp3",
  cinematic: "music/cinematic.mp3",
  calm_ambient: "music/calm_ambient.mp3",
  energetic: "music/energetic.mp3",
  none: "",
};

// Scene duration: 5 seconds per clip + 0.5s crossfade overlap
const SCENE_SECONDS = 5;
const OVERLAP_SECONDS = 0.5;
// Brand card: 4 seconds
const BRAND_CARD_SECONDS = 4;

export const PropertyVideo: React.FC<{ manifest: RenderManifest }> = ({ manifest }) => {
  const { fps } = useVideoConfig();

  const sceneDuration = SCENE_SECONDS * fps;
  const overlapFrames = OVERLAP_SECONDS * fps;
  const brandCardFrames = BRAND_CARD_SECONDS * fps;

  const musicFile = MUSIC_FILES[manifest.musicTrack] ?? "";

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Scene clips with crossfade overlap */}
      {manifest.scenes.map((scene, i) => {
        const startFrame = i * (sceneDuration - overlapFrames);
        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={sceneDuration}
            name={scene.sceneLabel}
          >
            <SceneClip scene={scene} showCaption={true} />
          </Sequence>
        );
      })}

      {/* Brand card at the end */}
      {(() => {
        const totalSceneFrames =
          manifest.scenes.length * (sceneDuration - overlapFrames) + overlapFrames;
        return (
          <Sequence
            from={totalSceneFrames}
            durationInFrames={brandCardFrames}
            name="Brand Card"
          >
            <BrandCard
              brandKit={manifest.brandKit}
              projectTitle={manifest.projectTitle}
            />
          </Sequence>
        );
      })()}

      {/* Background music (low volume) */}
      {musicFile && (
        <Audio
          src={staticFile(musicFile)}
          volume={0.15}
          loop
        />
      )}

      {/* Voiceover (high volume) */}
      {manifest.voiceoverUrl && (
        <Audio
          src={manifest.voiceoverUrl}
          volume={0.9}
        />
      )}

      {/* Watermark on free plan */}
      {manifest.watermark && <Watermark />}
    </AbsoluteFill>
  );
};
