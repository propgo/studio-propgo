"use client";

import {
  motion,
  useInView,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import {
  Sparkles,
  Play,
  Check,
  ArrowRight,
  Zap,
  Globe,
  Clock,
  Shield,
  Menu,
  X,
  Building2,
  Wand2,
  Share2,
  BarChart3,
  Film,
  Mic,
  Palette,
  Plus,
  Clapperboard,
} from "lucide-react";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";

// ─── LANDING AUTH (SSR pass-through) ───────────────────────────────────────────

export type LandingAuth = {
  userEmail: string;
  userName?: string;
  plan: string;
  credits: number;
};

// ─── ANIMATION PRESETS ────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const stagger = (delay = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
});

// ─── NAV ─────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

function Nav({ landingAuth }: { landingAuth: LandingAuth | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthed = Boolean(landingAuth);
  const displayName =
    landingAuth?.userName ?? landingAuth?.userEmail ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,10,15,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-16 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="shrink-0"
          >
            <Image
              src="/propgo-logo.png"
              alt="PropGo"
              width={88}
              height={30}
              className="h-7 w-auto object-contain"
              style={{ mixBlendMode: "lighten" }}
              priority
            />
          </motion.div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{
              background: "linear-gradient(90deg, #4A6CF7, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {isAuthed && landingAuth ? (
            <>
              <Link
                href="/projects/new"
                className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                  boxShadow: "0 0 16px rgba(74,108,247,0.3)",
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </Link>
              <Link
                href="/credits"
                className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    repeat: Infinity,
                    repeatDelay: 5,
                    duration: 0.5,
                  }}
                >
                  <Zap className="w-3.5 h-3.5 text-brand-accent" />
                </motion.div>
                <span className="text-sm font-bold text-white tabular-nums">
                  {landingAuth.credits}
                </span>
              </Link>
              <ProfileDropdown
                displayName={displayName}
                plan={landingAuth.plan}
                credits={landingAuth.credits}
                initial={initial}
              />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-white/[0.04]"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                  boxShadow: "0 0 20px rgba(74,108,247,0.3)",
                }}
              >
                Start Free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden ml-auto p-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden border-t border-white/[0.06]"
            style={{ background: "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)" }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                {isAuthed && landingAuth ? (
                  <>
                    <Link
                      href="/projects/new"
                      onClick={() => setMobileOpen(false)}
                      className="flex cursor-pointer items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New project
                    </Link>
                    <Link
                      href="/projects"
                      onClick={() => setMobileOpen(false)}
                      className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/[0.06] transition-colors border border-white/[0.08]"
                    >
                      <Clapperboard className="w-4 h-4 shrink-0" />
                      Open studio
                    </Link>
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                      <Link
                        href="/credits"
                        onClick={() => setMobileOpen(false)}
                        className="flex flex-1 items-center gap-2 min-w-0 cursor-pointer hover:opacity-90"
                      >
                        <Zap className="w-4 h-4 text-brand-accent shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] text-white/40">
                            Credits
                          </div>
                          <div className="text-sm font-bold text-white tabular-nums truncate">
                            {landingAuth.credits}
                          </div>
                        </div>
                      </Link>
                      <ProfileDropdown
                        displayName={displayName}
                        plan={landingAuth.plan}
                        credits={landingAuth.credits}
                        initial={initial}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-2.5 rounded-xl text-sm text-center text-white/60 hover:bg-white/[0.05] transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white text-center cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                      }}
                    >
                      Start Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ─── APP MOCKUP ──────────────────────────────────────────────────────────────

function AppMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.45, ease }}
      className="relative w-full max-w-3xl mx-auto"
    >
      {/* Glow behind mockup */}
      <div
        className="absolute -inset-10 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(74,108,247,0.35) 0%, transparent 65%)",
        }}
      />

      {/* Browser chrome */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "#13131A",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]"
          style={{ background: "#0F0F18" }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <div
            className="flex-1 mx-6 px-3 py-1 rounded-md text-[11px] text-white/20 text-center"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            studio.propgo.my
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4A6CF7, #8B5CF6)" }}>
            <Sparkles className="w-3 h-3" />
            New Video
          </div>
        </div>

        {/* App content */}
        <div className="p-5 md:p-7 space-y-5">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white mb-1">
                My Projects
              </div>
              <div className="text-xs text-white/30">
                3 projects · 2 in progress
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-7 w-24 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
              <div className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
            </div>
          </div>

          {/* Project cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                bg: "rgba(74,108,247,0.12)",
                border: "rgba(74,108,247,0.25)",
                label: "Mont Kiara Condo",
                tag: "Ready",
                tagColor: "#22C55E",
                progress: null,
              },
              {
                bg: "rgba(139,92,246,0.12)",
                border: "rgba(139,92,246,0.2)",
                label: "Bangsar Semi-D",
                tag: "Generating",
                tagColor: "#4A6CF7",
                progress: 68,
              },
              {
                bg: "rgba(255,193,7,0.07)",
                border: "rgba(255,193,7,0.15)",
                label: "KLCC Suite",
                tag: "Draft",
                tagColor: "rgba(255,255,255,0.25)",
                progress: null,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.12, duration: 0.4 }}
                className="rounded-xl p-3 border cursor-pointer"
                style={{ background: card.bg, borderColor: card.border }}
              >
                {/* Thumbnail */}
                <div
                  className="aspect-video rounded-lg mb-2.5 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.25)" }}
                >
                  <Film className="w-4 h-4 text-white/20" />
                </div>
                <div className="text-[11px] font-medium text-white/70 truncate mb-1.5">
                  {card.label}
                </div>
                <div
                  className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={{ color: card.tagColor, background: `${card.tagColor}18` }}
                >
                  {card.tag}
                </div>
                {card.progress !== null && (
                  <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progress}%` }}
                      transition={{ delay: 1.3, duration: 1.2, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #4A6CF7, #8B5CF6)",
                      }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Storyboard strip */}
          <div
            className="rounded-xl p-3.5 border border-white/[0.05]"
            style={{ background: "#0F0F18" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span className="text-[11px] text-white/35">
                AI Storyboard — Mont Kiara Condo
              </span>
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[
                "Exterior",
                "Living Rm",
                "Master",
                "Kitchen",
                "Pool View",
                "CTA",
              ].map((scene, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 + i * 0.07, duration: 0.35 }}
                  className="flex-shrink-0 w-16 md:w-[72px] aspect-video rounded-lg flex items-center justify-center text-[9px] text-center px-1 border"
                  style={{
                    background:
                      i === 0
                        ? "rgba(74,108,247,0.2)"
                        : "rgba(255,255,255,0.025)",
                    borderColor:
                      i === 0
                        ? "rgba(74,108,247,0.45)"
                        : "rgba(255,255,255,0.05)",
                    color: i === 0 ? "#4A6CF7" : "rgba(255,255,255,0.3)",
                  }}
                >
                  {scene}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge: video ready */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5, ease }}
        className="absolute -right-3 md:-right-8 top-24 px-4 py-3 rounded-2xl border border-white/[0.08] hidden sm:flex items-center gap-3"
        style={{
          background: "rgba(13,13,20,0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <Film className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">Video Ready!</div>
          <div className="text-[10px] text-white/35">Mont Kiara Condo · 1:32</div>
        </div>
      </motion.div>

      {/* Floating badge: AI generating */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 2.0, duration: 0.5, ease }}
        className="absolute -left-3 md:-left-8 bottom-24 px-4 py-3 rounded-2xl border border-white/[0.08] hidden sm:flex items-center gap-3"
        style={{
          background: "rgba(13,13,20,0.95)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(74,108,247,0.15)",
            border: "1px solid rgba(74,108,247,0.25)",
          }}
        >
          <Wand2 className="w-4 h-4 text-brand-primary" />
        </div>
        <div>
          <div className="text-xs font-semibold text-white">AI Generating</div>
          <div className="text-[10px] text-white/35">Bangsar Semi-D · 68%</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background grid */}
      <div className="studio-grid absolute inset-0 opacity-50" />

      {/* Top glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(74,108,247,0.6) 0%, transparent 65%)",
        }}
      />

      {/* Orbs */}
      <div
        className="absolute top-24 left-[15%] w-72 h-72 rounded-full pointer-events-none opacity-20 animate-orb"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute top-40 right-[15%] w-56 h-56 rounded-full pointer-events-none opacity-20 animate-orb-delay"
        style={{
          background:
            "radial-gradient(circle, rgba(74,108,247,0.6) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex justify-center mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/60 border"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>AI-Powered Property Video Generation</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(74,108,247,0.2)",
                color: "#4A6CF7",
              }}
            >
              New
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold tracking-[-0.02em] leading-[1.06] mb-6"
        >
          Turn Listings Into
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 45%, #FFC107 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cinematic Videos
          </span>
          <br />
          In Minutes.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="text-center text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          PropGo Studio uses AI to transform your property photos, floor plans,
          and details into professional marketing videos — complete with script,
          voiceover, and your branding.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/auth/signup"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
              boxShadow:
                "0 0 40px rgba(74,108,247,0.45), 0 0 80px rgba(74,108,247,0.15)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            Start Free — 3 Videos
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/65 hover:text-white border border-white/[0.08] hover:border-white/[0.18] bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            See How It Works
          </a>
        </motion.div>

        {/* App mockup */}
        <AppMockup />

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-white/25"
        >
          {[
            { icon: Shield, label: "No credit card required" },
            { icon: Zap, label: "Generate in under 2 minutes" },
            { icon: Globe, label: "Share anywhere instantly" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-white/15" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── LOGO STRIP ──────────────────────────────────────────────────────────────

function LogoStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const agencies = [
    "IQI Global",
    "Hartamas",
    "CBRE WTW",
    "Rahim & Co",
    "PropNex",
    "ERA Malaysia",
    "Knight Frank",
    "Savills",
  ];

  return (
    <section
      ref={ref}
      className="py-12 border-y"
      style={{
        background: "#0D0D14",
        borderColor: "rgba(255,255,255,0.04)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-[11px] text-white/20 uppercase tracking-[0.15em] mb-8 font-semibold"
        >
          Trusted by leading Malaysian property agencies
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {agencies.map((agency, i) => (
            <motion.span
              key={agency}
              initial={{ opacity: 0, y: 8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="text-sm md:text-base font-semibold text-white/18 hover:text-white/45 transition-colors cursor-default select-none"
            >
              {agency}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    icon: Building2,
    title: "Import Your Listing",
    description:
      "Select your property from PropGo listings or upload photos, floor plans, and details directly.",
    color: "#4A6CF7",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Does the Magic",
    description:
      "Our AI writes a cinematic script, generates a professional voiceover, and assembles your scenes automatically.",
    color: "#8B5CF6",
  },
  {
    number: "03",
    icon: Share2,
    title: "Publish & Share",
    description:
      "Download your branded video or share directly to social media, WhatsApp, property portals, and your website.",
    color: "#FFC107",
  },
];

function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={stagger()}
          className="text-center mb-20"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold text-brand-primary uppercase tracking-[0.18em] mb-4"
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-bold tracking-[-0.02em] mb-5"
          >
            From listing to video
            <br />
            in 3 simple steps
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/40 text-lg max-w-lg mx-auto leading-relaxed"
          >
            No video editing experience required. Just import, generate, and
            share.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector */}
          <div
            className="hidden md:block absolute top-10 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(74,108,247,0.0), rgba(74,108,247,0.35) 20%, rgba(139,92,246,0.35) 80%, rgba(139,92,246,0.0))",
            }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 36 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.16, ease }}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon circle */}
              <div className="relative mb-8">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `${step.color}18`,
                    border: `1px solid ${step.color}28`,
                  }}
                >
                  <step.icon
                    className="w-8 h-8"
                    style={{ color: step.color }}
                  />
                </div>
                <div
                  className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                  style={{ background: step.color }}
                >
                  {step.number}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-white/40 leading-relaxed text-sm md:text-base max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Film,
    title: "Cinematic AI Video",
    description:
      "Professional Ken Burns effects, smooth scene transitions, and cinematic pacing — all generated automatically.",
    color: "#4A6CF7",
  },
  {
    icon: Mic,
    title: "AI Voiceover",
    description:
      "Natural-sounding AI voices in English and Bahasa Malaysia, synchronized perfectly with your property highlights.",
    color: "#8B5CF6",
  },
  {
    icon: Palette,
    title: "Brand Kit Integration",
    description:
      "Your logo, brand colors, and contact info are automatically embedded into every video you generate.",
    color: "#EC4899",
  },
  {
    icon: Zap,
    title: "2-Minute Generation",
    description:
      "Go from property photos to a ready-to-share marketing video in under 2 minutes. No waiting.",
    color: "#FFC107",
  },
  {
    icon: Globe,
    title: "Multi-Platform Export",
    description:
      "Export formats optimized for Facebook, Instagram, TikTok, YouTube, and property portals like PropertyGuru.",
    color: "#22C55E",
  },
  {
    icon: BarChart3,
    title: "Video Analytics",
    description:
      "Track views, shares, and engagement. Know which property videos attract the most serious buyers.",
    color: "#06B6D4",
  },
];

function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-24 md:py-36"
      style={{ background: "#0D0D14" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={stagger()}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold text-brand-primary uppercase tracking-[0.18em] mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-bold tracking-[-0.02em] mb-5"
          >
            Everything you need to
            <br />
            sell properties faster
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            Built specifically for Malaysian property agents and agencies.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.09, ease }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative group p-7 rounded-2xl border border-white/[0.06] hover:border-white/[0.11] transition-colors cursor-pointer overflow-hidden"
              style={{ background: "#13131A" }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${feature.color}12 0%, transparent 65%)`,
                }}
              />

              <div
                className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: `${feature.color}14`,
                  border: `1px solid ${feature.color}22`,
                }}
              >
                <feature.icon
                  className="w-5 h-5"
                  style={{ color: feature.color }}
                />
              </div>
              <h3 className="relative text-base font-bold text-white mb-2.5">
                {feature.title}
              </h3>
              <p className="relative text-sm text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─── STATS ───────────────────────────────────────────────────────────────────

