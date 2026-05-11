import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Layers,
  Ruler,
  Tag,
  Pencil,
  Sparkles,
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
    <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="text-white/20 mt-0.5">{icon}</span>
      <span className="text-white/35 text-sm w-32 shrink-0">{label}</span>
      <span className="text-white/80 text-sm">{value}</span>
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
    <div className="px-4 py-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/projects"
          className="flex items-center gap-1 text-white/35 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </Link>
        <span className="text-white/15">/</span>
        <span className="text-white/50 truncate max-w-xs">{project.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-white/40 text-sm mt-1">
            {PROPERTY_TYPE_LABELS[project.property_type] ?? project.property_type}
            {project.city ? ` · ${project.city}, ${project.state}` : ""}
          </p>
        </div>
        <Link
          href={`/projects/new?projectId=${project.id}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white/50 border border-white/[0.07] bg-white/[0.03] hover:text-white hover:border-white/15 transition-all shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Link>
      </div>

      {/* Property info */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-0" style={{ backdropFilter: "blur(8px)" }}>
        <Row icon={<MapPin className="w-4 h-4" />} label="Location"
          value={[project.address, project.city, project.state].filter(Boolean).join(", ")} />
        <Row icon={<Layers className="w-4 h-4" />} label="Floors"
          value={project.floors ? `${project.floors} floor${project.floors > 1 ? "s" : ""}` : undefined} />
        <Row icon={<BedDouble className="w-4 h-4" />} label="Bedrooms"
          value={`${project.bedrooms} bedroom${project.bedrooms !== 1 ? "s" : ""}`} />
        <Row icon={<Bath className="w-4 h-4" />} label="Bathrooms"
          value={`${project.bathrooms} bathroom${project.bathrooms !== 1 ? "s" : ""}`} />
        <Row icon={<Ruler className="w-4 h-4" />} label="Built-up"
          value={project.built_up_sqft ? `${project.built_up_sqft.toLocaleString()} sqft` : undefined} />
        <Row icon={<Ruler className="w-4 h-4" />} label="Land Area"
          value={project.land_sqft ? `${project.land_sqft.toLocaleString()} sqft` : undefined} />
        <Row icon={<Tag className="w-4 h-4" />} label="Furnishing" value={project.furnishing} />
        <Row icon={<Tag className="w-4 h-4" />} label="Tenure" value={project.tenure} />
        <Row icon={<Tag className="w-4 h-4" />} label="Asking Price"
          value={project.price ? formatPrice(project.price) : undefined} />
      </div>

      {Array.isArray(project.key_features) && project.key_features.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5" style={{ backdropFilter: "blur(8px)" }}>
          <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-3">Key Features</p>
          <div className="flex flex-wrap gap-2">
            {(project.key_features as string[]).map((feat) => (
              <span key={feat} className="text-xs px-2.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/80">
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.description && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5" style={{ backdropFilter: "blur(8px)" }}>
          <p className="text-white/35 text-xs font-semibold uppercase tracking-widest mb-3">Description</p>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center space-y-3">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
        <p className="text-white/35 text-sm">Floor Plans, Photos & AI generation coming in Phase 4+</p>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)" }}
        >
          <Sparkles className="w-4 h-4" />
          New Project
        </Link>
      </div>
    </div>
  );
}
