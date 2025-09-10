// Script de debug para identificar elementos do sidebar
// Execute este código no Console do DevTools do navegador

// 1. Adicionar cores temporárias para visualizar hierarquia
const style = document.createElement('style');
style.textContent = `
  [data-slot="sidebar-wrapper"] { background: red !important; }
  [data-slot="sidebar"] { background: blue !important; }
  [data-slot="sidebar-container"] { background: green !important; }
  [data-slot="sidebar-inner"] { background: yellow !important; }
  [data-slot="sidebar-content"] { background: purple !important; }
  [data-slot="sidebar-group"] { background: orange !important; }
`;
document.head.appendChild(style);

console.log('Cores de debug aplicadas!');

// 2. Verificar alturas dos elementos
const elements = [
  '[data-slot="sidebar-wrapper"]',
  '[data-slot="sidebar"]', 
  '[data-slot="sidebar-container"]',
  '[data-slot="sidebar-inner"]',
  '[data-slot="sidebar-content"]',
  '[data-slot="sidebar-group"]'
];

elements.forEach(selector => {
  const el = document.querySelector(selector);
  if (el) {
    const computed = getComputedStyle(el);
    console.log(`${selector}:`, {
      height: computed.height,
      minHeight: computed.minHeight,
      maxHeight: computed.maxHeight,
      offsetHeight: el.offsetHeight + 'px',
      scrollHeight: el.scrollHeight + 'px'
    });
  } else {
    console.log(`${selector}: elemento não encontrado`);
  }
});

// 3. Remover cores após 10 segundos
setTimeout(() => {
  document.head.removeChild(style);
  console.log('Cores de debug removidas!');
}, 10000);