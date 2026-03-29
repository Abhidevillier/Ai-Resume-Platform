import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Resumiq — AI-Powered Resume Builder",
    template: "%s | Resumiq",
  },
  description:
    "Build ATS-optimized resumes with AI. Get instant keyword analysis, GPT-4 powered rewrites, and land more interviews.",
  keywords: ["resume builder", "ATS checker", "AI resume", "career booster", "resumiq"],
  authors: [{ name: "Resumiq" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Resumiq — AI-Powered Resume Builder",
    description: "Build ATS-optimized resumes with AI in minutes.",
    siteName: "Resumiq",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e1b4b",
              color: "#ede9fe",
              fontSize: "14px",
              fontWeight: "500",
              borderRadius: "12px",
              border: "1px solid rgba(139,92,246,0.3)",
            },
            success: { iconTheme: { primary: "#8b5cf6", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#f87171", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
