/**
 * Design tokens for the LynkCircles UI.
 *
 * Hybrid aesthetic: modern SaaS shell (Linear/Vercel-style typography and
 * spacing) with marketplace trust signals (emerald verified badges,
 * prominent CTAs). Tokens are the single source of truth — the MUI
 * theme factory (createAppTheme.ts) maps these into MUI palette/typography
 * so components stay theme-aware without hardcoding hex codes.
 *
 * Anchors:
 * - Neutral scale: zinc (warm grey, more interesting than pure neutral).
 * - Accent: indigo. Solid color shifts brightness with mode so contrast
 *   ratios stay AA on both backgrounds.
 * - Trust: emerald — used sparingly, only on verified badges and
 *   success states. Resist using it for primary CTAs.
 */

export type ColorMode = "light" | "dark";

const zinc = {
  50: "#fafafa",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#3f3f46",
  800: "#27272a",
  900: "#18181b",
  950: "#09090b",
} as const;

const indigo = {
  50: "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
  900: "#312e81",
} as const;

const emerald = {
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
} as const;

const rose = {
  400: "#fb7185",
  500: "#f43f5e",
  600: "#e11d48",
} as const;

const amber = {
  400: "#fbbf24",
  500: "#f59e0b",
  600: "#d97706",
} as const;

export const palette = { zinc, indigo, emerald, rose, amber } as const;

export const semantic = {
  light: {
    canvas: "#ffffff",
    surface: zinc[50],
    surfaceElevated: "#ffffff",
    borderSubtle: zinc[200],
    borderDefault: zinc[300],
    textPrimary: zinc[950],
    textSecondary: zinc[600],
    textTertiary: zinc[500],
    textOnAccent: "#ffffff",
    accentSolid: indigo[700],
    accentHover: indigo[800],
    accentBg: indigo[50],
    accentBgHover: indigo[100],
    accentBorder: indigo[200],
    trust: emerald[600],
    trustBg: "#ecfdf5",
    danger: rose[600],
    dangerBg: "#fff1f2",
    warning: amber[600],
    warningBg: "#fffbeb",
  },
  dark: {
    canvas: zinc[950],
    surface: zinc[900],
    surfaceElevated: zinc[800],
    borderSubtle: zinc[800],
    borderDefault: zinc[700],
    textPrimary: zinc[50],
    textSecondary: zinc[400],
    textTertiary: zinc[500],
    textOnAccent: "#ffffff",
    accentSolid: indigo[400],
    accentHover: indigo[300],
    accentBg: "rgba(99, 102, 241, 0.15)",
    accentBgHover: "rgba(99, 102, 241, 0.25)",
    accentBorder: "rgba(99, 102, 241, 0.3)",
    trust: emerald[400],
    trustBg: "rgba(16, 185, 129, 0.15)",
    danger: rose[400],
    dangerBg: "rgba(244, 63, 94, 0.15)",
    warning: amber[400],
    warningBg: "rgba(245, 158, 11, 0.15)",
  },
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
} as const;

export const shadows = {
  light: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
  },
  dark: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.4)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: '"Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono Variable", ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.8125rem",
    base: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
    wider: "0.04em",
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const;

export type SemanticColors = typeof semantic.light;
