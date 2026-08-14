import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    clearMocks: true,
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: Boolean(process.env.TAURI_ENV_DEBUG),
    rollupOptions: {
      output: {
        manualChunks: {
          "editor-core": ["@codemirror/state", "@codemirror/view", "@codemirror/commands"],
          "editor-markdown": [
            "@codemirror/lang-markdown",
            "@codemirror/search",
            "@codemirror/theme-one-dark",
          ],
          vendor: ["react", "react-dom", "zustand", "fuse.js"],
        },
      },
    },
  },
});
