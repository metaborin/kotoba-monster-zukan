import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // GitHub Pages (https://<user>.github.io/kotoba-monster-zukan/) で配信するためのパス
  base: "/kotoba-monster-zukan/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png", "icons/favicon-64x64.png"],
      manifest: {
        name: "ことばモンスターずかん 1ねんせい",
        short_name: "ことばずかん",
        description:
          "こくごの もんだいを といて、ことばモンスターと なかよくなる 小学1年生向け学習ゲーム",
        lang: "ja",
        display: "standalone",
        theme_color: "#ffedb3",
        background_color: "#fef6e4",
        icons: [
          {
            src: "icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // モンスター画像も含めて全アセットを事前キャッシュし、オフラインでも遊べるようにする
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
      },
    }),
  ],
  server: {
    host: true,
  },
});
