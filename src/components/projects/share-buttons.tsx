"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, Link, MessageCircle, Check, Loader2 } from "lucide-react";
import { generateShareLink } from "@/lib/actions/share";

interface ShareButtonsProps {
  generationId: string;
  outputUrl: string;
  projectTitle: string;
  initialShareUrl?: string;
}

export function ShareButtons({
  generationId,
  outputUrl,
  projectTitle,
  initialShareUrl,
}: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(initialShareUrl ?? null);
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  async function handleCopyLink() {
    setGeneratingLink(true);
    let url = shareUrl;

    if (!url) {
      const result = await generateShareLink(generationId);
      if (result.shareUrl) {
        url = result.shareUrl;
        setShareUrl(url);
      }
    }

    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setGeneratingLink(false);
  }

  async function handleWhatsApp() {
    let url = shareUrl;
    if (!url) {
      const result = await generateShareLink(generationId);
      if (result.shareUrl) {
        url = result.shareUrl;
        setShareUrl(url);
      }
    }
    if (url) {
      const text = encodeURIComponent(`${projectTitle}\n${url}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = `${projectTitle.replace(/\s+/g, "-")}.mp4`;
    a.click();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Download */}
      <button
        type="button"
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        Download MP4
      </button>

      {/* Copy link */}
      <button
        type="button"
        onClick={handleCopyLink}
        disabled={generatingLink}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
          copied
            ? "border-brand-success/40 bg-brand-success/10 text-brand-success"
            : "border-studio-border bg-studio-surface text-white/60 hover:text-white hover:border-white/20"
        )}
      >
        {generatingLink ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : copied ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Link className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied!" : "Copy Link"}
      </button>

      {/* WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsApp}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-studio-border bg-studio-surface text-white/60 hover:text-green-400 hover:border-green-500/30 text-sm font-medium transition-all"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </button>
    </div>
  );
}
