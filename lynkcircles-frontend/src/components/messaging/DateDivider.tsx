import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { format, isToday, isYesterday } from "date-fns";

const labelFor = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "PPP"); // e.g. "May 14th, 2026"
};

/**
 * Inline divider between groups of messages that fall on different
 * days. Subtle pill — informative without competing with the bubbles.
 */
export const DateDivider = ({ date }: { date: string | Date }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      my: 2,
      color: "text.tertiary",
    }}
  >
    <Box sx={{ flex: 1, height: 1, bgcolor: "divider" }} />
    <Typography
      variant="caption"
      sx={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
    >
      {labelFor(typeof date === "string" ? new Date(date) : date)}
    </Typography>
    <Box sx={{ flex: 1, height: 1, bgcolor: "divider" }} />
  </Box>
);
