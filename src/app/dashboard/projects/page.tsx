import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Plus,
  Clapperboard,
  MapPin,
  BedDouble,
  Bath,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { redirect } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  ready: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  generating: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  completed: "bg-green-500/15 text-green-400 border-green-500/20",
  failed: "bg-red-500/15 text-red-400 border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  ready: "Ready",
  generating: "Generating",
  completed: "Completed",
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
    .select("id, title, property_type, state, city, bedrooms, bathrooms, status, created_at, thumbnail_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = projects ?? [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {list.length} project{list.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className={buttonVariants({ className: "bg-brand-primary hover:bg-brand-primary/90 text-white gap-2" })}
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-studio-border bg-studio-surface/30 py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-studio-muted flex items-center justify-center">
            <Clapperboard className="w-7 h-7 text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-white/60 font-medium">No projects yet</p>
            <p className="text-white/30 text-sm mt-1">
              Create your first project to start generating property videos.
            </p>
          </div>
          <Link
            href="/dashboard/projects/new"
            className={buttonVariants({ className: "bg-brand-primary hover:bg-brand-primary/90 text-white gap-2" })}
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      )}

      {/* Project grid */}
      {list.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group flex flex-col rounded-xl border border-studio-border bg-studio-surface hover:border-brand-primary/40 transition-all overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-studio-muted flex items-center justify-center relative">
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
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status] ?? STATUS_COLORS.draft}`}
                  >
                    {STATUS_LABELS[project.status] ?? "Draft"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 p-4 flex-1">
                <div>
                  <p className="text-white font-medium text-sm leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">
                    {project.title}
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    {PROPERTY_TYPE_LABELS[project.property_type] ?? project.property_type}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/35 mt-auto">
                  {project.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {project.city}, {project.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BedDouble className="w-3 h-3" />
                    {project.bedrooms} bed
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="w-3 h-3" />
                    {project.bathrooms} bath
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-studio-border">
                  <span className="flex items-center gap-1 text-[11px] text-white/25">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.created_at)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-brand-primary/60 group-hover:text-brand-primary transition-colors font-medium">
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
