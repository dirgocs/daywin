# Electron Window Title Bar Customization Guide (2025 Edition)

This comprehensive guide covers customizing Electron application windows, specifically focusing on title bar customization using Electron's native properties. Updated with the latest 2025 techniques and advanced customization options. Based on the current Daywin application configuration and modern Electron best practices.

## Current Daywin Configuration

The Daywin app currently uses the following window configuration in `src/main.js`:

```javascript
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  title: '',
  titleBarStyle: 'hiddenInset',        // Custom title bar style
  autoHideMenuBar: true,
  resizable: true,
  
  titleBarOverlay: {
    color: '#1f1f23',                  // Dark background color
    symbolColor: '#ffffff',            // White window controls
    height: 32                         // Custom height for title bar
  },
  icon: null,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    enableRemoteModule: false,
    nodeIntegration: false
  }
});
```

## Title Bar Customization Options

### 1. Basic Title Bar Styles

#### `titleBarStyle: 'default'`
- Standard OS-provided title bar
- Includes window controls and title text
- Platform-specific appearance

#### `titleBarStyle: 'hidden'`
- Removes the entire title bar
- Requires manual implementation of window controls
- Cross-platform consistency

```javascript
const win = new BrowserWindow({
  titleBarStyle: 'hidden'
});
```

#### `titleBarStyle: 'hiddenInset'` (Current Daywin Style)
- macOS: Hides title bar but shifts traffic lights inward
- Windows/Linux: Similar to 'hidden' but with better positioning
- Good balance between customization and native feel

```javascript
const win = new BrowserWindow({
  titleBarStyle: 'hiddenInset'
});
```

#### `titleBarStyle: 'customButtonsOnHover'` (macOS only)
- Hides traffic lights until hover
- Allows custom buttons while keeping native functionality

```javascript
const win = new BrowserWindow({
  titleBarStyle: 'customButtonsOnHover'
});
```

### 2. Title Bar Overlay Configuration

The `titleBarOverlay` option provides fine-grained control over window controls appearance:

#### Basic Overlay
```javascript
const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  titleBarOverlay: true  // Simple overlay with default colors
});
```

#### Advanced Overlay (Daywin Configuration)
```javascript
const win = new BrowserWindow({
  titleBarStyle: 'hiddenInset',
  titleBarOverlay: {
    color: '#1f1f23',        // Background color of control area
    symbolColor: '#ffffff',  // Color of window control symbols
    height: 32               // Height of the title bar area
  }
});
```

#### Color Format Options
- Hex: `#1f1f23`, `#RRGGBBAA` (with alpha)
- RGB: `rgb(31, 31, 35)`
- RGBA: `rgba(31, 31, 35, 0.9)`
- HSL: `hsl(240, 6%, 13%)`
- HSLA: `hsla(240, 6%, 13%, 0.9)`

### 3. Platform-Specific Configurations

#### Cross-Platform Title Bar
```javascript
const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  // Only apply titleBarOverlay on Windows/Linux
  ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
});
```

#### macOS-Specific Features
```javascript
// Custom traffic light position
const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  trafficLightPosition: { x: 15, y: 10 }
});

// Programmatic control
win.setWindowButtonVisibility(false); // Hide traffic lights
win.setWindowButtonVisibility(true);  // Show traffic lights
```

### 4. Frameless Windows

#### Complete Frameless Window
```javascript
const win = new BrowserWindow({
  frame: false,              // Remove all window chrome
  width: 800,
  height: 600
});
```

#### Transparent Windows
```javascript
const win = new BrowserWindow({
  frame: false,
  transparent: true,         // Make window background transparent
  width: 400,
  height: 300,
  resizable: false          // Required for transparent windows
});
```

## CSS Integration for Custom Title Bars

### 1. Draggable Regions

When using custom title bars, you must define draggable areas:

```css
/* Make the custom title bar draggable */
.custom-titlebar {
  app-region: drag;
  user-select: none;        /* Prevent text selection */
  height: 32px;
  background: #1f1f23;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Make buttons non-draggable */
.window-controls button {
  app-region: no-drag;
}

/* Alternative: Make entire window draggable */
body {
  app-region: drag;
}

/* Then exclude interactive elements */
button, input, select, textarea {
  app-region: no-drag;
}
```

