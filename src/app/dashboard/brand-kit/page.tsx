import { Metadata } from "next";
import { getBrandKit } from "@/lib/actions/brand-kit";
import { BrandKitForm } from "@/components/brand-kit/brand-kit-form";
import { Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "Brand Kit – PropGo Studio",
};

export default async function BrandKitPage() {
  const brandKit = await getBrandKit();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-studio-accent/20 flex items-center justify-center shrink-0">
          <Palette className="w-5 h-5 text-studio-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Kit</h1>
          <p className="text-studio-text-muted text-sm mt-0.5">
            Your logo, colour, and contact details are overlaid on every generated video.
          </p>
        </div>
      </div>

      <BrandKitForm initial={brandKit} />
    </div>
  );
}
