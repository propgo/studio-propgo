import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autoTagPhoto } from "@/lib/fal/tag-photo";
import { z } from "zod";

const bodySchema = z.object({
  photoId: z.string().uuid(),
  storagePath: z.string().min(1),
  projectId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as unknown;
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { photoId, storagePath, projectId } = parsed.data;

  // Verify the photo belongs to the user's project
  const { data: project } = await supabase
    .schema("video")
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Get a signed URL for the image so Fal.ai can access it
  const { data: signedUrlData } = await supabase.storage
    .from("studio-uploads")
    .createSignedUrl(storagePath, 300); // 5 minute URL

  if (!signedUrlData?.signedUrl) {
    return NextResponse.json({ error: "Could not generate image URL" }, { status: 500 });
  }

  // Run AI tagging
  const tagResult = await autoTagPhoto(signedUrlData.signedUrl);

  if (tagResult.error) {
    return NextResponse.json({ error: tagResult.error }, { status: 500 });
  }

  // Update the photo record with the AI-suggested tag
  await supabase
    .schema("video")
    .from("project_photos")
    .update({
      scene_tag: tagResult.scene_tag,
      ai_suggested_tag: tagResult.scene_tag,
    })
    .eq("id", photoId);

  return NextResponse.json({ scene_tag: tagResult.scene_tag });
}
