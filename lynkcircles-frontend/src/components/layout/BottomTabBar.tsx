import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { NavLink, useResolvedPath, useMatch } from "react-router-dom";
import { NAV_ITEMS, type NavItem } from "./navItems";

const BAR_HEIGHT = 64;

const Tab = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;
  const resolved = useResolvedPath(item.href);
  const matched = useMatch({
    path: resolved.pathname,
    end: item.href === "/",
  });
  const active = Boolean(matched);

  return (
    <Box
      component={NavLink}
      to={item.href}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        color: active ? "primary.main" : "text.secondary",
        gap: 0.5,
        minHeight: 44,
        transition: "color 120ms ease",
        "&:hover": { color: active ? "primary.main" : "text.primary" },
      }}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={20} aria-hidden />
      <Typography
        variant="caption"
        sx={{ fontSize: "0.6875rem", fontWeight: active ? 600 : 500 }}
      >
        {item.label}
      </Typography>
    </Box>
  );
};

/**
 * Mobile bottom tab bar. Shows on <md breakpoints only. Picks up to
 * 5 mobile-flagged items from navItems.ts.
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
        pb: "env(safe-area-inset-bottom)",
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      {items.map((item) => (
        <Tab key={item.href} item={item} />
      ))}
    </Paper>
  );
};

export const BOTTOM_TAB_HEIGHT = BAR_HEIGHT;
