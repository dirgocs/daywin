# Daywin - Especificação de Design do Title Bar Integrado

## Visão Geral

Este documento define a especificação completa de design para o title bar do aplicativo Daywin, que deve ser completamente integrado à interface, criando uma experiência visual contínua e moderna.

## Objetivos de Design

### Princípio Fundamental
O title bar deve ser **invisível como elemento separado**, integrando-se perfeitamente com o layout do aplicativo para criar uma interface coesa e moderna.

### Objetivos Específicos
1. **Integração Visual Completa**: O title bar deve parecer uma extensão natural do sidebar
2. **Minimalismo Funcional**: Apenas elementos essenciais (controles de janela)
3. **Usabilidade Preservada**: Manter funcionalidade de arrastar janela
4. **Consistência de Layout**: Não sobrepor nem interferir com outros elementos

## Especificações Técnicas Detalhadas

### 1. Estrutura Visual

#### 1.1 Dimensões
- **Altura**: 32px (padrão para aplicativos modernos)
- **Largura**: 100% da janela
- **Posição**: Topo da janela, sem margem ou padding externo

#### 1.2 Cor e Material
- **Background**: Idêntico ao sidebar (`--sidebar-background` ou equivalente Tailwind)
- **Transparência**: Opaca (sem efeitos de transparência)
- **Gradientes**: Nenhum
- **Texturas**: Nenhuma

#### 1.3 Bordas e Separadores
- **Bordas**: Nenhuma
- **Shadow**: Nenhuma
- **Separadores**: Nenhum divisor visual entre title bar e conteúdo

### 2. Conteúdo e Elementos

#### 2.1 Elementos Proibidos
- ❌ Texto do título do aplicativo
- ❌ Logo ou ícone do aplicativo
- ❌ Menu bar ou elementos de navegação
- ❌ Breadcrumbs ou indicadores de localização
- ❌ Botões de ação ou ferramentas
- ❌ Status indicators

#### 2.2 Elementos Obrigatórios
- ✅ Controles de janela (minimizar, maximizar, fechar)
- ✅ Área draggable para mover a janela

### 3. Controles de Janela

#### 3.1 Posicionamento
- **Localização**: Canto superior direito
- **Alinhamento**: Alinhados à direita com padding de 8px da borda
- **Espaçamento**: 2px entre os botões

#### 3.2 Dimensões dos Controles
- **Largura do botão**: 46px
- **Altura do botão**: 32px (mesma altura do title bar)
- **Área ativa**: Toda a área do botão

#### 3.3 Styling dos Controles
```css
.window-controls {
  background: transparent;
  border: none;
  color: var(--sidebar-foreground);
  transition: background-color 0.15s ease;
}

.window-controls:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-button:hover {
  background: #e81123;
  color: white;
}
```

#### 3.4 Ícones dos Controles
- **Minimizar**: `−` (U+2212 Minus Sign)
- **Maximizar**: `□` (U+25A1 White Square) / `❐` (U+2750 quando maximizado)
- **Fechar**: `×` (U+00D7 Multiplication Sign)

### 4. Área Draggable

#### 4.1 Região Ativa
- **Extensão**: Toda a largura do title bar
- **Exceções**: Área dos controles de janela (não draggable)
- **Altura**: 32px completos

#### 4.2 Implementação CSS
```css
.integrated-titlebar {
  -webkit-app-region: drag;
  app-region: drag;
  user-select: none;
}

.window-controls {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}
```

### 5. Responsividade e Estados

#### 5.1 Estados da Janela
- **Windowed**: Layout normal
- **Maximized**: Controles mantêm posição, sem alteração visual
- **Focus/Unfocus**: Sem alteração visual (mantém consistência)

#### 5.2 Comportamento Cross-Platform
- **Windows**: Usar `titleBarOverlay` com cores personalizadas
- **macOS**: Usar `titleBarStyle: 'hiddenInset'` com `trafficLightPosition`
- **Linux**: Comportamento similar ao Windows

### 6. Integração com Layout

