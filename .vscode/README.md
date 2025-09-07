# Configuração do VS Code para Tailwind CSS v4

Este diretório contém as configurações necessárias para resolver os warnings do Tailwind CSS v4 no VS Code.

## Arquivos de Configuração

### `settings.json`
- Desabilita a validação CSS nativa do VS Code
- Configura o Tailwind CSS IntelliSense
- Define associações de arquivo para melhor suporte
- Ignora regras CSS desconhecidas (unknownAtRules)

### `css_custom_data.json`
- Define as diretivas customizadas do Tailwind CSS v4:
  - `@plugin`
  - `@theme`
  - `@custom-variant`
  - `@apply`
  - `@tailwind`
  - `@layer`
  - `@config`

### `extensions.json`
- Lista as extensões recomendadas para o projeto
- Inclui o Tailwind CSS IntelliSense

## Como Resolver os Warnings

1. **Instale a extensão Tailwind CSS IntelliSense** se ainda não estiver instalada
2. **Recarregue o VS Code** após criar estes arquivos
3. **Reinicie o Language Server** se necessário:
   - Abra a Command Palette (Ctrl+Shift+P)
   - Execute: "Developer: Reload Window"

## Verificação

Após aplicar essas configurações, os warnings relacionados às diretivas do Tailwind CSS v4 devem desaparecer:
- `@plugin`
- `@custom-variant`
- `@theme`
- `@apply`

Se os warnings persistirem, tente:
1. Fechar e reabrir o arquivo CSS
2. Reiniciar o VS Code completamente
3. Verificar se a extensão Tailwind CSS IntelliSense está ativa