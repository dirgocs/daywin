# Guia de Configuração do Vite no Projeto Daywin

## Estrutura de Configuração

Este projeto usa **Electron Forge** com múltiplas configurações do Vite para diferentes processos:

### Arquivos de Configuração

1. **`vite.config.ts`** - Configuração principal para desenvolvimento
2. **`vite.main.config.mjs`** - Processo principal do Electron
3. **`vite.renderer.config.mjs`** - Processo de renderização (UI)
4. **`vite.preload.config.mjs`** - Scripts de preload

### Por que Múltiplas Configurações?

O Electron tem diferentes processos que precisam de configurações específicas:

- **Main Process**: Executa Node.js, controla janelas
- **Renderer Process**: Executa no navegador, renderiza UI
- **Preload Scripts**: Ponte segura entre main e renderer

## Configuração do PGlite

### Problema
O PGlite pode ter problemas quando otimizado pelo Vite, causando:
- Exclusão de dependências essenciais
- Problemas de carregamento de módulos
- Erros de runtime

### Solução
Excluir o PGlite das otimizações em todas as configurações:

```javascript
export default defineConfig({
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  }
})
```

### Configurações Aplicadas

✅ **vite.config.ts** - Configuração principal
✅ **vite.main.config.mjs** - Processo principal
✅ **vite.renderer.config.mjs** - Processo de renderização

## Como Usar

### Desenvolvimento
```bash
npm start          # Inicia Electron com hot reload
npm run pglite:example  # Testa integração PGlite
```

### Build
```bash
npm run package    # Empacota aplicação
npm run make       # Cria instaladores
```

## Estrutura do Electron Forge

O arquivo `forge.config.js` define:

```javascript
plugins: [
  {
    name: '@electron-forge/plugin-vite',
    config: {
      build: [
        {
          entry: 'src/main.js',
          config: 'vite.main.config.mjs',
          target: 'main',
        },
        {
          entry: 'src/preload.js',
          config: 'vite.preload.config.mjs',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mjs',
        },
      ],
    },
  },
]
```

## Troubleshooting

### PGlite não carrega
1. Verificar se está excluído das otimizações
2. Limpar cache: `rm -rf node_modules/.vite`
3. Reinstalar dependências: `npm ci`

### Erros de build
1. Verificar configurações específicas por processo
2. Testar cada configuração individualmente
3. Verificar logs do Electron Forge

## Recursos

- [Electron Forge + Vite](https://www.electronforge.io/guides/framework-integration/vite)
- [Vite Configuration](https://vitejs.dev/config/)
- [PGlite Documentation](https://pglite.dev/)