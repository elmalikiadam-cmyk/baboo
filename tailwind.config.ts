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
        // V3 éditorial chaleureux — palette de marque
        cream: {
          DEFAULT: "hsl(var(--cream))",
          2: "hsl(var(--cream-2))",
          3: "hsl(var(--cream-3))",
        },
        midnight: {
          DEFAULT: "hsl(var(--midnight))",
          2: "hsl(var(--midnight-2))",
          3: "hsl(var(--midnight-3))",
        },
        terracotta: {
          DEFAULT: "hsl(var(--terracotta))",
          2: "hsl(var(--terracotta-2))",
        },
        forest: {
          DEFAULT: "hsl(var(--forest))",
          2: "hsl(var(--forest-2))",
        },

        // Tokens système
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          warm: "hsl(var(--surface-warm))",
          cool: "hsl(var(--surface-cool))",
          muted: "hsl(var(--surface-warm))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
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

        // Compat V2 — legacy classes qui existent encore dans le codebase
        paper: {
          DEFAULT: "hsl(var(--background))",
          2: "hsl(var(--paper-2))",
          3: "hsl(var(--paper-3))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          soft: "hsl(var(--ink-soft))",
          muted: "hsl(var(--ink-muted))",
          foreground: "hsl(var(--ink-foreground))",
          2: "hsl(var(--ink-2))",
          3: "hsl(var(--ink-3))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Fraunces", "Times New Roman", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SF Mono", "monospace"],
      },
      borderRadius: {
        // V3 : rayons généreux, md/xl/2xl/3xl/full uniquement.
        none: "0",
        md: "6px",      // badges
        xl: "12px",     // inputs, photos internes
        "2xl": "16px",  // cards d'annonces, hero search block
        "3xl": "24px",  // dual blocks grand format
        full: "9999px",
        // Compat V2 — certains composants utilisent encore sm/lg/xs
        xs: "2px",
        sm: "6px",      // aliasé sur md
        lg: "12px",     // aliasé sur xl
      },
      boxShadow: {
        warm: "0 12px 30px -10px rgba(26, 37, 64, 0.15)",
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
