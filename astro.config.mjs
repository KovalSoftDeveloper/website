// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // sitemap needs the final domain; see public/robots.txt
  site: "https://kovalsoft.com",
  // Contact form. All optional so the site builds without them; the form
  // explains itself when they are missing. Values live in .env / Cloudflare.
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      RESEND_FROM: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      CONTACT_INBOX: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      TURNSTILE_SITE_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_CONTACT_EMAIL: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Familjen Grotesk",
      cssVariable: "--font-familjen",
      weights: [500, 600, 700],
      fallbacks: ["sans-serif"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    // Native file events don't arrive in a sandboxed shell; polling always sees edits.
    server: { watch: { usePolling: true, interval: 300 } },
  },

  integrations: [react(), sitemap()],
  adapter: cloudflare(),
});
