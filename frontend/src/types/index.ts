// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  plan: "free" | "pro";
  planExpiresAt: string | null;
  resumeCount: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── Resume ────────────────────────────────────────────────────────────────────

export interface ContactInfo {
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  summary: string;
  contact: ContactInfo;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade: string;
  description: string;
}

export interface Experience {
  _id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface Project {
  _id?: string;
  name: string;
  description: string;
  techStack: string[];
  liveUrl: string;
  githubUrl: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  _id?: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
}

export type ResumeTemplate = "modern" | "classic" | "minimal" | "bold";

export interface Resume {
  _id: string;
  userId: string;
  title: string;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  template: ResumeTemplate;
  isPublic: boolean;
  lastAtsScore: number | null;
  aiImproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Partial resume used during the builder (no _id required yet)
export type ResumeFormData = Omit<Resume, "_id" | "userId" | "createdAt" | "updatedAt">;

// ── ATS ───────────────────────────────────────────────────────────────────────

export interface AtsScoreBreakdown {
  overall: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
}

export interface AtsSuggestion {
  section: "summary" | "experience" | "skills" | "education" | "general";
  priority: "high" | "medium" | "low";
  text: string;
}

export interface AtsResult {
  _id: string;
  resumeId: string;
  jobTitle: string;
  jobDescription: string;
  score: AtsScoreBreakdown;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: AtsSuggestion[];
  createdAt: string;
}

// ── Payment ───────────────────────────────────────────────────────────────────

export type PlanId = "pro_monthly" | "pro_annual";

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: number;        // in INR
  priceInPaise: number; // for Razorpay
  period: string;
  features: string[];
  highlighted: boolean;
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// ── API Responses ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
