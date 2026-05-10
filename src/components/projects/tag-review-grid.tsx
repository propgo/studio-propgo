"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { SCENE_TAGS, SCENE_TAG_GROUPS } from "@/lib/constants/scene-tags";
import type { PhotoItem } from "./photo-upload-grid";
import { createClient } from "@/lib/supabase/client";

interface TagReviewGridProps {
  photos: PhotoItem[];
  projectId: string;
  onConfirm: () => void;
}

export function TagReviewGrid({ photos, projectId, onConfirm }: TagReviewGridProps) {
  const [items, setItems] = useState<PhotoItem[]>(photos);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("All");

  const groups = ["All", ...SCENE_TAG_GROUPS];

  const visible =
    activeGroup === "All"
      ? items
      : items.filter((p) => {
          const tag = SCENE_TAGS.find((t) => t.value === p.scene_tag);
          return tag?.group === activeGroup;
        });

  async function updateTag(id: string, tag: string) {
    const supabase = createClient();
    await supabase.schema("video").from("project_photos").update({ scene_tag: tag }).eq("id", id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, scene_tag: tag } : p)));
  }

  async function confirmTags() {
    setSaving(true);
    try {
      // Persist any remaining unsaved tags + mark project photos as confirmed
      const supabase = createClient();
      await supabase
        .schema("video")
        .from("projects")
        .update({ photos_tagged: true })
        .eq("id", projectId);
      onConfirm();
    } finally {
      setSaving(false);
    }
  }

  const aiTaggedCount = items.filter(
    (p) => p.ai_suggested_tag && p.ai_suggested_tag === p.scene_tag
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-white/80">Review Photo Tags</h3>
          <p className="text-xs text-white/30 mt-0.5">
            {items.length} photos ·{" "}
            <span className="text-brand-primary/60">
              <Sparkles className="w-3 h-3 inline mr-0.5" />
              {aiTaggedCount} AI-tagged
            </span>
            {" · "}Correct any wrong tags before proceeding
          </p>
        </div>
      </div>

      {/* Group filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all border",
              activeGroup === g
                ? "bg-brand-primary border-brand-primary text-white"
                : "border-studio-border text-white/40 hover:text-white/70"
            )}
          >
            {g}
            {g !== "All" && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {items.filter((p) => SCENE_TAGS.find((t) => t.value === p.scene_tag)?.group === g).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {visible.map((photo) => {
            const isAI = photo.ai_suggested_tag === photo.scene_tag && !!photo.ai_suggested_tag;
            return (
              <div
                key={photo.id}
                className={cn(
                  "rounded-xl border bg-studio-surface overflow-hidden transition-all",
                  isAI ? "border-brand-primary/30" : "border-studio-border"
                )}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-studio-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="property" className="w-full h-full object-cover" />
                  {isAI && (
                    <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 text-[9px] bg-brand-primary/80 text-white px-1.5 py-0.5 rounded-full font-medium">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}
                </div>

                {/* Tag selector */}
                <div className="p-2">
                  <select
                    value={photo.scene_tag}
                    onChange={(e) => updateTag(photo.id, e.target.value)}
                    className="w-full text-[11px] bg-transparent text-white/70 border-0 outline-none cursor-pointer hover:text-white transition-colors"
                  >
                    {SCENE_TAGS.map((t) => (
                      <option key={t.value} value={t.value} className="bg-studio-surface text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-white/25 text-sm">
          No photos in this group
        </div>
      )}

      {/* Confirm button */}
      {items.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-studio-border">
          <div className="flex items-center gap-2 text-xs text-white/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-success/50" />
            {items.length} photo{items.length !== 1 ? "s" : ""} ready
          </div>
          <Button
            type="button"
            onClick={confirmTags}
            disabled={saving}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Confirm Tags — Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
