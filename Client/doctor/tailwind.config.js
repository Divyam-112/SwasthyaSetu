/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) — variables hold "r g b" triplets,
        // which is what makes bg-success/10, text-accent/30 etc. work.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          dark: "rgb(var(--color-brand-dark) / <alpha-value>)",
        },
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"Inter"', '"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.5" }],
        sm: ["1rem", { lineHeight: "1.5" }],
        base: ["1.125rem", { lineHeight: "1.55" }], // 18px minimum body text
        lg: ["1.25rem", { lineHeight: "1.55" }],
        xl: ["1.5rem", { lineHeight: "1.4" }],
        "2xl": ["1.875rem", { lineHeight: "1.3" }],
        "3xl": ["2.25rem", { lineHeight: "1.25" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 30, 28, 0.04)",
        modal: "0 8px 24px rgba(20, 30, 28, 0.12)",
      },
      spacing: {
        tap: "48px", // minimum tap target
      },
    },
  },
  plugins: [],
};
