import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Plus,
  Clapperboard,
  MapPin,
  BedDouble,
  Bath,
  Calendar,
  ChevronRight,
  Sparkles,
  Play,
  Wand2,
} from "lucide-react";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  ready: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  storyboard_ready: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  generating: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  complete: "bg-green-500/15 text-green-400 border-green-500/20",
  completed: "bg-green-500/15 text-green-400 border-green-500/20",
  failed: "bg-red-500/15 text-red-400 border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  ready: "Ready",
  storyboard_ready: "Ready",
  generating: "Generating",
  complete: "Complete",
  completed: "Complete",
  failed: "Failed",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condo",
  terrace: "Terrace House",
  semi_d: "Semi-D",
  bungalow: "Bungalow",
  commercial: "Commercial",
  land: "Land",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: projects } = await supabase
    .schema("video")
    .from("projects")
    .select(
      "id, title, property_type, state, city, bedrooms, bathrooms, status, created_at, thumbnail_url"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = projects ?? [];

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl w-full mx-auto space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Projects</h1>
          <p className="text-white/35 text-sm mt-0.5">
            {list.length} project{list.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-semibold text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
            boxShadow: "0 0 20px rgba(74,108,247,0.3)",
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Cinematic empty state */}
      {list.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] py-20 px-6 flex flex-col items-center text-center gap-6">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #4A6CF7 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />

          <div className="relative">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center relative z-10"
              style={{
                background:
                  "linear-gradient(135deg, rgba(74,108,247,0.2) 0%, rgba(139,92,246,0.1) 100%)",
                border: "1px solid rgba(74,108,247,0.2)",
                boxShadow: "0 0 30px rgba(74,108,247,0.15)",
              }}
            >
              <Clapperboard className="w-9 h-9 text-brand-primary/70" />
            </div>
            <div className="absolute -top-2 -right-3 w-8 h-8 rounded-xl bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-brand-accent/70" />
            </div>
            <div className="absolute -bottom-2 -left-3 w-7 h-7 rounded-lg bg-brand-success/15 border border-brand-success/20 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-brand-success/70" />
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <h3 className="text-xl font-bold text-white">Your studio is ready</h3>
            <p className="text-white/40 text-sm max-w-sm leading-relaxed">
              Create your first project and let AI generate a stunning property video in minutes.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
              boxShadow: "0 0 30px rgba(74,108,247,0.35), 0 4px 16px rgba(74,108,247,0.2)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Create First Project
          </Link>

          <div className="flex items-center gap-6 text-[11px] text-white/25 relative z-10">
            {["AI Script", "Auto Storyboard", "HD Video"].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-brand-primary/50 inline-block" />
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Project grid */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {list.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:border-brand-primary/30 hover:bg-white/[0.05] active:scale-[0.98] transition-all duration-200 overflow-hidden"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <div className="aspect-video bg-white/5 flex items-center justify-center relative overflow-hidden border-b border-white/[0.04]">
                {project.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.thumbnail_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Clapperboard className="w-8 h-8 text-white/10" />
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status] ?? STATUS_COLORS["draft"]}`}
                  >
                    {STATUS_LABELS[project.status] ?? "Draft"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-4 flex-1">
                <div>
                  <p className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {project.title}
                  </p>
                  <p className="text-white/35 text-xs mt-0.5">
                    {PROPERTY_TYPE_LABELS[project.property_type] ?? project.property_type}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30 mt-auto">
                  {project.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {project.city}, {project.state}
                    </span>
                  )}
                  {project.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3 h-3 shrink-0" />
                      {project.bedrooms} bed
                    </span>
                  )}
                  {project.bathrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3 shrink-0" />
                      {project.bathrooms} bath
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                  <span className="flex items-center gap-1 text-[11px] text-white/20">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {formatDate(project.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-brand-primary/50 group-hover:text-brand-primary transition-colors font-medium">
                    Open
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
