"use client";

import Link from "next/link";
import { FileText, Target, Sparkles, ArrowRight, PlusCircle, Crown, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const quickActions = [
  {
    href: "/dashboard/resume-builder",
    icon: FileText,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Resume Builder",
    desc: "Create or edit your resume with our guided builder.",
    cta: "Open Builder",
    ctaColor: "text-violet-600 hover:text-violet-700",
  },
  {
    href: "/dashboard/ats-checker",
    icon: Target,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    title: "ATS Checker",
    desc: "Paste a job description and check your match score.",
    cta: "Check Score",
    ctaColor: "text-indigo-600 hover:text-indigo-700",
  },
  {
    href: "/dashboard/ai-suggestions",
    icon: Sparkles,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    title: "AI Suggestions",
    desc: "GPT-4 powered rewrites for your bullet points.",
    cta: "Improve Resume",
    ctaColor: "text-pink-600 hover:text-pink-700",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isPro = user?.plan === "pro";
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Good to see you, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isPro
              ? "You're on Pro — all features unlocked."
              : "You're on the Free plan. "}
            {!isPro && (
              <Link href="/dashboard/billing" className="text-violet-600 hover:underline font-medium">
                Upgrade for AI features →
              </Link>
            )}
          </p>
        </div>
        {isPro && (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold shadow-sm">
            <Crown className="w-3.5 h-3.5" /> Pro Plan
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-slate-900">{user?.resumeCount ?? 0}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPro ? "Resumes · unlimited" : `Resume${user?.resumeCount === 1 ? "" : "s"} · 1 max`}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-slate-900 capitalize">{user?.plan}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPro && user?.planExpiresAt
                ? `Expires ${new Date(user.planExpiresAt).toLocaleDateString()}`
                : "Current plan"}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-slate-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Member since</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-4 font-display">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <div key={a.href} className="card group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-11 h-11 rounded-2xl ${a.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <a.icon className={`w-5 h-5 ${a.iconColor}`} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 font-display">{a.title}</h3>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">{a.desc}</p>
              <Link href={a.href} className={`inline-flex items-center gap-1.5 text-sm font-semibold ${a.ctaColor} transition-colors`}>
                {a.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state CTA */}
      {user?.resumeCount === 0 && (
        <div className="card border-dashed border-2 border-violet-200 bg-violet-50/50 text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-7 h-7 text-violet-600" />
          </div>
          <h3 className="font-semibold text-slate-900 font-display mb-1">Build your first resume</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
            Takes less than 10 minutes. AI will help you improve it once you&apos;re done.
          </p>
          <Link href="/dashboard/resume-builder" className="btn-primary mx-auto">
            <PlusCircle className="w-4 h-4" /> Create Resume
          </Link>
        </div>
      )}

      {/* Pro upgrade card */}
      {!isPro && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 flex items-center justify-between gap-6 shadow-lg shadow-violet-500/20">
          <div>
            <p className="font-bold text-white font-display text-lg">Unlock the full power of AI</p>
            <p className="text-violet-200 text-sm mt-1">
              Get GPT-4 rewrites, unlimited resumes, and deep ATS analysis.
            </p>
          </div>
          <Link href="/dashboard/billing" className="btn-dark shrink-0 whitespace-nowrap">
            <Crown className="w-4 h-4" /> Upgrade to Pro
          </Link>
        </div>
      )}
    </div>
  );
}
