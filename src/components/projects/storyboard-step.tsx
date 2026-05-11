"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { StoryboardEditor } from "./storyboard-editor";
import { generateStoryboardAction, saveStoryboard } from "@/lib/actions/storyboard";
import type { StoryboardScene } from "@/lib/ai/generate-storyboard";

interface StoryboardStepProps {
  projectId: string;
  existingScenes?: StoryboardScene[];
  existingStoryboardId?: string;
}

export function StoryboardStep({
  projectId,
  existingScenes,
  existingStoryboardId,
}: StoryboardStepProps) {
  const router = useRouter();
  const [scenes, setScenes] = useState<StoryboardScene[]>(existingScenes ?? []);
  const [storyboardId, setStoryboardId] = useState<string | undefined>(existingStoryboardId);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateStoryboardAction(projectId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setScenes(result.scenes ?? []);
      setStoryboardId(result.storyboardId ?? undefined);
    } finally {
      setGenerating(false);
    }
  }

  async function handleConfirm(updatedScenes: StoryboardScene[]) {
    if (!storyboardId) return;
    setSaving(true);
    setError(null);
    try {
      const result = await saveStoryboard(projectId, storyboardId, updatedScenes);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/projects/${projectId}/edit?step=5`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">AI Storyboard</h2>
          <p className="text-white/40 text-sm mt-1">
            AI arranges your tagged photos into an optimal scene order. Reorder, edit, or remove scenes.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {scenes.length === 0 ? (
        /* Empty — show generate CTA */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-studio-border bg-studio-surface/30 py-20 gap-5">
          <div className="w-14 h-14 rounded-full bg-studio-muted flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-brand-primary/40" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-white/60 font-medium">No storyboard yet</p>
            <p className="text-white/30 text-sm max-w-xs">
              AI will analyse your tagged photos and property details to create an optimised scene sequence.
            </p>
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
                Generating Storyboard…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Storyboard
              </>
            )}
          </Button>
        </div>
      ) : (
        <StoryboardEditor
          initialScenes={scenes}
          storyboardId={storyboardId ?? ""}
          projectId={projectId}
          onRegenerate={handleGenerate}
          onConfirm={handleConfirm}
          saving={saving}
          regenerating={generating}
        />
      )}

      <div className="flex items-center justify-between pt-2 border-t border-studio-border">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/projects/${projectId}/edit?step=3`)}
          className="text-white/40 hover:text-white/70 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Photos
        </Button>
      </div>
    </div>
  );
}
