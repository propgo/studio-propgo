import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { GeneratePageClient } from "./generate-page-client";
import { getUserCredits } from "@/lib/actions/generation";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ generationId?: string }>;
}

export default async function GeneratePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { generationId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .schema("video")
    .from("projects")
    .select("id, title, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  // Load latest storyboard
  const { data: storyboard } = await supabase
    .schema("video")
    .from("storyboards")
    .select("id, scenes")
    .eq("project_id", id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const credits = await getUserCredits(user.id);

  return (
    <div className="p-8 max-w-3xl space-y-8">
      <GeneratePageClient
        projectId={id}
        projectTitle={project.title as string}
        storyboardId={storyboard?.id as string | undefined}
        sceneCount={Array.isArray(storyboard?.scenes) ? (storyboard.scenes as unknown[]).length : 0}
        userCredits={credits}
        initialGenerationId={generationId}
      />
    </div>
  );
}
