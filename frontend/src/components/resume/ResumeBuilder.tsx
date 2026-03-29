"use client";

import { useRef, useState } from "react";
import { Check, Loader2, Download, Save, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import { useResumeStore } from "@/store/resumeStore";
import { useResume } from "@/hooks/useResume";
import ResumePreview from "./ResumePreview";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import EducationStep from "./steps/EducationStep";
import ExperienceStep from "./steps/ExperienceStep";
import ProjectsStep from "./steps/ProjectsStep";
import SkillsStep from "./steps/SkillsStep";
import CertificationsStep from "./steps/CertificationsStep";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 0, label: "Personal",      short: "Info",    component: PersonalInfoStep },
  { id: 1, label: "Education",     short: "Edu",     component: EducationStep },
  { id: 2, label: "Experience",    short: "Exp",     component: ExperienceStep },
  { id: 3, label: "Projects",      short: "Projects",component: ProjectsStep },
  { id: 4, label: "Skills",        short: "Skills",  component: SkillsStep },
  { id: 5, label: "Certifications",short: "Certs",   component: CertificationsStep },
];

export default function ResumeBuilder() {
  const { formData, currentStep, setCurrentStep, isSaving, activeResume, updateFormSection } =
    useResumeStore();
  const { createResume, updateResume } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false); // mobile toggle
  const [isExporting, setIsExporting] = useState(false);

  const ActiveStep = STEPS[currentStep].component;

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.personalInfo.name || !formData.personalInfo.email) {
      toast.error("Please fill in your name and email first.");
      setCurrentStep(0);
      return;
    }
    if (activeResume) {
      await updateResume(activeResume._id, formData);
    } else {
      await createResume(formData);
    }
  };

  // ── PDF Export ───────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Dynamic imports keep bundle small
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = previewRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,          // 2x for crisp text
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.personalInfo.name || "resume"}.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-0">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex-1 min-w-0">
          <input
            className="text-lg font-semibold text-slate-900 bg-transparent border-0 outline-none focus:ring-0 w-full truncate"
            value={formData.title}
            onChange={(e) => updateFormSection("title", e.target.value)}
            placeholder="Resume title..."
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile preview toggle */}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="btn-ghost gap-1.5 lg:hidden"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">{showPreview ? "Edit" : "Preview"}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-secondary gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn-primary gap-1.5"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Form ─────────────────────────────────────────────────── */}
        <div className={cn("flex flex-col w-full lg:w-[480px] lg:border-r border-slate-100 shrink-0 overflow-hidden", showPreview && "hidden lg:flex")}>
          {/* Step tabs */}
          <div className="flex overflow-x-auto scrollbar-hide bg-white border-b border-slate-100 shrink-0">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors shrink-0 border-b-2",
                  currentStep === step.id
                    ? "border-primary-600 text-primary-700 bg-primary-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  currentStep === step.id ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </button>
            ))}
          </div>

          {/* Active step form */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-5">
            <ActiveStep />
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-white shrink-0">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn-secondary disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-400">{currentStep + 1} / {STEPS.length}</span>
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Resume
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Preview ─────────────────────────────────────────────── */}
        <div className={cn(
          "flex-1 overflow-auto bg-slate-200 p-4 lg:p-8",
          !showPreview && "hidden lg:flex lg:flex-col"
        )}>
          {/* Scaled preview container */}
          <div className="flex justify-center">
            <div
              style={{
                transform: "scale(0.75)",
                transformOrigin: "top center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              <ResumePreview data={formData} previewRef={previewRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
