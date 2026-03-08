import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      // Proxy APK downloads through Vite so they are same-origin
      // This makes the browser respect the `download` attribute and
      // saves the file with the correct .apk filename instead of a UUID
      '/apk-download': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apk-download/, '/api/apk/download'),
      },
    },
  },
  build: {
    // Code-split large vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libs into separate cacheable chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-stream': ['stream-chat-react', '@stream-io/video-react-sdk'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-firebase': ['firebase/app', 'firebase/messaging'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
    // Increase chunk warning limit (stream SDK is large)
    chunkSizeWarningLimit: 800,
    // Minification target
    target: 'es2020',
  },
})
