"use client";

import { useState } from "react";
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { Education } from "@/types";

const emptyEdu = (): Education => ({
  institution: "", degree: "", field: "",
  startDate: "", endDate: "", grade: "", description: "",
});

export default function EducationStep() {
  const { formData, updateFormSection } = useResumeStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = formData.education;
  const update = (idx: number, field: keyof Education, value: string) => {
    const updated = items.map((e, i) => (i === idx ? { ...e, [field]: value } : e));
    updateFormSection("education", updated);
  };
  const add = () => {
    updateFormSection("education", [...items, emptyEdu()]);
    setOpenIndex(items.length);
  };
  const remove = (idx: number) => {
    updateFormSection("education", items.filter((_, i) => i !== idx));
    setOpenIndex(null);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">
          No education added yet. Click below to add.
        </p>
      )}

      {items.map((edu, idx) => (
        <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Accordion header */}
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <span className="text-sm font-medium text-slate-700">
              {edu.institution || `Education ${idx + 1}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(idx); }}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {openIndex === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {/* Accordion body */}
          {openIndex === idx && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Institution *</label>
                  <input className="input" placeholder="IIT Delhi" value={edu.institution} onChange={(e) => update(idx, "institution", e.target.value)} />
                </div>
                <div>
                  <label className="label">Degree *</label>
                  <input className="input" placeholder="B.Tech" value={edu.degree} onChange={(e) => update(idx, "degree", e.target.value)} />
                </div>
                <div>
                  <label className="label">Field of Study</label>
                  <input className="input" placeholder="Computer Science" value={edu.field} onChange={(e) => update(idx, "field", e.target.value)} />
                </div>
                <div>
                  <label className="label">Grade / GPA</label>
                  <input className="input" placeholder="8.5 CGPA / 85%" value={edu.grade} onChange={(e) => update(idx, "grade", e.target.value)} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input className="input" placeholder="Aug 2020" value={edu.startDate} onChange={(e) => update(idx, "startDate", e.target.value)} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input className="input" placeholder="May 2024 / Present" value={edu.endDate} onChange={(e) => update(idx, "endDate", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Additional Info</label>
                <textarea className="input min-h-[72px] resize-y" placeholder="Relevant coursework, achievements, clubs..." value={edu.description} onChange={(e) => update(idx, "description", e.target.value)} />
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={add} className="btn-secondary w-full justify-center gap-2 mt-2">
        <PlusCircle className="w-4 h-4" /> Add Education
      </button>
    </div>
  );
}
