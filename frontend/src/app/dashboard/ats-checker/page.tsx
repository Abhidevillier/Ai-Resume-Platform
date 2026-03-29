"use client";

import { useEffect, useState } from "react";
import { Target, Loader2, ChevronDown, CheckCircle2, XCircle, AlertCircle, History } from "lucide-react";
import toast from "react-hot-toast";

import apiClient from "@/lib/apiClient";
import { useResume } from "@/hooks/useResume";
import { AtsResult, Resume } from "@/types";
import { cn, getScoreColor, getScoreBgColor } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AtsCheckerPage() {
  const { resumes, fetchResumes } = useResume();

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [history, setHistory] = useState<AtsResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // When a resume is selected, load its ATS history
  useEffect(() => {
    if (!selectedResumeId) return;
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await apiClient.get<{ success: boolean; data: { results: AtsResult[] } }>(
          `/ats/history/${selectedResumeId}`
        );
        setHistory(data.data.results);
      } catch {
        // no history yet is fine
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [selectedResumeId]);

  const handleAnalyze = async () => {
    if (!selectedResumeId) { toast.error("Select a resume first"); return; }
    if (jobDescription.trim().length < 50) { toast.error("Job description must be at least 50 characters"); return; }

    setIsAnalyzing(true);
    setResult(null);
    try {
      const { data } = await apiClient.post<{ success: boolean; data: { result: AtsResult } }>(
        "/ats/analyze",
        { resumeId: selectedResumeId, jobDescription, jobTitle }
      );
      setResult(data.data.result);
      setHistory((prev) => [data.data.result, ...prev]);
      toast.success("Analysis complete!");
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Analysis failed";
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Target className="w-6 h-6 text-violet-600" /> ATS Score Checker
        </h1>
        <p className="section-subtitle">Paste a job description to see how well your resume matches.</p>
      </div>

      {/* Input form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Resume selector */}
          <div>
            <label className="label">Select Resume</label>
            <div className="relative">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="input appearance-none pr-10"
              >
                <option value="">-- Choose a resume --</option>
                {resumes.map((r: Resume) => (
                  <option key={r._id} value={r._id}>{r.title} — {r.personalInfo.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {resumes.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No resumes yet. <a href="/dashboard/resume-builder" className="underline">Build one first →</a>
              </p>
            )}
          </div>

          {/* Job title */}
          <div>
            <label className="label">Job Title <span className="text-slate-400">(optional)</span></label>
            <input
              className="input"
              placeholder="Senior Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          {/* Job description */}
          <div>
            <label className="label">Job Description *</label>
            <textarea
              className="input min-h-[260px] resize-y font-mono text-xs"
              placeholder="Paste the full job description here...&#10;&#10;We are looking for a Senior React Developer with 3+ years of experience..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">{jobDescription.length} chars — min 50 required</p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedResumeId}
            className="btn-primary w-full justify-center gap-2"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Target className="w-4 h-4" /> Analyze Resume</>
            )}
          </button>
        </div>

        {/* Results panel */}
        <div>
          {isAnalyzing && (
            <div className="card flex flex-col items-center justify-center py-16 gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-slate-500">Analyzing your resume...</p>
            </div>
          )}

          {!isAnalyzing && result && <AtsResultCard result={result} />}

          {!isAnalyzing && !result && (
            <div className="card border-dashed border-2 border-slate-200 text-center py-16 text-slate-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Your results will appear here</p>
              <p className="text-sm mt-1">Select a resume and paste a job description to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {selectedResumeId && (
        <div>
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Previous Analyses
          </h2>
          {loadingHistory ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : history.length === 0 ? (
            <p className="text-sm text-slate-400">No previous analyses for this resume.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <button
                  key={h._id}
                  onClick={() => setResult(h)}
                  className={cn(
                    "w-full card text-left hover:shadow-card-hover transition-shadow flex items-center justify-between gap-4",
                    result?._id === h._id && "border-primary-200 bg-primary-50/30"
                  )}
                >
                  <div>
                    <p className="font-medium text-slate-800">{h.jobTitle || "Untitled Job"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  <ScoreBadge score={h.score.overall} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className={cn(
      "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
      score >= 80 ? "bg-green-100 text-green-700" :
      score >= 60 ? "bg-yellow-100 text-yellow-700" :
                   "bg-red-100 text-red-700"
    )}>
      {score}
    </div>
  );
}

function AtsResultCard({ result }: { result: AtsResult }) {
  const { score, matchedKeywords, missingKeywords, suggestions } = result;

  const scoreLabel =
    score.overall >= 80 ? "Excellent match!" :
    score.overall >= 60 ? "Good match" :
    score.overall >= 40 ? "Needs improvement" : "Poor match";

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Overall score */}
      <div className="card text-center">
        <div className="relative w-28 h-28 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={score.overall >= 80 ? "#22c55e" : score.overall >= 60 ? "#f59e0b" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={`${(score.overall / 100) * 263.9} 263.9`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", getScoreColor(score.overall))}>{score.overall}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>
        <p className={cn("font-semibold text-lg", getScoreColor(score.overall))}>{scoreLabel}</p>
        {result.jobTitle && <p className="text-sm text-slate-400 mt-1">for: {result.jobTitle}</p>}
      </div>

      {/* Score breakdown */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-slate-800 mb-1">Score Breakdown</h3>
        {[
          { label: "Keyword Match", value: score.keywordMatch },
          { label: "Skills Match",  value: score.skillsMatch },
          { label: "Experience",    value: score.experienceMatch },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">{label}</span>
              <span className={cn("font-medium", getScoreColor(value))}>{value}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", getScoreBgColor(value))}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Keywords */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Matched ({matchedKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.slice(0, 15).map((kw) => (
              <span key={kw} className="badge bg-green-50 text-green-700">{kw}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Missing ({missingKeywords.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.slice(0, 15).map((kw) => (
              <span key={kw} className="badge bg-red-50 text-red-600">{kw}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-800">Recommendations</h3>
          {suggestions.map((s, i) => (
            <div key={i} className={cn(
              "flex gap-3 p-3 rounded-lg",
              s.priority === "high"   ? "bg-red-50" :
              s.priority === "medium" ? "bg-amber-50" : "bg-green-50"
            )}>
              <AlertCircle className={cn(
                "w-4 h-4 mt-0.5 shrink-0",
                s.priority === "high"   ? "text-red-500" :
                s.priority === "medium" ? "text-amber-500" : "text-green-500"
              )} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-0.5 capitalize">
                  {s.section} · {s.priority} priority
                </p>
                <p className="text-sm text-slate-700">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
