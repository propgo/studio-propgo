import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import type { BrandKit } from "../types";

interface BrandCardProps {
  brandKit: BrandKit;
  projectTitle: string;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brandKit, projectTitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, fps * 0.5, durationInFrames - fps * 0.3, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(
    frame,
    [0, fps * 0.5],
    [0.95, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const primary = brandKit.primaryColor ?? "#4A6CF7";

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0A0A0F 0%, #12121A 100%)`,
        opacity,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: primary,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 24,
          transform: `scale(${scale})`,
        }}
      >
        {/* Logo */}
        {brandKit.logoUrl && (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              overflow: "hidden",
              border: `2px solid ${primary}40`,
            }}
          >
            <Img
              src={brandKit.logoUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Property title */}
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 20,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            letterSpacing: 2,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {projectTitle}
        </p>

        {/* Agent name */}
        <p
          style={{
            color: "white",
            fontSize: 48,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            margin: 0,
            textAlign: "center",
          }}
        >
          {brandKit.agentName}
        </p>

        {/* Agency */}
        {brandKit.agencyName && (
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 26,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              margin: 0,
              textAlign: "center",
            }}
          >
            {brandKit.agencyName}
          </p>
        )}

        {/* Contact */}
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {brandKit.agentPhone && (
            <p
              style={{
                color: primary,
                fontSize: 28,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {brandKit.agentPhone}
            </p>
          )}
          {brandKit.websiteUrl && (
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 22,
                fontFamily: "Inter, sans-serif",
                margin: 0,
              }}
            >
              {brandKit.websiteUrl.replace(/^https?:\/\//, "")}
            </p>
          )}
          {brandKit.agentEmail && (
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 22,
                fontFamily: "Inter, sans-serif",
                margin: 0,
              }}
            >
              {brandKit.agentEmail}
            </p>
          )}
        </div>

        {/* PropGo Studio badge */}
        <div
          style={{
            marginTop: 16,
            padding: "8px 20px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 14,
              fontFamily: "Inter, sans-serif",
              margin: 0,
              letterSpacing: 1,
            }}
          >
            Made with PropGo Studio
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
