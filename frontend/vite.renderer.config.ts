// biome-ignore assist/source/organizeImports: need for proper rendering
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react({}), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup.ts"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
      },
    },
  },
});