#### 6.1 Relação com Sidebar
- **Alinhamento**: Title bar deve ter exatamente a mesma cor do sidebar
- **Continuidade**: Sem linha de separação visual
- **Flow**: Title bar flui naturalmente para o sidebar

#### 6.2 Relação com Área Principal
- **Separação**: Sem border ou shadow entre title bar e conteúdo principal
- **Sobreposição**: Zero sobreposição com elementos funcionais
- **Z-index**: Menor que modals, maior que conteúdo normal

### 7. Configuração Electron

#### 7.1 BrowserWindow Options
```javascript
new BrowserWindow({
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#1f1f23',        // Cor do sidebar
    symbolColor: '#ffffff',   // Cor dos ícones
    height: 32
  },
  frame: false,              // Remove frame nativo
  trafficLightPosition: { x: 15, y: 10 }  // macOS only
})
```

#### 7.2 Segurança e Performance
- Context isolation mantido
- IPC handlers para controles de janela
- Validação de inputs dos controles

### 8. Customizações Avançadas Cross-Platform

#### 8.1 Configurações Específicas por Plataforma

##### 8.1.1 Windows e Linux - Window Controls Overlay
```javascript
// Configuração inicial
new BrowserWindow({
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#1f1f23',           // Cor do fundo do title bar
    symbolColor: '#ffffff',      // Cor dos ícones dos controles
    height: 32                   // Altura em pixels
  },
  frame: false,
  thickFrame: true              // Mantém sombra e animações no Windows
})

// Atualização dinâmica das cores
win.setTitleBarOverlay({
  color: themeManager.getCurrentSidebarColor(),
  symbolColor: themeManager.getCurrentForegroundColor(),
  height: 32
})
```

##### 8.1.2 macOS - Traffic Light Controls
```javascript
// Configuração com posicionamento personalizado
new BrowserWindow({
  titleBarStyle: 'hidden',
  trafficLightPosition: { x: 15, y: 10 },
  titleBarOverlay: true,
  vibrancy: 'titlebar',         // Efeito de transparência opcional
  visualEffectState: 'active'   // Sempre ativo
})

// Controle programático da visibilidade
win.setWindowButtonVisibility(true)   // Mostra os traffic lights
win.setWindowButtonVisibility(false)  // Esconde os traffic lights

// Posicionamento dinâmico
win.setWindowButtonPosition({ x: 15, y: 10 })
```

##### 8.1.3 Alternativas de titleBarStyle

**Para macOS:**
```javascript
// Opção 1: Oculto com inset (recomendado)
titleBarStyle: 'hiddenInset'

// Opção 2: Botões aparecem ao hover (experimental)
titleBarStyle: 'customButtonsOnHover'

// Opção 3: Completamente oculto
titleBarStyle: 'hidden'
```

**Para Windows/Linux:**
```javascript
// Sempre usar 'hidden' com titleBarOverlay
titleBarStyle: 'hidden',
titleBarOverlay: true
```

#### 8.2 Detecção e Adaptação de Sistema

##### 8.2.1 Detecção de Plataforma
```javascript
const { platform } = require('os')
const isMac = platform() === 'darwin'
const isWindows = platform() === 'win32'
const isLinux = platform() === 'linux'

// Configuração adaptativa
function createAdaptiveWindow() {
  const baseOptions = {
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  }

  if (isMac) {
    return new BrowserWindow({
      ...baseOptions,
      trafficLightPosition: { x: 15, y: 10 },
      titleBarOverlay: true,
      vibrancy: 'titlebar'
    })
  } else {
    return new BrowserWindow({
      ...baseOptions,
      titleBarOverlay: {
        color: '#1f1f23',
        symbolColor: '#ffffff',
        height: 32
      },
      frame: false
    })
  }
}
```

