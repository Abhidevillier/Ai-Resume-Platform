import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/apiClient";

interface BulletResult {
  original: string[];
  improved: string[];
  experienceIndex: number;
}

interface SkillSuggestions {
  technical: string[];
  soft: string[];
  certifications: string[];
}

interface AiSuggestion {
  section: string;
  priority: "high" | "medium" | "low";
  title: string;
  text: string;
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    try {
      return await fn();
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg?.includes("Pro plan")) {
        toast.error("This feature requires a Pro plan. Please upgrade.");
      } else {
        toast.error(msg || "AI request failed. Please try again.");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const improveBullets = useCallback(
    (resumeId: string, experienceIndex: number, jobTitle = "", jobDescription = "") =>
      withLoading(async () => {
        const { data } = await apiClient.post<{ success: boolean; data: BulletResult }>(
          "/ai/improve-bullets",
          { resumeId, experienceIndex, jobTitle, jobDescription }
        );
        return data.data;
      }),
    []
  );

  const improveAllBullets = useCallback(
    (resumeId: string, jobTitle = "", jobDescription = "") =>
      withLoading(async () => {
        const { data } = await apiClient.post<{ success: boolean; data: { results: BulletResult[] } }>(
          "/ai/improve-all-bullets",
          { resumeId, jobTitle, jobDescription }
        );
        return data.data.results;
      }),
    []
  );

  const generateSummary = useCallback(
    (resumeId: string, jobTitle = "", jobDescription = "") =>
      withLoading(async () => {
        const { data } = await apiClient.post<{ success: boolean; data: { original: string; improved: string } }>(
          "/ai/generate-summary",
          { resumeId, jobTitle, jobDescription }
        );
        return data.data;
      }),
    []
  );

  const suggestSkills = useCallback(
    (resumeId: string, jobDescription: string, jobTitle = "") =>
      withLoading(async () => {
        const { data } = await apiClient.post<{ success: boolean; data: { suggestions: SkillSuggestions } }>(
          "/ai/suggest-skills",
          { resumeId, jobDescription, jobTitle }
        );
        return data.data.suggestions;
      }),
    []
  );

  const enhanceAts = useCallback(
    (resumeId: string, atsResultId: string) =>
      withLoading(async () => {
        const { data } = await apiClient.post<{ success: boolean; data: { suggestions: AiSuggestion[] } }>(
          "/ai/enhance-ats",
          { resumeId, atsResultId }
        );
        return data.data.suggestions;
      }),
    []
  );

  const applyBullets = useCallback(
    async (resumeId: string, experienceIndex: number, bullets: string[]) => {
      await apiClient.post("/ai/apply-bullets", { resumeId, experienceIndex, bullets });
      toast.success("Bullets applied to your resume!");
    },
    []
  );

  const applySummary = useCallback(
    async (resumeId: string, summary: string) => {
      await apiClient.post("/ai/apply-summary", { resumeId, summary });
      toast.success("Summary applied to your resume!");
    },
    []
  );

  return {
    isLoading,
    improveBullets,
    improveAllBullets,
    generateSummary,
    suggestSkills,
    enhanceAts,
    applyBullets,
    applySummary,
  };
};
