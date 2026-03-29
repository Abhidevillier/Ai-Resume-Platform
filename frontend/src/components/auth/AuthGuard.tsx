"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "@/components/ui/LoadingSpinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after hydration — prevents flash-redirect on refresh
    if (isHydrated && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  // Show loader while reading from localStorage
  if (!isHydrated) return <PageLoader />;

  // Redirect is queued — don't flash protected content
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
