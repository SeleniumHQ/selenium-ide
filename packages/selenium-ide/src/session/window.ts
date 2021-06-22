import { BrowserWindow } from 'electron'
import preloadScriptPath from '../constants/preloadScriptPath'
import rendererPath from '../constants/rendererPath'
import { Session } from '../types/server'

export default buildWindow

async function buildWindow(_session: Session): BrowserWindow {
  // Make the main window
  const window = new BrowserWindow({
    width: 1460,
    height: 840,
    webPreferences: {
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
