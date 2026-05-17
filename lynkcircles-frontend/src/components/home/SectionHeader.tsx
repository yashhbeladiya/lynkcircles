import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ChevronRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional "See all" link slot. */
  seeAllHref?: string;
  seeAllLabel?: string;
}

/**
 * Section header for the Home dashboard. Eyebrow (uppercase mono),
 * larger title, optional description, and an optional "See all"
 * affordance on the right — clicking takes you to the dedicated page
 * (e.g. /works, /network) so Home stays a curated dashboard, not
 * the canonical surface.
 */
export const SectionHeader = ({
  eyebrow,
  title,
  description,
  seeAllHref,
  seeAllLabel = "See all",
}: Props) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 2,
      mb: 1.5,
      px: 0.5,
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      {eyebrow ? (
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", display: "block", fontSize: "0.6875rem" }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, fontSize: "1.0625rem", letterSpacing: "-0.01em" }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="caption"
          sx={{
            color: "text.tertiary",
            fontSize: "0.75rem",
            display: "block",
            mt: 0.25,
          }}
        >
          {description}
        </Typography>
      ) : null}
    </Box>
    {seeAllHref ? (
      <Box
        component={Link}
        to={seeAllHref}
        sx={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          color: "primary.main",
          fontSize: "0.75rem",
          fontWeight: 500,
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {seeAllLabel}
        <ChevronRight size={12} aria-hidden />
      </Box>
    ) : null}
  </Box>
);
