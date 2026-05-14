import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:5100",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5100",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
