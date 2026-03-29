"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Crown, Settings, CreditCard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn, getAvatarStyle } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user, logout } = useAuth();
  const isPro = user?.plan === "pro";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="font-semibold text-slate-900 text-lg font-display">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {isPro ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-sm">
            <Crown className="w-3 h-3" /> Pro
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
            Free
          </span>
        )}

        {user && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl hover:bg-slate-50 p-1 pr-2 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                style={getAvatarStyle(user.avatar)}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-1.5 z-50 animate-fade-in">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/billing"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Billing & Plans
                  </Link>
                </div>

                <div className="border-t border-slate-50 py-1">
                  <button
                    onClick={() => { setOpen(false); logout(); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
