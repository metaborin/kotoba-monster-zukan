import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages (https://<user>.github.io/kotoba-monster-zukan/) で配信するためのパス
  base: "/kotoba-monster-zukan/",
  plugins: [react()],
  server: {
    host: true,
  },
});
