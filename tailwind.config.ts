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
        "display-lg": ["clamp(2.5rem, 7vw, 5.5rem)", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        "display-md": ["clamp(2rem, 4.5vw, 3.5rem)", { lineHeight: "0.92", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        // UI guidelines : un seul rayon par famille.
        // - rounded-md (6px) → cards, surfaces, inputs
        // - rounded-full     → pills et boutons ronds
        // - rounded-none     → photos
        // Les rayons lg / xl / 2xl / 3xl sont bannis.
        none: "0",
        xs: "2px",
        sm: "4px",
        md: "6px",
        full: "9999px",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
