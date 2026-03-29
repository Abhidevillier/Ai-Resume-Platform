"use client";

import { useResumeStore } from "@/store/resumeStore";
import { PersonalInfo } from "@/types";

export default function PersonalInfoStep() {
  const { formData, updateFormSection } = useResumeStore();
  const { personalInfo } = formData;

  const update = (field: keyof PersonalInfo, value: string) =>
    updateFormSection("personalInfo", { ...personalInfo, [field]: value });

  const updateContact = (field: keyof PersonalInfo["contact"], value: string) =>
    updateFormSection("personalInfo", {
      ...personalInfo,
      contact: { ...personalInfo.contact, [field]: value },
    });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input
            className="input"
            placeholder="Abhishek Saklani"
            value={personalInfo.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email *</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={personalInfo.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Professional Summary</label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="Results-driven software engineer with 3+ years of experience building scalable web applications..."
          value={personalInfo.summary}
          onChange={(e) => update("summary", e.target.value)}
        />
        <p className="text-xs text-slate-400 mt-1">2–4 sentences. Keep it impactful.</p>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              placeholder="+91 98765 43210"
              value={personalInfo.contact.phone}
              onChange={(e) => updateContact("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              className="input"
              placeholder="Dehradun, Uttarakhand"
              value={personalInfo.contact.location}
              onChange={(e) => updateContact("location", e.target.value)}
            />
          </div>
          <div>
            <label className="label">LinkedIn URL</label>
            <input
              className="input"
              placeholder="linkedin.com/in/username"
              value={personalInfo.contact.linkedin}
              onChange={(e) => updateContact("linkedin", e.target.value)}
            />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input
              className="input"
              placeholder="github.com/username"
              value={personalInfo.contact.github}
              onChange={(e) => updateContact("github", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Portfolio / Website</label>
            <input
              className="input"
              placeholder="yourportfolio.com"
              value={personalInfo.contact.portfolio}
              onChange={(e) => updateContact("portfolio", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
