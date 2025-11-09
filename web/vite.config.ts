import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5160,
    https: (() => {
      const keyPath = resolve(__dirname, 'certs/localhost-key.pem')
      const certPath = resolve(__dirname, 'certs/localhost-cert.pem')
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        }
      }
      return undefined
    })(),
    proxy: {
      '/api': {
        target: 'http://localhost:5060',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:5060',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: 5160,
    host: '0.0.0.0',  // Listen on all interfaces for remote cloudflared
    https: false,  // Cloudflare Tunnel handles HTTPS, use plain HTTP locally
    allowedHosts: [
      'thesim.bynolo.ca',
      'localhost',
      '192.168.1.13'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5060',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: 'http://localhost:5060',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
