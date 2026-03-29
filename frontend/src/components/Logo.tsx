import { cn } from "@/lib/utils";

// ── Logo mark (SVG icon only) ────────────────────────────────────────────────

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="rq-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="36" height="36" rx="9" fill="url(#rq-bg)" />

      {/* Inner subtle shine */}
      <rect width="36" height="18" rx="9" fill="white" fillOpacity="0.06" />

      {/* Person avatar — head circle */}
      <circle cx="11" cy="9.5" r="2.8" fill="white" fillOpacity="0.35" />
      {/* Person avatar — body arc */}
      <path
        d="M7.2 17 C7.2 14.2 8.8 12.5 11 12.5 C13.2 12.5 14.8 14.2 14.8 17 Z"
        fill="white"
        fillOpacity="0.2"
      />

      {/* Name line (header) */}
      <rect x="17" y="8.5" width="12" height="2.2" rx="1.1" fill="white" fillOpacity="0.9" />
      {/* Role/title line */}
      <rect x="17" y="12.5" width="8" height="1.6" rx="0.8" fill="white" fillOpacity="0.55" />

      {/* Horizontal divider */}
      <rect x="7.5" y="19" width="21" height="0.5" rx="0.25" fill="white" fillOpacity="0.12" />

      {/* Body content lines */}
      <rect x="7.5" y="21.5" width="17" height="1.6" rx="0.8" fill="white" fillOpacity="0.55" />
      <rect x="7.5" y="25"   width="12" height="1.6" rx="0.8" fill="white" fillOpacity="0.42" />
      <rect x="7.5" y="28.5" width="15" height="1.6" rx="0.8" fill="white" fillOpacity="0.32" />

      {/* AI sparkle — golden 4-point star, top-right */}
      <circle cx="27.5" cy="7" r="4.2" fill="rgba(251,191,36,0.14)" />
      <path
        d="M27.5 4 L28.35 6.15 L30.5 7 L28.35 7.85 L27.5 10 L26.65 7.85 L24.5 7 L26.65 6.15 Z"
        fill="#fbbf24"
      />
    </svg>
  );
}

// ── Full logo (mark + wordmark) ──────────────────────────────────────────────

interface LogoProps {
  size?: number;
  className?: string;
  /** "light" = white wordmark for dark BG (default), "dark" = dark wordmark for light BG */
  variant?: "light" | "dark";
}

export function Logo({ size = 32, className, variant = "light" }: LogoProps) {
  const textSizes: Record<string, string> = {
    "16": "text-base",
    "20": "text-lg",
    "24": "text-lg",
    "28": "text-xl",
    "32": "text-xl",
    "36": "text-2xl",
    "40": "text-2xl",
  };
  const textClass = textSizes[String(size)] ?? "text-xl";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span
        className={cn(
          textClass,
          "font-bold font-display tracking-tight",
          variant === "light"
            ? "bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
        )}
      >
        Resumiq
      </span>
    </div>
  );
}
