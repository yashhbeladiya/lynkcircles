import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "leaflet/dist/leaflet.css";

import "./index.css";
// Side-effect import — initializes i18next before any component
// renders so the first paint uses the chosen locale (detected from
// localStorage or browser language). Components read via the
// useTranslation hook.
import "./lib/i18n";
import App from "./App";
import { ThemeProvider } from "./theme/ThemeProvider";
import { createQueryClient } from "./lib/queryClient";

const queryClient = createQueryClient();

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: "0.875rem",
              borderRadius: 8,
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