##### 8.2.2 CSS Adaptativo com Environment Variables
```css
:root {
  --titlebar-bg: var(--sidebar-background);
  --titlebar-fg: var(--sidebar-foreground);
  --titlebar-hover: rgba(255, 255, 255, 0.1);
  --titlebar-height: env(titlebar-area-height, 32px);
  --titlebar-x: env(titlebar-area-x, 0);
  --titlebar-y: env(titlebar-area-y, 0);
  --titlebar-width: env(titlebar-area-width, 100%);
}

.integrated-titlebar {
  position: absolute;
  top: var(--titlebar-y);
  left: var(--titlebar-x);
  width: var(--titlebar-width);
  height: var(--titlebar-height);
  background: var(--titlebar-bg);
  -webkit-app-region: drag;
  app-region: drag;
  user-select: none;
}

/* Adaptação para macOS com traffic lights */
@media (platform: macOS) {
  .integrated-titlebar {
    padding-left: 78px; /* Espaço para traffic lights */
  }
}

/* Adaptação para Windows/Linux */
@media (platform: Windows), (platform: Linux) {
  .integrated-titlebar {
    justify-content: flex-end;
    padding-right: 0; /* Window Controls Overlay cuida do espaçamento */
  }
}
```

#### 8.3 Window Controls Overlay API

##### 8.3.1 Monitoramento de Geometria
```javascript
// Listener para mudanças na geometria do title bar
navigator.windowControlsOverlay?.addEventListener('geometrychange', (event) => {
  const { titlebarAreaRect } = event
  console.log('Nova geometria:', titlebarAreaRect)
  
  // Atualizar CSS variables
  document.documentElement.style.setProperty('--wco-x', `${titlebarAreaRect.x}px`)
  document.documentElement.style.setProperty('--wco-y', `${titlebarAreaRect.y}px`)
  document.documentElement.style.setProperty('--wco-width', `${titlebarAreaRect.width}px`)
  document.documentElement.style.setProperty('--wco-height', `${titlebarAreaRect.height}px`)
})

// Obter informações atuais
const titlebarRect = navigator.windowControlsOverlay?.getTitlebarAreaRect()
if (titlebarRect) {
  console.log('Área do title bar:', titlebarRect)
}
```

##### 8.3.2 Verificação de Disponibilidade
```javascript
// Verificar se Window Controls Overlay está disponível
const hasWCO = 'windowControlsOverlay' in navigator
if (hasWCO) {
  console.log('Window Controls Overlay disponível')
  // Usar APIs específicas
} else {
  console.log('Fallback para controles customizados')
  // Implementar controles próprios
}
```

#### 8.4 Customizações Avançadas de Estilo

##### 8.4.1 Efeitos Visuais macOS
```javascript
// Configuração de vibrancy
new BrowserWindow({
  titleBarStyle: 'hidden',
  vibrancy: 'titlebar',           // Efeito de transparência
  visualEffectState: 'active',    // Sempre ativo
  backgroundMaterial: 'mica'      // Windows 11+ apenas
})

// Opções de vibrancy disponíveis:
// 'appearance-based', 'titlebar', 'selection', 'menu',
// 'popover', 'sidebar', 'header', 'sheet', 'window',
// 'hud', 'fullscreen-ui', 'tooltip', 'content',
// 'under-window', 'under-page'
```

##### 8.4.2 Material Design Windows
```javascript
// Windows 11+ background materials
new BrowserWindow({
  titleBarStyle: 'hidden',
  backgroundMaterial: 'mica',    // Efeito Mica
  // Outras opções: 'acrylic', 'tabbed', 'auto', 'none'
})
```

#### 8.5 Temas e Customização Dinâmica

