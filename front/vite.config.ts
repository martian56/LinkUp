import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: '[name]-[hash][extname]',
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: '[name]-[hash].js'
      }
    }
  }
})

