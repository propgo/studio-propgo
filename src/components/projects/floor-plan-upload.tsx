"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Layers, Loader2, FileImage } from "lucide-react";
import { uploadFloorPlan } from "@/lib/supabase/storage";
import { FLOOR_PLAN_LABELS } from "@/lib/constants/scene-tags";
import { createClient } from "@/lib/supabase/client";

export interface FloorPlanItem {
  id: string;
  file?: File;
  path: string;
  url: string;
  label: string;
  include_in_video: boolean;
  uploading?: boolean;
  error?: string;
}

interface FloorPlanUploadProps {
  projectId: string;
  userId: string;
  initialPlans?: FloorPlanItem[];
  onUpdate?: (plans: FloorPlanItem[]) => void;
}

const MAX_FLOOR_PLANS = 3;

export function FloorPlanUpload({ projectId, userId, initialPlans = [], onUpdate }: FloorPlanUploadProps) {
  const [plans, setPlans] = useState<FloorPlanItem[]>(initialPlans);

  const update = (next: FloorPlanItem[]) => {
    setPlans(next);
    onUpdate?.(next);
  };

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const remaining = MAX_FLOOR_PLANS - plans.length;
      const toProcess = accepted.slice(0, remaining);
      if (toProcess.length === 0) return;

      const supabase = createClient();

      for (const file of toProcess) {
        const tempId = crypto.randomUUID();
        const placeholder: FloorPlanItem = {
          id: tempId,
          file,
          path: "",
          url: URL.createObjectURL(file),
          label: FLOOR_PLAN_LABELS[plans.length]?.value ?? "ground",
          include_in_video: true,
          uploading: true,
        };

        setPlans((prev) => [...prev, placeholder]);

        const result = await uploadFloorPlan(userId, projectId, file);
        if (result.error) {
          setPlans((prev) =>
            prev.map((p) => (p.id === tempId ? { ...p, uploading: false, error: result.error } : p))
          );
          continue;
        }

        // Persist to DB
        const { data: row } = await supabase
          .schema("video")
          .from("project_floor_plans")
          .insert({
            project_id: projectId,
            storage_path: result.path,
            floor_label: placeholder.label,
            include_in_video: true,
          })
          .select("id")
          .single();

        setPlans((prev) => {
          const next: FloorPlanItem[] = prev.map((p) =>
            p.id === tempId
              ? { ...p, id: row?.id ?? tempId, path: result.path!, url: result.url!, uploading: false }
              : p
          );
          onUpdate?.(next);
          return next;
        });
      }
    },
    [plans, projectId, userId, onUpdate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
      "application/pdf": [],
    },
    maxSize: 20 * 1024 * 1024,
    disabled: plans.length >= MAX_FLOOR_PLANS,
  });

  async function removeFloorPlan(id: string) {
    const supabase = createClient();
    await supabase.schema("video").from("project_floor_plans").delete().eq("id", id);
    const next = plans.filter((p) => p.id !== id);
    update(next);
  }

  async function updateLabel(id: string, label: string) {
    const supabase = createClient();
    await supabase
      .schema("video")
      .from("project_floor_plans")
      .update({ floor_label: label })
      .eq("id", id);
    const next = plans.map((p) => (p.id === id ? { ...p, label } : p));
    update(next);
  }

  async function toggleInclude(id: string) {
    const supabase = createClient();
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;
    const next_val = !plan.include_in_video;
    await supabase
      .schema("video")
      .from("project_floor_plans")
      .update({ include_in_video: next_val })
      .eq("id", id);
    const next = plans.map((p) => (p.id === id ? { ...p, include_in_video: next_val } : p));
    update(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white/80">Floor Plans (Optional)</h3>
          <p className="text-xs text-white/30 mt-0.5">
            Up to {MAX_FLOOR_PLANS} floor plans · {plans.length}/{MAX_FLOOR_PLANS} uploaded
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/25">
          <Layers className="w-3.5 h-3.5" />
          JPG, PNG, PDF, WEBP · max 20 MB
        </div>
      </div>

      {/* Upload zone */}
      {plans.length < MAX_FLOOR_PLANS && (
        <div
          {...getRootProps()}
          className={cn(
            "border border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all",
            isDragActive
              ? "border-brand-primary/60 bg-brand-primary/5"
              : "border-studio-border hover:border-white/20 bg-studio-bg/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-5 h-5 text-white/20" />
          <p className="text-xs text-white/40 text-center">
            {isDragActive ? "Drop floor plan here" : "Drag & drop or click to upload floor plan"}
          </p>
        </div>
      )}

      {/* Floor plan list */}
      {plans.length > 0 && (
        <div className="space-y-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-studio-border bg-studio-surface"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg bg-studio-muted overflow-hidden flex items-center justify-center shrink-0 relative">
                {plan.uploading ? (
                  <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                ) : plan.url.startsWith("blob:") || plan.url.includes("supabase") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={plan.url} alt="floor plan" className="w-full h-full object-cover" />
                ) : (
                  <FileImage className="w-5 h-5 text-white/20" />
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <Select value={plan.label} onValueChange={(v) => { if (v) updateLabel(plan.id, v); }} disabled={plan.uploading}>
                  <SelectTrigger className="h-8 text-xs bg-studio-bg border-studio-border text-white/70 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-surface border-studio-border">
                    {FLOOR_PLAN_LABELS.map((fl) => (
                      <SelectItem key={fl.value} value={fl.value} className="text-white text-xs focus:bg-brand-primary/20">
                        {fl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={plan.include_in_video}
                    onChange={() => toggleInclude(plan.id)}
                    className="accent-brand-primary"
                    disabled={plan.uploading}
                  />
                  <span className="text-xs text-white/40">Include in video</span>
                </label>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeFloorPlan(plan.id)}
                disabled={plan.uploading}
                className="p-1 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {plans.length === 0 && (
        <p className="text-xs text-white/20 text-center">No floor plans uploaded yet</p>
      )}
    </div>
  );
}
