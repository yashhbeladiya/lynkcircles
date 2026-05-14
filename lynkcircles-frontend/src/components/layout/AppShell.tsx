import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import { TopNav } from "./TopNav";
import { BottomTabBar, BOTTOM_TAB_HEIGHT } from "./BottomTabBar";
import { CommandPalette } from "./CommandPalette";

interface Props {
  children: React.ReactNode;
}

/**
 * The chrome around every authenticated page: top nav on desktop,
 * bottom tab bar on mobile, ⌘K command palette globally. Pages render
 * inside `{children}` and only need to think about their own content.
 */
export const AppShell = ({ children }: Props) => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopNav onOpenCommandPalette={openPalette} />
      <Box
        component="main"
        sx={{
          // Leave room for the bottom tab bar on mobile so content
          // doesn't render behind it. Desktop has no bottom bar so
          // padding collapses to 0.
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
