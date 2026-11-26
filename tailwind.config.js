/** @type {import('tailwindcss').Config} */
// Design tokens live here AND as CSS custom properties in src/index.css (keep in sync).
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        page: "#0a0a0f",
        panel: "#111118",
        surface: "#16161f",
        raised: "#1c1c28",
        header: "#0f0f16",
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          hover: "rgba(255,255,255,0.15)",
          active: "rgba(129,140,248,0.3)",
        },
        accent: {
          indigo: "#818cf8",
          emerald: "#34d399",
          violet: "#c084fc",
          amber: "#fbbf24",
          rose: "#fb7185",
          cyan: "#22d3ee",
        },
        content: { DEFAULT: "#f1f1f4", secondary: "#9ca3af", dim: "#6b7280", onAccent: "#0a0a0f" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "Consolas", "monospace"],
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "none" } },
        toastIn: { from: { opacity: 0, transform: "translateX(16px)" }, to: { opacity: 1, transform: "none" } },
        riseIn: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: { fadeIn: "fadeIn 200ms ease-out", toastIn: "toastIn 180ms ease-out", riseIn: "riseIn 240ms ease-out both" },
    },
  },
  plugins: [],
};
