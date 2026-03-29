import { useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/apiClient";
import { useResumeStore } from "@/store/resumeStore";
import { Resume, ResumeFormData } from "@/types";
import { useAuthStore } from "@/store/authStore";

export const useResume = () => {
  const { resumes, setResumes, activeResume, setActiveResume, setIsSaving, resetForm } =
    useResumeStore();
  const { updateUser } = useAuthStore();

  const fetchResumes = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { resumes: Resume[] } }>(
        "/resumes"
      );
      setResumes(data.data.resumes);
    } catch {
      toast.error("Failed to load resumes");
    }
  }, [setResumes]);

  const createResume = useCallback(
    async (formData: ResumeFormData): Promise<Resume | null> => {
      setIsSaving(true);
      try {
        const { data } = await apiClient.post<{ success: boolean; data: { resume: Resume } }>(
          "/resumes",
          formData
        );
        const newResume = data.data.resume;
        setResumes([newResume, ...resumes]);
        updateUser({ resumeCount: resumes.length + 1 });
        toast.success("Resume saved!");
        return newResume;
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to save resume";
        toast.error(msg);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [resumes, setResumes, setIsSaving, updateUser]
  );

  const updateResume = useCallback(
    async (id: string, formData: ResumeFormData): Promise<Resume | null> => {
      setIsSaving(true);
      try {
        const { data } = await apiClient.put<{ success: boolean; data: { resume: Resume } }>(
          `/resumes/${id}`,
          formData
        );
        const updated = data.data.resume;
        setResumes(resumes.map((r) => (r._id === id ? updated : r)));
        setActiveResume(updated);
        toast.success("Resume saved!");
        return updated;
      } catch {
        toast.error("Failed to update resume");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [resumes, setResumes, setActiveResume, setIsSaving]
  );

  const deleteResume = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/resumes/${id}`);
        setResumes(resumes.filter((r) => r._id !== id));
        if (activeResume?._id === id) {
          setActiveResume(null);
          resetForm();
        }
        updateUser({ resumeCount: Math.max(0, resumes.length - 1) });
        toast.success("Resume deleted");
      } catch {
        toast.error("Failed to delete resume");
      }
    },
    [resumes, activeResume, setResumes, setActiveResume, resetForm, updateUser]
  );

  const duplicateResume = useCallback(
    async (id: string): Promise<Resume | null> => {
      try {
        const { data } = await apiClient.post<{ success: boolean; data: { resume: Resume } }>(
          `/resumes/${id}/duplicate`
        );
        const copy = data.data.resume;
        setResumes([copy, ...resumes]);
        updateUser({ resumeCount: resumes.length + 1 });
        toast.success("Resume duplicated!");
        return copy;
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to duplicate resume";
        toast.error(msg);
        return null;
      }
    },
    [resumes, setResumes, updateUser]
  );

  return { resumes, fetchResumes, createResume, updateResume, deleteResume, duplicateResume };
};
