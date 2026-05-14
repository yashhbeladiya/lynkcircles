import { createContext } from "react";
import type { ColorMode } from "./tokens";

export interface ColorModeContextValue {
  mode: ColorMode;
  toggleMode: () => void;
  setMode: (mode: ColorMode) => void;
}

export const ColorModeContext = createContext<ColorModeContextValue | null>(
  null
);
