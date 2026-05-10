"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export type GenerationStatus =
  | "queued"
  | "tagging"
  | "generating"
  | "rendering"
  | "complete"
  | "failed";

export interface GenerationProgress {
  status: GenerationStatus;
  progress: number;
  outputUrl: string | null;
  errorMessage: string | null;
  durationSeconds: number | null;
}

const STATUS_PROGRESS: Record<GenerationStatus, number> = {
  queued: 5,
  tagging: 15,
  generating: 55,
  rendering: 85,
  complete: 100,
  failed: 0,
};

const STATUS_LABELS: Record<GenerationStatus, string> = {
  queued: "Queued…",
  tagging: "Analysing scenes…",
  generating: "Generating clips…",
  rendering: "Rendering video…",
  complete: "Complete!",
  failed: "Generation failed",
};

export function useGenerationProgress(generationId: string | null): GenerationProgress {
  const [progress, setProgress] = useState<GenerationProgress>({
    status: "queued",
    progress: STATUS_PROGRESS["queued"],
    outputUrl: null,
    errorMessage: null,
    durationSeconds: null,
  });

  useEffect(() => {
    if (!generationId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Initial fetch
    supabase
      .schema("video")
      .from("generations")
      .select("status, output_url, error_message, duration_seconds")
      .eq("id", generationId)
      .single()
      .then(({ data }) => {
        if (data) {
          const status = data.status as GenerationStatus;
          setProgress({
            status,
            progress: STATUS_PROGRESS[status] ?? 0,
            outputUrl: (data.output_url as string | null) ?? null,
            errorMessage: (data.error_message as string | null) ?? null,
            durationSeconds: (data.duration_seconds as number | null) ?? null,
          });
        }
      });

    // Realtime subscription
    const channel = supabase
      .channel(`generation:${generationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "video",
          table: "generations",
          filter: `id=eq.${generationId}`,
        },
        (payload) => {
          const row = payload.new as {
            status: GenerationStatus;
            output_url: string | null;
            error_message: string | null;
            duration_seconds: number | null;
          };
          setProgress({
            status: row.status,
            progress: STATUS_PROGRESS[row.status] ?? 0,
            outputUrl: row.output_url ?? null,
            errorMessage: row.error_message ?? null,
            durationSeconds: row.duration_seconds ?? null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [generationId]);

  return progress;
}

export { STATUS_LABELS };
