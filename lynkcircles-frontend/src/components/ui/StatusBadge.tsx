import Box from "@mui/material/Box";
import { ShieldCheck, Sparkles, Flame, Award } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "trust" | "info" | "warning" | "neutral";

interface Props {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md";
}

const toneToken = (tone: Tone): "success" | "primary" | "warning" | "neutral" => {
  if (tone === "trust") return "success";
  if (tone === "info") return "primary";
  if (tone === "warning") return "warning";
  return "neutral";
};

/**
 * Inline status pill — used for "Verified", "New", "Featured", "Hot",
 * etc. Tinted background via CSS color-mix so the chip stays readable
 * on both light and dark surfaces without per-mode style branches.
 */
export const StatusBadge = ({
  tone = "neutral",
  icon,
  children,
  size = "sm",
}: Props) => {
  const token = toneToken(tone);

  return (
    <Box
      component="span"
      sx={(theme) => {
        const main =
          token === "neutral"
            ? theme.palette.text.secondary
            : theme.palette[token].main;
        return {
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: size === "sm" ? 0.875 : 1.25,
          py: size === "sm" ? 0.25 : 0.5,
          borderRadius: 999,
          fontSize: size === "sm" ? "0.6875rem" : "0.75rem",
          fontWeight: 500,
          lineHeight: 1.2,
          color: main,
          background: `color-mix(in oklab, ${main} 14%, transparent)`,
        };
      }}
    >
      {icon}
      {children}
    </Box>
  );
};

// Conveniences for common cases — same component, presets applied.
export const VerifiedBadge = () => (
  <StatusBadge tone="trust" icon={<ShieldCheck size={12} />}>
    Verified
  </StatusBadge>
);

export const NewBadge = () => (
  <StatusBadge tone="info" icon={<Sparkles size={12} />}>
    New
  </StatusBadge>
);

export const HotBadge = () => (
  <StatusBadge tone="warning" icon={<Flame size={12} />}>
    Hot
  </StatusBadge>
);

export const TopRatedBadge = () => (
  <StatusBadge tone="trust" icon={<Award size={12} />}>
    Top rated
  </StatusBadge>
);
