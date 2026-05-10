"use client";

import type { BrandKitData } from "@/lib/types/brand-kit";

interface BrandKitPreviewProps {
  brandKit: BrandKitData;
}

export function BrandKitPreview({ brandKit }: BrandKitPreviewProps) {
  const primary = brandKit.primaryColor || "#4A6CF7";

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#0A0A0F] to-[#12121A] border border-studio-border">
      {/* Simulated property scene */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Caption strip */}
      <div
        className="absolute bottom-16 left-0 right-0 px-6"
      >
        <div
          className="inline-block px-3 py-1.5 rounded"
          style={{ background: `${primary}CC` }}
        >
          <p className="text-white text-sm font-semibold leading-tight">
            Spacious living areas designed for comfort and modern living.
          </p>
        </div>
      </div>

      {/* Brand overlay — bottom right */}
      <div className="absolute bottom-3 right-4 flex items-center gap-2">
        {brandKit.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brandKit.logoUrl}
            alt="logo"
            className="w-8 h-8 rounded object-contain bg-white/10"
          />
        ) : (
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs"
            style={{ background: primary }}
          >
            {(brandKit.agentName || "A")[0]?.toUpperCase()}
          </div>
        )}
        <div className="text-right">
          <p className="text-white text-xs font-semibold leading-tight">
            {brandKit.agentName || "Agent Name"}
          </p>
          {brandKit.agentPhone && (
            <p className="text-white/60 text-[10px] leading-tight">{brandKit.agentPhone}</p>
          )}
        </div>
      </div>

      {/* Accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: primary }}
      />

      {/* Preview label */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/50 text-white/40 text-[10px] font-medium tracking-wider uppercase">
        Preview
      </div>
    </div>
  );
}
