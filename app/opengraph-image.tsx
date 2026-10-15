import { ImageResponse } from "next/og";
export const alt = "Welquim Panogaling — Full-Stack Web Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#fafafa",
        width: "100%",
        height: "100%",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        color: "#111",
      }}
    >
      <div style={{ fontSize: 22, color: "#737373", letterSpacing: 4 }}>
        THOUGHTFUL INTERFACES. SOLID FOUNDATIONS.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontWeight: 800,
          fontSize: 90,
          lineHeight: 1.05,
          letterSpacing: -5,
          marginTop: 55,
        }}
      >
        <span>Welquim</span>
        <span style={{ display: "flex" }}>
          Panogaling<span style={{ color: "#22c55e" }}>.</span>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 26,
          color: "#737373",
        }}
      >
        Full-Stack Web Developer · Laravel / React / Next.js / MySQL
      </div>
    </div>,
    size,
  );
}
