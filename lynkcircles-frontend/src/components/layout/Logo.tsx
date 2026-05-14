import Box from "@mui/material/Box";

interface Props {
  size?: "sm" | "md";
}

/**
 * Wordmark. Two pieces: a small mono glyph (◆) that sets the brand
 * character, and the wordmark "lynkcircles" tracked tight. Kept flat
 * and typography-driven on purpose — modern SaaS apps treat the logo
 * as a piece of typography rather than a separate illustrated mark.
 */
export const Logo = ({ size = "md" }: Props) => {
  const fontSize = size === "sm" ? "0.9375rem" : "1.0625rem";

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.75,
        fontWeight: 600,
        fontSize,
        letterSpacing: "-0.02em",
        color: "text.primary",
        userSelect: "none",
      }}
      aria-label="LynkCircles"
    >
      <Box
        component="span"
        sx={{
          fontFamily: "var(--mui-font-mono, monospace)",
          color: "primary.main",
          transform: "translateY(1px)",
          fontSize: "0.875em",
        }}
        aria-hidden
      >
        ◆
      </Box>
      lynkcircles
    </Box>
  );
};
