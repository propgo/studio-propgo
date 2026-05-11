"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  X,
  RefreshCw,
  ArrowRight,
  Loader2,
  Clock,
  Clapperboard,
  Sparkles,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import type { StoryboardScene } from "@/lib/ai/generate-storyboard";

const AI_REFINE_SUGGESTIONS = [
  "More dramatic",
  "Focus on kitchen & living",
  "Highlight outdoor spaces",
  "Add luxury feel",
  "Shorter scenes",
  "Better flow",
  "Emphasize master bedroom",
];

const CAMERA_MOVEMENTS = [
  "slow push-in",
  "slow pull-back",
  "slow pan",
  "pan right",
  "pan left",
  "tracking shot",
  "aerial drift",
  "aerial orbit",
  "zoom-in reveal",
  "fade-in",
  "static",
];

interface SortableSceneCardProps {
  scene: StoryboardScene;
  index: number;
  onRemove: (id: string) => void;
  onUpdateCamera: (id: string, movement: string) => void;
  onUpdateDuration: (id: string, seconds: number) => void;
  onUpdateNarration: (id: string, line: string) => void;
}

function SortableSceneCard({
  scene,
  index,
  onRemove,
  onUpdateCamera,
  onUpdateDuration,
  onUpdateNarration,
}: SortableSceneCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: scene.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const isBrandingCard = scene.sceneTag === "branding_card";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex gap-3 p-3 rounded-xl border bg-studio-surface transition-all",
        isDragging ? "border-brand-primary/50 shadow-lg shadow-black/40 opacity-90" : "border-studio-border"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex items-center text-white/15 hover:text-white/40 cursor-grab active:cursor-grabbing shrink-0 mt-1"
        type="button"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Scene number */}
      <div className="w-6 h-6 rounded-full bg-studio-muted flex items-center justify-center text-[10px] font-semibold text-white/40 shrink-0 mt-0.5">
        {index + 1}
      </div>

      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-lg bg-studio-muted overflow-hidden shrink-0 flex items-center justify-center">
        {scene.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={scene.photoUrl} alt={scene.sceneLabel} className="w-full h-full object-cover" />
        ) : (
          <Clapperboard className="w-5 h-5 text-white/15" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Scene label */}
        <p className="text-xs font-medium text-white/70 truncate">{scene.sceneLabel}</p>

        {/* Narration line */}
        <textarea
          value={scene.narrationLine}
          onChange={(e) => onUpdateNarration(scene.id, e.target.value)}
          rows={2}
          maxLength={120}
          placeholder="Narration line…"
          className="w-full text-xs bg-studio-bg border border-studio-border rounded-lg px-2.5 py-1.5 text-white/70 placeholder:text-white/20 resize-none focus:outline-none focus:border-brand-primary/40 leading-relaxed"
        />

        {/* Controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Camera movement */}
          {!isBrandingCard && (
            <select
              value={scene.cameraMovement}
              onChange={(e) => onUpdateCamera(scene.id, e.target.value)}
              className="text-[11px] bg-studio-bg border border-studio-border rounded-lg px-2 py-1 text-white/50 cursor-pointer focus:outline-none focus:border-brand-primary/40"
            >
              {CAMERA_MOVEMENTS.map((m) => (
                <option key={m} value={m} className="bg-studio-surface">
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Duration */}
          <div className="flex items-center gap-1 text-[11px] text-white/40">
            <Clock className="w-3 h-3" />
            <select
              value={scene.durationSeconds}
              onChange={(e) => onUpdateDuration(scene.id, parseInt(e.target.value, 10))}
              className="bg-studio-bg border border-studio-border rounded-lg px-2 py-1 text-white/50 cursor-pointer focus:outline-none focus:border-brand-primary/40"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={s} className="bg-studio-surface">
                  {s}s
                </option>
              ))}
            </select>
          </div>

          <span className="text-[10px] text-white/20 ml-auto">
            {scene.narrationLine.length}/120
          </span>
        </div>
      </div>

      {/* Remove */}
      {!isBrandingCard && (
        <button
          type="button"
          onClick={() => onRemove(scene.id)}
          className="p-1 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface StoryboardEditorProps {
  initialScenes: StoryboardScene[];
  storyboardId: string;
  projectId: string;
  onRegenerate: () => void;
  onConfirm: (scenes: StoryboardScene[]) => void;
  saving: boolean;
  regenerating: boolean;
}

export function StoryboardEditor({
  initialScenes,
  storyboardId,
  projectId,
  onRegenerate,
  onConfirm,
  saving,
  regenerating,
}: StoryboardEditorProps) {
  const [scenes, setScenes] = useState<StoryboardScene[]>(initialScenes);
  const [showAIRefine, setShowAIRefine] = useState(false);
  const [aiInput, setAIInput] = useState("");
  const aiInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setScenes((items) => {
      const oldIndex = items.findIndex((s) => s.id === active.id);
      const newIndex = items.findIndex((s) => s.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function removeScene(id: string) {
    setScenes((prev) => prev.filter((s) => s.id !== id));
  }

  function updateCamera(id: string, movement: string) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, cameraMovement: movement } : s)));
  }

  function updateDuration(id: string, seconds: number) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, durationSeconds: seconds } : s)));
  }

  function updateNarration(id: string, line: string) {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, narrationLine: line } : s)));
  }

  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span>{scenes.length} scenes</span>
        <span>~{totalDuration}s total</span>
        <span>~{Math.ceil(totalDuration / 60)}m video</span>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors ml-auto"
        >
          {regenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Regenerate
        </button>
      </div>

      {/* Drag list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={scenes.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {scenes.map((scene, i) => (
              <SortableSceneCard
                key={scene.id}
                scene={scene}
                index={i}
                onRemove={removeScene}
                onUpdateCamera={updateCamera}
                onUpdateDuration={updateDuration}
                onUpdateNarration={updateNarration}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* ── AI Refine Panel — adapted from AI Chat (21st.dev) ── */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
        {/* Toggle header */}
        <button
          type="button"
          onClick={() => {
            setShowAIRefine((v) => !v);
            if (!showAIRefine) setTimeout(() => aiInputRef.current?.focus(), 200);
          }}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/3 transition-colors"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: showAIRefine ? 0 : 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-6 h-6 rounded-lg bg-brand-primary/20 flex items-center justify-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            </motion.div>
            <span className="text-sm font-medium text-white">Refine with AI</span>
            <span className="text-[11px] text-white/25 ml-0.5">
              — give a direction, then regenerate
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/30 transition-transform duration-300",
              showAIRefine && "rotate-180"
            )}
          />
        </button>

        {/* Expandable body */}
        <AnimatePresence>
          {showAIRefine && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/5 px-4 pt-3 pb-4 space-y-3">
                {/* Quick suggestion chips */}
                <div className="flex flex-wrap gap-1.5">
                  {AI_REFINE_SUGGESTIONS.map((s) => (
                    <motion.button
                      key={s}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setAIInput(s);
                        aiInputRef.current?.focus();
                      }}
                      className="px-3 py-1 rounded-full text-[11px] border border-brand-primary/20 text-brand-primary/70 hover:bg-brand-primary/10 hover:border-brand-primary/40 hover:text-brand-primary transition-all"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>

                {/* Custom input row */}
                <div className="flex gap-2">
                  <input
                    ref={aiInputRef}
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAIInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onRegenerate();
                        setAIInput("");
                      }
                    }}
                    placeholder="Custom direction… (press Enter to regenerate)"
                    className="flex-1 bg-studio-bg border border-studio-border rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary/40 transition-colors"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      onRegenerate();
                      setAIInput("");
                    }}
                    disabled={regenerating}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0",
                      regenerating
                        ? "bg-brand-primary/10 text-brand-primary/40 cursor-not-allowed"
                        : "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25"
                    )}
                  >
                    {regenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                    {regenerating ? "Regenerating…" : "Regenerate"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm */}
      <div className="flex items-center justify-between pt-4 border-t border-studio-border">
        <p className="text-xs text-white/25">
          Drag scenes to reorder · Remove unwanted scenes · Edit narration inline
        </p>
        <Button
          type="button"
          onClick={() => onConfirm(scenes)}
          disabled={saving || scenes.length < 2}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Confirm Storyboard
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
