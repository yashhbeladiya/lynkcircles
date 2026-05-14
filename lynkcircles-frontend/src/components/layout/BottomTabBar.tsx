import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { NAV_ITEMS } from "./navItems";

const BAR_HEIGHT = 64;

/**
 * Mobile bottom tab bar. Shows on <md breakpoints only. Picks the 5
 * highest-priority items (Home / Network / Works / Messages / one
 * extra) so we never overflow horizontally on a 320px viewport.
 *
 * Routing is wired in sub 5/5 — for now these are plain <a> tags so
 * the visual + a11y can be reviewed in isolation.
 */
export const BottomTabBar = () => {
  const items = NAV_ITEMS.filter((item) => item.mobile).slice(0, 5);

  return (
    <Paper
      component="nav"
      aria-label="Mobile primary"
      square
      elevation={0}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: BAR_HEIGHT,
        display: { xs: "flex", md: "none" },
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: "background.default",
        // Honor iOS safe area so the bar doesn't sit behind the home
        // indicator on iPhones.
        pb: "env(safe-area-inset-bottom)",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Box
            key={item.href}
            component="a"
            href={item.href}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              color: "text.secondary",
              gap: 0.5,
              minHeight: 44,
              "&:hover": { color: "text.primary" },
              "&:active": { color: "primary.main" },
            }}
            aria-label={item.label}
          >
            <Icon size={20} aria-hidden />
            <Typography
              variant="caption"
              sx={{ fontSize: "0.6875rem", fontWeight: 500 }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
};

export const BOTTOM_TAB_HEIGHT = BAR_HEIGHT;
