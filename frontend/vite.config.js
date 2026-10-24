import path from 'path'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  // root: path.resolve(__dirname, 'src'),
  css: {
    preprocessorOptions: {
        scss: {
            api: 'modern-compiler',
            quietDeps: true,
        },
    },
  },
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
  base: "/",
  plugins: [preact()],
  preview: {
    port: 3100,
    strictPort: true,
  },
  server: {
    watch: {
      usePolling: true,
    },
    port: 3100,
    strictPort: true,
    host: true,
    allowedHosts: ['tga-front'],
    // origin: "http://0.0.0.0:3000",
 },})
