"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Clapperboard, Zap, Palette, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Projects", href: "/projects", icon: Clapperboard },
  { label: "Brand Kit", href: "/brand-kit", icon: Palette },
  { label: "Credits", href: "/credits", icon: Zap },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="absolute inset-0 border-t border-white/[0.06]"
        style={{ background: "rgba(13,13,26,0.88)", backdropFilter: "blur(24px)" }} />

      <div className="relative flex items-center px-1 pt-1 pb-2">
        {/* Left nav items */}
        {navItems.slice(0, 1).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 min-w-0 select-none">
              <div className="relative flex items-center justify-center w-12 h-10">
                {isActive && (
                  <motion.div layoutId="mobile-active-bg"
                    className="absolute inset-0 rounded-xl bg-brand-primary/15"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
                )}
                <motion.div whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="relative z-10">
                  <item.icon className={cn("w-[22px] h-[22px] transition-colors duration-150",
                    isActive ? "text-brand-primary" : "text-white/35")} />
                </motion.div>
              </div>
              <span className={cn("text-[10px] font-medium leading-none transition-colors duration-150",
                isActive ? "text-brand-primary" : "text-white/30")}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center CTA — New Project (Higgsfield-style prominent button) */}
        <div className="flex-1 flex justify-center py-1">
          <Link
            href="/projects/new"
            className="flex items-center justify-center w-14 h-10 rounded-2xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)",
              boxShadow: "0 0 20px rgba(74,108,247,0.5)",
            }}
          >
            <Plus className="w-6 h-6 text-white" />
          </Link>
        </div>

        {/* Right nav items */}
        {navItems.slice(1).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-1.5 min-w-0 select-none">
              <div className="relative flex items-center justify-center w-12 h-10">
                {isActive && (
                  <motion.div layoutId="mobile-active-bg"
                    className="absolute inset-0 rounded-xl bg-brand-primary/15"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />
                )}
                <motion.div whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="relative z-10">
                  <item.icon className={cn("w-[22px] h-[22px] transition-colors duration-150",
                    isActive ? "text-brand-primary" : "text-white/35")} />
                </motion.div>
              </div>
              <span className={cn("text-[10px] font-medium leading-none transition-colors duration-150",
                isActive ? "text-brand-primary" : "text-white/30")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
