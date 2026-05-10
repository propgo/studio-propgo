"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { ScriptEditor } from "./script-editor";
import { generateScriptAction } from "@/lib/actions/script";
import type { StoryboardScene } from "@/lib/ai/generate-storyboard";
import type { ScriptLine } from "@/lib/ai/generate-script";
import type { VoiceStyleId } from "@/lib/constants/voices";

interface VoiceoverStepProps {
  projectId: string;
  scenes: StoryboardScene[];
}

export function VoiceoverStep({ projectId, scenes }: VoiceoverStepProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "bm">("en");
  const [voiceStyleId, setVoiceStyleId] = useState<VoiceStyleId>("en_male_pro");
  const [lines, setLines] = useState<ScriptLine[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateScriptAction(projectId, scenes, language);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLines(result.lines ?? []);
    } finally {
      setGenerating(false);
    }
  }

  function handleLanguageChange(lang: "en" | "bm") {
    setLanguage(lang);
    // Reset voice to first option for new language
    setVoiceStyleId(lang === "en" ? "en_male_pro" : "bm_male_pro");
    // Clear lines so user regenerates with new language
    setLines([]);
  }

  function handleConfirm() {
    // Store script + voice in sessionStorage, redirect to generation config
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        `voiceover_${projectId}`,
        JSON.stringify({ lines, language, voiceStyleId })
      );
    }
    router.push(`/dashboard/projects/${projectId}/generate`);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Voiceover & Script</h2>
          <p className="text-white/40 text-sm mt-1">
            AI writes a narration line for each scene. Edit any line, preview the voice, then confirm.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {lines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-studio-border bg-studio-surface/30 py-20 gap-5">
          <div className="w-14 h-14 rounded-full bg-studio-muted flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-brand-primary/40" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-white/60 font-medium">No script yet</p>
            <p className="text-white/30 text-sm max-w-xs">
              AI will write a narration line for each of your {scenes.length} storyboard scenes.
            </p>
          </div>

          {/* Language pre-select */}
          <div className="flex gap-2">
            {(["en", "bm"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  language === lang
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "border-studio-border text-white/40 hover:text-white/70"
                }`}
              >
                {lang === "en" ? "English" : "Bahasa Malaysia"}
              </button>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Writing Script…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Script
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <ScriptEditor
            projectId={projectId}
            scenes={scenes}
            initialLines={lines}
            language={language}
            voiceStyleId={voiceStyleId}
            onLanguageChange={handleLanguageChange}
            onVoiceChange={(id) => setVoiceStyleId(id)}
            onLinesChange={setLines}
            onRegenerate={handleGenerate}
            regenerating={generating}
          />

          <div className="flex items-center justify-between pt-4 border-t border-studio-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/dashboard/projects/${projectId}/edit?step=4`)}
              className="text-white/40 hover:text-white/70 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Storyboard
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
            >
              Confirm & Configure Video
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {lines.length === 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-studio-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/dashboard/projects/${projectId}/edit?step=4`)}
            className="text-white/40 hover:text-white/70 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Storyboard
          </Button>
        </div>
      )}
    </div>
  );
}
