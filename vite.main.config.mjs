import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },
  build: {
    // Configurações específicas para o processo principal do Electron
    rollupOptions: {
      external: ['electron']
    }
  }
});
