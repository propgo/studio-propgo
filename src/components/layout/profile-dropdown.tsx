"use client";

import Link from "next/link";
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
  CreditCard,
} from "lucide-react";

const planGradient: Record<string, string> = {
  free: "text-white/40",
  starter: "text-brand-primary",
  pro: "text-brand-accent",
  agency: "text-brand-success",
};

interface ProfileDropdownProps {
  displayName: string;
  plan?: string;
  credits?: number;
  initial: string;
}

export function ProfileDropdown({
  displayName,
  plan = "free",
  credits = 0,
  initial,
}: ProfileDropdownProps) {
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-2 p-1 rounded-xl hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/45"
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
            role="menu"
            className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-white/[0.08] bg-[#13131A]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
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
                      planGradient[plan] ?? planGradient.free
                    )}
                  >
                    {plan === "free" ? "Free Plan" : `${plan} Plan`}
                  </p>
                </div>
              </div>
            </div>

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
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((credits / 50) * 100, 100)}%`,
                    background: "linear-gradient(90deg, #4A6CF7, #8B5CF6)",
                  }}
                />
              </div>
            </div>

            {plan === "free" && (
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <Link
                  href="/credits"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer"
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
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="py-1 border-t border-white/[0.06]">
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex cursor-pointer items-center gap-3 w-full px-4 py-2.5 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors"
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
