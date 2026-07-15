import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  optimizeDeps: {
  include: ["recharts"],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logolc1.png", "logo192.png", "logo512.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/socket\.io/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "https://picsum.photos" ||
              url.origin === "https://ui-avatars.com" ||
              url.host.endsWith(".cloudinary.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "remote-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/v1/messages/conversations"),
            handler: "NetworkFirst",
            options: {
              cacheName: "conversations",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      manifest: {
        name: "LynkCircles",
        short_name: "LynkCircles",
        description:
          "Find skilled workers near you — carpenters, plumbers, electricians, tailors, cooks, and more.",
        theme_color: "#4338ca",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        categories: ["business", "lifestyle", "productivity"],
        icons: [
          { src: "/logolc1.png", sizes: "1755x1755", type: "image/png", purpose: "any" },
          { src: "/logo192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/logo512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
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