##### 8.5.1 Sistema de Temas
```javascript
class TitleBarThemeManager {
  constructor(window) {
    this.window = window
    this.currentTheme = 'auto'
    this.setupThemeDetection()
  }

  setupThemeDetection() {
    // Detectar mudanças no tema do sistema
    nativeTheme.on('updated', () => {
      this.updateTitleBarTheme()
    })
  }

  updateTitleBarTheme() {
    const isDark = nativeTheme.shouldUseDarkColors
    const colors = isDark ? this.getDarkTheme() : this.getLightTheme()
    
    if (process.platform !== 'darwin') {
      this.window.setTitleBarOverlay({
        color: colors.background,
        symbolColor: colors.foreground,
        height: 32
      })
    }
    
    // Atualizar CSS variables
    this.updateCSSVariables(colors)
  }

  getDarkTheme() {
    return {
      background: '#1f1f23',
      foreground: '#ffffff',
      hover: 'rgba(255, 255, 255, 0.1)'
    }
  }

  getLightTheme() {
    return {
      background: '#f8f9fa',
      foreground: '#000000',
      hover: 'rgba(0, 0, 0, 0.1)'
    }
  }

  updateCSSVariables(colors) {
    this.window.webContents.executeJavaScript(`
      document.documentElement.style.setProperty('--titlebar-bg', '${colors.background}');
      document.documentElement.style.setProperty('--titlebar-fg', '${colors.foreground}');
      document.documentElement.style.setProperty('--titlebar-hover', '${colors.hover}');
    `)
  }
}
```

##### 8.5.2 Variáveis CSS Expandidas
```css
:root {
  /* Cores base */
  --titlebar-bg: var(--sidebar-background);
  --titlebar-fg: var(--sidebar-foreground);
  --titlebar-hover: rgba(255, 255, 255, 0.1);
  
  /* Dimensões adaptativas */
  --titlebar-height: env(titlebar-area-height, 32px);
  --titlebar-x: env(titlebar-area-x, 0);
  --titlebar-y: env(titlebar-area-y, 0);
  --titlebar-width: env(titlebar-area-width, 100%);
  
  /* Espaçamentos específicos por plataforma */
  --traffic-light-width: 78px;    /* macOS */
  --window-controls-width: 138px;  /* Windows (46px × 3 botões) */
  
  /* Transições */
  --titlebar-transition: background-color 0.15s ease, color 0.15s ease;
  
  /* Z-index */
  --titlebar-z-index: 1000;
  
  /* Bordas e sombras */
  --titlebar-border: none;
  --titlebar-shadow: none;
}

/* Tema escuro */
[data-theme="dark"] {
  --titlebar-bg: #1f1f23;
  --titlebar-fg: #ffffff;
  --titlebar-hover: rgba(255, 255, 255, 0.1);
}

/* Tema claro */
[data-theme="light"] {
  --titlebar-bg: #f8f9fa;
  --titlebar-fg: #000000;
  --titlebar-hover: rgba(0, 0, 0, 0.1);
}
```

### 9. Acessibilidade

#### 9.1 ARIA Labels
```html
<div class="integrated-titlebar" role="banner" aria-label="Window title bar">
  <div class="window-controls" role="group" aria-label="Window controls">
    <button aria-label="Minimize window" tabindex="0">−</button>
    <button aria-label="Maximize window" tabindex="0">□</button>
    <button aria-label="Close window" tabindex="0">×</button>
  </div>
</div>
```

#### 9.2 Navegação por Teclado
- Tab order: Controles devem ser acessíveis via Tab
- Shortcuts: Alt+F4 para fechar, Win+Up para maximizar
- Focus indicators: Subtle outline nos controles

### 10. Prevenção de Sobreposição e Layout

#### 10.1 Garantias de Não-Sobreposição

##### 10.1.1 CSS Layout Protection
```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.integrated-titlebar {
  position: relative; /* Não absolute/fixed para evitar sobreposição */
  height: var(--titlebar-height);
  flex-shrink: 0; /* Nunca diminui */
  z-index: var(--titlebar-z-index);
  order: -1; /* Sempre primeiro elemento */
}

.app-content {
  display: flex;
  flex: 1; /* Ocupa o restante do espaço */
  overflow: hidden; /* Previne vazamentos */
}

.sidebar {
  width: 250px;
  flex-shrink: 0;
  background: var(--titlebar-bg); /* Mesma cor do title bar */
}

.main-content {
  flex: 1;
  overflow: auto;
  /* Nunca invade a área do title bar */
  margin-top: 0; /* Sem margem negativa */
  padding-top: 0; /* Sem padding negativo */
}
```

