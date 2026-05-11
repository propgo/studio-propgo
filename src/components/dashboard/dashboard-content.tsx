"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
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
  Sparkles,
  TrendingUp,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatItem {
  label: string;
  value: number;
  iconKey: "projects" | "videos" | "credits";
  color: string;
  bg: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  status: string;
  property_type: string | null;
  created_at: string;
}

interface DashboardContentProps {
  firstName: string;
  stats: StatItem[];
  projects: ProjectItem[];
  totalProjects: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const iconMap = {
  projects: Clapperboard,
  videos: Video,
  credits: Zap,
} as const;

const statAccent: Record<string, { glow: string; gradient: string; iconBg: string }> = {
  projects: {
    glow: "rgba(74,108,247,0.15)",
    gradient: "from-brand-primary/20 to-brand-primary/5",
    iconBg: "bg-brand-primary/15",
  },
  videos: {
    glow: "rgba(139,92,246,0.15)",
    gradient: "from-purple-500/20 to-purple-500/5",
    iconBg: "bg-purple-500/15",
  },
  credits: {
    glow: "rgba(255,193,7,0.12)",
    gradient: "from-brand-accent/20 to-brand-accent/5",
    iconBg: "bg-brand-accent/15",
  },
};

const propertyTypeLabel: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condo",
  terrace: "Terrace House",
  semi_d: "Semi-D",
  bungalow: "Bungalow",
  commercial: "Commercial",
  land: "Land",
};

const statusMap: Record<
  string,
  { label: string; icon: React.ElementType; cls: string }
> = {
  draft: { label: "Draft", icon: Clock, cls: "text-white/40 bg-white/5" },
  storyboard_ready: {
    label: "Ready",
    icon: CheckCircle2,
    cls: "text-brand-primary bg-brand-primary/10",
  },
  ready: {
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
  completed: {
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

// ─── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountUp({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(count, target, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [count, target]);

  return <motion.span>{rounded}</motion.span>;
}

function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] ?? statusMap["draft"]!;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${config.cls}`}
    >
      <Icon className={cn("w-3 h-3", status === "generating" && "animate-spin")} />
      {config.label}
    </span>
  );
}

// Reusable gradient CTA button (bypasses shadcn buttonVariants which applies bg-primary)
function GradientButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      style={{
        background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
        boxShadow: "0 0 20px rgba(74,108,247,0.3), 0 2px 8px rgba(74,108,247,0.2)",
      }}
    >
      {children}
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardContent({
  firstName,
  stats,
  projects,
  totalProjects,
}: DashboardContentProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-5xl w-full mx-auto space-y-6 md:space-y-8">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        className="flex items-start justify-between gap-3"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-brand-primary/80 uppercase tracking-wider">
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Good {greeting},{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #fff 40%, #8B9FFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {firstName}
            </span>
          </h1>
          <p className="text-sm text-white/35 mt-1">
            {totalProjects === 0
              ? "Ready to create your first property video?"
              : `${totalProjects} project${totalProjects !== 1 ? "s" : ""} in your studio`}
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} className="shrink-0">
          <GradientButton href="/projects/new">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </GradientButton>
        </motion.div>
      </motion.div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-3 gap-2 md:gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => {
          const Icon = iconMap[stat.iconKey];
          const accent = statAccent[stat.iconKey];
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
              whileHover={{
                y: -3,
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 md:p-5 cursor-default"
              style={{ backdropFilter: "blur(8px)" }}
            >
              {/* Glow */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top left, ${accent?.glow ?? "transparent"}, transparent 60%)`,
                }}
              />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <span className="text-[10px] md:text-xs text-white/40 leading-tight font-medium">
                    {stat.label}
                  </span>
                  <motion.div
                    className={cn(
                      "w-6 h-6 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0",
                      accent?.iconBg ?? "bg-white/10"
                    )}
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Icon className={cn("w-3 h-3 md:w-4 md:h-4", stat.color)} />
                  </motion.div>
                </div>
                <p className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                  <CountUp target={stat.value} />
                </p>
                <div className="flex items-center gap-1 mt-1.5 hidden md:flex">
                  <TrendingUp className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/25">All time</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Recent projects ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
            Recent Projects
          </h2>
          {totalProjects > 4 && (
            <Link
              href="/projects"
              className="text-xs text-brand-primary/70 hover:text-brand-primary flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          /* Cinematic empty state */
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] py-14 md:py-16 flex flex-col items-center justify-center text-center px-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {/* Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(74,108,247,0.15) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/25 to-transparent" />

            {/* Icon */}
            <div className="relative mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(74,108,247,0.2) 0%, rgba(139,92,246,0.1) 100%)",
                  border: "1px solid rgba(74,108,247,0.2)",
                  boxShadow: "0 0 24px rgba(74,108,247,0.12)",
                }}
              >
                <Video className="w-7 h-7 text-brand-primary/60" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-xl bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-brand-accent/70" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 relative z-10">
              No projects yet
            </h3>
            <p className="text-sm text-white/35 mb-6 max-w-xs leading-relaxed relative z-10">
              Transform property photos into cinematic marketing videos with AI
            </p>

            <GradientButton href="/projects/new" className="relative z-10">
              <Sparkles className="w-4 h-4" />
              Create first project
            </GradientButton>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={fadeUp}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                whileHover={{
                  y: -3,
                  transition: { type: "spring", stiffness: 400, damping: 20 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="block rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 hover:border-brand-primary/25 hover:bg-white/[0.05] transition-all group"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  <div className="w-full aspect-video rounded-xl bg-white/5 mb-3 flex items-center justify-center overflow-hidden relative border border-white/[0.04]">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Video className="w-7 h-7 text-white/10 relative z-10" />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                        {project.title}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {project.property_type
                          ? (propertyTypeLabel[project.property_type] ?? project.property_type)
                          : "Property"}{" "}
                        ·{" "}
                        {new Date(project.created_at).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
