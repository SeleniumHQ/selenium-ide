import { WindowConfig } from 'browser/types'
import Electron from 'electron'

const WIDTH = 400
const HEIGHT = 150

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
    maximizable: false,
    show: false,
    skipTaskbar: true,
    useContentSize: false,
    modal: true,
    title: 'Update checker',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  }
}
