import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { NavLink, useResolvedPath, useMatch } from "react-router-dom";
import { NAV_ITEMS, type NavItem } from "./navItems";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";

const BAR_HEIGHT = 64;

interface TabProps {
  item: NavItem;
  badgeCount?: number;
}

const Tab = ({ item, badgeCount = 0 }: TabProps) => {
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
      aria-label={
        badgeCount > 0 ? `${item.label} (${badgeCount} unread)` : item.label
      }
      aria-current={active ? "page" : undefined}
    >
      <Badge
        color="error"
        badgeContent={badgeCount}
        max={9}
        overlap="circular"
        invisible={badgeCount === 0}
        slotProps={{
          badge: {
            style: {
              fontSize: "0.625rem",
              height: 14,
              minWidth: 14,
              padding: "0 4px",
            },
          },
        }}
      >
        <Icon size={20} aria-hidden />
      </Badge>
      <Typography
        variant="caption"
        noWrap
        sx={{ fontSize: "0.625rem", fontWeight: active ? 600 : 500, maxWidth: "100%" }}
      >
        {item.label}
      </Typography>
    </Box>
  );
};

export const BottomTabBar = () => {
  const items = NAV_ITEMS.filter((item) => item.mobile).slice(0, 5);
  const unread = useUnreadNotificationCount();

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
        <Tab
          key={item.href}
          item={item}
          badgeCount={item.href === "/notifications" ? unread : 0}
        />
      ))}
    </Paper>
  );
};

export const BOTTOM_TAB_HEIGHT = BAR_HEIGHT;
