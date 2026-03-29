"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, Sparkles, Zap, Shield, Loader2,
  ArrowLeft, Crown, X, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { cn } from "@/lib/utils";
import { PlanId } from "@/types";
import { Logo } from "@/components/Logo";

type BillingCycle = "monthly" | "annual";

const FREE_FEATURES = [
  "1 resume",
  "Basic ATS score check",
  "PDF export",
  "All resume templates",
  "Resume builder (all sections)",
];

const PRO_FEATURES = [
  "Unlimited resumes",
  "Advanced ATS analysis",
  "AI bullet point rewriter",
  "AI professional summary generator",
  "AI skills advisor",
  "Keyword gap analysis",
  "Priority support",
];

const FREE_MISSING = [
  "AI rewrites",
  "Skills advisor",
  "Keyword gap analysis",
];

const MONTHLY_PRICE = 499;
const ANNUAL_PRICE  = 333;
const ANNUAL_SAVING = Math.round(((MONTHLY_PRICE - ANNUAL_PRICE) / MONTHLY_PRICE) * 100);

const FAQ = [
  {
    q: "Can I try Pro before paying?",
    a: "The free plan includes the resume builder, ATS checker, and PDF export. AI features are Pro-only. You can see the AI suggestions UI but will be prompted to upgrade.",
  },
  {
    q: "What payment methods are accepted?",
    a: "All major credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and wallets via Razorpay.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes. Your Pro access continues until the end of your billing period. Contact support to cancel renewal.",
  },
  {
    q: "Is my payment information safe?",
    a: "Yes. Payments are processed by Razorpay (PCI-DSS compliant). We never store your card details.",
  },
  {
    q: "What happens when my Pro plan expires?",
    a: "Your account switches back to Free. Your resumes are preserved, but AI features are disabled until you renew.",
  },
];

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const { initiatePayment, isLoading } = usePayment();
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const planId: PlanId = billing === "annual" ? "pro_annual" : "pro_monthly";
  const isPro = user?.plan === "pro";

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      window.location.href = "/auth/signup";
      return;
    }
    await initiatePayment(planId);
  };

  return (
    <div className="min-h-screen bg-mesh text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-2xl bg-black/25">
        <div className="page-container h-16 flex items-center justify-between">
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          </Link>
          <Logo size={28} />
          <div className="w-32" /> {/* spacer to keep logo centred */}
        </div>
      </header>

      <main className="page-container py-20">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-14 relative">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              No hidden fees · Cancel anytime
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold font-display tracking-tight mb-4 leading-[1.05]">
              Simple,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                transparent
              </span>{" "}
              pricing
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Start free. Upgrade when you need the full power of AI.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center mt-10 bg-white/8 border border-white/10 p-1 rounded-xl gap-1">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                  billing === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  billing === "annual"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                Annual
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Save {ANNUAL_SAVING}%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Pricing cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">

          {/* Free card */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Free</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-6xl font-extrabold font-display text-white">₹0</span>
              </div>
              <p className="text-slate-500 text-sm">Forever free. No credit card needed.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  {f}
                </li>
              ))}
              {FREE_MISSING.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-600 line-through">
                  <X className="w-4 h-4 text-slate-700 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {isAuthenticated ? (
                <div className="w-full text-center py-3 rounded-xl border border-white/10 text-slate-500 text-sm font-semibold cursor-default">
                  {isPro ? "Your previous plan" : "✓ Current plan"}
                </div>
              ) : (
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/8 transition-colors"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </div>

          {/* Pro card */}
          <div className="flex flex-col rounded-2xl border-2 border-violet-500/70 bg-gradient-to-b from-violet-600/15 via-violet-600/8 to-transparent relative overflow-hidden p-8">
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-violet-600/5 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-5 py-1.5 rounded-bl-xl flex items-center gap-1.5">
              <Crown className="w-3 h-3" /> Most Popular
            </div>

            <div className="relative mb-8">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Pro</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-6xl font-extrabold font-display text-white">
                  ₹{billing === "annual" ? ANNUAL_PRICE : MONTHLY_PRICE}
                </span>
                <span className="text-slate-400 mb-2 text-lg">/mo</span>
              </div>
              {billing === "annual" ? (
                <p className="text-slate-400 text-sm">
                  Billed ₹3,999/year{" "}
                  <span className="text-emerald-400 font-semibold">
                    · save ₹{(MONTHLY_PRICE * 12 - 3999).toLocaleString("en-IN")}
                  </span>
                </p>
              ) : (
                <p className="text-slate-400 text-sm">Billed monthly. Cancel anytime.</p>
              )}
            </div>

            <ul className="relative space-y-3 flex-1 mb-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="relative mt-8">
              {isPro ? (
                <div className="w-full text-center py-3 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-200 text-sm font-semibold cursor-default flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" /> Pro Plan Active
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-base hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Upgrade to Pro <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Trust badges ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4 text-emerald-500" /> Secure payment via Razorpay
          </span>
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <Zap className="w-4 h-4 text-amber-400" /> Instant activation
          </span>
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-violet-400" /> Cancel anytime
          </span>
        </div>

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl font-bold font-display text-center mb-10">
            Free vs <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Pro</span>
          </h2>

          <div className="rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-white/5 border-b border-white/10">
              <div className="p-4 text-sm font-semibold text-slate-400">Feature</div>
              <div className="p-4 text-sm font-semibold text-slate-400 text-center">Free</div>
              <div className="p-4 text-sm font-semibold text-violet-400 text-center flex items-center justify-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Pro
              </div>
            </div>

            {[
              ["Resumes",                "1",           "Unlimited"],
              ["ATS Score Check",        "Basic",       "Advanced"],
              ["AI Bullet Rewrites",     false,         true],
              ["AI Summary Generator",   false,         true],
              ["AI Skills Advisor",      false,         true],
              ["Keyword Gap Analysis",   false,         true],
              ["PDF Export",             true,          true],
              ["All Templates",          true,          true],
              ["Priority Support",       false,         true],
            ].map(([feature, free, pro], i) => (
              <div
                key={String(feature)}
                className={cn(
                  "grid grid-cols-3 border-b border-white/5 last:border-0",
                  i % 2 === 0 ? "bg-white/2" : ""
                )}
              >
                <div className="p-4 text-sm text-slate-300">{feature}</div>
                <div className="p-4 flex items-center justify-center">
                  {typeof free === "boolean" ? (
                    free
                      ? <CheckCircle2 className="w-4 h-4 text-slate-500" />
                      : <X className="w-4 h-4 text-slate-700" />
                  ) : (
                    <span className="text-sm text-slate-400">{free}</span>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center">
                  {typeof pro === "boolean" ? (
                    pro
                      ? <CheckCircle2 className="w-4 h-4 text-violet-400" />
                      : <X className="w-4 h-4 text-slate-700" />
                  ) : (
                    <span className="text-sm text-violet-300 font-medium">{pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto mt-24">
          <h2 className="text-3xl font-bold font-display text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto mt-24">
          <div className="relative rounded-3xl border border-violet-500/30 overflow-hidden p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-purple-600/15" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-500/20 blur-3xl" />
            <div className="relative">
              <h3 className="text-3xl font-bold font-display mb-3">Ready to get hired?</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Join 10,000+ job seekers who upgraded their resumes with Resumiq.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
                >
                  Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/15 text-white font-semibold hover:bg-white/8 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-8 mt-12">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={24} />
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} Resumiq. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="w-full text-left rounded-2xl border border-white/8 bg-white/4 p-5 hover:bg-white/6 transition-colors"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium text-white">{q}</p>
        <span className={cn(
          "text-slate-500 transition-transform duration-200 shrink-0 text-xs",
          open && "rotate-180"
        )}>▼</span>
      </div>
      {open && (
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">{a}</p>
      )}
    </button>
  );
}
