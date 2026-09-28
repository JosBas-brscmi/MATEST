import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const configuredBase = process.env.VITE_BASE_PATH || '/'
const base = configuredBase === '/' ? '/' : `/${configuredBase.replace(/^\/+|\/+$/g, '')}/`
const basePath = base === '/' ? '' : base.slice(0, -1)

export default defineConfig({
  plugins: [react()],
  base,
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    proxy: {
      [`${basePath}/api`]: {
        target: 'http://127.0.0.1:3001',
        rewrite: (path) => basePath ? path.replace(basePath, '') : path,
      },
    },
  },
})
