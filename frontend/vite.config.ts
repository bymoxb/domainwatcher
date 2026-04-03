import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Aquí es donde se mapea el alias
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9876',
        changeOrigin: true,
      },
    },
  },
})
