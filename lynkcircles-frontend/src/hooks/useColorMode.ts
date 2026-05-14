import { useContext } from "react";
import { ColorModeContext } from "@/theme/ColorModeContext";

export const useColorMode = () => {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error("useColorMode must be used inside <ThemeProvider>");
  }
  return ctx;
};
