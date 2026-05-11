"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/actions";
import {
  Clapperboard,
  Zap,
  Palette,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
  Plus,
} from "lucide-react";

const navItems = [
  { label: "Projects", href: "/projects", icon: Clapperboard },
  { label: "Brand Kit", href: "/brand-kit", icon: Palette },
  { label: "Credits", href: "/credits", icon: Zap },
];

const planGradient: Record<string, string> = {
  free: "text-white/40",
  starter: "text-brand-primary",
  pro: "text-brand-accent",
  agency: "text-brand-success",
};

interface HeaderProps {
  userEmail?: string;
  userName?: string;
  plan?: string;
  credits?: number;
}

function ProfileDropdown({
  displayName,
  plan = "free",
  credits = 0,
  initial,
}: {
  displayName: string;
  plan: string;
  credits: number;
  initial: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.06] transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
            boxShadow: "0 0 0 2px rgba(74,108,247,0.2)",
          }}
        >
          {initial}
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-white/30 transition-transform hidden md:block",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-white/[0.08] bg-[#13131A]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            {/* User info */}
            <div className="px-4 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                  }}
                >
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {displayName}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium capitalize",
                      planGradient[plan] ?? planGradient["free"]
                    )}
                  >
                    {plan === "free" ? "Free Plan" : `${plan} Plan`}
                  </p>
                </div>
              </div>
            </div>

            {/* Credits bar */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <Link
                href="/credits"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <span className="text-xs text-white/40">Credits available</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-brand-accent" />
                  <span className="text-sm font-bold text-white tabular-nums">
                    {credits}
                  </span>
                </div>
              </Link>
              {/* Credit bar */}
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((credits / 50) * 100, 100)}%`,
                    background:
                      "linear-gradient(90deg, #4A6CF7, #8B5CF6)",
                  }}
                />
              </div>
            </div>

            {/* Upgrade CTA if free */}
            {plan === "free" && (
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <Link
                  href="/credits"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                    boxShadow: "0 0 16px rgba(74,108,247,0.25)",
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Go Premium
                  </span>
                  <span className="text-xs font-normal opacity-70">
                    from RM49/mo
                  </span>
                </Link>
              </div>
            )}

            {/* Menu items */}
            <div className="py-1">
              {[
                { label: "My Projects", href: "/projects", icon: Clapperboard },
                { label: "Brand Kit", href: "/brand-kit", icon: Palette },
                { label: "Billing", href: "/credits", icon: CreditCard },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="py-1 border-t border-white/[0.06]">
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign out
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header({
  userEmail,
  userName,
  plan = "free",
  credits = 0,
}: HeaderProps) {
  const pathname = usePathname();
  const displayName = userName ?? userEmail ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center h-14 px-4 md:px-6 gap-3">

        {/* ── Logo ────────────────────────────────────── */}
        <Link
          href="/projects"
          className="flex items-center gap-2.5 shrink-0 mr-3 md:mr-6"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
              boxShadow: "0 0 16px rgba(74,108,247,0.35)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Sparkles className="w-3.5 h-3.5 text-white relative z-10" />
          </motion.div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm tracking-tight text-white">
              PropGo
            </span>
            <span
              className="font-bold text-sm tracking-tight"
              style={{
                background: "linear-gradient(90deg, #4A6CF7, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}Studio
            </span>
          </div>
        </Link>

        {/* ── Center nav (desktop) ─────────────────────── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="header-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(74,108,247,0.15) 0%, rgba(139,92,246,0.08) 100%)",
                      border: "1px solid rgba(74,108,247,0.18)",
                    }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "w-4 h-4 relative z-10",
                    isActive ? "text-brand-primary" : "text-current"
                  )}
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right side ───────────────────────────────── */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* New Project CTA (desktop) */}
          <Link
            href="/projects/new"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
              boxShadow: "0 0 16px rgba(74,108,247,0.3)",
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </Link>

          {/* Credits pill (desktop) */}
          <Link
            href="/credits"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
            >
              <Zap className="w-3.5 h-3.5 text-brand-accent" />
            </motion.div>
            <span className="text-sm font-bold text-white tabular-nums">
              {credits}
            </span>
          </Link>

          {/* Profile dropdown */}
          <ProfileDropdown
            displayName={displayName}
            plan={plan}
            credits={credits}
            initial={initial}
          />
        </div>
      </div>
    </header>
  );
}
