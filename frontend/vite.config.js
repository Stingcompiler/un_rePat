import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // --- MONOLITH BUILD ---
  // Django serves everything from port 8000.
  // Build outputs:
  //   index.html  → backend/dist/index.html   (picked up by Django TemplateView)
  //   JS/CSS      → backend/dist/assets/       (served by Django at /static/assets/)
  //
  // Setting base='/static/' makes Vite prefix all asset references in
  // index.html with /static/, matching Django's STATIC_URL.
  base: '/static/',
  build: {
    outDir: '../backend/dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react'],
          'vendor-http': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  // --- DEVELOPMENT (npm run dev) ---
  // Keeps hot-reload on :5173 with API proxied to Django :8000.
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
