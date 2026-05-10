"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  thumbnailUrl?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  thumbnailUrl,
  title,
  className,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2500);
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * duration;
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      className={cn(
        "relative bg-black rounded-xl overflow-hidden group select-none",
        className
      )}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnailUrl}
        autoPlay={autoPlay}
        playsInline
        className="w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onEnded={() => {
          setPlaying(false);
          setShowControls(true);
        }}
        onClick={togglePlay}
      />

      {/* Buffering spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
        </div>
      )}

      {/* Big play button (shown when paused) */}
      {!playing && !buffering && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
            <Play className="w-7 h-7 text-white fill-white ml-1" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 transition-all duration-300",
          showControls || !playing ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-3 pt-8 space-y-2">
          {/* Title */}
          {title && (
            <p className="text-white/70 text-xs font-medium truncate">{title}</p>
          )}

          {/* Seek bar */}
          <div
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all"
            onClick={seek}
          >
            <div
              className="h-full bg-brand-primary rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={togglePlay} className="text-white hover:text-white/80 transition-colors">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button type="button" onClick={toggleMute} className="text-white hover:text-white/80 transition-colors">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-white/50 text-xs font-mono flex-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button type="button" onClick={toggleFullscreen} className="text-white hover:text-white/80 transition-colors">
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
