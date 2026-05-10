"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Play,
  Loader2,
  Volume2,
  VolumeX,
  Mic,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { regenerateLineAction } from "@/lib/actions/script";
import { VOICE_STYLES, type VoiceStyleId } from "@/lib/constants/voices";
import type { StoryboardScene } from "@/lib/ai/generate-storyboard";
import type { ScriptLine } from "@/lib/ai/generate-script";

interface ScriptRow {
  sceneId: string;
  sceneTag: string;
  sceneLabel: string;
  photoUrl: string | null;
  narrationLine: string;
  regenerating: boolean;
}

interface ScriptEditorProps {
  projectId: string;
  scenes: StoryboardScene[];
  initialLines: ScriptLine[];
  language: "en" | "bm";
  voiceStyleId: VoiceStyleId;
  onLanguageChange: (lang: "en" | "bm") => void;
  onVoiceChange: (id: VoiceStyleId) => void;
  onLinesChange: (lines: ScriptLine[]) => void;
  onRegenerate: () => void;
  regenerating: boolean;
}

export function ScriptEditor({
  projectId,
  scenes,
  initialLines,
  language,
  voiceStyleId,
  onLanguageChange,
  onVoiceChange,
  onLinesChange,
  onRegenerate,
  regenerating,
}: ScriptEditorProps) {
  const lineMap = new Map(initialLines.map((l) => [l.sceneId, l.narrationLine]));

  const [rows, setRows] = useState<ScriptRow[]>(
    scenes.map((s) => ({
      sceneId: s.id,
      sceneTag: s.sceneTag,
      sceneLabel: s.sceneLabel,
      photoUrl: s.photoUrl,
      narrationLine: lineMap.get(s.id) ?? s.narrationLine ?? "",
      regenerating: false,
    }))
  );

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const syncLines = useCallback(
    (updated: ScriptRow[]) => {
      onLinesChange(
        updated.map((r) => ({
          sceneId: r.sceneId,
          sceneTag: r.sceneTag,
          sceneLabel: r.sceneLabel,
          narrationLine: r.narrationLine,
          language,
        }))
      );
    },
    [language, onLinesChange]
  );

  function updateLine(sceneId: string, text: string) {
    const updated = rows.map((r) => (r.sceneId === sceneId ? { ...r, narrationLine: text } : r));
    setRows(updated);
    syncLines(updated);
  }

  async function regenerateSingleLine(sceneId: string) {
    const row = rows.find((r) => r.sceneId === sceneId);
    if (!row) return;
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    setRows((prev) =>
      prev.map((r) => (r.sceneId === sceneId ? { ...r, regenerating: true } : r))
    );

    const result = await regenerateLineAction(projectId, scene, language);

    const updated = rows.map((r) =>
      r.sceneId === sceneId
        ? { ...r, regenerating: false, narrationLine: result.narrationLine ?? r.narrationLine }
        : r
    );
    setRows(updated);
    syncLines(updated);
  }

  async function previewLine(sceneId: string, text: string) {
    setPreviewError(null);

    if (playingId === sceneId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    setPlayingId(sceneId);
    try {
      const res = await fetch("/api/voice-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceStyleId }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setPreviewError(data.error ?? "Preview failed");
        setPlayingId(null);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(url);
      };
    } catch {
      setPreviewError("Preview failed. Check your connection.");
      setPlayingId(null);
    }
  }

  const totalWords = rows.reduce((acc, r) => acc + r.narrationLine.split(" ").length, 0);
  const estimatedSeconds = Math.round(totalWords / 2.5); // avg 2.5 words/sec

  return (
    <div className="space-y-5">
      {/* Language + Voice selector */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-studio-surface border border-studio-border">
        {/* Language toggle */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Language</p>
          <div className="flex gap-1.5">
            {(["en", "bm"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  language === lang
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "border-studio-border text-white/40 hover:text-white/70"
                )}
              >
                {lang === "en" ? "English" : "Bahasa Malaysia"}
              </button>
            ))}
          </div>
        </div>

        {/* Voice selector */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-48">
          <p className="text-[11px] text-white/30 font-medium uppercase tracking-widest">Voice</p>
          <div className="flex flex-wrap gap-1.5">
            {VOICE_STYLES.filter((v) => v.language === language).map((voice) => (
              <button
                key={voice.id}
                type="button"
                onClick={() => onVoiceChange(voice.id as VoiceStyleId)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  voiceStyleId === voice.id
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "border-studio-border text-white/40 hover:text-white/70"
                )}
              >
                <Mic className="w-3 h-3" />
                {voice.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-end gap-4 text-xs text-white/30 ml-auto">
          <span>~{estimatedSeconds}s spoken</span>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1 hover:text-white/60 transition-colors"
          >
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerate All
          </button>
        </div>
      </div>

      {/* Preview error */}
      {previewError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {previewError}
          {previewError.includes("ELEVENLABS") && (
            <span className="text-white/30 ml-1">— add ELEVENLABS_API_KEY to enable</span>
          )}
        </div>
      )}

      {/* Scene rows */}
      <div className="space-y-2">
        {rows.map((row, i) => {
          const isPlaying = playingId === row.sceneId;
          const charCount = row.narrationLine.length;
          const isOverLimit = charCount > 200;

          return (
            <div
              key={row.sceneId}
              className="flex gap-3 p-3 rounded-xl border border-studio-border bg-studio-surface hover:border-white/10 transition-all"
            >
              {/* Scene number + thumbnail */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-5 h-5 rounded-full bg-studio-muted flex items-center justify-center text-[9px] font-bold text-white/30">
                  {i + 1}
                </div>
                <div className="w-16 h-11 rounded-lg bg-studio-muted overflow-hidden flex items-center justify-center">
                  {row.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.photoUrl} alt={row.sceneLabel} className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white/10" />
                  )}
                </div>
                <p className="text-[9px] text-white/25 text-center leading-tight max-w-16 truncate">
                  {row.sceneLabel}
                </p>
              </div>

              {/* Narration textarea */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <textarea
                  value={row.narrationLine}
                  onChange={(e) => updateLine(row.sceneId, e.target.value)}
                  rows={2}
                  placeholder="Narration line…"
                  className={cn(
                    "w-full text-sm bg-studio-bg border rounded-lg px-3 py-2 text-white/80 placeholder:text-white/20 resize-none focus:outline-none leading-relaxed",
                    isOverLimit
                      ? "border-yellow-500/40 focus:border-yellow-500/60"
                      : "border-studio-border focus:border-brand-primary/40"
                  )}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px]",
                      isOverLimit ? "text-yellow-400/70" : "text-white/20"
                    )}
                  >
                    {charCount}/200 chars
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0">
                {/* Preview */}
                <button
                  type="button"
                  onClick={() => previewLine(row.sceneId, row.narrationLine)}
                  disabled={row.regenerating || !row.narrationLine}
                  title="Preview voiceover"
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all border",
                    isPlaying
                      ? "bg-brand-primary/20 border-brand-primary/40 text-brand-primary"
                      : "border-studio-border text-white/25 hover:text-white/60 hover:border-white/20"
                  )}
                >
                  {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {/* Regenerate single line */}
                <button
                  type="button"
                  onClick={() => regenerateSingleLine(row.sceneId)}
                  disabled={row.regenerating}
                  title="Regenerate this line"
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-studio-border text-white/25 hover:text-white/60 hover:border-white/20 transition-all"
                >
                  {row.regenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="flex items-center gap-3 text-xs text-white/30 pt-2 border-t border-studio-border">
        <CheckCircle2 className="w-3.5 h-3.5 text-brand-success/40" />
        {rows.length} lines · ~{estimatedSeconds}s narration · {totalWords} words
      </div>
    </div>
  );
}
