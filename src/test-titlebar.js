// Test script for integrated title bar implementation
// Run this in the browser console when the app is running

console.log('🧪 Starting Title Bar Tests...');

// Test 1: Check if title bar is present
const titleBar = document.querySelector('.integrated-titlebar');
if (titleBar) {
  console.log('✅ Title bar element found');
  console.log('📏 Height:', titleBar.offsetHeight, 'px');
  console.log('🎨 Background:', getComputedStyle(titleBar).backgroundColor);
} else {
  console.error('❌ Title bar element not found');
}

// Test 2: Check drag region
const dragRegion = getComputedStyle(titleBar).webkitAppRegion;
if (dragRegion === 'drag') {
  console.log('✅ Drag region properly configured');
} else {
  console.error('❌ Drag region not configured:', dragRegion);
}

// Test 3: Check window controls
const windowControls = document.querySelector('.window-controls');
const platform = navigator.userAgentData?.platform || navigator.platform;

if (platform.toLowerCase().includes('mac')) {
  console.log('🍎 macOS detected - using native traffic lights');
} else {
  if (windowControls) {
    console.log('✅ Custom window controls found for Windows/Linux');
    const buttons = windowControls.querySelectorAll('.control-button');
    console.log(`📊 Found ${buttons.length} control buttons`);
  } else {
    console.log('ℹ️ Using Window Controls Overlay - no custom controls needed');
  }
}

// Test 4: Check layout integrity
const appContent = document.querySelector('.app-content');
const titleBarRect = titleBar.getBoundingClientRect();
const contentRect = appContent.getBoundingClientRect();

if (titleBarRect.bottom <= contentRect.top) {
  console.log('✅ No layout overlap detected');
} else {
  console.error('❌ Layout overlap detected!');
  console.log('Title bar bottom:', titleBarRect.bottom);
  console.log('Content top:', contentRect.top);
}

// Test 5: Check theme integration
const sidebarBg = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-background');
const titlebarBg = getComputedStyle(titleBar).backgroundColor;
console.log('🎨 Sidebar background CSS var:', sidebarBg);
console.log('🎨 Title bar computed background:', titlebarBg);

// Test 6: Check CSS variables
const cssVars = [
  '--titlebar-height',
  '--titlebar-bg',
  '--titlebar-fg',
  '--sidebar-background',
  '--sidebar-foreground'
];

console.log('📝 CSS Variables:');
cssVars.forEach(varName => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
  console.log(`  ${varName}:`, value || 'not set');
});

// Test 7: Check Window Controls Overlay support
if ('windowControlsOverlay' in navigator) {
  console.log('✅ Window Controls Overlay supported');
  const rect = navigator.windowControlsOverlay.getTitlebarAreaRect();
  console.log('📐 WCO Area:', rect);
} else {
  console.log('ℹ️ Window Controls Overlay not available');
}

// Test 8: Simulate theme change
console.log('🌓 Testing theme adaptation...');
const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
console.log('Current theme:', currentTheme);

// Test theme variables
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
console.log('System prefers dark mode:', prefersDark);

console.log('🎯 Title Bar Tests Completed!');