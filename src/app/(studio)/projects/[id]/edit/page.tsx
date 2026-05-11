import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { WizardShell } from "@/components/projects/wizard-shell";
import { FloorPlanStep } from "@/components/projects/floor-plan-step";
import { PhotoStep } from "@/components/projects/photo-step";
import { StoryboardStep } from "@/components/projects/storyboard-step";
import { VoiceoverStep } from "@/components/projects/voiceover-step";
import type { StoryboardScene } from "@/lib/ai/generate-storyboard";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}

export default async function EditProjectPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { step } = await searchParams;
  const currentStep = Math.min(Math.max(parseInt(step ?? "2", 10) || 2, 2), 5);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .schema("video")
    .from("projects")
    .select("id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const [{ data: floorPlans }, { data: photos }, { data: storyboards }] = await Promise.all([
    supabase.schema("video").from("project_floor_plans")
      .select("id, storage_path, floor_label, include_in_video").eq("project_id", id).order("created_at", { ascending: true }),
    supabase.schema("video").from("project_photos")
      .select("id, storage_path, scene_tag, ai_suggested_tag, upload_order").eq("project_id", id).order("upload_order", { ascending: true }),
    supabase.schema("video").from("storyboards")
      .select("id, scenes, version").eq("project_id", id).order("version", { ascending: false }).limit(1),
  ]);

  const latestStoryboard = storyboards?.[0];

  return (
    <WizardShell currentStep={currentStep}>
      {currentStep === 2 && (
        <FloorPlanStep
          projectId={id}
          userId={user.id}
          floorPlans={(floorPlans ?? []).map((fp) => ({
            id: fp.id,
            path: fp.storage_path,
            url: "",
            label: fp.floor_label ?? "ground",
            include_in_video: fp.include_in_video ?? true,
          }))}
        />
      )}
      {currentStep === 3 && (
        <PhotoStep
          projectId={id}
          userId={user.id}
          photos={(photos ?? []).map((p) => ({
            id: p.id,
            path: p.storage_path,
            url: "",
            scene_tag: p.scene_tag ?? "exterior_facade",
            ai_suggested_tag: p.ai_suggested_tag ?? undefined,
          }))}
        />
      )}
      {currentStep === 4 && (
        <StoryboardStep
          projectId={id}
          existingScenes={latestStoryboard ? (latestStoryboard.scenes as StoryboardScene[]) : undefined}
          existingStoryboardId={latestStoryboard?.id as string | undefined}
        />
      )}
      {currentStep === 5 && (
        <VoiceoverStep
          projectId={id}
          scenes={latestStoryboard ? (latestStoryboard.scenes as StoryboardScene[]) : []}
        />
      )}
    </WizardShell>
  );
}
