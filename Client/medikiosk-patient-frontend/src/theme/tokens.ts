/**
 * MediKiosk design tokens — single source of truth.
 *
 * Deliberately minimal: one ink color, one brand color, one accent,
 * and a strict neutral scale. No gradients. No decorative color.
 * Mirrored in tailwind.config.js as CSS custom properties so both
 * Tailwind classes (bg-brand) and raw CSS (var(--color-brand)) work.
 */

export const colors = {
  ink: "#1A2422", // primary text
  inkMuted: "#5C6B68", // secondary text, labels, timestamps
  brand: "#0E5F5A", // primary actions, links, active states
  brandDark: "#0A4642", // hover/pressed
  accent: "#B5792F", // used ONLY for "needs attention" — uncertain fields, warnings
  success: "#3A7A52", // verified / reviewed / confirmed
  error: "#A6382F", // errors, rejected uploads
  bg: "#F6F7F6", // page background
  surface: "#FFFFFF", // cards, modals, panels
  border: "#DCE2E0", // dividers, input borders, card outlines
} as const;

export const fontSizeSteps = {
  standard: 1,
  large: 1.15,
  xlarge: 1.3,
} as const;

export type FontSizeStep = keyof typeof fontSizeSteps;

export const typography = {
  fontFamily:
    '"Inter", "IBM Plex Sans", system-ui, -apple-system, sans-serif',
  baseSizePx: 18, // minimum body size — never go below this
  scale: {
    xs: "0.875rem",
    sm: "1rem",
    base: "1.125rem", // 18px
    lg: "1.25rem",
    xl: "1.5rem",
    "2xl": "1.875rem",
    "3xl": "2.25rem",
  },
  lineHeight: 1.55,
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  full: "999px",
} as const;

export const shadow = {
  // Borders do most of the elevation work; shadow stays near-invisible.
  card: "0 1px 2px rgba(20, 30, 28, 0.04)",
  modal: "0 8px 24px rgba(20, 30, 28, 0.12)",
} as const;

/** Minimum touch target size for a kiosk / elderly-friendly UI. */
export const minTapTarget = 48; // px
