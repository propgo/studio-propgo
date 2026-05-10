import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "./client";

export async function getUploadPresignedUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export function getPublicVideoUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

export function buildVideoKey(userId: string, generationId: string): string {
  return `videos/${userId}/${generationId}/output.mp4`;
}

export function buildThumbnailKey(
  userId: string,
  generationId: string
): string {
  return `videos/${userId}/${generationId}/thumbnail.jpg`;
}
