// CORREÇÃO EMERGENCIAL PARA TITLE BAR OVERLAY
// Execute este código no Console do DevTools (F12) quando o app estiver aberto

console.log('🚨 APLICANDO CORREÇÃO EMERGENCIAL DO TITLE BAR...');

// 1. Identificar elementos problemáticos
const titleBar = document.querySelector('.integrated-titlebar');
const sidebar = document.querySelector('[data-sidebar="sidebar"]');
const sidebarHeader = document.querySelector('[data-slot="sidebar-header"]');

console.log('🔍 Elementos encontrados:');
console.log('Title Bar:', titleBar);
console.log('Sidebar:', sidebar);  
console.log('Sidebar Header:', sidebarHeader);

// 2. Aplicar correção CSS direta
const emergencyCSS = `
/* CORREÇÃO EMERGENCIAL - TITLE BAR */
[data-sidebar="sidebar"] {
  position: fixed !important;
  top: 32px !important;
  height: calc(100vh - 32px) !important;
  z-index: 999 !important;
}

[data-slot="sidebar-header"],
[data-sidebar="header"] {
  margin-top: 0 !important;
  padding-top: 8px !important;
}

.integrated-titlebar {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100vw !important;
  height: 32px !important;
  z-index: 1000 !important;
  background: var(--sidebar-background) !important;
}

.app-content {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

body {
  margin: 0 !important;
  padding: 0 !important;
}
`;

// 3. Adicionar CSS ao documento
const styleElement = document.createElement('style');
styleElement.id = 'emergency-titlebar-fix';
styleElement.textContent = emergencyCSS;
document.head.appendChild(styleElement);

// 4. Forçar reposicionamento manual se necessário
setTimeout(() => {
  if (sidebar) {
    sidebar.style.position = 'fixed';
    sidebar.style.top = '32px';
    sidebar.style.height = 'calc(100vh - 32px)';
    sidebar.style.zIndex = '999';
  }
  
  if (titleBar) {
    titleBar.style.position = 'fixed';
    titleBar.style.top = '0';
    titleBar.style.left = '0';
    titleBar.style.right = '0';
    titleBar.style.width = '100vw';
    titleBar.style.height = '32px';
    titleBar.style.zIndex = '1000';
  }
  
  console.log('✅ CORREÇÃO APLICADA COM SUCESSO!');
  
  // 5. Verificar resultado
  const titleBarRect = titleBar?.getBoundingClientRect();
  const sidebarRect = sidebar?.getBoundingClientRect();
  
  console.log('📏 POSIÇÕES APÓS CORREÇÃO:');
  console.log('Title Bar - top:', titleBarRect?.top, 'bottom:', titleBarRect?.bottom);
  console.log('Sidebar - top:', sidebarRect?.top, 'bottom:', sidebarRect?.bottom);
  
  if (titleBarRect && sidebarRect) {
    const overlap = titleBarRect.bottom > sidebarRect.top && titleBarRect.top < sidebarRect.bottom;
    if (overlap) {
      console.error('❌ AINDA HÁ SOBREPOSIÇÃO');
    } else {
      console.log('✅ SOBREPOSIÇÃO CORRIGIDA!');
    }
  }
  
}, 100);

console.log('🎯 Correção emergencial aplicada. Verifique o resultado!');

// 6. Função para remover a correção se necessário
window.removerCorrecao = function() {
  const style = document.getElementById('emergency-titlebar-fix');
  if (style) style.remove();
  console.log('🗑️ Correção emergencial removida');
};