import { defineConfig } from "vite";

// Bundles the plugin's main-thread code (runs in the Figma sandbox, not a
// browser) into a single classic script — no ESM/CJS wrapper, since Figma
// loads this file directly rather than as a module.
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    target: "es2017",
    lib: {
      entry: "src/code.ts",
      formats: ["iife"],
      name: "code",
      fileName: () => "code.js",
    },
  },
});
