import React from "react";
import { AbsoluteFill } from "remotion";

export const Watermark: React.FC = () => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      pointerEvents: "none",
    }}
  >
    <p
      style={{
        color: "rgba(255,255,255,0.18)",
        fontSize: 28,
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: "uppercase",
        transform: "rotate(-30deg)",
        userSelect: "none",
      }}
    >
      PropGo Studio
    </p>
  </AbsoluteFill>
);
