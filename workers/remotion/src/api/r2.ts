import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "propgo-studio-videos";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export async function uploadVideoToR2(
  filePath: string,
  generationId: string
): Promise<string> {
  const key = `videos/${generationId}/output.mp4`;
  const fileBuffer = fs.readFileSync(filePath);

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: "video/mp4",
      CacheControl: "public, max-age=31536000",
    })
  );

  return PUBLIC_URL ? `${PUBLIC_URL}/${key}` : key;
}

export async function getSignedVideoUrl(
  generationId: string,
  expiresIn = 86400
): Promise<string> {
  const key = `videos/${generationId}/output.mp4`;
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );
}