### 2. Window Controls Overlay CSS

Access overlay properties in CSS using environment variables:

```css
.title-bar {
  /* Use the overlay height */
  height: env(titlebar-area-height, 32px);
  
  /* Position relative to overlay */
  padding-left: env(titlebar-area-x, 0);
  padding-right: env(titlebar-area-width, 0);
}
```

### 3. Responsive Title Bar
```css
.custom-titlebar {
  app-region: drag;
  height: 32px;
  background: var(--titlebar-bg, #1f1f23);
  color: var(--titlebar-text, #ffffff);
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--titlebar-border, #333);
}

/* macOS styles */
@media (platform: darwin) {
  .custom-titlebar {
    padding-left: 80px; /* Space for traffic lights */
  }
}

/* Windows/Linux styles */
@media (platform: win32), (platform: linux) {
  .custom-titlebar {
    padding-right: 138px; /* Space for window controls */
  }
}
```

## Advanced Window Interactions

### 1. Click-Through Windows
```javascript
// Make window ignore mouse events
win.setIgnoreMouseEvents(true);

// With forwarding (Windows/macOS)
win.setIgnoreMouseEvents(true, { forward: true });
```

### 2. IPC Integration for Window Controls
```javascript
// In main.js
ipcMain.handle('window:minimize', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) focusedWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    if (focusedWindow.isMaximized()) {
      focusedWindow.unmaximize();
    } else {
      focusedWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) focusedWindow.close();
});
```

## Complete Custom Title Bar Example

### HTML Structure
```html
<div class="custom-titlebar">
  <div class="app-title">Daywin</div>
  <div class="window-controls">
    <button id="minimize-btn">−</button>
    <button id="maximize-btn">□</button>
    <button id="close-btn">×</button>
  </div>
</div>
```

### CSS Styling
```css
.custom-titlebar {
  app-region: drag;
  user-select: none;
  height: 32px;
  background: #1f1f23;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 16px;
  border-bottom: 1px solid #333;
}

.app-title {
  font-size: 14px;
  font-weight: 500;
}

.window-controls {
  app-region: no-drag;
  display: flex;
  gap: 2px;
}

.window-controls button {
  width: 46px;
  height: 32px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}

.window-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.window-controls button:last-child:hover {
  background: #e81123; /* Red close button */
}
```

### JavaScript Integration
```javascript
// In renderer process
document.getElementById('minimize-btn').addEventListener('click', () => {
  window.electronAPI.minimizeWindow();
});

document.getElementById('maximize-btn').addEventListener('click', () => {
  window.electronAPI.maximizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
  window.electronAPI.closeWindow();
});
```

## Best Practices

### 1. Accessibility
- Provide proper ARIA labels for window controls
- Ensure sufficient color contrast
- Support keyboard navigation

```html
<button 
  id="close-btn" 
  aria-label="Close window"
  role="button"
  tabindex="0"
>
  ×
</button>
```

### 2. Responsive Design
- Test on different screen sizes and DPI settings
- Provide fallback dimensions for CSS environment variables
- Consider touch-friendly sizes on touch devices

### 3. Theme Integration
```css
:root {
  --titlebar-bg: #1f1f23;
  --titlebar-text: #ffffff;
  --titlebar-border: #333;
}

[data-theme="light"] {
  --titlebar-bg: #f3f3f3;
  --titlebar-text: #333333;
  --titlebar-border: #ddd;
}
```

### 4. Security Considerations
- Validate all IPC messages for window operations
- Implement proper error handling
- Avoid exposing sensitive information in title bars

## Common Pitfalls and Solutions

### 1. Platform Differences
**Problem**: Different behavior across operating systems
**Solution**: Use platform-specific configuration:
```javascript
const titleBarConfig = process.platform === 'darwin' 
  ? { titleBarStyle: 'hiddenInset' }
  : { titleBarStyle: 'hidden', titleBarOverlay: true };
```

### 2. Missing Window Controls
**Problem**: No way to minimize/maximize/close on custom title bars
**Solution**: Always implement window controls or use `titleBarOverlay`

### 3. Drag Region Conflicts
**Problem**: Interactive elements not working in draggable areas
**Solution**: Explicitly mark interactive elements with `app-region: no-drag`

