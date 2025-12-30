import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        accent: "var(--accent)",
      },
      fontFamily: {
        serif: ["Crimson Pro", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        sm: "6px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        medium: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
