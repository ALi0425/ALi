import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/ALi/' : '/',
  plugins: [tailwindcss()],
  server: {
    host: true,
    port: 5173,
  },
})
