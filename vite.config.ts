import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const apiProxyTarget = process.env.VITE_API_URL ?? 'http://localhost:5163'
const allowedHosts = ['westchesterepic.com', 'www.westchesterepic.com']

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': apiProxyTarget,
      '/uploads': apiProxyTarget,
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts,
  },
})
