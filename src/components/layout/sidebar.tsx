"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/actions";
import {
  LayoutDashboard,
  Clapperboard,
  Zap,
  Palette,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: Clapperboard },
  { label: "Credits", href: "/dashboard/credits", icon: Zap },
  { label: "Brand Kit", href: "/dashboard/brand-kit", icon: Palette },
];

const navContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const navItemVariant = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, bounce: 0.25, duration: 0.55 },
  },
};

interface SidebarProps {
  userEmail?: string;
  userName?: string;
  plan?: string;
  credits?: number;
}

const planLabel: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

const planGradient: Record<string, string> = {
  free: "from-white/20 to-white/10 text-white/40",
  starter: "from-brand-primary/30 to-brand-primary/10 text-brand-primary",
  pro: "from-brand-accent/30 to-brand-accent/10 text-brand-accent",
  agency: "from-brand-success/30 to-brand-success/10 text-brand-success",
};

export function Sidebar({
  userEmail,
  userName,
  plan = "free",
  credits = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const displayName = userName ?? userEmail ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-60 min-h-screen flex flex-col relative">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-[#13131A]/80 backdrop-blur-xl border-r border-white/[0.06]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <motion.div
          className="px-5 py-5 border-b border-white/[0.06]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* Gradient logo mark */}
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                boxShadow: "0 0 20px rgba(74, 108, 247, 0.4)",
              }}
              whileHover={{ scale: 1.08, rotate: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <Sparkles className="w-4 h-4 text-white relative z-10" />
            </motion.div>

            <div>
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
                {" "}
                Studio
              </span>
            </div>
          </Link>
        </motion.div>

        {/* ── Credits pill ──────────────────────────────────────────────── */}
        <motion.div
          className="px-4 py-3 border-b border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link
            href="/dashboard/credits"
            className="group flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-brand-primary/30 transition-all"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
                className="w-5 h-5 rounded-lg bg-brand-accent/15 flex items-center justify-center"
              >
                <Zap className="w-3 h-3 text-brand-accent" />
              </motion.div>
              <span className="text-xs text-white/50">Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tabular-nums">
                {credits}
              </span>
              <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
          </Link>
        </motion.div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <motion.nav
          className="flex-1 px-3 py-4 space-y-0.5"
          variants={navContainer}
          initial="hidden"
          animate="show"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <motion.div key={item.href} variants={navItemVariant}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150",
                    isActive
                      ? "text-white font-medium"
                      : "text-white/35 hover:text-white/75 hover:bg-white/[0.04]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(74,108,247,0.18) 0%, rgba(139,92,246,0.10) 100%)",
                        border: "1px solid rgba(74,108,247,0.2)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}
                  {/* Icon with glow when active */}
                  <div
                    className={cn(
                      "relative z-10 w-5 h-5 flex items-center justify-center shrink-0 transition-all",
                      isActive && "drop-shadow-[0_0_6px_rgba(74,108,247,0.7)]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-brand-primary" : "text-current"
                      )}
                    />
                  </div>
                  <span className="relative z-10">{item.label}</span>

                  {/* Active accent line on left */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-line"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{
                        background:
                          "linear-gradient(180deg, #4A6CF7, #8B5CF6)",
                        boxShadow: "0 0 8px rgba(74,108,247,0.6)",
                      }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* ── User section ─────────────────────────────────────────────── */}
        <motion.div
          className="px-4 py-4 border-t border-white/[0.06]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar with gradient ring */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
                boxShadow: "0 0 0 2px rgba(74,108,247,0.2)",
              }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">
                {displayName}
              </p>
              <div
                className={cn(
                  "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 bg-gradient-to-r",
                  planGradient[plan] ?? planGradient["free"]
                )}
              >
                {planLabel[plan] ?? "Free"}
              </div>
            </div>
          </div>

          <form action={signOut}>
            <motion.button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </motion.button>
          </form>
        </motion.div>
      </div>
    </aside>
  );
}
