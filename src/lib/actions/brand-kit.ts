"use server";

import { createClient } from "@/lib/supabase/server";
import type { BrandKitData } from "@/lib/types/brand-kit";
import { DEFAULT_BRAND_KIT } from "@/lib/types/brand-kit";
import { v4 as uuidv4 } from "uuid";

export async function getBrandKit(): Promise<BrandKitData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULT_BRAND_KIT;

  const { data } = await supabase
    .schema("video")
    .from("profiles")
    .select("brand_kit")
    .eq("id", user.id)
    .single();

  if (!data?.brand_kit) return DEFAULT_BRAND_KIT;
  return { ...DEFAULT_BRAND_KIT, ...(data.brand_kit as Partial<BrandKitData>) };
}

export async function saveBrandKit(
  brandKit: Omit<BrandKitData, "logoUrl" | "logoStoragePath">,
  existingLogoPath: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get existing to preserve logo path if not changed
  const current = await getBrandKit();
  const logoStoragePath = existingLogoPath ?? current.logoStoragePath;
  let logoUrl = current.logoUrl;

  if (logoStoragePath) {
    const { data } = await supabase.storage
      .from("studio-uploads")
      .getPublicUrl(logoStoragePath);
    logoUrl = data.publicUrl;
  }

  const fullKit: BrandKitData = { ...brandKit, logoUrl, logoStoragePath };

  const { error } = await supabase
    .schema("video")
    .from("profiles")
    .upsert({ id: user.id, brand_kit: fullKit }, { onConflict: "id" });

  return { error: error?.message };
}

export async function uploadLogo(
  formData: FormData
): Promise<{ storagePath: string; publicUrl: string; error?: never } | { error: string; storagePath?: never; publicUrl?: never }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("logo") as File | null;
  if (!file) return { error: "No file provided" };
  if (file.size > 2 * 1024 * 1024) return { error: "Logo must be under 2MB" };
  if (!["image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
    return { error: "Logo must be PNG, WebP or SVG" };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const storagePath = `brand-kits/${user.id}/${uuidv4()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("studio-uploads")
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("studio-uploads").getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl };
}
