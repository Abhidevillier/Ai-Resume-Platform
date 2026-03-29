"use client";

import { useState } from "react";
import { PlusCircle, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { Project } from "@/types";

const emptyProject = (): Project => ({
  name: "", description: "", techStack: [],
  liveUrl: "", githubUrl: "", startDate: "", endDate: "",
});

export default function ProjectsStep() {
  const { formData, updateFormSection } = useResumeStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [techInput, setTechInput] = useState<Record<number, string>>({});

  const items = formData.projects;

  const update = (idx: number, field: keyof Project, value: unknown) => {
    const updated = items.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    updateFormSection("projects", updated);
  };

  const addTech = (idx: number) => {
    const val = (techInput[idx] || "").trim();
    if (!val) return;
    update(idx, "techStack", [...items[idx].techStack, val]);
    setTechInput((prev) => ({ ...prev, [idx]: "" }));
  };

  const removeTech = (idx: number, techIdx: number) =>
    update(idx, "techStack", items[idx].techStack.filter((_, i) => i !== techIdx));

  const add = () => {
    updateFormSection("projects", [...items, emptyProject()]);
    setOpenIndex(items.length);
  };
  const remove = (idx: number) => {
    updateFormSection("projects", items.filter((_, i) => i !== idx));
    setOpenIndex(null);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">No projects added yet.</p>
      )}

      {items.map((proj, idx) => (
        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <span className="text-sm font-medium text-slate-700">
              {proj.name || `Project ${idx + 1}`}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(idx); }} className="p-1 text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
              {openIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {openIndex === idx && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Project Name *</label>
                  <input className="input" placeholder="AI Resume Platform" value={proj.name} onChange={(e) => update(idx, "name", e.target.value)} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input className="input" placeholder="Jan 2024" value={proj.startDate} onChange={(e) => update(idx, "startDate", e.target.value)} />
                </div>
                <div>
                  <label className="label">Live URL</label>
                  <input className="input" placeholder="https://yourproject.com" value={proj.liveUrl} onChange={(e) => update(idx, "liveUrl", e.target.value)} />
                </div>
                <div>
                  <label className="label">GitHub URL</label>
                  <input className="input" placeholder="github.com/user/repo" value={proj.githubUrl} onChange={(e) => update(idx, "githubUrl", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  placeholder="Built a full-stack SaaS platform that helps users create ATS-optimized resumes using AI..."
                  value={proj.description}
                  onChange={(e) => update(idx, "description", e.target.value)}
                />
              </div>

              <div>
                <label className="label">Tech Stack</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {proj.techStack.map((tech, tIdx) => (
                    <span key={tIdx} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {tech}
                      <button type="button" onClick={() => removeTech(idx, tIdx)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Next.js, then press Enter"
                    value={techInput[idx] || ""}
                    onChange={(e) => setTechInput((prev) => ({ ...prev, [idx]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(idx); } }}
                  />
                  <button type="button" onClick={() => addTech(idx)} className="btn-secondary px-3">Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={add} className="btn-secondary w-full justify-center gap-2 mt-2">
        <PlusCircle className="w-4 h-4" /> Add Project
      </button>
    </div>
  );
}
