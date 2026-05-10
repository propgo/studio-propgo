import { notFound } from "next/navigation";
import Link from "next/link";
import { getSharedGeneration } from "@/lib/actions/share";
import { VideoPlayer } from "@/components/projects/video-player";
import { buttonVariants } from "@/components/ui/button";
import { MapPin, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const gen = await getSharedGeneration(token);
  if (!gen) return { title: "PropGo Studio" };
  return {
    title: `${gen.projectTitle} — PropGo Studio`,
    description: `Watch this AI-generated property video for ${gen.projectTitle} in ${gen.city}, ${gen.state}.`,
    openGraph: {
      title: gen.projectTitle,
      description: `${gen.propertyType} in ${gen.city}, ${gen.state}`,
      type: "video.other",
      videos: [{ url: gen.outputUrl }],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const gen = await getSharedGeneration(token);

  if (!gen) notFound();

  return (
    <div className="min-h-screen bg-studio-bg text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-studio-border">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-primary" />
          <span className="font-bold text-sm tracking-tight">PropGo Studio</span>
        </Link>
        <Link
          href="/auth/signup"
          className={buttonVariants({
            className: "bg-brand-primary hover:bg-brand-primary/90 text-white text-sm gap-1.5",
          })}
        >
          Create your video
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-8 max-w-2xl mx-auto w-full">
        {/* Property info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{gen.projectTitle}</h1>
          {(gen.city || gen.state) && (
            <p className="flex items-center justify-center gap-1 text-white/40 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {[gen.city, gen.state].filter(Boolean).join(", ")}
            </p>
          )}
          {gen.propertyType && (
            <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-medium uppercase tracking-wider">
              {gen.propertyType}
            </span>
          )}
        </div>

        {/* Player */}
        <VideoPlayer
          src={gen.outputUrl}
          title={gen.projectTitle}
          className="w-full aspect-video rounded-xl shadow-2xl"
          autoPlay
        />

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={gen.outputUrl}
            download={`${gen.projectTitle}.mp4`}
            className={buttonVariants({
              className: "bg-brand-primary hover:bg-brand-primary/90 text-white gap-2",
            })}
          >
            Download MP4
          </a>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href);
            }}
            className={buttonVariants({
              variant: "outline",
              className: "border-studio-border text-white/60 hover:text-white gap-2",
            })}
          >
            Copy Link
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${gen.projectTitle}\n${typeof window !== "undefined" ? window.location.href : ""}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              className: "border-studio-border text-white/60 hover:text-green-400 hover:border-green-500/30 gap-2",
            })}
          >
            Share on WhatsApp
          </a>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3 pt-4 border-t border-studio-border w-full">
          <p className="text-white/40 text-sm">
            Create AI property videos for your own listings
          </p>
          <Link
            href="/auth/signup"
            className={buttonVariants({
              className: "bg-brand-primary hover:bg-brand-primary/90 text-white gap-2",
            })}
          >
            <Sparkles className="w-4 h-4" />
            Try PropGo Studio Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-white/20 text-xs border-t border-studio-border">
        Made with PropGo Studio · <Link href="/" className="hover:text-white/50 transition-colors">studio.propgo.my</Link>
      </footer>
    </div>
  );
}
