import React from "react";
import {
  Video,
  AbsoluteFill,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
} from "remotion";
import type { RenderScene } from "../types";

interface SceneClipProps {
  scene: RenderScene;
  showCaption: boolean;
}

export const SceneClip: React.FC<SceneClipProps> = ({ scene, showCaption }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, fps * 0.4, durationInFrames - fps * 0.4, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Caption slide up
  const captionY = interpolate(
    frame,
    [fps * 0.3, fps * 0.7],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const captionOpacity = interpolate(
    frame,
    [fps * 0.3, fps * 0.7, durationInFrames - fps * 0.5, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Video clip */}
      <Video
        src={scene.clipUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        muted
      />

      {/* Gradient scrim for caption legibility */}
      {showCaption && (
        <AbsoluteFill
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)",
          }}
        />
      )}

      {/* Caption */}
      {showCaption && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: "0 64px 56px",
          }}
        >
          <div
            style={{
              opacity: captionOpacity,
              transform: `translateY(${captionY}px)`,
              maxWidth: "80%",
            }}
          >
            <p
              style={{
                color: "white",
                fontSize: 36,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                lineHeight: 1.3,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                margin: 0,
              }}
            >
              {scene.narrationLine}
            </p>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
