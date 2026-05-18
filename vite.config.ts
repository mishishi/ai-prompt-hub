import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/__tests__/setup.ts'],
      
      exclude: ['e2e/**', 'node_modules/**', 'src/__tests__/setup.ts', 'tests/**'],
    },
    server: {
      host: '127.0.0.1',
      port: 3006,
      proxy: {
        '/api/generate': {
          target: 'https://api.minimax.chat/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/generate/, '/text/chatcompletion_v2'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.MINIMAX_API_KEY || ''}`)
            })
          },
        },
        '/api': {
          target: 'http://127.0.0.1:3007',
          changeOrigin: true,
        },
      },
    },
  }
})