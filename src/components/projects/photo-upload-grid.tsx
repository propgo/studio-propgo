"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, Sparkles, Tag, AlertCircle } from "lucide-react";
import { uploadPhoto } from "@/lib/supabase/storage";
import { SCENE_TAGS } from "@/lib/constants/scene-tags";
import { createClient } from "@/lib/supabase/client";

export interface PhotoItem {
  id: string;
  file?: File;
  path: string;
  url: string;
  scene_tag: string;
  ai_suggested_tag?: string;
  ai_tagging?: boolean;
  uploading?: boolean;
  error?: string;
}

interface PhotoUploadGridProps {
  projectId: string;
  userId: string;
  initialPhotos?: PhotoItem[];
  onUpdate?: (photos: PhotoItem[]) => void;
}

const MAX_PHOTOS = 15;

const tagLabel = (value: string) =>
  SCENE_TAGS.find((t) => t.value === value)?.label ?? value;

export function PhotoUploadGrid({ projectId, userId, initialPhotos = [], onUpdate }: PhotoUploadGridProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);

  const update = (next: PhotoItem[]) => {
    setPhotos(next);
    onUpdate?.(next);
  };

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const remaining = MAX_PHOTOS - photos.length;
      const toProcess = accepted.slice(0, remaining);
      if (toProcess.length === 0) return;

      const supabase = createClient();

      for (const file of toProcess) {
        const tempId = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);

        const placeholder: PhotoItem = {
          id: tempId,
          file,
          path: "",
          url: previewUrl,
          scene_tag: "exterior_facade",
          uploading: true,
        };

        setPhotos((prev) => [...prev, placeholder]);

        // Upload to Supabase Storage
        const result = await uploadPhoto(userId, projectId, file);
        if (result.error) {
          setPhotos((prev) =>
            prev.map((p) => (p.id === tempId ? { ...p, uploading: false, error: result.error } : p))
          );
          continue;
        }

        // Insert to DB with placeholder tag
        const { data: row } = await supabase
          .schema("video")
          .from("project_photos")
          .insert({
            project_id: projectId,
            storage_path: result.path,
            scene_tag: "exterior_facade",
            upload_order: photos.length,
          })
          .select("id")
          .single();

        const dbId = row?.id ?? tempId;

        setPhotos((prev) => {
          const next: PhotoItem[] = prev.map((p) =>
            p.id === tempId
              ? { ...p, id: dbId, path: result.path!, url: result.url!, uploading: false, ai_tagging: true }
              : p
          );
          return next;
        });

        // Trigger AI auto-tag (fire and forget, update state when done)
        fetch("/api/tag-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoId: dbId, storagePath: result.path, projectId }),
        })
          .then((r) => r.json())
          .then((data: { scene_tag?: string; error?: string }) => {
            setPhotos((prev) => {
              const next = prev.map((p) =>
                p.id === dbId
                  ? {
                      ...p,
                      ai_tagging: false,
                      scene_tag: data.scene_tag ?? p.scene_tag,
                      ai_suggested_tag: data.scene_tag,
                    }
                  : p
              );
              onUpdate?.(next);
              return next;
            });
          })
          .catch(() => {
            setPhotos((prev) =>
              prev.map((p) => (p.id === dbId ? { ...p, ai_tagging: false } : p))
            );
          });
      }
    },
    [photos, projectId, userId, onUpdate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/gif": [] },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
    disabled: photos.length >= MAX_PHOTOS,
  });

  async function removePhoto(id: string) {
    const supabase = createClient();
    await supabase.schema("video").from("project_photos").delete().eq("id", id);
    const next = photos.filter((p) => p.id !== id);
    update(next);
  }

  async function updateTag(id: string, tag: string) {
    const supabase = createClient();
    await supabase.schema("video").from("project_photos").update({ scene_tag: tag }).eq("id", id);
    const next = photos.map((p) => (p.id === id ? { ...p, scene_tag: tag } : p));
    update(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white/80">Property Photos</h3>
          <p className="text-xs text-white/30 mt-0.5">
            Up to {MAX_PHOTOS} photos · {photos.length}/{MAX_PHOTOS} uploaded
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/25">
          <Sparkles className="w-3.5 h-3.5 text-brand-primary/40" />
          AI auto-tags each photo
        </div>
      </div>

      {/* Drop zone */}
      {photos.length < MAX_PHOTOS && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all",
            isDragActive
              ? "border-brand-primary/60 bg-brand-primary/5 scale-[1.01]"
              : "border-studio-border hover:border-white/25 bg-studio-bg/30 hover:bg-studio-bg/60"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-full bg-studio-muted flex items-center justify-center">
            <Upload className={cn("w-5 h-5 transition-colors", isDragActive ? "text-brand-primary" : "text-white/20")} />
          </div>
          <div className="text-center">
            <p className="text-sm text-white/50">
              {isDragActive ? "Drop photos here" : "Drag & drop photos or click to browse"}
            </p>
            <p className="text-xs text-white/25 mt-1">
              JPG, PNG, WEBP · max 20 MB each · up to {MAX_PHOTOS - photos.length} more
            </p>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-xl border border-studio-border bg-studio-surface overflow-hidden group"
            >
              {/* Image */}
              <div className="aspect-video bg-studio-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="property" className="w-full h-full object-cover" />

                {/* Uploading overlay */}
                {photo.uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}

                {/* Error overlay */}
                {photo.error && (
                  <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-300" />
                  </div>
                )}

                {/* Remove button */}
                {!photo.uploading && (
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>

              {/* Tag selector */}
              <div className="p-2">
                {photo.ai_tagging ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-brand-primary/60 px-1">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    AI tagging…
                  </div>
                ) : (
                  <div className="relative">
                    {photo.ai_suggested_tag === photo.scene_tag && (
                      <span className="absolute -top-1 right-1 flex items-center gap-0.5 text-[9px] text-brand-primary/50">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}
                    <select
                      value={photo.scene_tag}
                      onChange={(e) => updateTag(photo.id, e.target.value)}
                      disabled={photo.uploading}
                      className="w-full text-[11px] bg-transparent text-white/60 border-0 outline-none cursor-pointer hover:text-white/80 transition-colors pr-1"
                    >
                      {SCENE_TAGS.map((t) => (
                        <option key={t.value} value={t.value} className="bg-studio-surface text-white">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-white/20 justify-center py-2">
          <Tag className="w-3.5 h-3.5" />
          No photos uploaded yet
        </div>
      )}
    </div>
  );
}
