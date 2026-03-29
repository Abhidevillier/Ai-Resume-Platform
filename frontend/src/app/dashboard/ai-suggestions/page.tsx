"use client";

import { useEffect, useState } from "react";
import {
  Sparkles, Loader2, ChevronDown, Check, X, ArrowRight,
  Zap, FileText, Target, PlusCircle, Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import { useResume } from "@/hooks/useResume";
import { useAI } from "@/hooks/useAI";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import { cn } from "@/lib/utils";

type TabId = "bullets" | "summary" | "skills";

const TABS: { id: TabId; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "bullets", label: "Bullet Points", icon: <Zap className="w-4 h-4" />,      desc: "Rewrite weak bullets with strong action verbs & metrics" },
  { id: "summary", label: "Summary",       icon: <FileText className="w-4 h-4" />, desc: "Generate a tailored professional summary" },
  { id: "skills",  label: "Skills Advisor",icon: <Target className="w-4 h-4" />,   desc: "Discover skills you're missing for the role" },
];

export default function AISuggestionsPage() {
  const { user } = useAuth();
  const { resumes, fetchResumes } = useResume();
  const ai = useAI();

  const [activeTab, setActiveTab] = useState<TabId>("bullets");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const selectedResume = resumes.find((r: Resume) => r._id === selectedResumeId) || null;

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  // Gate Pro features
  const isPro = user?.plan === "pro";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-600" /> AI Suggestions
        </h1>
        <p className="section-subtitle">GPT-4 powered tools to make your resume stand out.</p>
      </div>

      {/* Pro gate */}
      {!isPro && (
        <div className="card bg-gradient-to-r from-primary-50 to-violet-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary-900">Pro Feature</p>
              <p className="text-sm text-primary-700 mt-0.5">
                AI suggestions require a Pro plan. Upgrade to unlock GPT-4 powered rewrites,
                summary generation, and skills analysis.
              </p>
            </div>
            <Link href="/pricing" className="btn-primary shrink-0">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Resume selector */}
      <div className="max-w-md">
        <label className="label">Select Resume to Improve</label>
        <div className="relative">
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            disabled={!isPro}
            className="input appearance-none pr-10 disabled:opacity-60"
          >
            <option value="">-- Choose a resume --</option>
            {resumes.map((r: Resume) => (
              <option key={r._id} value={r._id}>{r.title} — {r.personalInfo.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!isPro}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors disabled:opacity-50",
                activeTab === tab.id
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className={cn(!isPro && "opacity-60 pointer-events-none")}>
        {activeTab === "bullets" && (
          <BulletsTab resume={selectedResume} ai={ai} />
        )}
        {activeTab === "summary" && (
          <SummaryTab resume={selectedResume} ai={ai} />
        )}
        {activeTab === "skills" && (
          <SkillsTab resume={selectedResume} ai={ai} />
        )}
      </div>
    </div>
  );
}

// ── Tab: Bullet Points ────────────────────────────────────────────────────────

function BulletsTab({ resume, ai }: { resume: Resume | null; ai: ReturnType<typeof useAI> }) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<{ experienceIndex: number; original: string[]; improved: string[] }[]>([]);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  const handleImproveAll = async () => {
    if (!resume) { toast.error("Select a resume first"); return; }
    const data = await ai.improveAllBullets(resume._id, jobTitle, jobDescription);
    if (data) {
      setResults(data.filter((r) => r.improved.length > 0));
      toast.success(`Improved ${data.length} experience entries!`);
    }
  };

  const handleApply = async (expIdx: number, bullets: string[]) => {
    if (!resume) return;
    await ai.applyBullets(resume._id, expIdx, bullets);
    setApplied((prev) => new Set([...prev, expIdx]));
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Optionally paste a job description for context — AI will tailor the rewrites to match the role.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Target Job Title</label>
          <input className="input" placeholder="Senior Frontend Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
        <div className="md:col-span-1">
          <label className="label">Job Description <span className="text-slate-400">(optional but recommended)</span></label>
          <textarea className="input min-h-[100px] resize-y text-xs" placeholder="Paste the job description..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
        </div>
      </div>

      <button
        onClick={handleImproveAll}
        disabled={ai.isLoading || !resume}
        className="btn-primary gap-2"
      >
        {ai.isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Improving all bullets...</> : <><Sparkles className="w-4 h-4" /> Improve All Bullets</>}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">Results — Review & Apply</h3>
          {results.map((r) => {
            const expTitle = resume?.experience[r.experienceIndex]?.position || `Experience ${r.experienceIndex + 1}`;
            const isApplied = applied.has(r.experienceIndex);
            return (
              <div key={r.experienceIndex} className={cn("card", isApplied && "border-green-200 bg-green-50/30")}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-800">{expTitle}</h4>
                  {isApplied ? (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                      <Check className="w-4 h-4" /> Applied
                    </span>
                  ) : (
                    <button onClick={() => handleApply(r.experienceIndex, r.improved)} className="btn-primary text-sm gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Apply to Resume
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <X className="w-3 h-3 text-red-400" /> Original
                    </p>
                    <ul className="space-y-1.5">
                      {r.original.map((b, i) => (
                        <li key={i} className="text-sm text-slate-500 flex gap-2 bg-red-50 px-3 py-2 rounded-lg">
                          <span className="mt-0.5 text-red-300">•</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Improved */}
                  <div>
                    <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Improved
                    </p>
                    <ul className="space-y-1.5">
                      {r.improved.map((b, i) => (
                        <li key={i} className="text-sm text-slate-700 flex gap-2 bg-primary-50 px-3 py-2 rounded-lg">
                          <span className="mt-0.5 text-primary-400">•</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tab: Summary ──────────────────────────────────────────────────────────────

function SummaryTab({ resume, ai }: { resume: Resume | null; ai: ReturnType<typeof useAI> }) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<{ original: string; improved: string } | null>(null);
  const [applied, setApplied] = useState(false);

  const handleGenerate = async () => {
    if (!resume) { toast.error("Select a resume first"); return; }
    const data = await ai.generateSummary(resume._id, jobTitle, jobDescription);
    if (data) { setResult(data); setApplied(false); }
  };

  const handleApply = async () => {
    if (!resume || !result) return;
    await ai.applySummary(resume._id, result.improved);
    setApplied(true);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        AI will write a tailored professional summary based on your resume content and target role.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Target Job Title</label>
          <input className="input" placeholder="Full Stack Developer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Job Description <span className="text-slate-400">(optional)</span></label>
          <textarea className="input min-h-[100px] resize-y text-xs" placeholder="Paste job description for better tailoring..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
        </div>
      </div>

      <button onClick={handleGenerate} disabled={ai.isLoading || !resume} className="btn-primary gap-2">
        {ai.isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Summary</>}
      </button>

      {result && (
        <div className="space-y-4">
          {result.original && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <X className="w-3 h-3 text-red-400" /> Current Summary
              </p>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-slate-600">
                {result.original || <span className="italic text-slate-400">No summary yet</span>}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Generated
            </p>
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
              {result.improved}
            </div>
          </div>

          <div className="flex gap-3">
            {applied ? (
              <span className="flex items-center gap-2 text-green-600 font-medium text-sm">
                <Check className="w-4 h-4" /> Applied to resume
              </span>
            ) : (
              <button onClick={handleApply} className="btn-primary gap-2">
                <Check className="w-4 h-4" /> Apply to Resume
              </button>
            )}
            <button onClick={handleGenerate} disabled={ai.isLoading} className="btn-secondary gap-2">
              <ArrowRight className="w-4 h-4" /> Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Skills Advisor ───────────────────────────────────────────────────────

function SkillsTab({ resume, ai }: { resume: Resume | null; ai: ReturnType<typeof useAI> }) {
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [suggestions, setSuggestions] = useState<{ technical: string[]; soft: string[]; certifications: string[] } | null>(null);

  const handleSuggest = async () => {
    if (!resume) { toast.error("Select a resume first"); return; }
    if (!jobDescription.trim()) { toast.error("Paste a job description to get skill suggestions"); return; }
    const data = await ai.suggestSkills(resume._id, jobDescription, jobTitle);
    if (data) setSuggestions(data);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        AI will analyze the job description and suggest skills you should add to your resume.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Target Job Title</label>
          <input className="input" placeholder="Backend Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Job Description *</label>
          <textarea className="input min-h-[120px] resize-y text-xs" placeholder="Paste the full job description..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
        </div>
      </div>

      <button onClick={handleSuggest} disabled={ai.isLoading || !resume} className="btn-primary gap-2">
        {ai.isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Target className="w-4 h-4" /> Suggest Missing Skills</>}
      </button>

      {suggestions && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          {[
            { key: "technical",      label: "Technical Skills",  color: "primary" },
            { key: "soft",           label: "Soft Skills",       color: "violet" },
            { key: "certifications", label: "Certifications",    color: "pink" },
          ].map(({ key, label, color }) => {
            const items = suggestions[key as keyof typeof suggestions] || [];
            return (
              <div key={key} className="card">
                <h3 className={cn("font-semibold mb-3 text-sm", `text-${color}-700`)}>
                  {label}
                  <span className="ml-1.5 text-xs font-normal text-slate-400">
                    ({items.length} suggestions)
                  </span>
                </h3>
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">You already cover these well!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <span
                        key={skill}
                        className={cn(
                          "badge text-xs",
                          color === "primary" ? "bg-primary-50 text-primary-700" :
                          color === "violet"  ? "bg-violet-50 text-violet-700" :
                                               "bg-pink-50 text-pink-700"
                        )}
                      >
                        <PlusCircle className="w-3 h-3 mr-1" /> {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {suggestions && (
        <div className="card bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Next step:</strong> Go to the{" "}
            <Link href="/dashboard/resume-builder" className="underline font-medium">Resume Builder</Link>{" "}
            and add these skills to your resume manually, then re-run the ATS checker to see your improved score.
          </p>
        </div>
      )}
    </div>
  );
}
