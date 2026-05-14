import { createTheme, type Theme } from "@mui/material/styles";
import {
  type ColorMode,
  radius,
  semantic,
  shadows,
  typography,
} from "./tokens";

/**
 * Maps semantic tokens onto MUI's theme so every component (Button, Card,
 * TextField, etc.) renders against the same palette as raw `sx` props.
 *
 * Why we override MUI's defaults aggressively:
 * - Default MUI buttons have an "uppercase" transform and shadows that
 *   read as 2014-era Material. We want Linear/Vercel-style modern SaaS:
 *   no uppercase, subtle shadows, tighter radii, denser typography.
 * - The default font sizes are 1rem (16px) body. Modern SaaS apps tend
 *   to use 14px body for density without sacrificing legibility.
 */
export const createAppTheme = (mode: ColorMode): Theme => {
  const tokens = semantic[mode];
  const elevation = shadows[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.accentSolid,
        contrastText: tokens.textOnAccent,
      },
      secondary: {
        main: tokens.trust,
        contrastText: tokens.textOnAccent,
      },
      error: { main: tokens.danger },
      warning: { main: tokens.warning },
      success: { main: tokens.trust },
      background: {
        default: tokens.canvas,
        paper: tokens.surfaceElevated,
      },
      text: {
        primary: tokens.textPrimary,
        secondary: tokens.textSecondary,
        disabled: tokens.textTertiary,
      },
      divider: tokens.borderSubtle,
    },
    shape: {
      borderRadius: radius.md,
    },
    typography: {
      fontFamily: typography.fontFamily.sans,
      fontSize: 14,
      htmlFontSize: 16,
      h1: {
        fontSize: typography.fontSize["4xl"],
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.tight,
        lineHeight: typography.lineHeight.tight,
      },
      h2: {
        fontSize: typography.fontSize["3xl"],
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.tight,
        lineHeight: typography.lineHeight.tight,
      },
      h3: {
        fontSize: typography.fontSize["2xl"],
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.tight,
        lineHeight: typography.lineHeight.snug,
      },
      h4: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.snug,
      },
      h5: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
      },
      h6: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
      },
      body1: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.lineHeight.normal,
      },
      body2: {
        fontSize: typography.fontSize.sm,
        lineHeight: typography.lineHeight.normal,
        color: tokens.textSecondary,
      },
      caption: {
        fontSize: typography.fontSize.xs,
        color: tokens.textTertiary,
      },
      overline: {
        fontFamily: typography.fontFamily.mono,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: "uppercase",
      },
      button: {
        textTransform: "none",
        fontWeight: typography.fontWeight.medium,
        letterSpacing: 0,
      },
    },
    shadows: [
      "none",
      elevation.sm,
      elevation.sm,
      elevation.md,
      elevation.md,
      elevation.md,
      elevation.lg,
      elevation.lg,
      elevation.lg,
      elevation.lg,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
      elevation.xl,
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: tokens.canvas,
            color: tokens.textPrimary,
            transition: "background-color 120ms ease, color 120ms ease",
          },
          "::selection": {
            backgroundColor: tokens.accentBg,
            color: tokens.textPrimary,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            paddingInline: 14,
            paddingBlock: 8,
            fontWeight: typography.fontWeight.medium,
          },
          outlined: {
            borderColor: tokens.borderDefault,
            color: tokens.textPrimary,
            "&:hover": {
              borderColor: tokens.borderDefault,
              backgroundColor: tokens.surface,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${tokens.borderSubtle}`,
          },
          elevation0: { border: "none" },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            border: `1px solid ${tokens.borderSubtle}`,
            backgroundColor: tokens.surfaceElevated,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            backgroundColor: tokens.canvas,
          },
          notchedOutline: {
            borderColor: tokens.borderDefault,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius.full,
            fontWeight: typography.fontWeight.medium,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: tokens.borderSubtle },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: tokens.surfaceElevated,
            color: tokens.textPrimary,
            border: `1px solid ${tokens.borderSubtle}`,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
            boxShadow: elevation.lg,
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: "default" },
        styleOverrides: {
          root: {
            backgroundColor: tokens.canvas,
            color: tokens.textPrimary,
            borderBottom: `1px solid ${tokens.borderSubtle}`,
          },
        },
      },
    },
  });
};
