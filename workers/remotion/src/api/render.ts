import path from "path";
import os from "os";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { v4 as uuidv4 } from "uuid";
import { uploadVideoToR2 } from "./r2";
import type { RenderManifest } from "../types";
import { ASPECT_RATIO_DIMENSIONS, QUALITY_SCALE } from "../types";

interface RenderJob {
  id: string;
  status: "queued" | "rendering" | "uploading" | "complete" | "failed";
  progress: number;
  outputUrl?: string;
  error?: string;
  startedAt: Date;
}

// In-memory job store (sufficient for single-instance worker)
const jobs = new Map<string, RenderJob>();

let bundleCache: string | null = null;

async function getBundle(): Promise<string> {
  if (bundleCache) return bundleCache;
  const entry = path.resolve(__dirname, "../index.tsx");
  bundleCache = await bundle({
    entryPoint: entry,
    onProgress: (progress) => {
      if (progress % 25 === 0) console.log(`Bundling: ${progress}%`);
    },
  });
  return bundleCache;
}

export async function startRender(manifest: RenderManifest): Promise<string> {
  const jobId = uuidv4();

  const job: RenderJob = {
    id: jobId,
    status: "queued",
    progress: 0,
    startedAt: new Date(),
  };
  jobs.set(jobId, job);

  // Run render async — do not await
  runRender(jobId, manifest).catch((err) => {
    const j = jobs.get(jobId);
    if (j) {
      j.status = "failed";
      j.error = err instanceof Error ? err.message : String(err);
    }
  });

  return jobId;
}

async function runRender(jobId: string, manifest: RenderManifest): Promise<void> {
  const job = jobs.get(jobId)!;
  job.status = "rendering";
  job.progress = 5;

  const dimensions = ASPECT_RATIO_DIMENSIONS[manifest.aspectRatio];
  const scale = QUALITY_SCALE[manifest.quality];
  const width = Math.round(dimensions.width * scale);
  const height = Math.round(dimensions.height * scale);
  const fps = 30;

  const scenesCount = manifest.scenes.length;
  const sceneFrames = scenesCount * (5 * fps - Math.round(0.5 * fps)) + Math.round(0.5 * fps);
  const brandCardFrames = 4 * fps;
  const totalFrames = sceneFrames + brandCardFrames;

  const outputPath = path.join(os.tmpdir(), `propgo-${jobId}.mp4`);

  try {
    const bundled = await getBundle();

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "PropertyVideo",
      inputProps: { manifest },
    });

    // Override dimensions based on manifest
    composition.width = width;
    composition.height = height;
    composition.durationInFrames = totalFrames;

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { manifest },
      onProgress: ({ renderedFrames }) => {
        job.progress = Math.min(
          90,
          5 + Math.round((renderedFrames / totalFrames) * 85)
        );
      },
      videoBitrate: manifest.quality === "1080p" ? "8M" : "4M",
    });

    job.status = "uploading";
    job.progress = 92;

    // Upload to R2
    const outputUrl = await uploadVideoToR2(outputPath, manifest.generationId);
    job.outputUrl = outputUrl;
    job.progress = 100;
    job.status = "complete";

    // Clean up temp file
    fs.rmSync(outputPath, { force: true });
  } catch (err) {
    job.status = "failed";
    job.error = err instanceof Error ? err.message : String(err);
    job.progress = 0;
    fs.rmSync(outputPath, { force: true });
    throw err;
  }
}

export function getJobStatus(jobId: string): RenderJob | undefined {
  return jobs.get(jobId);
}
