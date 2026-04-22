import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          warm: "hsl(var(--surface-warm))",
          cool: "hsl(var(--surface-cool))",
          muted: "hsl(var(--surface-muted))",
        },
        paper: {
          DEFAULT: "hsl(var(--background))",
          2: "hsl(var(--paper-2))",
          3: "hsl(var(--paper-3))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          soft: "hsl(var(--ink-soft))",
          muted: "hsl(var(--ink-muted))",
          foreground: "hsl(var(--ink-foreground))",
          2: "hsl(var(--ink-2))",
          3: "hsl(var(--ink-3))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          soft: "hsl(var(--border-soft))",
          strong: "hsl(var(--border-strong))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          soft: "hsl(var(--accent-soft))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          soft: "hsl(var(--success-soft))",
        },
        danger: "hsl(var(--danger))",
      },
      fontFamily: {
        sans: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        body: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SF Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["clamp(1.5rem, 3.5vw, 2rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-md": ["1.375rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
      },
      borderRadius: {
        // V2 "Maison ouverte" : cartes rounded-2xl (20px),
        // boutons/inputs rounded-full, sticker rounded-sm pour étiquettes.
        none: "0",
        xs: "2px",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        full: "9999px",
      },
      boxShadow: {
        warm: "0 12px 30px -10px rgba(26, 24, 21, 0.15)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        out: "cubic-bezier(0.33, 1, 0.68, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
