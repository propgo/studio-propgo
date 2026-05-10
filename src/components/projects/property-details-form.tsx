"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, X, Sparkles } from "lucide-react";
import { propertyDetailsSchema, type PropertyDetailsInput } from "@/lib/validations/project";
import {
  MALAYSIA_STATES,
  CITIES_BY_STATE,
  KEY_FEATURES,
  PROPERTY_TYPES,
} from "@/lib/constants/malaysia-locations";
import { saveProjectDetails } from "@/lib/actions/project";

interface FieldErrorProps {
  message?: string;
}
function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="text-red-400 text-xs mt-1">{message}</p>;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">{title}</h3>
      {children}
    </div>
  );
}

const inputClass =
  "bg-studio-bg border-studio-border text-white placeholder:text-white/25 focus:border-brand-primary/60 focus:ring-brand-primary/20";

export function PropertyDetailsForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyDetailsInput>({
    resolver: zodResolver(propertyDetailsSchema) as Resolver<PropertyDetailsInput>,
    defaultValues: {
      bedrooms: 0,
      bathrooms: 0,
      keyFeatures: [],
    },
  });

  const watchedState = watch("state");
  const availableCities = watchedState ? (CITIES_BY_STATE[watchedState] ?? []) : [];

  useEffect(() => {
    setValue("city", "");
  }, [watchedState, setValue]);

  useEffect(() => {
    setValue("keyFeatures", selectedFeatures);
  }, [selectedFeatures, setValue]);

  function toggleFeature(feature: string) {
    setSelectedFeatures((prev) => {
      if (prev.includes(feature)) return prev.filter((f) => f !== feature);
      if (prev.length >= 10) return prev;
      return [...prev, feature];
    });
  }

  async function onSubmit(data: PropertyDetailsInput) {
    setSaving(true);
    try {
      const result = await saveProjectDetails(projectId ?? null, data);
      if ("error" in result) {
        console.error(result.error);
        return;
      }
      router.push(`/dashboard/projects/${result.projectId}/edit?step=2`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Property Details</h2>
        <p className="text-white/40 text-sm mt-1">
          These details power AI storyboard generation and voiceover scripts.
        </p>
      </div>

      {/* Basic Info */}
      <Section title="Basic Info">
        <div className="grid gap-4">
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">
              Project Title <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register("title")}
              placeholder="e.g. 3-Bedroom Corner Unit at Mont Kiara"
              className={inputClass}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">
              Property Type <span className="text-red-400">*</span>
            </Label>
            <Controller
              control={control}
              name="propertyType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-surface border-studio-border">
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem
                        key={t.value}
                        value={t.value}
                        className="text-white focus:bg-brand-primary/20"
                      >
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.propertyType?.message} />
          </div>
        </div>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">
              State <span className="text-red-400">*</span>
            </Label>
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-surface border-studio-border">
                    {MALAYSIA_STATES.map((s) => (
                      <SelectItem key={s} value={s} className="text-white focus:bg-brand-primary/20">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.state?.message} />
          </div>

          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">
              City / Area <span className="text-red-400">*</span>
            </Label>
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={availableCities.length === 0}
                >
                  <SelectTrigger className={cn(inputClass, availableCities.length === 0 && "opacity-50")}>
                    <SelectValue
                      placeholder={availableCities.length === 0 ? "Select state first" : "Select city"}
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-surface border-studio-border">
                    {availableCities.map((c) => (
                      <SelectItem key={c} value={c} className="text-white focus:bg-brand-primary/20">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.city?.message} />
          </div>
        </div>

        <div>
          <Label className="text-white/70 text-sm mb-1.5 block">Street Address (optional)</Label>
          <Input
            {...register("address")}
            placeholder="e.g. 15, Jalan Kiara 5, Mont Kiara"
            className={inputClass}
          />
        </div>
      </Section>

      {/* Property Specs */}
      <Section title="Property Specs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Floors</Label>
            <Input
              {...register("floors", { valueAsNumber: true })}
              type="number"
              min={1}
              max={99}
              placeholder="e.g. 2"
              className={inputClass}
            />
            <FieldError message={errors.floors?.message} />
          </div>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">
              Bedrooms <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register("bedrooms", { valueAsNumber: true })}
              type="number"
              min={0}
              max={99}
              placeholder="0"
              className={inputClass}
            />
            <FieldError message={errors.bedrooms?.message} />
          </div>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">
              Bathrooms <span className="text-red-400">*</span>
            </Label>
            <Input
              {...register("bathrooms", { valueAsNumber: true })}
              type="number"
              min={0}
              max={99}
              placeholder="0"
              className={inputClass}
            />
            <FieldError message={errors.bathrooms?.message} />
          </div>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Built-up (sqft)</Label>
            <Input
              {...register("builtUpSqft", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="e.g. 1200"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Land Area (sqft)</Label>
            <Input
              {...register("landSqft", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="e.g. 2400"
              className={inputClass}
            />
          </div>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Furnishing</Label>
            <Controller
              control={control}
              name="furnishing"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-surface border-studio-border">
                    <SelectItem value="fully" className="text-white focus:bg-brand-primary/20">
                      Fully Furnished
                    </SelectItem>
                    <SelectItem value="partially" className="text-white focus:bg-brand-primary/20">
                      Partially Furnished
                    </SelectItem>
                    <SelectItem value="unfurnished" className="text-white focus:bg-brand-primary/20">
                      Unfurnished
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Tenure</Label>
            <Controller
              control={control}
              name="tenure"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-surface border-studio-border">
                    <SelectItem value="freehold" className="text-white focus:bg-brand-primary/20">
                      Freehold
                    </SelectItem>
                    <SelectItem value="leasehold" className="text-white focus:bg-brand-primary/20">
                      Leasehold
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label className="text-white/70 text-sm mb-1.5 block">Asking Price (RM)</Label>
            <Input
              {...register("price", { valueAsNumber: true })}
              type="number"
              min={0}
              placeholder="e.g. 750000"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* Key Features */}
      <Section title="Key Features">
        <p className="text-white/30 text-xs -mt-2">
          Select up to 10 features · {selectedFeatures.length}/10 selected
        </p>
        <div className="flex flex-wrap gap-2">
          {KEY_FEATURES.map((feat) => {
            const selected = selectedFeatures.includes(feat);
            const maxReached = selectedFeatures.length >= 10 && !selected;
            return (
              <button
                key={feat}
                type="button"
                disabled={maxReached}
                onClick={() => toggleFeature(feat)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  selected
                    ? "bg-brand-primary border-brand-primary text-white"
                    : maxReached
                      ? "border-studio-border text-white/20 cursor-not-allowed"
                      : "border-studio-border text-white/50 hover:border-white/30 hover:text-white/80"
                )}
              >
                {feat}
                {selected && <X className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Description */}
      <Section title="Description">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-white/70 text-sm">Property Description (optional)</Label>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-brand-primary/70 hover:text-brand-primary transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Auto-generate (Phase 5)
            </button>
          </div>
          <Textarea
            {...register("description")}
            rows={4}
            placeholder="Describe the property — unique selling points, nearby amenities, lifestyle, etc."
            className={cn(inputClass, "resize-none")}
          />
          <div className="flex justify-between mt-1">
            <FieldError message={errors.description?.message} />
            <span className="text-white/20 text-xs ml-auto">
              {watch("description")?.length ?? 0}/2000
            </span>
          </div>
        </div>
      </Section>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t border-studio-border">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="text-white/40 hover:text-white/70"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Save &amp; Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
