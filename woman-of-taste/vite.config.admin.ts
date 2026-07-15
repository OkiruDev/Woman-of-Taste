import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Separate build for the admin portal — same source tree, different entry (admin.html →
// main.admin.tsx → AdminApp.tsx) and a different output dir so it can be deployed on its
// own Railway service/subdomain without shipping any admin code into the public bundle.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/admin"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "admin.html"),
    },
  },
});
