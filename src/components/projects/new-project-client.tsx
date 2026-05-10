"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Import, Pencil, ChevronRight } from "lucide-react";
import { PropertyDetailsForm } from "./property-details-form";
import { ListingPicker } from "./listing-picker";
import type { PropertyDetailsInput } from "@/lib/validations/project";

interface NewProjectClientProps {
  isAgent: boolean;
}

type Mode = "choose" | "import" | "manual";

export function NewProjectClient({ isAgent }: NewProjectClientProps) {
  const [mode, setMode] = useState<Mode>(isAgent ? "choose" : "manual");
  const [importedValues, setImportedValues] = useState<
    Partial<PropertyDetailsInput> | undefined
  >(undefined);
  const [importedPhotos, setImportedPhotos] = useState<
    Array<{ url: string; storagePath: string }>
  >([]);

  const handleImport = (
    details: PropertyDetailsInput,
    photos: Array<{ url: string; storagePath: string }>
  ) => {
    setImportedValues(details);
    setImportedPhotos(photos);
    setMode("manual");
  };

  if (mode === "import") {
    return (
      <div className="rounded-2xl bg-studio-card border border-studio-border overflow-hidden">
        <ListingPicker onImport={handleImport} onClose={() => setMode("choose")} />
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-studio-card border border-studio-border overflow-hidden divide-y divide-studio-border">
          {/* Import from PropGo */}
          <button
            type="button"
            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/3 transition-colors text-left group"
            onClick={() => setMode("import")}
          >
            <div className="w-10 h-10 rounded-xl bg-studio-accent/15 flex items-center justify-center shrink-0 group-hover:bg-studio-accent/25 transition-colors">
              <Import className="w-5 h-5 text-studio-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">
                Import from PropGo Listing
              </p>
              <p className="text-studio-text-muted text-xs mt-0.5">
                Auto-fill details and photos from one of your active listings.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-studio-text-muted group-hover:text-studio-accent transition-colors shrink-0" />
          </button>

          {/* Start from scratch */}
          <button
            type="button"
            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/3 transition-colors text-left group"
            onClick={() => setMode("manual")}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/8 transition-colors">
              <Pencil className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Start from scratch</p>
              <p className="text-studio-text-muted text-xs mt-0.5">
                Enter property details manually.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-studio-text-muted group-hover:text-white/50 transition-colors shrink-0" />
          </button>
        </div>
      </div>
    );
  }

  // Manual / post-import form
  return (
    <div className="space-y-4">
      {/* Imported banner */}
      {importedValues && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Import className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <p className="text-emerald-300 text-xs font-medium">
              Imported from PropGo listing — {importedPhotos.length} photo
              {importedPhotos.length !== 1 ? "s" : ""} ready for tagging.
            </p>
          </div>
          {isAgent && (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300 text-xs px-2 py-0.5 h-auto"
              onClick={() => setMode("import")}
            >
              Change listing
            </Button>
          )}
        </div>
      )}

      <PropertyDetailsForm initialValues={importedValues} />
    </div>
  );
}
