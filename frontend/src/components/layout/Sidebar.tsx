"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Target, Sparkles,
  CreditCard, LogOut, X, Crown, Settings,
} from "lucide-react";
import { cn, getAvatarStyle } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

const navItems = [
  { href: "/dashboard",                label: "Dashboard",      icon: LayoutDashboard },
  { href: "/dashboard/resume-builder", label: "Resume Builder", icon: FileText },
  { href: "/dashboard/ats-checker",    label: "ATS Checker",    icon: Target },
  { href: "/dashboard/ai-suggestions", label: "AI Suggestions", icon: Sparkles },
  { href: "/dashboard/billing",        label: "Billing",        icon: CreditCard },
  { href: "/dashboard/settings",       label: "Settings",       icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const isPro = user?.plan === "pro";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 z-30 flex flex-col",
        "bg-slate-900 border-r border-white/5",
        "transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5 shrink-0">
          <Logo size={28} />
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-violet-500/15 text-violet-300 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-violet-400" : "text-slate-500")} />
                {label}
                {label === "AI Suggestions" && !isPro && (
                  <span className="ml-auto text-[10px] font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 px-1.5 py-0.5 rounded-full">
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Plan upgrade nudge */}
        {!isPro && (
          <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Unlock AI features & unlimited resumes.</p>
            <Link href="/dashboard/billing" className="btn-primary w-full justify-center text-xs py-2">
              Upgrade →
            </Link>
          </div>
        )}

        {/* User */}
        <div className="border-t border-white/5 p-4 shrink-0">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
                style={getAvatarStyle(user.avatar)}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs", isPro ? "text-violet-400" : "text-slate-500")}>
                    {isPro ? "Pro" : "Free"} plan
                  </span>
                  {isPro && <Crown className="w-3 h-3 text-violet-400" />}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