### 4. DevTools Compatibility
**Problem**: Custom title bars interfering with DevTools
**Solution**: Conditional styles for development:
```css
body.dev-mode .custom-titlebar {
  display: none;
}
```

## 2025 Advanced Window Customization Features

### 1. BaseWindow vs BrowserWindow Architecture

**Modern Approach**: Electron has evolved to support two distinct window architectures:

#### BrowserWindow (Traditional)
- Single, full-size web view
- Simpler for basic applications
- Direct webContents access
- Current Daywin implementation

#### BaseWindow (Modern Multi-View)
- Supports multiple WebContentsView instances
- Flexible composition of views
- No direct webContents property
- Future-proof architecture

```javascript
// Traditional BrowserWindow (Current Daywin approach)
const mainWindow = new BrowserWindow({
  titleBarStyle: 'hiddenInset',
  // ... other options
});

// Modern BaseWindow with WebContentsView
const { BaseWindow, WebContentsView } = require('electron');

const baseWindow = new BaseWindow({
  titleBarStyle: 'hiddenInset',
  // ... other options
});

const webContentsView = new WebContentsView();
baseWindow.contentView.addChildView(webContentsView);
```

**Migration Consideration**: For single-view applications like Daywin, BrowserWindow remains the simpler choice. Consider BaseWindow for future multi-view features.

### 2. Advanced Vibrancy and Material Effects

#### macOS Vibrancy with Visual Effect States

**Enhanced Configuration**:
```javascript
const win = new BrowserWindow({
  transparent: true,
  vibrancy: 'under-window',           // Modern material options
  visualEffectState: 'followWindow',  // 2025 feature: active/inactive/followWindow
  titleBarStyle: 'hiddenInset'
});
```

**Available Vibrancy Materials** (macOS):
- `appearance-based` - Adapts to system appearance
- `under-window` - Modern translucent effect
- `content` - Content-specific vibrancy
- `header` - Header-specific material
- `sidebar` - Sidebar material effect
- `titlebar` - Title bar specific vibrancy

**Visual Effect States**:
- `followWindow` - Automatically matches window state (default)
- `active` - Always appears active
- `inactive` - Always appears inactive

#### Windows Backdrop Materials (Windows 11+)

**New backgroundMaterial Property**:
```javascript
const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  backgroundMaterial: 'mica',    // Windows 11 22H2+ feature
  titleBarOverlay: true
});
```

**Available Materials**:
- `auto` - System decides appropriate material
- `none` - No backdrop effect
- `mica` - Modern Windows 11 mica effect
- `acrylic` - Acrylic transparency effect
- `tabbed` - Tabbed interface material

### 3. Dynamic Title Bar Overlay Updates (2025 Feature)

**Runtime Overlay Modifications**:
```javascript
// Initial setup
const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#1f1f23',
    symbolColor: '#ffffff',
    height: 32
  }
});

// Dynamic updates based on user preferences or themes
function updateTitleBarTheme(theme) {
  const overlayConfig = theme === 'dark' 
    ? { color: '#1f1f23', symbolColor: '#ffffff' }
    : { color: '#f3f3f3', symbolColor: '#333333' };
    
  win.setTitleBarOverlay(overlayConfig);
}

// Listen for theme changes
ipcMain.on('theme-changed', (event, theme) => {
  updateTitleBarTheme(theme);
});
```

### 4. Modern UI Framework Integration

#### Recommended 2025 UI Libraries

**Enterprise Applications**:
```javascript
// Ant Design v5 with modern theming
import { ConfigProvider, theme } from 'antd';

const App = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: '#1f1f23'
      }
    }}
  >
    <CustomTitleBar />
    <MainContent />
  </ConfigProvider>
);
```

**Windows 11 Native Look**:
```javascript
// Fluent UI v2 integration
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';

const App = () => (
  <FluentProvider theme={webDarkTheme}>
    <CustomTitleBar />
    <MainContent />
  </FluentProvider>
);
```

**Utility-First Approach** (Current Daywin):
```css
/* Tailwind CSS with custom title bar */
@tailwind base;
@tailwind components;
@tailwind utilities;

.title-bar {
  @apply bg-gray-900 text-white h-8 flex items-center justify-between px-4;
  app-region: drag;
  user-select: none;
}

.window-controls {
  @apply flex gap-1;
  app-region: no-drag;
}
```

