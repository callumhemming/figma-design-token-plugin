import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Figma's UI iframe can't fetch external files (networkAccess is locked
// down), so ui.html must ship as one self-contained file with JS/CSS inlined.
export default defineConfig({
  root: "src",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "../dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: {
      input: "src/ui.html",
    },
  },
});
