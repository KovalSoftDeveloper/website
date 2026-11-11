// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // sitemap needs the final domain; see public/robots.txt
  site: "https://kovalsoft.ca",
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), sitemap()],
  adapter: cloudflare(),
});
