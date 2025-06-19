import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'animation-vendor': ['framer-motion'],
          'ui-vendor': ['react-intersection-observer', 'react-helmet-async'],
          
          // Admin chunks (loaded only when needed)
          'admin-vendor': [
            './src/pages/AdminDashboard',
            './src/pages/AdminLogin',
            './src/components/admin/Dashboard',
            './src/components/admin/ProjectsManager',
            './src/components/admin/MessagesManager',
            './src/components/admin/SettingsManager'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-intersection-observer'
    ],
    exclude: [
      // Exclude heavy admin components from dev optimization
      './src/components/admin/*'
    ]
  }
})