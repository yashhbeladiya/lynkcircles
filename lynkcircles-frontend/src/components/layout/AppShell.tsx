import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import { TopNav } from "./TopNav";
import { BottomTabBar, BOTTOM_TAB_HEIGHT } from "./BottomTabBar";
import { CommandPalette } from "./CommandPalette";
import { useSocketLifecycle } from "@/hooks/useSocketLifecycle";

interface Props {
  children: React.ReactNode;
}

export const AppShell = ({ children }: Props) => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useSocketLifecycle();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          left: 16,
          top: 16,
          zIndex: (t) => t.zIndex.tooltip + 1,
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontSize: "0.875rem",
          fontWeight: 600,
          textDecoration: "none",
          transform: "translateY(-200%)",
          transition: "transform 120ms ease",
          "&:focus": { transform: "translateY(0)" },
        }}
      >
        Skip to main content
      </Box>
      <TopNav onOpenCommandPalette={openPalette} />
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          pb: { xs: `calc(${BOTTOM_TAB_HEIGHT}px + env(safe-area-inset-bottom))`, md: 0 },
          "&:focus": { outline: "none" },
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
