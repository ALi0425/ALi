import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/ALi/' : '/',
  plugins: [tailwindcss(), cloudflare()],
  server: {
    host: true,
    port: 5173,
  },
})