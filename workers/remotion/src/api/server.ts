import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { startRender, getJobStatus } from "./render";
import type { RenderManifest } from "../types";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

const WORKER_SECRET = process.env.WORKER_SECRET ?? "";

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (!WORKER_SECRET) {
    next();
    return;
  }
  const auth = req.headers.authorization ?? "";
  if (auth !== `Bearer ${WORKER_SECRET}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

const ManifestSchema = z.object({
  generationId: z.string(),
  projectTitle: z.string(),
  scenes: z.array(
    z.object({
      id: z.string(),
      clipUrl: z.string().url(),
      narrationLine: z.string(),
      sceneLabel: z.string(),
      durationSeconds: z.number(),
      cameraMovement: z.string(),
    })
  ),
  brandKit: z.object({
    agentName: z.string(),
    agentPhone: z.string().optional(),
    agentEmail: z.string().optional(),
    logoUrl: z.string().optional(),
    primaryColor: z.string().optional(),
  }),
  voiceoverUrl: z.string().url().optional(),
  musicTrack: z.string(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3"]),
  quality: z.enum(["720p", "1080p"]),
  watermark: z.boolean(),
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", worker: "propgo-remotion" });
});

// Start render
app.post("/render", authMiddleware, async (req, res) => {
  const parsed = ManifestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid manifest", details: parsed.error.flatten() });
    return;
  }

  try {
    const jobId = await startRender(parsed.data as RenderManifest);
    res.json({ jobId, status: "queued" });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Render failed" });
  }
});

// Get render status
app.get("/render/:jobId/status", authMiddleware, (req, res) => {
  const job = getJobStatus(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    outputUrl: job.outputUrl ?? null,
    error: job.error ?? null,
  });
});

const PORT = parseInt(process.env.PORT ?? "3001", 10);
app.listen(PORT, () => {
  console.log(`PropGo Remotion Worker listening on port ${PORT}`);
});

export default app;
