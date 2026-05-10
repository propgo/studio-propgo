"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

  // Load voiceover data saved from step 5
  function getVoiceoverData(): { lines: ScriptLine[]; voiceStyleId: VoiceStyleId } {
    try {
      const raw = typeof window !== "undefined"
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

    // Redirect to progress view
    router.push(`/dashboard/projects/${projectId}/generate?generationId=${result.generationId}`);
    setGenerationId(result.generationId ?? null);
    setStarting(false);
  }

  // Show progress view if generation started
  if (generationId) {
    return <GenerationProgress generationId={generationId} projectId={projectId} />;
  }

  // Show config UI
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/dashboard/projects/${projectId}/edit?step=5`}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Voiceover
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-white">Configure Video Generation</h1>
        <p className="text-white/40 text-sm mt-1">{projectTitle}</p>
      </div>

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
    </div>
  );
}
