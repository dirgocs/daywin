Window Customization
The BrowserWindow module is the foundation of your Electron application, and it exposes many APIs that let you customize the look and behavior of your app’s windows. This section covers how to implement various use cases for window customization on macOS, Windows, and Linux.

note
BrowserWindow is a subclass of the BaseWindow module. Both modules allow you to create and manage application windows in Electron, with the main difference being that BrowserWindow supports a single, full size web view while BaseWindow supports composing many web views. BaseWindow can be used interchangeably with BrowserWindow in the examples of the documents in this section.