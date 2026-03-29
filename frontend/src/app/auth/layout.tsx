import Link from "next/link";
import { Sparkles, Target, Zap, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";

const perks = [
  { icon: <Sparkles className="w-4 h-4" />, text: "GPT-4 powered bullet rewrites" },
  { icon: <Target className="w-4 h-4" />,   text: "Instant ATS score analysis" },
  { icon: <Zap className="w-4 h-4" />,      text: "One-click PDF export" },
  { icon: <CheckCircle2 className="w-4 h-4" />, text: "Free forever, no credit card" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── Left: Brand panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] shrink-0 flex-col justify-between p-12 bg-mesh border-r border-white/10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/25 rounded-full blur-[100px] pointer-events-none" />

        <Link href="/" className="relative z-10">
          <Logo size={36} />
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold font-display text-white leading-tight mb-3">
              Land your dream job with an AI-powered resume
            </h2>
            <p className="text-slate-400">
              Join 10,000+ professionals who built their perfect resume with Resumiq.
            </p>
          </div>

          <ul className="space-y-4">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                  {p.icon}
                </div>
                <span className="text-slate-300 text-sm">{p.text}</span>
              </li>
            ))}
          </ul>

          {/* Fake testimonial */}
          <div className="card-dark rounded-2xl p-5">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "Resumiq rewrote my resume in 5 minutes and I got 3 interview calls the next week. Absolutely worth it."
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                RK
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Rahul Kumar</p>
                <p className="text-slate-400 text-xs">SDE @ Microsoft</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 relative z-10">
          © {new Date().getFullYear()} Resumiq · Privacy · Terms
        </p>
      </div>

      {/* ── Right: Form area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-5 border-b border-white/10">
          <Link href="/"><Logo size={28} /></Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
