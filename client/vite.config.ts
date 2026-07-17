import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  define: {
    // Some CJS dependencies (e.g. react-draggable, used internally by react-grid-layout)
    // read arbitrary process.env.* properties at runtime. Vite only auto-replaces
    // process.env.NODE_ENV by default, so any other process.env access throws
    // "process is not defined" in the browser. Stub the whole object out.
    'process.env': '{}',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['apexcharts', 'react-apexcharts'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
