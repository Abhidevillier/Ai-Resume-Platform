"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import { Skills } from "@/types";

type SkillCategory = keyof Skills;

const categories: { key: SkillCategory; label: string; placeholder: string }[] = [
  { key: "technical", label: "Technical Skills", placeholder: "React, Node.js, Python..." },
  { key: "soft",      label: "Soft Skills",      placeholder: "Leadership, Communication..." },
  { key: "languages", label: "Languages",         placeholder: "English, Hindi, Spanish..." },
];

export default function SkillsStep() {
  const { formData, updateFormSection } = useResumeStore();
  const [inputs, setInputs] = useState<Record<SkillCategory, string>>({
    technical: "", soft: "", languages: "",
  });

  const skills = formData.skills;

  const add = (cat: SkillCategory) => {
    const val = inputs[cat].trim();
    if (!val || skills[cat].includes(val)) return;
    updateFormSection("skills", { ...skills, [cat]: [...skills[cat], val] });
    setInputs((prev) => ({ ...prev, [cat]: "" }));
  };

  const remove = (cat: SkillCategory, skill: string) =>
    updateFormSection("skills", {
      ...skills,
      [cat]: skills[cat].filter((s) => s !== skill),
    });

  return (
    <div className="space-y-6">
      {categories.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="label">{label}</label>

          {/* Skill chips */}
          <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
            {skills[key].map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => remove(key, skill)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {skills[key].length === 0 && (
              <span className="text-xs text-slate-400 py-1">None added yet</span>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder={placeholder}
              value={inputs[key]}
              onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  add(key);
                }
              }}
            />
            <button type="button" onClick={() => add(key)} className="btn-secondary px-4">
              Add
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Press Enter or comma to add.</p>
        </div>
      ))}
    </div>
  );
}
