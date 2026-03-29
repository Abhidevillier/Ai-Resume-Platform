import { create } from "zustand";
import { Resume, ResumeFormData, ResumeTemplate } from "@/types";

const emptyForm: ResumeFormData = {
  title: "My Resume",
  personalInfo: {
    name: "",
    email: "",
    summary: "",
    contact: { phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  },
  education: [],
  experience: [],
  projects: [],
  skills: { technical: [], soft: [], languages: [] },
  certifications: [],
  template: "modern",
  isPublic: false,
  lastAtsScore: null,
  aiImproved: false,
};

interface ResumeStore {
  // List of user's resumes
  resumes: Resume[];
  setResumes: (resumes: Resume[]) => void;

  // Currently editing
  activeResume: Resume | null;
  setActiveResume: (resume: Resume | null) => void;

  // Form state (live-edited copy)
  formData: ResumeFormData;
  setFormData: (data: ResumeFormData) => void;
  updateFormSection: <K extends keyof ResumeFormData>(key: K, value: ResumeFormData[K]) => void;
  resetForm: () => void;
  loadResumeIntoForm: (resume: Resume) => void;

  // Builder UI state
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  isDirty: boolean;
  setIsDirty: (v: boolean) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  setResumes: (resumes) => set({ resumes }),

  activeResume: null,
  setActiveResume: (resume) => set({ activeResume: resume }),

  formData: { ...emptyForm },
  setFormData: (data) => set({ formData: data, isDirty: true }),
  updateFormSection: (key, value) =>
    set((s) => ({ formData: { ...s.formData, [key]: value }, isDirty: true })),
  resetForm: () => set({ formData: { ...emptyForm }, isDirty: false, currentStep: 0 }),
  loadResumeIntoForm: (resume) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, userId, createdAt, updatedAt, ...formData } = resume;
    set({ formData, activeResume: resume, isDirty: false, currentStep: 0 });
  },

  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),

  isSaving: false,
  setIsSaving: (v) => set({ isSaving: v }),

  isDirty: false,
  setIsDirty: (v) => set({ isDirty: v }),
}));
