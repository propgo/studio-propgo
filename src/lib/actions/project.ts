"use server";

import { createClient } from "@/lib/supabase/server";
import { propertyDetailsSchema, type PropertyDetailsInput } from "@/lib/validations/project";

export async function saveProjectDetails(
  projectId: string | null,
  data: PropertyDetailsInput
): Promise<{ error: string } | { projectId: string }> {
  const parsed = propertyDetailsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const payload = {
    user_id: user.id,
    title: parsed.data.title,
    property_type: parsed.data.propertyType,
    state: parsed.data.state,
    city: parsed.data.city,
    address: parsed.data.address ?? null,
    floors: parsed.data.floors ?? null,
    bedrooms: parsed.data.bedrooms,
    bathrooms: parsed.data.bathrooms,
    built_up_sqft: parsed.data.builtUpSqft ?? null,
    land_sqft: parsed.data.landSqft ?? null,
    furnishing: parsed.data.furnishing ?? null,
    tenure: parsed.data.tenure ?? null,
    key_features: parsed.data.keyFeatures,
    price: parsed.data.price ?? null,
    description: parsed.data.description ?? null,
    status: "draft" as const,
  };

  if (projectId) {
    const { error } = await supabase
      .schema("video")
      .from("projects")
      .update(payload)
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { projectId };
  }

  const { data: inserted, error } = await supabase
    .schema("video")
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { projectId: inserted.id as string };
}
