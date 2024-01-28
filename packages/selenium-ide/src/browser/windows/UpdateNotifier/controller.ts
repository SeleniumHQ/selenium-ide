import { WindowConfig } from 'browser/types'
import Electron from 'electron'

const WIDTH = 300
const HEIGHT = 120

export const window: WindowConfig['window'] = () => {
  const display = Electron.screen.getPrimaryDisplay()
  return {
    x: display.bounds.width - WIDTH - 50,
    y: display.bounds.height - HEIGHT - 50,
    width: WIDTH,
    height: HEIGHT,
    resizable: false,
    minimizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    frame: false,
    maximizable: false,
    skipTaskbar: true,
    useContentSize: false,
    title: 'Checking for updates',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  }
}
