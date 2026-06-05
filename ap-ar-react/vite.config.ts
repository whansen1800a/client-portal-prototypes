import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/client-portal-prototypes/ap-ar-react-build/',
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  build: {
    outDir: '../ap-ar-react-build',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
  },
  server: { port: 5174 }
})
