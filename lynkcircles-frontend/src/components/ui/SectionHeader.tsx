import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface Props {
  /** Mono overline above the title — used for category/section labels. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned action slot (button, link, filter). */
  action?: ReactNode;
}

/**
 * Section header with an optional mono "eyebrow", a title, an optional
 * description, and a right-aligned action slot. The eyebrow uses the
 * mono variant + uppercase tracking to telegraph hierarchy without
 * shouting visually.
 */
export const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
}: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "flex-end" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
        mb: 2,
      }}
    >
      <Box>
        {eyebrow ? (
          <Typography
            variant="overline"
            sx={{ display: "block", color: "text.tertiary", mb: 0.5 }}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box>{action}</Box> : null}
    </Box>
  );
};