const statItems = [
  {
    value: 500,
    suffix: "+",
    label: "Videos Generated",
    sub: "and growing daily",
    isDecimal: false,
  },
  {
    value: 150,
    suffix: "+",
    label: "Active Agents",
    sub: "across Malaysia",
    isDecimal: false,
  },
  {
    value: 2,
    suffix: " min",
    label: "Avg Generation Time",
    sub: "from upload to share",
    isDecimal: false,
  },
  {
    value: 4.9,
    suffix: "/5",
    label: "Agent Rating",
    sub: "based on user reviews",
    isDecimal: true,
  },
];

function AnimatedStat({
  value,
  suffix,
  label,
  sub,
  isDecimal,
  delay,
}: (typeof statItems)[0] & { delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const start = Date.now();
    const duration = 1600;
    const end = value;

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * end);
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
      className="text-center px-4"
    >
      <div
        className="text-4xl md:text-5xl font-black mb-2.5 tabular-nums"
        style={{
          background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {isDecimal
          ? displayed.toFixed(1)
          : Math.round(displayed).toLocaleString()}
        {suffix}
      </div>
      <div className="text-white font-semibold mb-1">{label}</div>
      <div className="text-sm text-white/30">{sub}</div>
    </motion.div>
  );
}

function Stats() {
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div
          className="rounded-3xl p-10 md:p-14 border border-white/[0.06]"
          style={{ background: "#13131A" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 divide-white/[0.04] md:divide-x">
            {statItems.map((stat, i) => (
              <AnimatedStat key={stat.label} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "RM 0",
    period: "forever",
    credits: 3,
    features: [
      "3 video credits/month",
      "5 active listings",
      "HD video export",
      "Basic brand kit",
      "Email support",
    ],
    cta: "Start Free",
    href: "/auth/signup",
    popular: false,
    color: "#4A6CF7",
  },
  {
    name: "Starter",
    price: "RM 49",
    period: "per month",
    credits: 20,
    features: [
      "20 video credits/month",
      "15 active listings",
      "Full HD export",
      "Complete brand kit",
      "Priority support",
      "Analytics dashboard",
    ],
    cta: "Get Starter",
    href: "/auth/signup?plan=starter",
    popular: false,
    color: "#4A6CF7",
  },
  {
    name: "Pro",
    price: "RM 99",
    period: "per month",
    credits: 50,
    features: [
      "50 video credits/month",
      "50 active listings",
      "4K video export",
      "Advanced brand kit",
      "Priority support",
      "Analytics + insights",
      "Custom watermark",
    ],
    cta: "Go Pro",
    href: "/auth/signup?plan=pro",
    popular: true,
    color: "#8B5CF6",
  },
  {
    name: "Agency",
    price: "RM 199",
    period: "per month",
    credits: 150,
    features: [
      "150 video credits/month",
      "200 active listings",
      "4K + batch export",
      "White-label branding",
      "Dedicated support",
      "Team collaboration",
      "API access",
    ],
    cta: "Contact Sales",
    href: "/auth/signup?plan=agency",
    popular: false,
    color: "#22C55E",
  },
];

function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="pricing"
      ref={ref}
      className="py-24 md:py-36 relative"
      style={{ background: "#0D0D14" }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none opacity-12"
        style={{
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.6) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <motion.div
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          variants={stagger()}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold text-brand-primary uppercase tracking-[0.18em] mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-5xl font-bold tracking-[-0.02em] mb-5"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            Start free. Scale as your business grows. No hidden fees.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease }}
              className={`relative flex flex-col rounded-2xl border transition-all ${
                plan.popular
                  ? "border-purple-500/35 scale-[1.03] shadow-2xl"
                  : "border-white/[0.06] hover:border-white/[0.11]"
              }`}
              style={{
                background: plan.popular
                  ? "linear-gradient(180deg, #1C1C30 0%, #13131A 100%)"
                  : "#13131A",
                boxShadow: plan.popular
                  ? "0 0 50px rgba(139,92,246,0.2), inset 0 0 50px rgba(139,92,246,0.03)"
                  : undefined,
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white z-10 whitespace-nowrap"
                  style={{
                    background:
                      "linear-gradient(135deg, #8B5CF6, #4A6CF7)",
                  }}
                >
                  Most Popular
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Plan name + price */}
                <div className="mb-6">
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-white/30">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Credits badge */}
                <div
                  className="flex items-center gap-2 mb-6 p-3 rounded-xl"
                  style={{
                    background: `${plan.color}10`,
                    border: `1px solid ${plan.color}1E`,
                  }}
                >
                  <Zap
                    className="w-4 h-4 shrink-0"
                    style={{ color: plan.color }}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: plan.color }}
                  >
                    {plan.credits} credits/month
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-sm text-white/50"
                    >
                      <Check
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color: plan.color }}
                      />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    plan.popular
                      ? "text-white"
                      : "text-white/70 hover:text-white border border-white/[0.09] hover:border-white/[0.18] hover:bg-white/[0.04]"
                  }`}
                  style={
                    plan.popular
                      ? {
                          background:
                            "linear-gradient(135deg, #8B5CF6, #4A6CF7)",
                          boxShadow: "0 0 24px rgba(139,92,246,0.35)",
                        }
                      : {}
                  }
                >
                  {plan.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


function CtaBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-16 md:py-24 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease }}
        className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden"
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #3D5BF5 0%, #7C3AED 50%, #4A6CF7 100%)",
          }}
        />
        {/* Texture overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 20%, rgba(255,193,7,0.18) 0%, transparent 40%)",
          }}
        />
        <div className="studio-grid absolute inset-0 opacity-20" />

        <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-sm font-semibold text-white"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <Sparkles className="w-4 h-4" />
            Start for free today
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="text-3xl md:text-5xl font-black text-white mb-5 tracking-[-0.02em]"
          >
            Ready to create your
            <br />
            first property video?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Join 150+ agents creating cinematic property videos in minutes.
            Start with 3 free videos — no credit card needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-black text-brand-primary bg-white hover:bg-white/90 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xl"
            >
              <Sparkles className="w-4 h-4" />
              Start Free — 3 Videos
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all cursor-pointer"
            >
              Already have an account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();

  const linkGroups = {
    Product: ["Features", "Pricing", "Changelog", "Roadmap"],
    Company: ["About Us", "Blog", "Careers", "Contact"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer
      className="border-t py-16"
      style={{ background: "#0A0A0F", borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12 mb-12">
          {/* Brand col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <Image
                src="/propgo-logo.png"
                alt="PropGo"
                width={88}
                height={30}
                className="h-7 w-auto object-contain"
                style={{ mixBlendMode: "lighten" }}
              />
              <span
                className="font-bold text-sm tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #4A6CF7, #8B5CF6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                  Studio
                </span>
            </div>
            <p className="text-sm text-white/28 leading-relaxed max-w-xs">
              AI-powered property video generation for Malaysian real estate
              professionals. Turn listings into cinematic videos in minutes.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {[Globe, Clock, Shield].map((Icon, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.07] hover:border-white/[0.14] transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <Icon className="w-3.5 h-3.5 text-white/30" />
                </div>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(linkGroups).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.14em] mb-5">
                {group}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-white/28 hover:text-white/65 transition-colors cursor-pointer"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <p className="text-xs text-white/18">
            © {year} PropGo Studio. All rights reserved.
          </p>
          <p className="text-xs text-white/18">
            Built with AI for Malaysian property professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function LandingPage({
  landingAuth = null,
}: {
  landingAuth?: LandingAuth | null;
}) {
  return (
    <div className="min-h-screen bg-studio-bg text-white overflow-x-hidden">
      <Nav landingAuth={landingAuth} />
      <Hero />
      <LogoStrip />
      <HowItWorks />
      <Features />
      <Stats />
      <Pricing />
      <CtaBanner />
      <Footer />
    </div>
  );
}
