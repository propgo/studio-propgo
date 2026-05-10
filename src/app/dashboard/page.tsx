import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Plus,
  Clapperboard,
  Zap,
  Video,
  ArrowRight,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    draft: {
      label: "Draft",
      icon: Clock,
      cls: "text-white/40 bg-white/5",
    },
    storyboard_ready: {
      label: "Ready",
      icon: CheckCircle2,
      cls: "text-brand-primary bg-brand-primary/10",
    },
    generating: {
      label: "Generating",
      icon: Loader2,
      cls: "text-brand-accent bg-brand-accent/10",
    },
    complete: {
      label: "Complete",
      icon: CheckCircle2,
      cls: "text-brand-success bg-brand-success/10",
    },
    failed: {
      label: "Failed",
      icon: AlertCircle,
      cls: "text-brand-error bg-brand-error/10",
    },
  };

  const config = map[status] ?? map["draft"]!;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.cls}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const firstName =
    (user.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0] ??
    "there";

  // Fetch stats in parallel
  const [projectsResult, generationsResult, walletResult] = await Promise.all([
    supabase
      .schema("video")
      .from("projects")
      .select("id, title, status, property_type, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .schema("video")
      .from("generations")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "complete"),
    supabase
      .schema("video")
      .from("wallets")
      .select("monthly_credits, topup_credits")
      .eq("user_id", user.id)
      .single(),
  ]);

  const projects = projectsResult.data ?? [];
  const totalProjects = projectsResult.count ?? 0;
  const videosGenerated = generationsResult.count ?? 0;
  const totalCredits =
    (walletResult.data?.monthly_credits ?? 0) +
    (walletResult.data?.topup_credits ?? 0);

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: Clapperboard,
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      label: "Videos Generated",
      value: videosGenerated,
      icon: Video,
      color: "text-brand-success",
      bg: "bg-brand-success/10",
    },
    {
      label: "Credits Left",
      value: totalCredits,
      icon: Zap,
      color: "text-brand-accent",
      bg: "bg-brand-accent/10",
    },
  ];

  const propertyTypeLabel: Record<string, string> = {
    apartment: "Apartment",
    condo: "Condo",
    terrace: "Terrace House",
    semi_d: "Semi-D",
    bungalow: "Bungalow",
    commercial: "Commercial",
    land: "Land",
  };

  return (
    <div className="flex-1 px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {firstName} 👋
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {totalProjects === 0
              ? "Create your first project to get started"
              : `You have ${totalProjects} project${totalProjects !== 1 ? "s" : ""} in your studio`}
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-studio-surface border border-studio-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/40">{stat.label}</span>
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/60">Recent Projects</h2>
          {totalProjects > 4 && (
            <Link
              href="/dashboard/projects"
              className="text-xs text-brand-primary hover:text-brand-primary/80 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          /* Empty state */
          <div className="bg-studio-surface border border-studio-border border-dashed rounded-2xl py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-studio-muted rounded-2xl flex items-center justify-center mb-5">
              <Video className="w-7 h-7 text-white/20" />
            </div>
            <h3 className="text-base font-medium text-white/60 mb-2">
              No projects yet
            </h3>
            <p className="text-sm text-white/30 mb-6 max-w-xs">
              Create your first project to transform property photos into
              cinematic marketing videos
            </p>
            <Link
              href="/dashboard/projects/new"
              className={buttonVariants({ className: "bg-brand-primary hover:bg-brand-primary/90 text-white gap-2" })}
            >
              <Plus className="w-4 h-4" />
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="bg-studio-surface border border-studio-border rounded-xl p-5 hover:border-white/10 transition-all group"
              >
                {/* Thumbnail placeholder */}
                <div className="w-full aspect-video bg-studio-muted rounded-lg mb-4 flex items-center justify-center">
                  <Video className="w-8 h-8 text-white/10" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-primary transition-colors">
                      {project.title}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {project.property_type
                        ? propertyTypeLabel[project.property_type] ?? project.property_type
                        : "Property"}{" "}
                      ·{" "}
                      {new Date(project.created_at as string).toLocaleDateString(
                        "en-MY",
                        { day: "numeric", month: "short" }
                      )}
                    </p>
                  </div>
                  <StatusBadge status={project.status as string} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
