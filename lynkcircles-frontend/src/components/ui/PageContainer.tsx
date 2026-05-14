import Box from "@mui/material/Box";
import type { ReactNode } from "react";

type MaxWidth = "sm" | "md" | "lg" | "xl";

const WIDTHS: Record<MaxWidth, number> = {
  sm: 640,
  md: 800,
  lg: 1120,
  xl: 1320,
};

interface Props {
  children: ReactNode;
  /** Default 'lg' which is comfortable for a 2-3 column layout. */
  maxWidth?: MaxWidth;
  /** Disable horizontal padding on small screens (rare; default false). */
  disablePadding?: boolean;
}

/**
 * Consistent page wrapper. Caps width, applies responsive horizontal
 * padding, and vertical breathing room so every page lines up.
 */
export const PageContainer = ({
  children,
  maxWidth = "lg",
  disablePadding = false,
}: Props) => {
  return (
    <Box
      sx={{
        maxWidth: WIDTHS[maxWidth],
        mx: "auto",
        px: disablePadding ? 0 : { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
};
