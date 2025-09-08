Custom Window Styles
Frameless windows
Frameless Window

A frameless window removes all chrome applied by the OS, including window controls.

To create a frameless window, set the BaseWindowContructorOptions frame param in the BrowserWindow constructor to false.

docs/fiddles/features/window-customization/custom-window-styles/frameless-windows (38.0.0)
main.js
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false
  })
  win.loadURL('https://example.com')
}

app.whenReady().then(() => {
  createWindow()
})

Transparent windows
Transparent Window Transparent Window in macOS Mission Control

To create a fully transparent window, set the BaseWindowContructorOptions transparent param in the BrowserWindow constructor to true.

The following fiddle takes advantage of a transparent window and CSS styling to create the illusion of a circular window.

docs/fiddles/features/window-customization/custom-window-styles/transparent-windows (38.0.0)
main.js
index.html
styles.css
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 100,
    height: 100,
    resizable: false,
    frame: false,
    transparent: true
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

Limitações
You cannot click through the transparent area. See #1335 for details.
Transparent windows are not resizable. Setting resizable to true may make a transparent window stop working on some platforms.
The CSS blur() filter only applies to the window's web contents, so there is no way to apply blur effect to the content below the window (i.e. other applications open on the user's system).
The window will not be transparent when DevTools is opened.
On Windows:
Transparent windows can not be maximized using the Windows system menu or by double clicking the title bar. The reasoning behind this can be seen on PR #28207.
On macOS:
The native window shadow will not be shown on a transparent window.