##### 10.1.2 JavaScript Layout Validation
```javascript
class TitleBarLayoutManager {
  constructor() {
    this.titleBarHeight = 32
    this.setupLayoutMonitoring()
  }

  setupLayoutMonitoring() {
    // Observer para mudanças de layout
    const observer = new ResizeObserver(entries => {
      this.validateLayout()
    })
    
    observer.observe(document.querySelector('.integrated-titlebar'))
    observer.observe(document.querySelector('.app-content'))
  }

  validateLayout() {
    const titleBar = document.querySelector('.integrated-titlebar')
    const appContent = document.querySelector('.app-content')
    
    if (!titleBar || !appContent) return

    const titleBarRect = titleBar.getBoundingClientRect()
    const contentRect = appContent.getBoundingClientRect()

    // Verificar sobreposição
    if (titleBarRect.bottom > contentRect.top) {
      console.warn('Title bar sobrepondo conteúdo!')
      this.fixOverlap()
    }

    // Verificar se title bar está visível
    if (titleBarRect.height === 0) {
      console.warn('Title bar não visível!')
    }
  }

  fixOverlap() {
    const appContent = document.querySelector('.app-content')
    appContent.style.marginTop = `${this.titleBarHeight}px`
  }
}
```

#### 10.2 Área de Arraste (Drag Area) Robusta

##### 10.2.1 CSS Drag Configuration
```css
.integrated-titlebar {
  -webkit-app-region: drag;
  app-region: drag;
  user-select: none;
  cursor: grab;
  
  /* Garantir que toda a área é draggable */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Elementos dentro do title bar que NÃO devem ser draggable */
.window-controls,
.non-draggable {
  -webkit-app-region: no-drag;
  app-region: no-drag;
  cursor: default;
}

/* Indicação visual durante drag */
.integrated-titlebar:active {
  cursor: grabbing;
}
```

##### 10.2.2 JavaScript Drag Enhancement
```javascript
class DragAreaManager {
  constructor() {
    this.setupDragEnhancements()
  }

  setupDragEnhancements() {
    const titleBar = document.querySelector('.integrated-titlebar')
    if (!titleBar) return

    // Feedback visual durante o drag
    titleBar.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Botão esquerdo
        titleBar.classList.add('dragging')
      }
    })

    titleBar.addEventListener('mouseup', () => {
      titleBar.classList.remove('dragging')
    })

    // Prevenir drag em elementos específicos
    const nonDraggableElements = titleBar.querySelectorAll('.window-controls, input, button, select')
    nonDraggableElements.forEach(element => {
      element.style.webkitAppRegion = 'no-drag'
      element.style.appRegion = 'no-drag'
    })
  }
}
```

#### 10.3 Controles de Janela Cross-Platform

