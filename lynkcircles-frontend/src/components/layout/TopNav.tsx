import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { NavLink, Link as RouterLink, useResolvedPath, useMatch } from "react-router-dom";
import { Moon, Sun, Search } from "lucide-react";

import { Logo } from "./Logo";
import { NAV_ITEMS, type NavItem } from "./navItems";
import { UserMenu } from "./UserMenu";
import { useColorMode } from "@/hooks/useColorMode";

const HEADER_HEIGHT = 60;

interface Props {
  onOpenCommandPalette: () => void;
}

const NavIconLink = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;
  const resolved = useResolvedPath(item.href);
  const matched = useMatch({
    path: resolved.pathname,
    end: item.href === "/",
  });
  const active = Boolean(matched);

  return (
    <Tooltip title={item.label} placement="bottom">
      <IconButton
        component={NavLink}
        to={item.href}
        size="medium"
        sx={{
          color: active ? "primary.main" : "text.secondary",
          backgroundColor: active ? "action.selected" : "transparent",
          borderRadius: 1.5,
          "&:hover": {
            color: active ? "primary.main" : "text.primary",
            backgroundColor: "action.hover",
          },
        }}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={18} aria-hidden />
      </IconButton>
    </Tooltip>
  );
};

/**
 * Desktop / tablet top navigation. Hidden on mobile (<md breakpoint),
 * where the BottomTabBar takes over.
 */
export const TopNav = ({ onOpenCommandPalette }: Props) => {
  const { mode, toggleMode } = useColorMode();
  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <AppBar
      position="sticky"
      sx={{
        display: { xs: "none", md: "block" },
        height: HEADER_HEIGHT,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          height: HEADER_HEIGHT,
          minHeight: HEADER_HEIGHT,
          gap: 3,
          px: { md: 3, lg: 4 },
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{ textDecoration: "none", color: "inherit" }}
        >
          <Logo />
        </Box>

        <Box
          component="button"
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Open search"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            flex: "0 1 320px",
            ml: 2,
            px: 1.5,
            py: 0.875,
            background: "transparent",
            border: 1,
            borderColor: "divider",
            borderRadius: 999,
            color: "text.secondary",
            fontSize: "0.8125rem",
            cursor: "pointer",
            transition: "border-color 120ms ease, background 120ms ease",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "action.hover",
            },
          }}
        >
          <Search size={14} aria-hidden />
          <Box component="span" sx={{ flex: 1, textAlign: "left" }}>
            Search
          </Box>
          <Box
            component="span"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6875rem",
              px: 0.75,
              py: 0.25,
              border: 1,
              borderColor: "divider",
              borderRadius: 0.75,
            }}
            aria-hidden
          >
            {isMac ? "⌘K" : "Ctrl K"}
          </Box>
        </Box>

        <Stack
          component="nav"
          direction="row"
          aria-label="Primary"
          sx={{
            ml: "auto",
            gap: 0.5,
            alignItems: "center",
          }}
        >
          {NAV_ITEMS.filter((item) => item.desktop).map((item) => (
            <NavIconLink key={item.href} item={item} />
          ))}

          <Box sx={{ width: 1, height: 24, bgcolor: "divider", mx: 1 }} />

          <Tooltip
            title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <IconButton
              onClick={toggleMode}
              size="medium"
              aria-label="Toggle color mode"
              sx={{
                color: "text.secondary",
                borderRadius: 1.5,
                "&:hover": { color: "text.primary" },
              }}
            >
              {mode === "dark" ? (
                <Sun size={18} aria-hidden />
              ) : (
                <Moon size={18} aria-hidden />
              )}
            </IconButton>
          </Tooltip>

          <UserMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export const TOP_NAV_HEIGHT = HEADER_HEIGHT;
