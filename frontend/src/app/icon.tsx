import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #7c3aed, #4338ca)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* White top shine */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 16,
            background: "rgba(255,255,255,0.06)",
            borderRadius: "8px 8px 0 0",
          }}
        />

        {/* Resume lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 18, marginTop: 4 }}>
          <div style={{ width: 18, height: 2.5, borderRadius: 1.25, background: "rgba(255,255,255,0.9)" }} />
          <div style={{ width: 13, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.55)" }} />
          <div style={{ width: 15, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.45)" }} />
          <div style={{ width: 11, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.35)" }} />
        </div>

        {/* Golden sparkle dot - top right */}
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#fbbf24",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
