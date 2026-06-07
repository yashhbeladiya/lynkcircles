import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  right?: React.ReactNode;
}

export const SectionHeader = ({
  title,
  seeAllHref,
  seeAllLabel = "See all",
  right,
}: Props) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      mb: 1.5,
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        fontSize: "1.0625rem",
        letterSpacing: "-0.015em",
      }}
    >
      {title}
    </Typography>
    {right ?? (seeAllHref ? (
      <Box
        component={Link}
        to={seeAllHref}
        sx={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          color: "primary.main",
          fontSize: "0.8125rem",
          fontWeight: 600,
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {seeAllLabel}
        <ChevronRight size={14} aria-hidden />
      </Box>
    ) : null)}
  </Box>
);