##### 10.3.1 Implementação Unificada
```typescript
interface WindowControls {
  platform: 'darwin' | 'win32' | 'linux'
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => boolean
}

class UnifiedWindowControls implements WindowControls {
  platform: 'darwin' | 'win32' | 'linux'
  
  constructor() {
    this.platform = process.platform as 'darwin' | 'win32' | 'linux'
    this.setupControls()
  }

  setupControls() {
    if (this.platform === 'darwin') {
      this.setupMacOSControls()
    } else {
      this.setupWindowsLinuxControls()
    }
  }

  setupMacOSControls() {
    // macOS usa traffic lights nativos
    // Apenas configurar visibilidade e posição
    const { getCurrentWindow } = require('@electron/remote')
    const win = getCurrentWindow()
    
    win.setWindowButtonVisibility(true)
    win.setTrafficLightPosition({ x: 15, y: 10 })
  }

  setupWindowsLinuxControls() {
    // Windows/Linux usa Window Controls Overlay
    const controlsContainer = document.createElement('div')
    controlsContainer.className = 'window-controls'
    controlsContainer.innerHTML = `
      <button class="control-button minimize-btn" aria-label="Minimize">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M0,5 L10,5" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      <button class="control-button maximize-btn" aria-label="Maximize">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect x="0" y="0" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      <button class="control-button close-btn" aria-label="Close">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
    `

    const titleBar = document.querySelector('.integrated-titlebar')
    titleBar?.appendChild(controlsContainer)

    this.bindControlEvents(controlsContainer)
  }

  bindControlEvents(container: HTMLElement) {
    const { getCurrentWindow } = require('@electron/remote')
    const win = getCurrentWindow()

    container.querySelector('.minimize-btn')?.addEventListener('click', () => {
      win.minimize()
    })

    container.querySelector('.maximize-btn')?.addEventListener('click', () => {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    })

    container.querySelector('.close-btn')?.addEventListener('click', () => {
      win.close()
    })
  }

  minimize() {
    const { getCurrentWindow } = require('@electron/remote')
    getCurrentWindow().minimize()
  }

  maximize() {
    const { getCurrentWindow } = require('@electron/remote')
    const win = getCurrentWindow()
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }

  close() {
    const { getCurrentWindow } = require('@electron/remote')
    getCurrentWindow().close()
  }

  isMaximized(): boolean {
    const { getCurrentWindow } = require('@electron/remote')
    return getCurrentWindow().isMaximized()
  }
}
```

#### 10.4 Testing e Validação Expandida

##### 10.4.1 Critérios de Aceitação Detalhados
- [ ] **Layout**: Title bar não sobrepõe nenhum container funcional
- [ ] **Cores**: Title bar tem exatamente a mesma cor do sidebar em todos os temas
- [ ] **Conteúdo**: Nenhum texto, logo ou ícone além dos controles de janela
- [ ] **Drag**: Área draggable funciona em toda extensão, exceto controles
- [ ] **Controles Windows/Linux**: Botões de minimizar, maximizar e fechar funcionam
- [ ] **Controles macOS**: Traffic lights posicionados e funcionais
- [ ] **Visual**: Sem bordas, separadores ou sombras visíveis
- [ ] **Responsivo**: Funciona em múltiplas resoluções e estados de janela
- [ ] **Temas**: Adaptação automática a mudanças de tema sistema/app
- [ ] **Performance**: Sem lag durante redimensionamento ou tema switching

