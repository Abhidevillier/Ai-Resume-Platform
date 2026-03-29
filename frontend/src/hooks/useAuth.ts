import { useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

interface LoginPayload  { email: string; password: string }
interface SignupPayload { name: string; email: string; password: string }

interface AuthApiResponse {
  success: boolean;
  accessToken: string;
  user: User;
  message?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, updateUser, setLoading } =
    useAuthStore();

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      try {
        const { data } = await apiClient.post<AuthApiResponse>("/auth/login", payload);
        setAuth(data.user, data.accessToken);
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
        router.push("/dashboard");
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Login failed. Please check your credentials.";
        toast.error(msg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth, setLoading]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setLoading(true);
      try {
        const { data } = await apiClient.post<AuthApiResponse>("/auth/signup", payload);
        setAuth(data.user, data.accessToken);
        toast.success("Account created! Welcome to Resumiq.");
        router.push("/dashboard");
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Signup failed. Please try again.";
        toast.error(msg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Clear local state regardless of server response
    }
    clearAuth();
    Cookies.remove("accessToken");
    toast.success("Logged out");
    router.push("/auth/login");
  }, [clearAuth, router]);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: { user: User } }>("/auth/me");
      updateUser(data.data.user);
    } catch {
      clearAuth();
    }
  }, [clearAuth, updateUser]);

  const updateProfile = useCallback(
    async (payload: { name?: string; avatar?: string }) => {
      setLoading(true);
      try {
        const { data } = await apiClient.patch<{ success: boolean; data: { user: User } }>(
          "/auth/update-profile",
          payload
        );
        updateUser(data.data.user);
        toast.success("Profile updated successfully.");
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to update profile.";
        toast.error(msg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, updateUser]
  );

  const changePassword = useCallback(
    async (payload: { currentPassword: string; newPassword: string }) => {
      setLoading(true);
      try {
        await apiClient.patch("/auth/change-password", payload);
        toast.success("Password changed successfully.");
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to change password.";
        toast.error(msg);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const deleteAccount = useCallback(async () => {
    try {
      await apiClient.delete("/auth/delete-account");
      clearAuth();
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      localStorage.removeItem("auth-storage");
      toast.success("Account deleted.");
      router.push("/");
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete account.";
      toast.error(msg);
      throw error;
    }
  }, [clearAuth, router]);

  return { user, isAuthenticated, isLoading, login, signup, logout, fetchMe, updateProfile, changePassword, deleteAccount };
};
