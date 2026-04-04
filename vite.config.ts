import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MathApp/', // GitHub Pages base path
  server: {
    host: true, // Expose on local network for dev
  },
  preview: {
    host: true,
    port: 4173,
  },
})
