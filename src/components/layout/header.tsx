"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clapperboard,
  Zap,
  Palette,
  Plus,
} from "lucide-react";

import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Projects", href: "/projects", icon: Clapperboard },
  { label: "Brand Kit", href: "/brand-kit", icon: Palette },
  { label: "Credits", href: "/credits", icon: Zap },
];

interface HeaderProps {
  userEmail?: string;
  userName?: string;
  plan?: string;
  credits?: number;
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
          href="/"
          className="flex items-center gap-2.5 shrink-0 mr-3 md:mr-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="shrink-0"
          >
            <Image
              src="/propgo-logo.png"
              alt="PropGo"
              width={80}
              height={28}
              className="h-7 w-auto object-contain"
              style={{ mixBlendMode: "lighten" }}
              priority
            />
          </motion.div>
          <span
            className="hidden sm:block font-bold text-sm tracking-tight"
            style={{
              background: "linear-gradient(90deg, #4A6CF7, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Studio
          </span>
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
