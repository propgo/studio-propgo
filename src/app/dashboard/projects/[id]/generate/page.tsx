import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Clapperboard } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GeneratePage({ params }: Props) {
  const { id } = await params;
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

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href={`/dashboard/projects/${id}/edit?step=5`}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Voiceover
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-white">Configure Generation</h1>
        <p className="text-white/40 text-sm mt-1">{project.title}</p>
      </div>

      {/* Phase 7 placeholder */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-studio-border bg-studio-surface/30 py-20 gap-4">
        <div className="w-14 h-14 rounded-full bg-studio-muted flex items-center justify-center">
          <Clapperboard className="w-7 h-7 text-white/15" />
        </div>
        <div className="text-center">
          <p className="text-white/50 font-medium">Video Generation — Phase 7</p>
          <p className="text-white/25 text-sm mt-1 max-w-xs">
            Model selection, aspect ratio, quality, music, and credit deduction coming next.
          </p>
        </div>
        <Link
          href="/dashboard/projects"
          className={buttonVariants({ className: "border-studio-border text-white/50" })}
        >
          Back to Projects
        </Link>
      </div>
    </div>
  );
}
