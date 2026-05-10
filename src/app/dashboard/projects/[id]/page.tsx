import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Layers,
  Ruler,
  Tag,
  Pencil,
} from "lucide-react";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condominium",
  terrace: "Terrace House",
  semi_d: "Semi-Detached (Semi-D)",
  bungalow: "Bungalow",
  commercial: "Commercial Property",
  land: "Land",
};

function formatPrice(price: number) {
  return `RM ${price.toLocaleString("en-MY")}`;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-studio-border last:border-0">
      <span className="text-white/25 mt-0.5">{icon}</span>
      <span className="text-white/40 text-sm w-32 shrink-0">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: project } = await supabase
    .schema("video")
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  return (
    <div className="p-8 max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-white/60 truncate max-w-xs">{project.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{project.title}</h1>
          <p className="text-white/40 text-sm mt-1">
            {PROPERTY_TYPE_LABELS[project.property_type] ?? project.property_type}
            {project.city ? ` · ${project.city}, ${project.state}` : ""}
          </p>
        </div>
        <Link
          href={`/dashboard/projects/new?projectId=${project.id}`}
          className={buttonVariants({ variant: "outline", className: "border-studio-border text-white/60 hover:text-white gap-2 shrink-0" })}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Details
        </Link>
      </div>

      {/* Property info */}
      <div className="rounded-xl border border-studio-border bg-studio-surface p-5 space-y-0">
        <Row
          icon={<MapPin className="w-4 h-4" />}
          label="Location"
          value={[project.address, project.city, project.state].filter(Boolean).join(", ")}
        />
        <Row
          icon={<Layers className="w-4 h-4" />}
          label="Floors"
          value={project.floors ? `${project.floors} floor${project.floors > 1 ? "s" : ""}` : undefined}
        />
        <Row
          icon={<BedDouble className="w-4 h-4" />}
          label="Bedrooms"
          value={`${project.bedrooms} bedroom${project.bedrooms !== 1 ? "s" : ""}`}
        />
        <Row
          icon={<Bath className="w-4 h-4" />}
          label="Bathrooms"
          value={`${project.bathrooms} bathroom${project.bathrooms !== 1 ? "s" : ""}`}
        />
        <Row
          icon={<Ruler className="w-4 h-4" />}
          label="Built-up"
          value={project.built_up_sqft ? `${project.built_up_sqft.toLocaleString()} sqft` : undefined}
        />
        <Row
          icon={<Ruler className="w-4 h-4" />}
          label="Land Area"
          value={project.land_sqft ? `${project.land_sqft.toLocaleString()} sqft` : undefined}
        />
        <Row icon={<Tag className="w-4 h-4" />} label="Furnishing" value={project.furnishing} />
        <Row icon={<Tag className="w-4 h-4" />} label="Tenure" value={project.tenure} />
        <Row
          icon={<Tag className="w-4 h-4" />}
          label="Asking Price"
          value={project.price ? formatPrice(project.price) : undefined}
        />
      </div>

      {/* Key features */}
      {Array.isArray(project.key_features) && project.key_features.length > 0 && (
        <div className="rounded-xl border border-studio-border bg-studio-surface p-5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
            Key Features
          </p>
          <div className="flex flex-wrap gap-2">
            {(project.key_features as string[]).map((feat) => (
              <span
                key={feat}
                className="text-xs px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="rounded-xl border border-studio-border bg-studio-surface p-5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
            Description
          </p>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}

      {/* Next steps (placeholder) */}
      <div className="rounded-xl border border-dashed border-studio-border bg-studio-surface/30 p-5 text-center space-y-2">
        <p className="text-white/40 text-sm">
          Floor Plans, Photos & AI generation coming in Phase 4+
        </p>
        <Link
          href="/dashboard/projects/new"
          className={buttonVariants({ className: "bg-brand-primary hover:bg-brand-primary/90 text-white" })}
        >
          New Project
        </Link>
      </div>
    </div>
  );
}