##### 10.4.2 Casos de Teste Expandidos
```javascript
// Suite de testes para validação
class TitleBarTestSuite {
  async runTests() {
    console.log('Iniciando testes do title bar...')
    
    await this.testDragFunctionality()
    await this.testWindowControls()
    await this.testLayoutIntegration()
    await this.testThemeAdaptation()
    await this.testCrossPlatformCompatibility()
    await this.testAccessibility()
    
    console.log('Testes concluídos')
  }

  async testDragFunctionality() {
    console.log('Testando funcionalidade de arraste...')
    
    // Simular drag
    const titleBar = document.querySelector('.integrated-titlebar')
    const dragEvent = new MouseEvent('mousedown', { button: 0 })
    titleBar.dispatchEvent(dragEvent)
    
    // Verificar se cursor muda
    const computedStyle = getComputedStyle(titleBar)
    console.assert(computedStyle.cursor === 'grab', 'Cursor de drag não aplicado')
  }

  async testWindowControls() {
    console.log('Testando controles de janela...')
    
    if (process.platform === 'darwin') {
      // Testar traffic lights
      const { getCurrentWindow } = require('@electron/remote')
      const win = getCurrentWindow()
      console.assert(typeof win.setWindowButtonVisibility === 'function', 'Traffic light API não disponível')
    } else {
      // Testar controles customizados
      const controls = document.querySelector('.window-controls')
      console.assert(controls !== null, 'Controles de janela não encontrados')
    }
  }

  async testLayoutIntegration() {
    console.log('Testando integração de layout...')
    
    const titleBar = document.querySelector('.integrated-titlebar')
    const appContent = document.querySelector('.app-content')
    
    const titleBarRect = titleBar.getBoundingClientRect()
    const contentRect = appContent.getBoundingClientRect()
    
    console.assert(titleBarRect.bottom <= contentRect.top, 'Title bar sobrepondo conteúdo!')
    console.assert(titleBarRect.height > 0, 'Title bar não visível')
  }

  async testThemeAdaptation() {
    console.log('Testando adaptação de tema...')
    
    const titleBar = document.querySelector('.integrated-titlebar')
    const sidebar = document.querySelector('.sidebar')
    
    const titleBarStyle = getComputedStyle(titleBar)
    const sidebarStyle = getComputedStyle(sidebar)
    
    console.assert(
      titleBarStyle.backgroundColor === sidebarStyle.backgroundColor,
      'Cores do title bar e sidebar não coincidem'
    )
  }

  async testCrossPlatformCompatibility() {
    console.log('Testando compatibilidade cross-platform...')
    
    const hasWCO = 'windowControlsOverlay' in navigator
    
    if (process.platform === 'darwin') {
      console.log('macOS: Verificando traffic lights')
    } else {
      console.assert(hasWCO || document.querySelector('.window-controls'), 
        'Controles de janela não disponíveis')
    }
  }

  async testAccessibility() {
    console.log('Testando acessibilidade...')
    
    const titleBar = document.querySelector('.integrated-titlebar')
    console.assert(titleBar.getAttribute('role') === 'banner', 'Role ARIA não definido')
    
    const controls = document.querySelectorAll('.control-button')
    controls.forEach(button => {
      console.assert(button.hasAttribute('aria-label'), 'aria-label ausente nos controles')
    })
  }
}
```

### 11. Implementação Técnica

#### 11.1 Estrutura HTML
```html
<div class="app-layout">
  <div class="integrated-titlebar">
    <div class="window-controls">
      <button class="control-button minimize-btn">−</button>
      <button class="control-button maximize-btn">□</button>
      <button class="control-button close-btn">×</button>
    </div>
  </div>
  <div class="app-content">
    <aside class="sidebar">...</aside>
    <main class="main-content">...</main>
  </div>
</div>
```

#### 11.2 CSS Classes
```css
.integrated-titlebar {
  height: 32px;
  background: var(--sidebar-background);
  color: var(--sidebar-foreground);
  -webkit-app-region: drag;
  app-region: drag;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 8px;
}
```

### 12. Guias de Implementação por Cenário

#### 12.1 Implementação Básica (Minimal)
```javascript
// main.js - Configuração mínima
const win = new BrowserWindow({
  width: 1200,
  height: 800,
  titleBarStyle: 'hidden',
  titleBarOverlay: process.platform !== 'darwin' ? {
    color: '#1f1f23',
    symbolColor: '#ffffff',
    height: 32
  } : true,
  trafficLightPosition: process.platform === 'darwin' ? { x: 15, y: 10 } : undefined
})
```

```css
/* styles.css - CSS mínimo */
.integrated-titlebar {
  height: 32px;
  background: var(--sidebar-background);
  -webkit-app-region: drag;
  app-region: drag;
  user-select: none;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
```

#### 12.2 Implementação Avançada (Recomendada)
```javascript
// TitleBarManager.js - Classe completa
export class TitleBarManager {
  constructor(window) {
    this.window = window
    this.platform = process.platform
    this.isInitialized = false
    
    this.init()
  }

  init() {
    this.setupPlatformSpecifics()
    this.setupThemeManager()
    this.setupEventListeners()
    this.validateLayout()
    this.isInitialized = true
  }

  setupPlatformSpecifics() {
    if (this.platform === 'darwin') {
      this.window.setTrafficLightPosition({ x: 15, y: 10 })
      this.window.setWindowButtonVisibility(true)
    } else {
      this.window.setTitleBarOverlay({
        color: '#1f1f23',
        symbolColor: '#ffffff',
        height: 32
      })
    }
  }

  // Implementações completas dos métodos anteriores...
}
```

