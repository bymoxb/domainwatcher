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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Aquí es donde se mapea el alias
    },
  },
  server: {
    proxy: {
      // Proxy requests starting with '/api'
      '/api': {
        target: 'http://localhost:9876', // The address of your backend server
        // changeOrigin: true, // Needed for virtual hosted sites
        // rewrite: (path) => path.replace(/^\/api/, ''), // Remove the '/api' prefix when forwarding
      },
    },
  },
})
