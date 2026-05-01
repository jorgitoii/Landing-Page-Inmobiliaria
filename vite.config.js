import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createReadStream, existsSync, statSync } from 'fs'
import { resolve, extname } from 'path'
import { fileURLToPath } from 'url'

// Safe __dirname for ES-module config files
const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Only intercept .ply and .json requests — let Vite serve images/video normally
const servePlyAssets = {
  name: 'serve-ply-assets',
  configureServer (server) {
    const assetDir = resolve(__dirname, '..', 'assets')
    server.middlewares.use((req, res, next) => {
      const url = req.url.split('?')[0]
      if (!url.startsWith('/assets/')) return next()
      const ext = extname(url).toLowerCase()
      if (ext !== '.ply' && ext !== '.json') return next()
      const file = resolve(assetDir, url.replace('/assets/', ''))
      if (!existsSync(file)) return next()
      const mime = ext === '.ply' ? 'application/octet-stream' : 'application/json'
      res.setHeader('Content-Type', mime)
      res.setHeader('Content-Length', statSync(file).size)
      createReadStream(file).pipe(res)
    })
  }
}

export default defineConfig({
  plugins: [vue(), servePlyAssets],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    emptyOutDir: false,
    outDir: 'dist',
  },
})