#### 12.3 Checklist de Implementação

##### 12.3.1 Pré-Implementação
- [ ] Verificar versão do Electron (>= 13.0 recomendado)
- [ ] Confirmar suporte a `titleBarOverlay` na versão target
- [ ] Definir design system com variáveis CSS
- [ ] Mapear todos os estados de janela necessários

##### 12.3.2 Durante Implementação
- [ ] Configurar `titleBarStyle: 'hidden'` no BrowserWindow
- [ ] Implementar `titleBarOverlay` para Windows/Linux
- [ ] Configurar `trafficLightPosition` para macOS
- [ ] Aplicar `-webkit-app-region: drag` corretamente
- [ ] Excluir controles com `-webkit-app-region: no-drag`
- [ ] Testar em múltiplas resoluções e DPI scales

##### 12.3.3 Pós-Implementação
- [ ] Executar suite de testes automatizada
- [ ] Validar em diferentes temas
- [ ] Testar mudanças de estado de janela
- [ ] Verificar compatibilidade com screen readers
- [ ] Confirmar performance em sistemas mais antigos

#### 12.4 Troubleshooting Comum

##### 12.4.1 Problemas e Soluções
```javascript
// Problema: Title bar não responde a drag
// Solução: Verificar se app-region está aplicado corretamente
const titleBar = document.querySelector('.integrated-titlebar')
console.log(getComputedStyle(titleBar).webkitAppRegion) // deve ser 'drag'

// Problema: Controles sobrepondo conteúdo
// Solução: Usar environment variables corretas
:root {
  --content-top: env(titlebar-area-height, 32px);
}
.main-content {
  padding-top: var(--content-top);
}

// Problema: Traffic lights não aparecem no macOS
// Solução: Verificar configuração e visibilidade
win.setWindowButtonVisibility(true)
win.setTrafficLightPosition({ x: 15, y: 10 })
```

##### 12.4.2 Debug e Monitoramento
```javascript
// Classe para debug em desenvolvimento
class TitleBarDebugger {
  static enable() {
    if (process.env.NODE_ENV !== 'development') return

    // Monitor de geometria
    if ('windowControlsOverlay' in navigator) {
      navigator.windowControlsOverlay.addEventListener('geometrychange', (e) => {
        console.log('WCO geometry changed:', e.titlebarAreaRect)
      })
    }

    // Monitor de tema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        console.log('Theme changed:', e.matches ? 'dark' : 'light')
      })
    }

    // Validação visual
    this.addVisualIndicators()
  }

  static addVisualIndicators() {
    const titleBar = document.querySelector('.integrated-titlebar')
    if (!titleBar) return

    // Adicionar border temporário para visualização
    titleBar.style.outline = '1px dashed red'
    
    setTimeout(() => {
      titleBar.style.outline = 'none'
    }, 3000)
  }
}

// Ativar em desenvolvimento
TitleBarDebugger.enable()
```

## Conclusão

Esta documentação fornece uma especificação completa para implementar um title bar integrado e cross-platform no aplicativo Daywin, garantindo:

1. **Zero Sobreposição**: Layout flexbox que previne qualquer sobreposição entre title bar e conteúdo funcional
2. **Funcionalidade de Arraste**: Área draggable robusta que funciona em toda extensão do title bar, exceto controles
3. **Controles Nativos**: 
   - **Windows/Linux**: Window Controls Overlay com botões de minimizar, maximizar e fechar
   - **macOS**: Traffic lights nativos posicionados adequadamente
4. **Integração Visual Perfeita**: Title bar invisível como elemento separado, integrado ao sidebar
5. **Adaptabilidade**: Suporte completo a temas dark/light e mudanças do sistema
6. **Performance**: Implementação otimizada sem impacto na performance da aplicação

A implementação prioriza a invisibilidade do title bar como elemento separado, criando uma experiência visual contínua e moderna que parece uma extensão natural do layout do aplicativo, mantendo toda a funcionalidade necessária de forma minimalista e elegante.