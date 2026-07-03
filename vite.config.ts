import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" so the built app works when hosted from a subpath (e.g. GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: "./",
});
