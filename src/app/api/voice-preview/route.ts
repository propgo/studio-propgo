import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createClient } from "@/lib/supabase/server";
import { VOICE_STYLES, type VoiceStyleId } from "@/lib/constants/voices";
import { z } from "zod";

const bodySchema = z.object({
  text: z.string().min(1).max(500),
  voiceStyleId: z.string(),
});

// Simple in-memory rate limiter (per user, 1 request / 3 seconds)
const lastPreviewTime = new Map<string, number>();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 1 preview per 3 seconds per user
  const now = Date.now();
  const last = lastPreviewTime.get(user.id) ?? 0;
  if (now - last < 3000) {
    return NextResponse.json(
      { error: "Please wait a moment before previewing again." },
      { status: 429 }
    );
  }
  lastPreviewTime.set(user.id, now);

  const body = await req.json() as unknown;
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { text, voiceStyleId } = parsed.data;

  const voiceStyle = VOICE_STYLES.find((v) => v.id === (voiceStyleId as VoiceStyleId));
  if (!voiceStyle) {
    return NextResponse.json({ error: "Unknown voice style" }, { status: 400 });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    // Return a mock response when no API key — client will show "preview unavailable"
    return NextResponse.json({ error: "Voice preview requires ELEVENLABS_API_KEY" }, { status: 503 });
  }

  try {
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

    const audioStream = await client.textToSpeech.convert(voiceStyle.elevenLabsVoiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.1,
        useSpeakerBoost: true,
      },
    });

    // Stream → Buffer (Web Streams API)
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "TTS error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
