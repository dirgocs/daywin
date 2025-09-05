import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'

// Configuração principal do Vite para desenvolvimento
// Este projeto usa Electron Forge com configurações separadas:
// - vite.main.config.mjs (processo principal)
// - vite.preload.config.mjs (scripts de preload)
// - vite.renderer.config.mjs (processo de renderização)
export default defineConfig({
  plugins: [
    { enforce: 'pre', ...mdx() },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
  ],
  optimizeDeps: {
    // Excluir PGlite das otimizações do Vite
    // PGlite pode ter problemas quando otimizado pelo Vite
    exclude: ['@electric-sql/pglite']
  },
  build: {
    // Configurações de build para desenvolvimento
    sourcemap: true,
    minify: false
  },
  server: {
    // Configurações do servidor de desenvolvimento
    port: 3000,
    open: false // Não abrir automaticamente (Electron cuida disso)
  }
})