### 5. Enhanced Accessibility and Modern UX Patterns

#### Contextual Intelligence Pattern
```javascript
// Adaptive title bar based on user context
class AdaptiveTitleBar {
  constructor(userProfile, currentTask) {
    this.userProfile = userProfile;
    this.currentTask = currentTask;
  }
  
  getContextualControls() {
    // Return different controls based on user role and current task
    if (this.currentTask === 'data-entry' && this.userProfile.role === 'admin') {
      return ['save', 'validate', 'export'];
    }
    return ['minimize', 'maximize', 'close'];
  }
  
  updateTitleBarLayout() {
    const controls = this.getContextualControls();
    // Dynamically update title bar controls
  }
}
```

#### Accessibility Enhancements
```html
<!-- Enhanced accessibility with ARIA labels and roles -->
<div class="custom-titlebar" role="banner" aria-label="Application title bar">
  <h1 class="app-title" aria-level="1">Daywin - Diaristas Manager</h1>
  <div class="window-controls" role="group" aria-label="Window controls">
    <button 
      aria-label="Minimize window"
      role="button"
      tabindex="0"
      onclick="minimizeWindow()"
    >
      <span aria-hidden="true">−</span>
    </button>
    <button 
      aria-label="Maximize window"
      role="button"
      tabindex="0"
      onclick="maximizeWindow()"
    >
      <span aria-hidden="true">□</span>
    </button>
    <button 
      aria-label="Close application"
      role="button"
      tabindex="0"
      onclick="closeWindow()"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</div>
```

### 6. Advanced Security Patterns for 2025

#### Secure Title Bar Context Bridge
```javascript
// In preload.js - Secure window control bridge
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Secure window controls with validation
  minimizeWindow: () => {
    // Add validation logic
    if (document.hasFocus()) {
      ipcRenderer.invoke('window:minimize');
    }
  },
  
  maximizeWindow: () => {
    // Security check before window manipulation
    if (document.visibilityState === 'visible') {
      ipcRenderer.invoke('window:maximize');
    }
  },
  
  // Secure theme updates
  updateTitleBarTheme: (theme) => {
    // Validate theme object structure
    if (theme && typeof theme === 'object' && theme.color && theme.symbolColor) {
      ipcRenderer.invoke('titlebar:update-theme', theme);
    }
  }
});
```

#### Content Security Policy for Custom Title Bars
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  style-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-eval';
  connect-src 'self' file:;
  img-src 'self' data: file:;
  font-src 'self' data:;
">
```

### 7. Performance Optimization for Modern Desktop Apps

#### Hardware-Accelerated Title Bar Animations
```css
.title-bar {
  /* Use GPU acceleration for smooth animations */
  transform: translateZ(0);
  will-change: background-color;
  transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-bar.focused {
  background-color: var(--accent-color);
}

/* Optimize for high DPI displays */
@media (-webkit-min-device-pixel-ratio: 2) {
  .window-controls button {
    transform: scale(0.5);
    transform-origin: center;
  }
}
```

#### Memory-Efficient Window Management
```javascript
// Efficient window management with proper cleanup
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.cleanupIntervals = new Map();
  }
  
  createWindow(id, options) {
    const window = new BrowserWindow(options);
    
    // Set up automatic cleanup
    const cleanup = setInterval(() => {
      if (window.isDestroyed()) {
        this.windows.delete(id);
        clearInterval(cleanup);
        this.cleanupIntervals.delete(id);
      }
    }, 5000);
    
    this.windows.set(id, window);
    this.cleanupIntervals.set(id, cleanup);
    
    return window;
  }
}
```

## Future-Proofing Recommendations

### 1. Prepare for WebContentsView Migration
Consider structuring your application to eventually support multiple views within a single window using the new BaseWindow + WebContentsView architecture.

### 2. Implement Progressive Enhancement
Design your custom title bar to gracefully degrade on platforms or versions that don't support advanced features.

### 3. Monitor Electron Updates
Stay updated with Electron releases as window customization APIs continue to evolve rapidly.

This guide provides comprehensive coverage of Electron window customization options, with specific examples based on the Daywin application's current configuration and the latest 2025 techniques for modern desktop application development.