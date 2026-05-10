"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Clapperboard,
  ArrowLeft,
} from "lucide-react";
import { useGenerationProgress, STATUS_LABELS, type GenerationStatus } from "@/hooks/use-generation-progress";

interface GenerationProgressProps {
  generationId: string;
  projectId: string;
  onCancel?: () => void;
}

const STAGE_ORDER: GenerationStatus[] = ["queued", "tagging", "generating", "rendering", "complete"];

function StageIndicator({ current }: { current: GenerationStatus }) {
  const isFailed = current === "failed";

  return (
    <div className="flex items-center gap-1">
      {STAGE_ORDER.map((stage, i) => {
        const currentIdx = STAGE_ORDER.indexOf(current);
        const isPast = i < currentIdx;
        const isActive = i === currentIdx;

        return (
          <div key={stage} className="flex items-center gap-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                isFailed ? "bg-red-500/40" : isPast ? "bg-brand-success" : isActive ? "bg-brand-primary animate-pulse" : "bg-white/10"
              )}
            />
            {i < STAGE_ORDER.length - 1 && (
              <div
                className={cn(
                  "w-8 h-px transition-all duration-500",
                  isPast ? "bg-brand-success" : "bg-white/10"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnimatedBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-studio-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-primary to-purple-500 transition-all duration-1000 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function GenerationProgress({ generationId, projectId, onCancel }: GenerationProgressProps) {
  const { status, progress, outputUrl, errorMessage, durationSeconds } =
    useGenerationProgress(generationId);

  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (status === "complete" || status === "failed") return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const isComplete = status === "complete";
  const isFailed = status === "failed";
  const isRunning = !isComplete && !isFailed;

  const estimatedTotal = 120; // seconds
  const remaining = Math.max(0, estimatedTotal - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 text-center">
      {/* Icon */}
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
          isComplete
            ? "bg-brand-success/20 text-brand-success"
            : isFailed
            ? "bg-red-500/20 text-red-400"
            : "bg-brand-primary/10 text-brand-primary"
        )}
      >
        {isComplete ? (
          <CheckCircle2 className="w-10 h-10" />
        ) : isFailed ? (
          <XCircle className="w-10 h-10" />
        ) : (
          <Clapperboard className="w-10 h-10 animate-pulse" />
        )}
      </div>

      {/* Status text */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">
          {STATUS_LABELS[status]}
        </h2>
        {isRunning && (
          <p className="text-white/35 text-sm flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            ~{mins > 0 ? `${mins}m ` : ""}{secs}s remaining
          </p>
        )}
        {isFailed && errorMessage && (
          <p className="text-red-400/60 text-sm max-w-sm mx-auto">{errorMessage}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md space-y-3">
        <AnimatedBar progress={progress} />
        <div className="flex items-center justify-between">
          <StageIndicator current={status} />
          <span className="text-xs text-white/30 font-mono">{progress}%</span>
        </div>
      </div>

      {/* Actions */}
      {isComplete && (
        <div className="space-y-4 w-full max-w-md">
          {/* Video preview */}
          {outputUrl && (
            <div className="rounded-xl overflow-hidden bg-black border border-studio-border">
              <video
                src={outputUrl}
                controls
                autoPlay
                loop
                muted
                className="w-full max-h-64 object-contain"
              />
            </div>
          )}
          {durationSeconds && (
            <p className="text-xs text-white/30 text-center">{durationSeconds}s · AI generated</p>
          )}
          <div className="flex gap-3">
            {outputUrl && (
              <a
                href={outputUrl}
                download="propgo-video.mp4"
                className={buttonVariants({
                  className: "flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white gap-2",
                })}
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
            <Button
              variant="outline"
              className="flex-1 border-studio-border text-white/50 hover:text-white gap-2"
              onClick={() => navigator.clipboard.writeText(outputUrl ?? "")}
            >
              <Share2 className="w-4 h-4" />
              Copy Link
            </Button>
          </div>
          <Link
            href="/dashboard/projects"
            className={buttonVariants({
              variant: "ghost",
              className: "w-full text-white/30 hover:text-white/60",
            })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      )}

      {isFailed && (
        <div className="flex gap-3">
          <Link
            href={`/dashboard/projects/${projectId}/generate`}
            className={buttonVariants({
              className: "bg-brand-primary hover:bg-brand-primary/90 text-white gap-2",
            })}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
          <Link
            href="/dashboard/projects"
            className={buttonVariants({
              variant: "ghost",
              className: "text-white/40 gap-2",
            })}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      )}

      {isRunning && onCancel && status === "queued" && (
        <button
          type="button"
          onClick={onCancel}
          className="text-white/25 hover:text-white/50 text-sm transition-colors"
        >
          Cancel generation
        </button>
      )}
    </div>
  );
}
