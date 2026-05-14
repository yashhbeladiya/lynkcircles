import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  /** Optional extra content slot (e.g. secondary link, illustration). */
  footer?: ReactNode;
}

/**
 * Empty-state pattern for lists, feeds, search results, etc. The icon
 * is rendered in a soft circular tint so it reads as graphic rather
 * than as a real button.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  footer,
}: Props) => {
  return (
    <Box
      role="status"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        py: 6,
        px: 3,
        gap: 1.5,
      }}
    >
      {Icon ? (
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            bgcolor: "action.hover",
            mb: 0.5,
          }}
        >
          <Icon size={26} aria-hidden />
        </Box>
      ) : null}
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 380 }}
        >
          {description}
        </Typography>
      ) : null}
      {action ? (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 1.5 }}
          onClick={action.onClick}
          href={action.href}
        >
          {action.label}
        </Button>
      ) : null}
      {footer ? <Box sx={{ mt: 1 }}>{footer}</Box> : null}
    </Box>
  );
};
