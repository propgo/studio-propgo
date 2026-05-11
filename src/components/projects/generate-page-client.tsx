"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Sparkles, Zap } from "lucide-react";
import { GenerationConfig, type GenerationConfig as ConfigType } from "@/components/projects/generation-config";
import { GenerationProgress } from "@/components/projects/generation-progress";
import { startGeneration } from "@/lib/actions/generation";
import type { ScriptLine } from "@/lib/ai/generate-script";
import type { VoiceStyleId } from "@/lib/constants/voices";

interface GeneratePageClientProps {
  projectId: string;
  projectTitle: string;
  storyboardId: string | undefined;
  sceneCount: number;
  userCredits: number;
  initialGenerationId?: string;
}

function FilmStripHero({
  projectTitle,
  sceneCount,
}: {
  projectTitle: string;
  sceneCount: number;
}) {
  const visibleCells = Math.min(sceneCount, 7);
  const extra = sceneCount > 7 ? sceneCount - 7 : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-5">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/12 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />

      <div className="flex gap-2 mb-5 overflow-hidden">
        {Array.from({ length: visibleCells }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", bounce: 0.3 }}
            className="flex-1 aspect-video rounded-lg bg-white/5 border border-white/8 flex items-center justify-center relative overflow-hidden min-w-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
            <Film className="w-4 h-4 text-white/12 relative z-10" />
            <span className="absolute bottom-1 right-1.5 text-[9px] text-white/20 font-mono">
              {i + 1}
            </span>
          </motion.div>
        ))}
        {extra > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: visibleCells * 0.06 }}
            className="flex-1 aspect-video rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[11px] text-white/30 font-medium min-w-0"
          >
            +{extra}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
          <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
            Ready to Generate
          </span>
        </div>
        <h2 className="text-lg font-semibold text-white leading-snug">{projectTitle}</h2>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-white/35">
          <span className="flex items-center gap-1">
            <Film className="w-3 h-3" />
            {sceneCount} scene{sceneCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-brand-accent" />
            AI video generation
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export function GeneratePageClient({
  projectId,
  projectTitle,
  storyboardId,
  sceneCount,
  userCredits,
  initialGenerationId,
}: GeneratePageClientProps) {
  const router = useRouter();
  const [generationId, setGenerationId] = useState<string | null>(
    initialGenerationId ?? null
  );
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getVoiceoverData(): { lines: ScriptLine[]; voiceStyleId: VoiceStyleId } {
    try {
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem(`voiceover_${projectId}`)
          : null;
      if (raw) return JSON.parse(raw) as { lines: ScriptLine[]; voiceStyleId: VoiceStyleId };
    } catch {
      // ignore
    }
    return { lines: [], voiceStyleId: "en_male_pro" };
  }

  async function handleConfirm(config: ConfigType) {
    if (!storyboardId) {
      setError("No storyboard found. Please complete the storyboard step first.");
      return;
    }

    setStarting(true);
    setError(null);

    const { lines, voiceStyleId } = getVoiceoverData();

    const result = await startGeneration({
      projectId,
      storyboardId,
      config,
      scriptLines: lines,
      voiceStyleId,
      language: "en",
    });

    if (result.error) {
      setError(result.error);
      setStarting(false);
      return;
    }

    router.push(
      `/projects/${projectId}/generate?generationId=${result.generationId}`
    );
    setGenerationId(result.generationId ?? null);
    setStarting(false);
  }

  if (generationId) {
    return <GenerationProgress generationId={generationId} projectId={projectId} />;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/projects/${projectId}/edit?step=5`}
          className="flex items-center gap-1 text-white/35 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Voiceover
        </Link>
      </div>

      <FilmStripHero projectTitle={projectTitle} sceneCount={sceneCount} />

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {sceneCount === 0 && (
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          No storyboard scenes found. Please complete the storyboard step first.
        </div>
      )}

      <GenerationConfig
        sceneCount={sceneCount || 1}
        userCredits={userCredits}
        onConfirm={handleConfirm}
        loading={starting}
      />
    </motion.div>
  );
}
