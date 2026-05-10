"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2, X, Import, ChevronRight, ImageIcon } from "lucide-react";
import type { PropGoListing } from "@/lib/actions/import-listing";
import { getAgentListings, importFromListing } from "@/lib/actions/import-listing";
import type { PropertyDetailsInput } from "@/lib/validations/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ListingPickerProps {
  onImport: (
    details: PropertyDetailsInput,
    photos: Array<{ url: string; storagePath: string }>
  ) => void;
  onClose: () => void;
}

function formatPrice(price: number | null): string {
  if (!price) return "Price not set";
  if (price >= 1_000_000) return `RM ${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `RM ${(price / 1_000).toFixed(0)}K`;
  return `RM ${price.toLocaleString()}`;
}

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  condo: "Condo",
  condominium: "Condo",
  terrace: "Terrace",
  semi_d: "Semi-D",
  semi_detached: "Semi-D",
  bungalow: "Bungalow",
  commercial: "Commercial",
  land: "Land",
};

export function ListingPicker({ onImport, onClose }: ListingPickerProps) {
  const [listings, setListings] = useState<PropGoListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAgentListings().then(({ listings: data, error: err }) => {
      if (cancelled) return;
      if (err) setError(err);
      else setListings(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      (l.address ?? "").toLowerCase().includes(q) ||
      (l.city ?? "").toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback(
    async (listing: PropGoListing) => {
      setImporting(listing.id);
      const result = await importFromListing(listing.id);
      setImporting(null);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (!result.result) return;
      toast.success(`Imported ${listing.title}`, {
        description: `${result.result.photos.length} photo(s) copied.`,
      });
      onImport(result.result.propertyDetails, result.result.photos);
    },
    [onImport]
  );

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-studio-accent/20 flex items-center justify-center">
            <Import className="w-4 h-4 text-studio-accent" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Import from PropGo Listing</h2>
            <p className="text-studio-text-muted text-xs">
              Select a listing to pre-fill your project details and photos.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-studio-text-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-studio-border shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or address…"
            className="pl-9 bg-studio-bg border-studio-border text-white placeholder:text-studio-text-muted text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-studio-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading your listings…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-studio-text-muted text-xs">
              This feature requires a PropGo agent account.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-studio-text-muted">
            <Building2 className="w-8 h-8 opacity-30" />
            <p className="text-sm">
              {search ? "No listings match your search" : "No active listings found"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-studio-border">
            {filtered.map((listing) => (
              <li key={listing.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors text-left group",
                    importing === listing.id && "opacity-60 pointer-events-none"
                  )}
                  onClick={() => handleSelect(listing)}
                  disabled={!!importing}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-studio-muted border border-studio-border">
                    {listing.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.thumbnail}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-studio-text-muted/40" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{listing.title}</p>
                    <p className="text-studio-text-muted text-xs truncate mt-0.5">
                      {[listing.address, listing.city, listing.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {listing.property_type && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 border-studio-border text-studio-text-muted"
                        >
                          {TYPE_LABELS[listing.property_type] ?? listing.property_type}
                        </Badge>
                      )}
                      {listing.bedrooms != null && (
                        <span className="text-studio-text-muted text-[10px]">
                          {listing.bedrooms}bd · {listing.bathrooms}ba
                        </span>
                      )}
                      {listing.image_count > 0 && (
                        <span className="text-studio-text-muted text-[10px]">
                          {listing.image_count} photo{listing.image_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + action */}
                  <div className="shrink-0 text-right">
                    <p className="text-white text-sm font-semibold">
                      {formatPrice(listing.price)}
                    </p>
                    {importing === listing.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-studio-accent mt-1 ml-auto" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-studio-text-muted group-hover:text-studio-accent transition-colors mt-1 ml-auto" />
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-studio-border shrink-0 flex justify-between items-center">
        <p className="text-studio-text-muted text-xs">
          {!loading && !error && `${filtered.length} listing${filtered.length !== 1 ? "s" : ""}`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-studio-text-muted hover:text-white"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
