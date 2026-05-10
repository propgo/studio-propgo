"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/actions";
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Zap,
  Palette,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: Clapperboard,
  },
  {
    label: "Credits",
    href: "/dashboard/credits",
    icon: Zap,
  },
  {
    label: "Brand Kit",
    href: "/dashboard/brand-kit",
    icon: Palette,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  userEmail?: string;
  userName?: string;
  plan?: string;
  credits?: number;
}

export function Sidebar({
  userEmail,
  userName,
  plan = "free",
  credits = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const planLabel: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    agency: "Agency",
  };

  const planColor: Record<string, string> = {
    free: "text-white/30 bg-white/5",
    starter: "text-brand-primary bg-brand-primary/10",
    pro: "text-brand-accent bg-brand-accent/10",
    agency: "text-brand-success bg-brand-success/10",
  };

  return (
    <aside className="w-60 min-h-screen bg-studio-surface border-r border-studio-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-studio-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0 group-hover:bg-brand-primary/90 transition-colors">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            PropGo Studio
          </span>
        </Link>
      </div>

      {/* Credits pill */}
      <div className="px-4 py-3 border-b border-studio-border">
        <Link
          href="/dashboard/credits"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-studio-bg border border-studio-border hover:border-brand-primary/30 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-xs text-white/60">Credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white">{credits}</span>
            <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-brand-primary/15 text-brand-primary font-medium"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-brand-primary" : "text-current"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-studio-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-studio-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-white/60">
              {(userName ?? userEmail ?? "U").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">
              {userName ?? userEmail ?? "User"}
            </p>
            <span
              className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                planColor[plan] ?? planColor["free"]
              )}
            >
              {planLabel[plan] ?? "Free"}
            </span>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
