"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FloorPlanUpload } from "./floor-plan-upload";
import type { FloorPlanItem } from "./floor-plan-upload";

// Re-export the interface for external use
export type { FloorPlanItem } from "./floor-plan-upload";

interface FloorPlanStepProps {
  projectId: string;
  userId: string;
  floorPlans: {
    id: string;
    path: string;
    url: string;
    label: string;
    include_in_video: boolean;
  }[];
}

export function FloorPlanStep({ projectId, userId, floorPlans }: FloorPlanStepProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<FloorPlanItem[]>(
    floorPlans.map((fp) => ({ ...fp, file: undefined, uploading: false }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Floor Plans</h2>
        <p className="text-white/40 text-sm mt-1">
          Upload floor plans to add a layout animation scene to your video.
        </p>
      </div>

      <FloorPlanUpload
        projectId={projectId}
        userId={userId}
        initialPlans={plans}
        onUpdate={setPlans}
      />

      <div className="flex items-center justify-between pt-4 border-t border-studio-border">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/dashboard/projects/new?projectId=${projectId}&step=1`)}
          className="text-white/40 hover:text-white/70 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </Button>
        <Button
          type="button"
          onClick={() => router.push(`/dashboard/projects/${projectId}/edit?step=3`)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
        >
          Next: Photos
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
