"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Sparkles, Target, Zap, Star,
  FileText, TrendingUp, Shield, Crown, Code2,
  LayoutDashboard, ChevronRight,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const duration = 1600;
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * to));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── ATS Score ring (SVG) ──────────────────────────────────────────────────────
function AtsRing({ score = 94 }: { score?: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
        <circle
          cx="40" cy="40" r={r}
          stroke="url(#ats-grad)"
          strokeWidth="7"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ats-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-white leading-none">{score}%</span>
        <span className="text-[9px] text-emerald-400 font-semibold">ATS</span>
      </div>
    </div>
  );
}

// ── 3D Hero Resume Card ───────────────────────────────────────────────────────
function HeroCard3D() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: ny * -14, y: nx * 14 });
    setMoving(true);
  }, []);

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setMoving(false);
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative flex items-center justify-center"
      style={{ perspective: "1100px" }}
    >
      {/* Glow beneath card */}
      <div className="absolute inset-x-8 bottom-0 h-16 bg-violet-600/30 blur-2xl rounded-full animate-pulse-ring" />

      {/* Orbiting ring */}
      <div className="absolute w-96 h-96 rounded-full border border-violet-500/10 animate-spin-slow pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full border border-indigo-500/8 animate-spin-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "30s" }} />

      {/* The resume card */}
      <div
        className="relative animate-float-card"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: moving ? "transform 0.08s linear" : "transform 0.6s ease",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="w-72 bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)" }}>
          {/* Card top bar */}
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

          <div className="p-5">
            {/* User row */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">RK</div>
              <div>
                <p className="text-sm font-bold text-slate-900">Rahul Kumar</p>
                <p className="text-[11px] text-violet-600 font-semibold">Senior Software Engineer</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Bangalore · rahul@gmail.com</p>
              </div>
            </div>

            {/* Experience */}
            <div className="py-3 border-b border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Experience</p>
              <p className="text-[11px] font-semibold text-slate-700 mb-2">Senior Dev · TechCorp India</p>
              <div className="space-y-1.5">
                {[1, 0.85, 0.7].map((w, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-violet-400 shrink-0" />
                    <div className="h-1.5 rounded-full" style={{ width: `${w * 100}%`, background: i === 1 ? "rgba(139,92,246,0.2)" : "#f1f5f9" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="py-3 border-b border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
              <div className="flex flex-wrap gap-1">
                {["React", "Node.js", "Python", "AWS", "TypeScript", "Docker"].map((s) => (
                  <span key={s} className="px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded text-[9px] font-bold border border-violet-100">{s}</span>
                ))}
              </div>
            </div>

            {/* ATS bar */}
            <div className="pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ATS Match</span>
                <span className="text-[10px] font-bold text-emerald-600">94%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: "94%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Floating badges — transform so they "pop" in 3D */}
        <div className="absolute -top-5 -right-6 animate-float-badge">
          <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
            <TrendingUp className="w-3 h-3" /> ATS: 94 ↑
          </div>
        </div>

        <div className="absolute -bottom-5 -left-6 animate-float-badge-2">
          <div className="flex items-center gap-1.5 bg-violet-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
            <Sparkles className="w-3 h-3" /> AI Rewriting...
          </div>
        </div>

        <div className="absolute top-1/3 -right-10 animate-float-badge-3">
          <div className="flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
            <Zap className="w-3 h-3" /> +12 Keywords
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard product mockup ──────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative" style={{ perspective: "1400px" }}>
      {/* Glow */}
      <div className="absolute -inset-8 bg-violet-600/15 blur-3xl rounded-3xl pointer-events-none" />

      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{ transform: "rotateX(8deg) rotateY(-6deg) rotateZ(1deg)", transformStyle: "preserve-3d" }}
      >
        {/* Browser chrome */}
        <div className="bg-slate-800 h-9 flex items-center px-4 gap-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1 mx-6">
            <div className="bg-slate-700 rounded-md h-5 flex items-center px-3 max-w-xs mx-auto">
              <div className="w-3 h-3 rounded-full border border-slate-500 mr-2 shrink-0" />
              <span className="text-slate-400 text-[10px] truncate">resumiq.io/dashboard</span>
            </div>
          </div>
        </div>

        {/* App UI */}
        <div className="flex h-72 bg-slate-950">
          {/* Sidebar */}
          <div className="w-44 bg-slate-900 border-r border-white/5 p-3 shrink-0">
            <div className="px-1 mb-4 pt-1">
              <LogoMark size={20} />
            </div>
            {[
              { label: "Dashboard", active: true, icon: LayoutDashboard },
              { label: "Resume Builder", active: false, icon: FileText },
              { label: "ATS Checker", active: false, icon: Target },
              { label: "AI Suggestions", active: false, icon: Sparkles },
            ].map(({ label, active, icon: Icon }) => (
              <div key={label} className={`flex items-center gap-2 h-8 rounded-lg px-2.5 mb-1 ${active ? "bg-violet-500/15 text-violet-300" : "text-slate-500"}`}>
                <Icon className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-medium truncate">{label}</span>
              </div>
            ))}
            {/* Pro nudge */}
            <div className="mt-4 p-2.5 rounded-lg bg-violet-600/15 border border-violet-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="w-3 h-3 text-violet-400" />
                <span className="text-[9px] font-bold text-white">Upgrade to Pro</span>
              </div>
              <div className="h-4 bg-violet-600/40 rounded text-[8px] text-white font-bold flex items-center justify-center">Upgrade →</div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 bg-slate-950 overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white font-bold text-sm">Good morning, Rahul 👋</p>
                <p className="text-slate-500 text-[10px]">You&apos;re on the Free plan.</p>
              </div>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">R</div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[["2", "Resumes"], ["82%", "ATS Score"], ["Free", "Plan"]].map(([v, l]) => (
                <div key={l} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                  <p className="text-sm font-bold text-white">{v}</p>
                  <p className="text-[9px] text-slate-500">{l}</p>
                </div>
              ))}
            </div>

            {/* Resume list */}
            <div className="space-y-2">
              {[
                { title: "Software Engineer CV", score: 92, color: "bg-violet-500" },
                { title: "Product Manager Resume", score: 78, color: "bg-indigo-500" },
                { title: "Frontend Dev Resume", score: 85, color: "bg-emerald-500" },
              ].map(({ title, score, color }) => (
                <div key={title} className="bg-white/5 rounded-xl p-2.5 flex items-center gap-2.5 border border-white/5">
                  <div className={`w-6 h-6 rounded-lg ${color}/20 flex items-center justify-center shrink-0`}>
                    <FileText className="w-3 h-3 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-300 truncate">{title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 bg-white/10 rounded-full">
                        <div className={`h-1 ${color} rounded-full`} style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-500 shrink-0">{score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay shimmer line */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Sparkles,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
    title: "GPT-4 AI Rewrites",
    description: "Transform weak bullet points into powerful, quantified achievements that recruiters can't ignore.",
    accent: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
    large: true,
  },
  {
    icon: Target,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/15",
    title: "ATS Score Analysis",
    description: "Instant keyword gap analysis. See exactly what's missing from your resume.",
    accent: "from-indigo-500/10 to-blue-500/5",
    border: "border-indigo-500/20",
    large: false,
  },
  {
    icon: Zap,
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/15",
    title: "One-Click PDF Export",
    description: "Pixel-perfect, professionally formatted PDF in seconds.",
    accent: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
    large: false,
  },
  {
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    title: "Smart Skills Advisor",
    description: "AI identifies skills you're missing for your target role.",
    accent: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    large: false,
  },
  {
    icon: Code2,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
    title: "Resume Builder",
    description: "Guided 6-step builder with live preview across 4 professional templates.",
    accent: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    large: false,
  },
  {
    icon: Shield,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    title: "Secure & Private",
    description: "Your resume data is encrypted. We never share your information.",
    accent: "from-cyan-500/10 to-sky-500/5",
    border: "border-cyan-500/20",
    large: false,
  },
];

const stats = [
  { to: 10000, suffix: "+", label: "Resumes Created" },
  { to: 85, suffix: "%", label: "ATS Pass Rate" },
  { to: 3, suffix: "×", label: "More Interviews" },
  { to: 4.9, suffix: "★", label: "User Rating" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer @ Google",
    text: "Resumiq's AI rewrote my bullet points and I went from 0 callbacks to 5 interviews in a week. Unbelievable.",
    initials: "PS",
    color: "from-violet-500 to-indigo-600",
  },
  {
    name: "Arjun Mehta",
    role: "Product Manager @ Flipkart",
    text: "The ATS checker showed me exactly why I wasn't getting calls. Fixed the keywords and landed my dream job.",
    initials: "AM",
    color: "from-indigo-500 to-blue-600",
  },
  {
    name: "Sneha Patel",
    role: "Data Scientist @ Amazon",
    text: "I was skeptical about AI resume tools but this one genuinely improved my resume. Worth every rupee.",
    initials: "SP",
    color: "from-pink-500 to-rose-600",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mesh text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/8 backdrop-blur-2xl bg-black/25">
        <div className="page-container flex items-center justify-between h-16">
          <Logo size={32} />
          <div className="hidden sm:flex items-center gap-6">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-dark text-sm px-4 py-2">Sign In</Link>
            <Link href="/auth/signup" className="btn-primary text-sm">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background dot grid */}
        <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none" />

        {/* Large glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-700/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-[400px] h-[400px] bg-indigo-600/12 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-48 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="page-container pt-20 pb-28 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by GPT-4o · 10,000+ resumes built
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold font-display leading-[1.05] mb-6 tracking-tight">
                Build resumes that{" "}
                <span className="text-shimmer">actually</span>
                <br />
                get you hired
              </h1>

              <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                ATS-optimized resumes, GPT-4 powered rewrites, and deep keyword
                analysis — all in one platform built for the modern job market.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Link href="/auth/signup" className="btn-primary text-base px-8 py-3.5 shadow-glow w-full sm:w-auto justify-center">
                  Build My Resume Free <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#how-it-works" className="btn-dark text-base px-8 py-3.5 w-full sm:w-auto justify-center">
                  See How It Works
                </a>
              </div>

              {/* Trust avatars */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {["PS", "AM", "SP", "RK", "NK"].map((init, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: `hsl(${250 + i * 20}, 80%, 55%)` }}
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-400">Loved by <span className="text-white font-semibold">10k+ users</span></span>
                </div>
              </div>
            </div>

            {/* Right: 3D card */}
            <div className="flex items-center justify-center">
              <HeroCard3D />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <section className="border-y border-white/8 bg-white/3 backdrop-blur-sm">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold font-display text-gradient mb-1">
                  <AnimatedCounter to={s.to} suffix={s.suffix} />
                </div>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="page-container py-28">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-5">
            Everything to land your{" "}
            <span className="text-gradient">dream job</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            AI-powered tools purpose-built for the modern job market.
          </p>
        </div>

        {/* Bento-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large card — spans 2 cols */}
          <div className={`md:col-span-2 card-3d rounded-2xl border ${features[0].border} bg-gradient-to-br ${features[0].accent} p-7 group relative overflow-hidden`}>
            <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />
            <div className="relative">
              <div className={`w-11 h-11 rounded-2xl ${features[0].iconBg} flex items-center justify-center mb-5 border border-white/10 group-hover:scale-110 transition-transform`}>
                <Sparkles className={`w-5 h-5 ${features[0].iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">{features[0].title}</h3>
              <p className="text-slate-400 leading-relaxed mb-6">{features[0].description}</p>

              {/* Before/after teaser */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-wide mb-1">Before</p>
                  <p className="text-xs text-slate-500 line-through">"Responsible for doing various coding tasks and helping the team"</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shadow-glow">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide mb-1">After AI</p>
                  <p className="text-xs text-slate-200">"Led a team of 8 engineers delivering 3 features <span className="text-emerald-400 font-semibold">40% ahead of schedule</span>, boosting retention by 28%"</p>
                </div>
              </div>
            </div>
          </div>

          {/* ATS score card with ring */}
          <div className={`card-3d rounded-2xl border ${features[1].border} bg-gradient-to-br ${features[1].accent} p-7 group flex flex-col`}>
            <div className={`w-11 h-11 rounded-2xl ${features[1].iconBg} flex items-center justify-center mb-5 border border-white/10 group-hover:scale-110 transition-transform`}>
              <Target className={`w-5 h-5 ${features[1].iconColor}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">{features[1].title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">{features[1].description}</p>
            <div className="flex items-center gap-4">
              <AtsRing score={94} />
              <div className="text-sm text-slate-400 leading-relaxed">
                <p className="text-white font-semibold mb-0.5">94% match</p>
                <p>for Software Engineer role</p>
                <p className="text-emerald-400 mt-1 font-medium text-xs">+12 keywords added</p>
              </div>
            </div>
          </div>

          {/* Remaining 4 feature cards */}
          {features.slice(2).map((f) => (
            <div key={f.title} className={`card-3d rounded-2xl border ${f.border} bg-gradient-to-br ${f.accent} p-6 group`}>
              <div className={`w-10 h-10 rounded-2xl ${f.iconBg} flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-5 h-5 ${f.iconColor}`} />
              </div>
              <h3 className="font-bold text-white mb-2 font-display">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent pointer-events-none" />

        <div className="page-container relative">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-5">
              From blank page to{" "}
              <span className="text-gradient">interview-ready</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">Three simple steps to a resume that gets results.</p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            {[
              {
                step: "01",
                icon: FileText,
                iconColor: "text-violet-400",
                iconBg: "from-violet-600/20 to-violet-600/5",
                title: "Build Your Resume",
                desc: "Use our guided 6-step builder. Fill in your experience, skills, and education with live preview.",
                color: "violet",
              },
              {
                step: "02",
                icon: Target,
                iconColor: "text-indigo-400",
                iconBg: "from-indigo-600/20 to-indigo-600/5",
                title: "Check ATS Score",
                desc: "Paste the job description. Instantly see your match score and every missing keyword.",
                color: "indigo",
              },
              {
                step: "03",
                icon: Sparkles,
                iconColor: "text-pink-400",
                iconBg: "from-pink-600/20 to-pink-600/5",
                title: "AI Optimize",
                desc: "Let GPT-4 rewrite your bullets, generate a summary, and suggest missing skills.",
                color: "pink",
              },
            ].map(({ step, icon: Icon, iconColor, iconBg, title, desc }, i) => (
              <div key={step} className="relative">
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-10 w-8 h-8 text-white/10 z-10" />
                )}
                <div className="card-3d rounded-2xl border border-white/8 bg-white/3 p-7 h-full relative overflow-hidden group">
                  <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <span className="text-3xl font-extrabold font-display text-white/10">{step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 font-display">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard mockup */}
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Product Preview</p>
            <h3 className="text-3xl font-bold font-display mb-4">
              See Resumiq <span className="text-gradient">in action</span>
            </h3>
            <p className="text-slate-400 max-w-lg mx-auto">A live, AI-powered resume platform — not just a template editor.</p>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="page-container py-24">
        <div className="text-center mb-12">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Reviews</p>
          <h2 className="text-4xl font-bold font-display mb-4">Loved by job seekers</h2>
          <div className="flex items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-slate-400 text-sm ml-2">4.9 / 5 from 500+ reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="card-3d card-dark p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
              <div className="relative">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" />
        <div className="page-container relative">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4">
              Start free, upgrade <span className="text-gradient">when ready</span>
            </h2>
            <p className="text-slate-400 text-lg">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="card-3d card-dark rounded-2xl flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
              <div className="relative p-7 flex flex-col flex-1">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Free</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-extrabold font-display">₹0</span>
                </div>
                <p className="text-slate-500 text-sm mb-8">Forever free. No credit card needed.</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["1 resume", "Basic ATS check", "PDF export", "All templates", "Resume builder"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="btn-dark w-full justify-center text-sm">
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="card-3d relative rounded-2xl border-2 border-violet-500/50 bg-gradient-to-b from-violet-500/10 via-violet-500/5 to-transparent flex flex-col overflow-hidden">
              <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
              <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-5 py-1.5 rounded-bl-xl flex items-center gap-1.5">
                <Crown className="w-3 h-3" /> Most Popular
              </div>
              <div className="relative p-7 flex flex-col flex-1">
                <p className="text-sm font-bold text-violet-400 uppercase tracking-widest mb-3">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-extrabold font-display">₹499</span>
                  <span className="text-slate-400 mb-2">/mo</span>
                </div>
                <p className="text-slate-500 text-sm mb-8">Billed monthly. Cancel anytime.</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {["Unlimited resumes", "Advanced ATS analysis", "GPT-4 AI rewrites", "Summary generator", "Skills advisor", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="btn-primary w-full justify-center gap-2">
                  Start with Pro <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="page-container py-24">
        <div className="relative rounded-3xl overflow-hidden border border-violet-500/30">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-purple-900/60 animate-gradient" />
          <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-violet-500/20 blur-3xl pointer-events-none" />

          <div className="relative p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/15 text-violet-300 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Start in 2 minutes — no credit card needed
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-5">
              Ready to get more interviews?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Join 10,000+ job seekers who transformed their resumes with Resumiq.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="btn-primary text-lg px-10 py-4 shadow-glow">
                Build My Resume — It&apos;s Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="btn-dark text-base px-8 py-4">
                View Pricing <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-10">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <Logo size={28} />
            <div className="flex gap-8 text-sm text-slate-500">
              {["Features", "Pricing", "Privacy", "Terms", "Contact"].map((l) => (
                <span key={l} className="hover:text-slate-300 cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} Resumiq. All rights reserved.</p>
            <p className="text-xs text-slate-700">Built with Next.js · Powered by GPT-4o</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
