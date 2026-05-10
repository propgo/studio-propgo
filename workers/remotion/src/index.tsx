import { registerRoot, Composition } from "remotion";
import React from "react";
import { PropertyVideo } from "./compositions/PropertyVideo";
import type { RenderManifest } from "./types";
import { ASPECT_RATIO_DIMENSIONS, QUALITY_SCALE } from "./types";

// Default manifest for Remotion Studio preview
const DEFAULT_MANIFEST: RenderManifest = {
  generationId: "preview",
  projectTitle: "3BR Condo in Mont Kiara",
  scenes: [
    {
      id: "s1",
      clipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      narrationLine: "Welcome to your dream home in the heart of Mont Kiara.",
      sceneLabel: "Exterior",
      durationSeconds: 5,
      cameraMovement: "pan_right",
    },
    {
      id: "s2",
      clipUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      narrationLine: "Spacious living areas designed for comfort and modern living.",
      sceneLabel: "Living Room",
      durationSeconds: 5,
      cameraMovement: "dolly_forward",
    },
  ],
  brandKit: {
    agentName: "Ahmad Zulhilmi",
    agentPhone: "+60 12-345 6789",
    agentEmail: "ahmad@propgo.my",
    primaryColor: "#4A6CF7",
  },
  musicTrack: "cinematic",
  aspectRatio: "16:9",
  quality: "1080p",
  watermark: false,
};

function Root() {
  const dimensions = ASPECT_RATIO_DIMENSIONS[DEFAULT_MANIFEST.aspectRatio];
  const scale = QUALITY_SCALE[DEFAULT_MANIFEST.quality];
  const fps = 30;
  const scenesCount = DEFAULT_MANIFEST.scenes.length;
  const sceneFrames = scenesCount * (5 * fps - 0.5 * fps) + 0.5 * fps;
  const brandCardFrames = 4 * fps;
  const total = sceneFrames + brandCardFrames;

  return (
    <Composition
      id="PropertyVideo"
      component={PropertyVideo}
      durationInFrames={Math.ceil(total)}
      fps={fps}
      width={Math.round(dimensions.width * scale)}
      height={Math.round(dimensions.height * scale)}
      defaultProps={{ manifest: DEFAULT_MANIFEST }}
    />
  );
}

registerRoot(Root);
