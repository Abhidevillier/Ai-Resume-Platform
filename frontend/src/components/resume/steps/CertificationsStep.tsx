"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { Certification } from "@/types";

const emptyCert = (): Certification => ({ name: "", issuer: "", date: "", url: "" });

export default function CertificationsStep() {
  const { formData, updateFormSection } = useResumeStore();
  const items = formData.certifications;

  const update = (idx: number, field: keyof Certification, value: string) => {
    const updated = items.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    updateFormSection("certifications", updated);
  };
  const add = () => updateFormSection("certifications", [...items, emptyCert()]);
  const remove = (idx: number) =>
    updateFormSection("certifications", items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Optional but adds credibility. Add relevant certifications only.</p>

      {items.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">No certifications added yet.</p>
      )}

      {items.map((cert, idx) => (
        <div key={idx} className="card relative">
          <button
            type="button"
            onClick={() => remove(idx)}
            className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
            <div>
              <label className="label">Certificate Name *</label>
              <input className="input" placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => update(idx, "name", e.target.value)} />
            </div>
            <div>
              <label className="label">Issuing Organization</label>
              <input className="input" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => update(idx, "issuer", e.target.value)} />
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" placeholder="Mar 2024" value={cert.date} onChange={(e) => update(idx, "date", e.target.value)} />
            </div>
            <div>
              <label className="label">Credential URL</label>
              <input className="input" placeholder="credly.com/badges/..." value={cert.url} onChange={(e) => update(idx, "url", e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="btn-secondary w-full justify-center gap-2">
        <PlusCircle className="w-4 h-4" /> Add Certification
      </button>
    </div>
  );
}
