import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Use a relative base so the app works on GitHub Pages subpaths and Vercel alike.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
