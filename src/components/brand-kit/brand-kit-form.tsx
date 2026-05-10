"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, X, Check, Palette } from "lucide-react";
import type { BrandKitData } from "@/lib/types/brand-kit";
import { saveBrandKit, uploadLogo } from "@/lib/actions/brand-kit";
import { BrandKitPreview } from "./brand-kit-preview";
import { cn } from "@/lib/utils";

interface BrandKitFormProps {
  initial: BrandKitData;
}

const PRESET_COLORS = [
  "#4A6CF7",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#10B981",
  "#06B6D4",
  "#EF4444",
  "#F59E0B",
  "#1E293B",
  "#374151",
];

export function BrandKitForm({ initial }: BrandKitFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BrandKitData>(initial);
  const [logoPreview, setLogoPreview] = useState<string | null>(initial.logoUrl);
  const [logoPath, setLogoPath] = useState<string | null>(initial.logoStoragePath);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const update = useCallback(
    (field: keyof BrandKitData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleLogoChange = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("logo", file);
    const result = await uploadLogo(fd);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    setLogoPreview(result.publicUrl ?? null);
    setLogoPath(result.storagePath ?? null);
    setForm((prev) => ({ ...prev, logoUrl: result.publicUrl ?? null, logoStoragePath: result.storagePath ?? null }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveBrandKit(
      {
        agentName: form.agentName,
        agentPhone: form.agentPhone,
        agentEmail: form.agentEmail,
        agencyName: form.agencyName,
        websiteUrl: form.websiteUrl,
        primaryColor: form.primaryColor,
      },
      logoPath
    );
    setSaving(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Brand kit saved!");
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-6">
        <Card className="bg-studio-card border-studio-border">
          <CardHeader>
            <CardTitle className="text-white text-base">Agent Details</CardTitle>
            <CardDescription>
              Your name and contact info appear on every generated video.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-studio-text-muted text-sm">Agent Name *</Label>
              <Input
                value={form.agentName}
                onChange={(e) => update("agentName", e.target.value)}
                placeholder="e.g. Ahmad Razif"
                className="bg-studio-bg border-studio-border text-white placeholder:text-studio-text-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-studio-text-muted text-sm">Phone / WhatsApp *</Label>
              <Input
                value={form.agentPhone}
                onChange={(e) => update("agentPhone", e.target.value)}
                placeholder="e.g. +601X-XXXXXXX"
                className="bg-studio-bg border-studio-border text-white placeholder:text-studio-text-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-studio-text-muted text-sm">Email</Label>
              <Input
                value={form.agentEmail}
                onChange={(e) => update("agentEmail", e.target.value)}
                placeholder="agent@example.com"
                className="bg-studio-bg border-studio-border text-white placeholder:text-studio-text-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-studio-text-muted text-sm">Agency Name</Label>
              <Input
                value={form.agencyName}
                onChange={(e) => update("agencyName", e.target.value)}
                placeholder="e.g. PropGo Realty"
                className="bg-studio-bg border-studio-border text-white placeholder:text-studio-text-muted"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-studio-text-muted text-sm">Website URL</Label>
              <Input
                value={form.websiteUrl}
                onChange={(e) => update("websiteUrl", e.target.value)}
                placeholder="https://propgo.my/agent/..."
                className="bg-studio-bg border-studio-border text-white placeholder:text-studio-text-muted"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-studio-card border-studio-border">
          <CardHeader>
            <CardTitle className="text-white text-base">Brand Identity</CardTitle>
            <CardDescription>Logo and colour applied to video overlays.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Logo upload */}
            <div className="space-y-2">
              <Label className="text-studio-text-muted text-sm">Logo (PNG / WebP / SVG, max 2MB)</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors",
                  uploading
                    ? "border-studio-accent/30"
                    : "border-studio-border hover:border-studio-accent/50"
                )}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="logo preview"
                      className="w-14 h-14 rounded-lg object-contain bg-white/5 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">Logo uploaded</p>
                      <p className="text-studio-text-muted text-xs">Click to replace</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 text-studio-text-muted hover:text-red-400 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoPreview(null);
                        setLogoPath(null);
                        setForm((prev) => ({ ...prev, logoUrl: null, logoStoragePath: null }));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-studio-text-muted w-full">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    ) : (
                      <Upload className="w-5 h-5 shrink-0" />
                    )}
                    <span className="text-sm">
                      {uploading ? "Uploading…" : "Click to upload logo"}
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoChange(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label className="text-studio-text-muted text-sm">Primary Brand Color</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg border-2 border-white/10 shrink-0 transition-transform hover:scale-110 relative"
                  style={{ background: form.primaryColor }}
                  onClick={() => setShowColorPicker((v) => !v)}
                >
                  <Palette className="w-4 h-4 text-white/60 absolute inset-0 m-auto" />
                </button>
                <Input
                  value={form.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  placeholder="#4A6CF7"
                  className="w-32 bg-studio-bg border-studio-border text-white font-mono text-sm"
                  maxLength={7}
                />
                <span className="text-studio-text-muted text-xs">Caption & accent colour</span>
              </div>

              {/* Preset swatches */}
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110",
                      form.primaryColor === color
                        ? "border-white scale-110"
                        : "border-transparent"
                    )}
                    style={{ background: color }}
                    onClick={() => update("primaryColor", color)}
                    title={color}
                  />
                ))}
              </div>

              {showColorPicker && (
                <div className="mt-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-studio-accent hover:bg-studio-accent/90 text-white"
          onClick={handleSave}
          disabled={saving || !form.agentName || !form.agentPhone}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save Brand Kit
            </>
          )}
        </Button>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium text-sm mb-1">Live Preview</h3>
          <p className="text-studio-text-muted text-xs">
            How your brand appears on generated videos.
          </p>
        </div>
        <BrandKitPreview brandKit={form} />

        <div className="rounded-xl bg-studio-card border border-studio-border p-4 space-y-2">
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
            Applied to every video
          </p>
          <ul className="text-studio-text-muted text-xs space-y-1">
            <li className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: form.primaryColor }}
              />
              Caption background color
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: form.primaryColor }}
              />
              Brand card on final frame
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: form.primaryColor }}
              />
              Logo + name overlay — bottom right
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: form.primaryColor }}
              />
              Accent bar at video bottom
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
