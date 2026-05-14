import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import { TopNav } from "./TopNav";
import { BottomTabBar, BOTTOM_TAB_HEIGHT } from "./BottomTabBar";
import { CommandPalette } from "./CommandPalette";
import { useSocketLifecycle } from "@/hooks/useSocketLifecycle";

interface Props {
  children: React.ReactNode;
}

/**
 * The chrome around every authenticated page: top nav on desktop,
 * bottom tab bar on mobile, ⌘K command palette globally, and the
 * socket connection (mounted at this layer so the connection survives
 * navigation between pages).
 */
export const AppShell = ({ children }: Props) => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Establishes + tears down the socket as auth changes, and bridges
  // server events into the react-query cache so any page that reads
  // ["messages", ...] or ["conversations"] sees live updates.
  useSocketLifecycle();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopNav onOpenCommandPalette={openPalette} />
      <Box
        component="main"
        sx={{
          pb: { xs: `calc(${BOTTOM_TAB_HEIGHT}px + env(safe-area-inset-bottom))`, md: 0 },
        }}
      >
        {children}
      </Box>
      <BottomTabBar />
      <CommandPalette
        open={paletteOpen}
        onOpen={openPalette}
        onClose={closePalette}
      />
    </Box>
  );
};
