import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        paper: {
          DEFAULT: "hsl(var(--background))",
          2: "hsl(var(--paper-2))",
          3: "hsl(var(--paper-3))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          muted: "hsl(var(--surface-muted))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          2: "hsl(var(--ink-2))",
          3: "hsl(var(--ink-3))",
          foreground: "hsl(var(--ink-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          peach: "hsl(var(--accent-peach))",
          sage: "hsl(var(--accent-sage))",
        },
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["Bahnschrift", "var(--font-barlow)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SF Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["clamp(2.5rem, 7vw, 5.5rem)", { lineHeight: "0.92", letterSpacing: "-0.035em" }],
        "display-md": ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17, 24, 39, 0.04), 0 4px 12px -4px rgba(17, 24, 39, 0.06)",
        "soft-lg": "0 2px 4px rgba(17, 24, 39, 0.04), 0 12px 28px -8px rgba(17, 24, 39, 0.1), 0 24px 48px -16px rgba(17, 24, 39, 0.08)",
        glass: "inset 0 1px 0 0 rgba(255, 255, 255, 0.4), 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px -8px rgba(0, 0, 0, 0.08)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
