"use client";

import { useState } from "react";
import { PlusCircle, Trash2, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { Experience } from "@/types";

const emptyExp = (): Experience => ({
  company: "", position: "", location: "",
  startDate: "", endDate: "", isCurrent: false, bullets: [""],
});

export default function ExperienceStep() {
  const { formData, updateFormSection } = useResumeStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = formData.experience;

  const update = (idx: number, field: keyof Experience, value: unknown) => {
    const updated = items.map((e, i) => (i === idx ? { ...e, [field]: value } : e));
    updateFormSection("experience", updated);
  };

  const updateBullet = (expIdx: number, bulletIdx: number, value: string) => {
    const bullets = [...items[expIdx].bullets];
    bullets[bulletIdx] = value;
    update(expIdx, "bullets", bullets);
  };

  const addBullet = (expIdx: number) =>
    update(expIdx, "bullets", [...items[expIdx].bullets, ""]);

  const removeBullet = (expIdx: number, bulletIdx: number) =>
    update(expIdx, "bullets", items[expIdx].bullets.filter((_, i) => i !== bulletIdx));

  const add = () => {
    updateFormSection("experience", [...items, emptyExp()]);
    setOpenIndex(items.length);
  };
  const remove = (idx: number) => {
    updateFormSection("experience", items.filter((_, i) => i !== idx));
    setOpenIndex(null);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">No experience added yet.</p>
      )}

      {items.map((exp, idx) => (
        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div>
              <span className="text-sm font-medium text-slate-700">
                {exp.position || `Experience ${idx + 1}`}
              </span>
              {exp.company && (
                <span className="text-xs text-slate-400 ml-2">@ {exp.company}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(idx); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              {openIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {openIndex === idx && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company *</label>
                  <input className="input" placeholder="Google" value={exp.company} onChange={(e) => update(idx, "company", e.target.value)} />
                </div>
                <div>
                  <label className="label">Position *</label>
                  <input className="input" placeholder="Software Engineer" value={exp.position} onChange={(e) => update(idx, "position", e.target.value)} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" placeholder="Bangalore, India / Remote" value={exp.location} onChange={(e) => update(idx, "location", e.target.value)} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input className="input" placeholder="Jun 2022" value={exp.startDate} onChange={(e) => update(idx, "startDate", e.target.value)} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    className="input"
                    placeholder="Present"
                    value={exp.isCurrent ? "Present" : exp.endDate}
                    disabled={exp.isCurrent}
                    onChange={(e) => update(idx, "endDate", e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id={`current-${idx}`}
                    checked={exp.isCurrent}
                    onChange={(e) => {
                      update(idx, "isCurrent", e.target.checked);
                      if (e.target.checked) update(idx, "endDate", "Present");
                    }}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor={`current-${idx}`} className="text-sm text-slate-600">Currently working here</label>
                </div>
              </div>

              {/* Bullet points */}
              <div>
                <label className="label">Achievement Bullets</label>
                <p className="text-xs text-slate-400 mb-2">Start with action verbs. Quantify impact. e.g. "Reduced load time by 40%..."</p>
                <div className="space-y-2">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <span className="mt-2.5 text-slate-300 text-lg leading-none">•</span>
                      <input
                        className="input flex-1"
                        placeholder={`Achievement ${bIdx + 1}...`}
                        value={bullet}
                        onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                      />
                      {exp.bullets.length > 1 && (
                        <button type="button" onClick={() => removeBullet(idx, bIdx)} className="mt-2.5 text-slate-300 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addBullet(idx)} className="btn-ghost text-xs gap-1.5 text-primary-600">
                    <Plus className="w-3.5 h-3.5" /> Add bullet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={add} className="btn-secondary w-full justify-center gap-2 mt-2">
        <PlusCircle className="w-4 h-4" /> Add Experience
      </button>
    </div>
  );
}
