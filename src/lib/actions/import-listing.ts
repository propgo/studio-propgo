"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { PropertyDetailsInput } from "@/lib/validations/project";
import { v4 as uuidv4 } from "uuid";

export interface PropGoListing {
  id: string;
  title: string;
  address: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  built_up_area: number | null;
  land_area: number | null;
  total_floors: number | null;
  furnishing: string | null;
  tenure: string | null;
  description: string | null;
  features: string[] | null;
  thumbnail: string | null;
  image_count: number;
}

interface ImportedListingResult {
  propertyDetails: PropertyDetailsInput;
  photos: Array<{ url: string; storagePath: string }>;
}

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Check if current user is a PropGo agent
export async function isUserAgent(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role === "agent" || data?.role === "agency_owner";
}

// Fetch agent's active listings from PropGo
export async function getAgentListings(): Promise<{
  listings: PropGoListing[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { listings: [], error: "Not authenticated" };

  const isAgent = await isUserAgent();
  if (!isAgent) return { listings: [], error: "Agent account required" };

  // Read listings + primary image via service role (cross-schema read)
  const service = getServiceSupabase();
  const { data, error } = await service
    .from("properties")
    .select(`
      id,
      title,
      address,
      city,
      state,
      price,
      property_type,
      bedrooms,
      bathrooms,
      built_up_area,
      land_area,
      total_floors,
      furnishing,
      tenure,
      description,
      features,
      property_images!left(url, sort_order, is_primary, image_type)
    `)
    .eq("agent_id", user.id)
    .in("status", ["active", "pending", "under_offer"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { listings: [], error: error.message };

  const listings: PropGoListing[] = (data ?? []).map((row) => {
    const images = (row.property_images ?? []) as Array<{
      url: string;
      sort_order: number;
      is_primary: boolean;
      image_type: string;
    }>;
    const primary = images.find((img) => img.is_primary) ?? images[0];
    return {
      id: row.id,
      title: row.title ?? "Untitled",
      address: row.address,
      city: row.city,
      state: row.state,
      price: row.price ? Number(row.price) : null,
      property_type: row.property_type,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      built_up_area: row.built_up_area,
      land_area: row.land_area,
      total_floors: row.total_floors,
      furnishing: row.furnishing,
      tenure: row.tenure,
      description: row.description,
      features: row.features ?? [],
      thumbnail: primary?.url ?? null,
      image_count: images.length,
    };
  });

  return { listings };
}

// Map PropGo property_type → Studio propertyType enum
function mapPropertyType(
  raw: string | null
): PropertyDetailsInput["propertyType"] {
  const map: Record<string, PropertyDetailsInput["propertyType"]> = {
    apartment: "apartment",
    condo: "condo",
    condominium: "condo",
    terrace: "terrace",
    terraced: "terrace",
    semi_d: "semi_d",
    semi_detached: "semi_d",
    bungalow: "bungalow",
    commercial: "commercial",
    land: "land",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "apartment";
}

function mapFurnishing(
  raw: string | null
): PropertyDetailsInput["furnishing"] {
  if (!raw) return undefined;
  if (raw.includes("fully") || raw === "full") return "fully";
  if (raw.includes("partial")) return "partially";
  return "unfurnished";
}

function mapTenure(raw: string | null): PropertyDetailsInput["tenure"] {
  if (!raw) return undefined;
  if (raw.toLowerCase().includes("free")) return "freehold";
  if (raw.toLowerCase().includes("lease")) return "leasehold";
  return undefined;
}

// Import a listing: map to Studio fields + copy up to 10 photos
export async function importFromListing(listingId: string): Promise<
  | { result: ImportedListingResult; error?: never }
  | { error: string; result?: never }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const isAgent = await isUserAgent();
  if (!isAgent) return { error: "Agent account required" };

  const service = getServiceSupabase();

  // Fetch full listing + all images
  const { data: listing, error: listingError } = await service
    .from("properties")
    .select(`
      id,
      title,
      address,
      city,
      state,
      price,
      property_type,
      bedrooms,
      bathrooms,
      built_up_area,
      land_area,
      total_floors,
      furnishing,
      tenure,
      description,
      features,
      property_images(url, sort_order, is_primary, image_type)
    `)
    .eq("id", listingId)
    .eq("agent_id", user.id)
    .single();

  if (listingError || !listing) {
    return { error: listingError?.message ?? "Listing not found" };
  }

  // Map to studio property details
  const propertyDetails: PropertyDetailsInput = {
    title: listing.title ?? "My Property",
    propertyType: mapPropertyType(listing.property_type),
    state: listing.state ?? "",
    city: listing.city ?? "",
    address: listing.address ?? undefined,
    floors: listing.total_floors ?? undefined,
    bedrooms: listing.bedrooms ?? 0,
    bathrooms: listing.bathrooms ?? 0,
    builtUpSqft: listing.built_up_area ?? undefined,
    landSqft: listing.land_area ?? undefined,
    furnishing: mapFurnishing(listing.furnishing),
    tenure: mapTenure(listing.tenure),
    price: listing.price ? Number(listing.price) : undefined,
    keyFeatures: (listing.features as string[]) ?? [],
    description: listing.description ?? undefined,
  };

  // Copy up to 10 exterior / interior photos to studio-uploads
  const images = ((listing.property_images ?? []) as Array<{
    url: string;
    sort_order: number;
    is_primary: boolean;
    image_type: string;
  }>)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .slice(0, 10);

  const copiedPhotos: Array<{ url: string; storagePath: string }> = [];

  for (const img of images) {
    if (!img.url) continue;
    try {
      const response = await fetch(img.url);
      if (!response.ok) continue;
      const buffer = await response.arrayBuffer();
      const contentType =
        response.headers.get("content-type") ?? "image/jpeg";
      const ext = contentType.split("/")[1]?.split(";")[0] ?? "jpg";
      const storagePath = `imported/${user.id}/${uuidv4()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("studio-uploads")
        .upload(storagePath, buffer, { contentType, upsert: false });

      if (uploadError) continue;

      const { data: publicData } = supabase.storage
        .from("studio-uploads")
        .getPublicUrl(storagePath);

      copiedPhotos.push({ url: publicData.publicUrl, storagePath });
    } catch {
      // Skip failed photo copies — non-fatal
    }
  }

  return {
    result: {
      propertyDetails,
      photos: copiedPhotos,
    },
  };
}
