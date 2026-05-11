"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PhotoUploadGrid, type PhotoItem } from "./photo-upload-grid";
import { TagReviewGrid } from "./tag-review-grid";

interface PhotoStepProps {
  projectId: string;
  userId: string;
  photos: {
    id: string;
    path: string;
    url: string;
    scene_tag: string;
    ai_suggested_tag?: string;
  }[];
}

export function PhotoStep({ projectId, userId, photos: initialPhotos }: PhotoStepProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>(
    initialPhotos.map((p) => ({ ...p, uploading: false }))
  );
  const [showReview, setShowReview] = useState(initialPhotos.length > 0);

  function handleConfirm() {
    router.push(`/projects/${projectId}/edit?step=4`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Photos & Tagging</h2>
        <p className="text-white/40 text-sm mt-1">
          Upload property photos. AI will auto-tag each by room — review and correct before proceeding.
        </p>
      </div>

      {!showReview ? (
        <>
          <PhotoUploadGrid
            projectId={projectId}
            userId={userId}
            initialPhotos={photos}
            onUpdate={(updated) => {
              setPhotos(updated);
            }}
          />

          <div className="flex items-center justify-between pt-4 border-t border-studio-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/projects/${projectId}/edit?step=2`)}
              className="text-white/40 hover:text-white/70 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Floor Plans
            </Button>
            <Button
              type="button"
              onClick={() => setShowReview(true)}
              disabled={photos.length === 0 || photos.some((p) => p.uploading)}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
            >
              Review Tags ({photos.length})
            </Button>
          </div>
        </>
      ) : (
        <TagReviewGrid
          photos={photos}
          projectId={projectId}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
