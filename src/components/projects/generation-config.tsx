"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Coins, ArrowRight, Loader2, AlertCircle, Sparkles, Zap, Crown } from "lucide-react";
import {
  GENERATION_MODELS,
  ASPECT_RATIOS,
  QUALITY_OPTIONS,
  MUSIC_TRACKS,
  calculateCreditCost,
  type GenerationModelId,
  type AspectRatioId,
  type QualityId,
  type MusicTrackId,
} from "@/lib/constants/generation";

export interface GenerationConfig {
  modelId: GenerationModelId;
  aspectRatio: AspectRatioId;
  quality: QualityId;
  musicTrack: MusicTrackId;
  creditCost: number;
}

interface GenerationConfigProps {
  sceneCount: number;
  userCredits: number;
  onConfirm: (config: GenerationConfig) => void;
  loading?: boolean;
}

const MODEL_BADGE_STYLES: Record<string, string> = {
  Recommended: "bg-brand-primary/20 text-brand-primary border-brand-primary/30",
  Premium: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Ultra: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const MODEL_ICONS: Record<string, React.ReactNode> = {
  "kling-2.6": <Zap className="w-4 h-4" />,
  "seedance-2.0": <Sparkles className="w-4 h-4" />,
  "runway-gen4": <Crown className="w-4 h-4" />,
  "veo-3": <Crown className="w-4 h-4 text-yellow-400" />,
};

export function GenerationConfig({
  sceneCount,
  userCredits,
  onConfirm,
  loading,
}: GenerationConfigProps) {
  const [modelId, setModelId] = useState<GenerationModelId>("seedance-2.0");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("16:9");
  const [quality, setQuality] = useState<QualityId>("720p");
  const [musicTrack, setMusicTrack] = useState<MusicTrackId>("cinematic");

  const creditCost = calculateCreditCost(modelId, quality, sceneCount);
  const hasEnoughCredits = userCredits >= creditCost;

  function handleConfirm() {
    onConfirm({ modelId, aspectRatio, quality, musicTrack, creditCost });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Model selector */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">AI Model</h3>
        <div className="grid grid-cols-2 gap-2">
          {GENERATION_MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setModelId(model.id)}
              className={cn(
                "relative p-3 rounded-xl border text-left transition-all",
                modelId === model.id
                  ? "border-brand-primary/50 bg-brand-primary/10"
                  : "border-studio-border bg-studio-surface hover:border-white/15"
              )}
            >
              {model.badge && (
                <span
                  className={cn(
                    "absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded border",
                    MODEL_BADGE_STYLES[model.badge] ?? ""
                  )}
                >
                  {model.badge}
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-white/30", modelId === model.id && "text-brand-primary")}>
                  {MODEL_ICONS[model.id]}
                </span>
                <span className="font-medium text-sm text-white">{model.label}</span>
              </div>
              <p className="text-[11px] text-white/30">{model.description}</p>
              <p className="text-[11px] text-white/50 mt-1 font-mono">
                {model.credits} cr/scene
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Aspect ratio */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Aspect Ratio</h3>
        <div className="flex gap-2">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.id}
              type="button"
              onClick={() => setAspectRatio(ar.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all",
                aspectRatio === ar.id
                  ? "border-brand-primary/50 bg-brand-primary/10"
                  : "border-studio-border bg-studio-surface hover:border-white/15"
              )}
            >
              <span className="text-xl text-white/60">{ar.icon}</span>
              <span className="text-xs font-semibold text-white">{ar.label}</span>
              <span className="text-[10px] text-white/30">{ar.subLabel}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Quality */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Quality</h3>
        <div className="flex gap-2">
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setQuality(q.id)}
              className={cn(
                "flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                quality === q.id
                  ? "border-brand-primary/50 bg-brand-primary/10"
                  : "border-studio-border bg-studio-surface hover:border-white/15"
              )}
            >
              <div>
                <p className="font-semibold text-sm text-white">{q.label}</p>
                <p className="text-[11px] text-white/30">{q.subLabel}</p>
              </div>
              {q.creditsMultiplier > 1 && (
                <span className="text-[10px] text-white/30 font-mono">{q.creditsMultiplier}x cost</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Music */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Background Music</h3>
        <div className="flex flex-wrap gap-2">
          {MUSIC_TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => setMusicTrack(track.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-all",
                musicTrack === track.id
                  ? "border-brand-primary/50 bg-brand-primary/10 text-white"
                  : "border-studio-border bg-studio-surface text-white/40 hover:text-white/70 hover:border-white/15"
              )}
            >
              <span>{track.emoji}</span>
              {track.label}
            </button>
          ))}
        </div>
      </section>

      {/* Credit cost summary */}
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          hasEnoughCredits
            ? "border-brand-success/20 bg-brand-success/5"
            : "border-red-500/20 bg-red-500/5"
        )}
      >
        <div className="space-y-0.5">
          <p className="text-xs text-white/40">Estimated cost</p>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-lg font-bold text-white">{creditCost} credits</span>
            <span className="text-xs text-white/25">
              ({sceneCount} scenes × {GENERATION_MODELS.find((m) => m.id === modelId)?.credits} ×{" "}
              {QUALITY_OPTIONS.find((q) => q.id === quality)?.creditsMultiplier}x)
            </span>
          </div>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-xs text-white/40">Your balance</p>
          <p className={cn("font-semibold", hasEnoughCredits ? "text-white" : "text-red-400")}>
            {userCredits} credits
          </p>
        </div>
      </div>

      {/* Insufficient credits banner */}
      {!hasEnoughCredits && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-medium">Insufficient credits</p>
            <p className="text-xs text-red-400/60 mt-0.5">
              You need {creditCost - userCredits} more credits. Top up your wallet to continue.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-300 hover:bg-red-500/10 shrink-0"
          >
            Top Up
          </Button>
        </div>
      )}

      {/* Confirm button */}
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={!hasEnoughCredits || loading}
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Starting Generation…
          </>
        ) : (
          <>
            Generate Video — {creditCost} credits
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}
