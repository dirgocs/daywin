Custom Title Bar
Basic tutorial
Application windows have a default chrome applied by the OS. Not to be confused with the Google Chrome browser, window chrome refers to the parts of the window (e.g. title bar, toolbars, controls) that are not a part of the main web content. While the default title bar provided by the OS chrome is sufficient for simple use cases, many applications opt to remove it. Implementing a custom title bar can help your application feel more modern and consistent across platforms.

You can follow along with this tutorial by opening Fiddle with the following starter code.

docs/fiddles/features/window-customization/custom-title-bar/starter-code (38.0.0)
main.js
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({})
  win.loadURL('https://example.com')
}

app.whenReady().then(() => {
  createWindow()
})

Remove the default title bar
Let’s start by configuring a window with native window controls and a hidden title bar. To remove the default title bar, set the BaseWindowContructorOptions titleBarStyle param in the BrowserWindow constructor to 'hidden'.

docs/fiddles/features/window-customization/custom-title-bar/remove-title-bar (38.0.0)
main.js
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    // remove the default titlebar
    titleBarStyle: 'hidden'
  })
  win.loadURL('https://example.com')
}

app.whenReady().then(() => {
  createWindow()
})

Add native window controls Windows Linux
On macOS, setting titleBarStyle: 'hidden' removes the title bar while keeping the window’s traffic light controls available in the upper left hand corner. However on Windows and Linux, you’ll need to add window controls back into your BrowserWindow by setting the BaseWindowContructorOptions titleBarOverlay param in the BrowserWindow constructor.

docs/fiddles/features/window-customization/custom-title-bar/native-window-controls (38.0.0)
main.js
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  })
  win.loadURL('https://example.com')
}

app.whenReady().then(() => {
  createWindow()
})

Setting titleBarOverlay: true is the simplest way to expose window controls back into your BrowserWindow. If you’re interested in customizing the window controls further, check out the sections Custom traffic lights and Custom window controls that cover this in more detail.

Create a custom title bar
Now, let’s implement a simple custom title bar in the webContents of our BrowserWindow. There’s nothing fancy here, just HTML and CSS!

docs/fiddles/features/window-customization/custom-title-bar/custom-title-bar (38.0.0)
main.js
index.html
styles.css
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

Currently our application window can’t be moved. Since we’ve removed the default title bar, the application needs to tell Electron which regions are draggable. We’ll do this by adding the CSS style app-region: drag to the custom title bar. Now we can drag the custom title bar to reposition our app window!

docs/fiddles/features/window-customization/custom-title-bar/custom-drag-region (38.0.0)
main.js
index.html
styles.css
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})

For more information around how to manage drag regions defined by your electron application, see the Custom draggable regions section below.

Congratulations, you've just implemented a basic custom title bar!

Advanced window customization
Custom traffic lights macOS
Customize the look of your traffic lights macOS
The customButtonsOnHover title bar style will hide the traffic lights until you hover over them. This is useful if you want to create custom traffic lights in your HTML but still use the native UI to control the window.

const { BrowserWindow } = require('electron')

const win = new BrowserWindow({ titleBarStyle: 'customButtonsOnHover' })

Customize the traffic light position macOS
To modify the position of the traffic light window controls, there are two configuration options available.

Applying hiddenInset title bar style will shift the vertical inset of the traffic lights by a fixed amount.

main.js
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({ titleBarStyle: 'hiddenInset' })

If you need more granular control over the positioning of the traffic lights, you can pass a set of coordinates to the trafficLightPosition option in the BrowserWindow constructor.

main.js
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  trafficLightPosition: { x: 10, y: 10 }
})

Show and hide the traffic lights programmatically macOS
You can also show and hide the traffic lights programmatically from the main process. The win.setWindowButtonVisibility forces traffic lights to be show or hidden depending on the value of its boolean parameter.

main.js
const { BrowserWindow } = require('electron')

const win = new BrowserWindow()
// hides the traffic lights
win.setWindowButtonVisibility(false)

note
Given the number of APIs available, there are many ways of achieving this. For instance, combining frame: false with win.setWindowButtonVisibility(true) will yield the same layout outcome as setting titleBarStyle: 'hidden'.

Custom window controls
The Window Controls Overlay API is a web standard that gives web apps the ability to customize their title bar region when installed on desktop. Electron exposes this API through the titleBarOverlay option in the BrowserWindow constructor. When titleBarOverlay is enabled, the window controls become exposed in their default position, and DOM elements cannot use the area underneath this region.

note
titleBarOverlay requires the titleBarStyle param in the BrowserWindow constructor to have a value other than default.

The custom title bar tutorial covers a basic example of exposing window controls by setting titleBarOverlay: true. The height, color (Windows Linux), and symbol colors (Windows) of the window controls can be customized further by setting titleBarOverlay to an object.

The value passed to the height property must be an integer. The color and symbolColor properties accept rgba(), hsla(), and #RRGGBBAA color formats and support transparency. If a color option is not specified, the color will default to its system color for the window control buttons. Similarly, if the height option is not specified, the window controls will default to the standard system height:

main.js
const { BrowserWindow } = require('electron')

const win = new BrowserWindow({
  titleBarStyle: 'hidden',
  titleBarOverlay: {
    color: '#2f3241',
    symbolColor: '#74b1be',
    height: 60
  }
})

note
Once your title bar overlay is enabled from the main process, you can access the overlay's color and dimension values from a renderer using a set of readonly JavaScript APIs and CSS Environment Variables.