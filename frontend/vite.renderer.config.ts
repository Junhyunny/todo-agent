// biome-ignore assist/source/organizeImports: need for proper rendering
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode ?? "development",
    path.resolve(__dirname, ".."),
    "VITE_",
  );
  return {
    plugins: [react({}), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      __API_BASE_URL__: JSON.stringify(
        env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
      ),
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest-setup.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/api/generated/**",
          "src/components/ui/**",
          "src/lib/**",
          "src/**/*.test.{ts,tsx}",
          "src/main.ts",
          "src/preload.ts",
          "src/renderer.ts",
          "src/main.tsx",
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8000",
        },
      },
    },
  };
});
