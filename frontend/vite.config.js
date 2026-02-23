import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    sourcemap: false
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})