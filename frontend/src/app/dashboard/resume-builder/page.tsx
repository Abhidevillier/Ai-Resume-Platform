"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PlusCircle, FileText, Trash2, Pencil, Clock, Copy, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import ResumeBuilder from "@/components/resume/ResumeBuilder";
import { useResume } from "@/hooks/useResume";
import { useResumeStore } from "@/store/resumeStore";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Resume } from "@/types";

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-modal max-w-sm w-full p-6 animate-fade-in">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Delete Resume</h3>
            <p className="text-sm text-slate-500 mt-1">
              Are you sure you want to delete <span className="font-medium text-slate-700">"{title}"</span>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Unsaved changes banner ────────────────────────────────────────────────────
function UnsavedBanner({ onDiscard }: { onDiscard: () => void }) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm shrink-0">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>You have unsaved changes — save before leaving.</span>
      </div>
      <button onClick={onDiscard} className="text-amber-600 hover:text-amber-800 transition-colors p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ResumeBuilderPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const { user } = useAuth();
  const { resumes, fetchResumes, deleteResume, duplicateResume } = useResume();
  const { activeResume, loadResumeIntoForm, resetForm, setActiveResume, isDirty, setIsDirty } = useResumeStore();

  const [view, setView] = useState<"list" | "builder">(editId ? "builder" : "list");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);

  useEffect(() => {
    const load = async () => {
      await fetchResumes();
      setIsLoading(false);
    };
    load();
  }, [fetchResumes]);

  useEffect(() => {
    if (editId && resumes.length > 0) {
      const found = resumes.find((r) => r._id === editId);
      if (found) {
        loadResumeIntoForm(found);
        setView("builder");
      }
    }
  }, [editId, resumes, loadResumeIntoForm]);

  // Warn browser about unsaved changes
  useEffect(() => {
    if (view !== "builder" || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [view, isDirty]);

  const handleNewResume = () => {
    if (user?.plan === "free" && (user?.resumeCount ?? 0) >= 1) {
      toast.error("Free plan allows 1 resume. Upgrade to Pro for unlimited.");
      return;
    }
    resetForm();
    setActiveResume(null);
    setView("builder");
  };

  const handleEdit = (resume: Resume) => {
    loadResumeIntoForm(resume);
    setView("builder");
  };

  const handleBackToList = useCallback(() => {
    setView("list");
    fetchResumes();
  }, [fetchResumes]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteResume(deleteTarget._id);
    setDeleteTarget(null);
  };

  // ── Builder view ─────────────────────────────────────────────────────────
  if (view === "builder") {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8 h-[calc(100vh-64px)] flex flex-col">
        {isDirty && <UnsavedBanner onDiscard={() => setIsDirty(false)} />}
        <div className="px-4 py-2 border-b border-slate-100 bg-white shrink-0">
          <button type="button" onClick={handleBackToList} className="btn-ghost text-sm gap-1.5">
            ← Back to resumes
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ResumeBuilder />
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Resumes</h1>
          <p className="section-subtitle">
            {user?.plan === "free"
              ? `${user.resumeCount}/1 resumes used · Free plan`
              : `${resumes.length} resumes · Pro plan`}
          </p>
        </div>
        <button onClick={handleNewResume} className="btn-primary gap-2">
          <PlusCircle className="w-4 h-4" /> New Resume
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-5" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="card border-dashed border-2 border-slate-200 text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No resumes yet</h3>
          <p className="text-sm text-slate-400 mb-5">Create your first resume to get started.</p>
          <button onClick={handleNewResume} className="btn-primary mx-auto">
            <PlusCircle className="w-4 h-4" /> Create Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div key={resume._id} className="card group hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(resume)}
                    className="btn-ghost p-1.5 text-slate-500 hover:text-primary-600"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateResume(resume._id)}
                    className="btn-ghost p-1.5 text-slate-500 hover:text-indigo-600"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(resume)}
                    className="btn-ghost p-1.5 text-slate-500 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 mb-0.5 truncate">{resume.title}</h3>
              <p className="text-sm text-slate-500 truncate">{resume.personalInfo.name}</p>

              {resume.lastAtsScore !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary-500"
                      style={{ width: `${resume.lastAtsScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">{resume.lastAtsScore}% ATS</span>
                </div>
              )}

              <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Updated {new Date(resume.updatedAt).toLocaleDateString()}
              </div>

              <button
                onClick={() => handleEdit(resume)}
                className="btn-secondary w-full justify-center mt-4 text-sm"
              >
                Open Builder
              </button>
            </div>
          ))}
        </div>
      )}

      {user?.plan === "free" && resumes.length >= 1 && (
        <div className="card bg-primary-50 border-primary-200 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-primary-800">You&apos;ve reached the free plan limit</p>
            <p className="text-sm text-primary-600">Upgrade to Pro for unlimited resumes + AI features.</p>
          </div>
          <Link href="/pricing" className="btn-primary shrink-0">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResumeBuilderPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}>
      <ResumeBuilderPage />
    </Suspense>
  );
}
