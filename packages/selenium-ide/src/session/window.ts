import { BrowserWindow } from 'electron'
import preloadScriptPath from '../constants/preloadScriptPath'
import rendererPath from '../constants/rendererPath'

export default async function buildWindow(): Promise<BrowserWindow> {
  // Make the main window
  const window = new BrowserWindow({
    width: 1460,
    height: 840,
    tabbingIdentifier: 'myTabs',
    webPreferences: {
      contextIsolation: true,
      nativeWindowOpen: true,
      nodeIntegration: false,
      preload: preloadScriptPath,
    },
  })
  window.loadFile(rendererPath)
  // Just a bit of focus passing
  window.on('ready-to-show', () => {
    window.show()
    window.focus()
  })
  return window
}
