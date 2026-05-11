"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowUp,
  ChevronDown,
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

  const [prompt, setPrompt] = useState("");
  const [showVoices, setShowVoices] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  function handlePromptKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onRegenerate();
      setPrompt("");
    }
  }

  const currentVoice = VOICE_STYLES.find((v) => v.id === voiceStyleId);

  return (
    <div className="space-y-5">
      {/* ── Animated AI Input bar — adapted from 21st.dev Animated AI Input ── */}
      <div className="relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
        {/* Animated top gradient line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #4A6CF7 50%, transparent 100%)",
          }}
          animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <span className="text-sm font-medium text-white">AI Script</span>
            </div>
            <span className="text-xs text-white/25">~{estimatedSeconds}s spoken</span>
          </div>

          {/* Textarea */}
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handlePromptKey}
            placeholder="Describe a style… e.g. 'Professional and luxurious tone for high-end condo'"
            rows={1}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/20 resize-none focus:outline-none leading-relaxed min-h-[40px]"
          />

          {/* Bottom action row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            {/* Left: Language + Voice */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Language toggle */}
              <div className="flex gap-1">
                {(["en", "bm"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => onLanguageChange(lang)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
                      language === lang
                        ? "bg-brand-primary/20 border-brand-primary/40 text-brand-primary"
                        : "border-white/8 text-white/30 hover:text-white/60 hover:border-white/15"
                    )}
                  >
                    {lang === "en" ? "EN" : "BM"}
                  </button>
                ))}
              </div>

              {/* Voice picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVoices((v) => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/8 text-[11px] text-white/40 hover:text-white/70 hover:border-white/15 transition-all"
                >
                  <Mic className="w-3 h-3" />
                  {currentVoice?.label ?? "Voice"}
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform",
                      showVoices && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {showVoices && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-1.5 left-0 z-20 min-w-40 rounded-xl border border-white/10 bg-studio-surface/95 backdrop-blur-xl shadow-xl p-1"
                    >
                      {VOICE_STYLES.filter((v) => v.language === language).map(
                        (voice) => (
                          <button
                            key={voice.id}
                            type="button"
                            onClick={() => {
                              onVoiceChange(voice.id as VoiceStyleId);
                              setShowVoices(false);
                            }}
                            className={cn(
                              "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors",
                              voiceStyleId === voice.id
                                ? "bg-brand-primary/15 text-brand-primary"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <Mic className="w-3 h-3 shrink-0" />
                            {voice.label}
                          </button>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Regenerate button */}
            <motion.button
              type="button"
              onClick={() => {
                onRegenerate();
                setPrompt("");
              }}
              disabled={regenerating}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                regenerating
                  ? "bg-brand-primary/10 text-brand-primary/50 cursor-not-allowed"
                  : "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25"
              )}
            >
              {regenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5" />
              )}
              {regenerating ? "Generating…" : "Regenerate"}
            </motion.button>
          </div>
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
