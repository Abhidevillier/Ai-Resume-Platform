import type React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely — handles conditional classes + conflicts.
 * Usage: cn("px-4", isActive && "bg-primary-500", "px-6") → "bg-primary-500 px-6"
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Format a date string to "Month Year"
 * e.g. "2024-01-15" → "January 2024"
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr || dateStr.toLowerCase() === "present") return "Present";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // return as-is if invalid
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

/**
 * Get ATS score color class based on score value
 */
export const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

/**
 * Get ATS score background color for progress bar
 */
export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

/**
 * Convert paise to INR string
 * e.g. 49900 → "₹499"
 */
export const paiseToINR = (paise: number): string =>
  `₹${(paise / 100).toLocaleString("en-IN")}`;

/**
 * Sleep utility for dev/testing
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Avatar color presets for profile customization
 */
export const AVATAR_COLORS = [
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#2563eb", label: "Blue" },
  { hex: "#059669", label: "Emerald" },
  { hex: "#d97706", label: "Amber" },
  { hex: "#dc2626", label: "Red" },
  { hex: "#db2777", label: "Pink" },
] as const;

/**
 * Returns true if the avatar field is a hex color string
 */
export const hasCustomAvatar = (avatar: string | null | undefined): boolean =>
  !!avatar && /^#[0-9a-fA-F]{6}$/.test(avatar);

/**
 * Returns inline style for avatar background.
 * Uses hex color if custom, otherwise falls back to violet-indigo gradient.
 */
export const getAvatarStyle = (avatar: string | null | undefined): React.CSSProperties =>
  hasCustomAvatar(avatar)
    ? { background: avatar as string }
    : { background: "linear-gradient(135deg, #7c3aed, #4f46e5)" };
